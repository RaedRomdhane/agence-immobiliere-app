const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const Property = require('../models/Property');

// AI Configuration - Support both Ollama (free, local) and OpenAI (paid)
const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama'; // 'ollama' or 'openai'
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

let aiClient = null;
let aiMode = 'rules'; // 'ollama', 'openai', or 'rules'

// Try to configure AI provider
try {
  if (AI_PROVIDER === 'ollama') {
    // Ollama (free local AI)
    console.log('🦙 Attempting to connect to Ollama...');
    console.log(`📍 URL: ${OLLAMA_URL}`);
    console.log(`🤖 Model: ${OLLAMA_MODEL}`);
    aiMode = 'ollama';
    aiClient = { url: OLLAMA_URL, model: OLLAMA_MODEL };
    console.log('✅ Ollama AI configured successfully (FREE!)');
  } else if (AI_PROVIDER === 'openai') {
    // OpenAI (paid API)
    const { OpenAI } = require('openai');
    if (process.env.OPENAI_API_KEY) {
      aiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      aiMode = 'openai';
      console.log('✅ OpenAI GPT configured successfully');
    } else {
      console.log('⚠️  OpenAI API key not found');
      console.log('💡 Add OPENAI_API_KEY to .env or switch to Ollama (free)');
    }
  }
} catch (error) {
  console.log('⚠️  AI configuration error:', error.message);
  console.log('📋 Using rule-based responses as fallback');
  aiMode = 'rules';
}

/**
 * @route   POST /api/chat/message
 * @desc    Generate intelligent chat response using AI or rules
 * @access  Private
 */
router.post('/message', protect, async (req, res) => {
  try {
    console.log('📨 Chat message received:', req.body.message);
    console.log('👤 User:', req.user?.firstName || 'Anonymous');
    
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMessage = message.toLowerCase();

    // Fetch relevant data from database
    const propertyCount = await Property.countDocuments({});
    const latestProperties = await Property.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type price location.city bedrooms surface features');

    const availableTypes = await Property.distinct('type');
    const availableCities = await Property.distinct('location.city');

    // Build context for AI
    const context = {
      totalProperties: propertyCount,
      propertyTypes: availableTypes,
      cities: availableCities,
      latestProperties: latestProperties.map(p => ({
        title: p.title,
        type: p.type,
        price: p.price,
        city: p.location?.city,
        bedrooms: p.bedrooms,
        surface: p.surface,
        id: p._id
      })),
      userName: req.user.firstName || 'utilisateur'
    };

    let responseText = '';
    let properties = [];

    // Try to use AI (Ollama or OpenAI)
    if (aiMode === 'ollama') {
      console.log('🦙 Using Ollama (free local AI) for response generation');
      try {
        const systemPrompt = `Tu es un assistant virtuel intelligent pour une agence immobilière. Tu as accès aux données suivantes :
- ${context.totalProperties} biens immobiliers disponibles
- Types disponibles : ${context.propertyTypes.join(', ')}
- Villes disponibles : ${context.cities.join(', ')}
- Derniers biens ajoutés : ${JSON.stringify(context.latestProperties, null, 2)}

Ton rôle est de :
1. Répondre aux questions sur les biens immobiliers de manière naturelle et professionnelle
2. Suggérer des biens en fonction des critères de l'utilisateur
3. Fournir des informations précises basées sur les données disponibles
4. Être amical et serviable

Réponds en français de manière conversationnelle et naturelle. Si l'utilisateur cherche un bien spécifique, mentionne les IDs des biens pertinents dans ta réponse.`;

        // Call Ollama API
        const response = await fetch(`${aiClient.url}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: aiClient.model,
            prompt: `${systemPrompt}\n\nUtilisateur: ${message}\nAssistant:`,
            stream: false,
            options: {
              temperature: 0.7,
              num_predict: 500,
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        responseText = data.response;

        console.log('✅ Ollama response received (FREE!)');

        // Extract property IDs from response if mentioned
        const propertyIdMatches = responseText.match(/[0-9a-f]{24}/gi);
        if (propertyIdMatches && propertyIdMatches.length > 0) {
          properties = await Property.find({
            _id: { $in: propertyIdMatches }
          }).limit(3);
        }

      } catch (aiError) {
        console.error('❌ Ollama error:', aiError.message);
        console.log('💡 Make sure Ollama is installed and running: ollama serve');
        // Fallback to rule-based if AI fails
        console.log('⚠️ Falling back to rule-based response');
        const fallback = await generateRuleBasedResponse(message, context);
        responseText = fallback.message;
        properties = fallback.properties || [];
      }
    } else if (aiMode === 'openai') {
      console.log('🤖 Using OpenAI GPT for response generation');
      try {
        const systemPrompt = `Tu es un assistant virtuel intelligent pour une agence immobilière. Tu as accès aux données suivantes :
- ${context.totalProperties} biens immobiliers disponibles
- Types disponibles : ${context.propertyTypes.join(', ')}
- Villes disponibles : ${context.cities.join(', ')}
- Derniers biens ajoutés : ${JSON.stringify(context.latestProperties, null, 2)}

Ton rôle est de :
1. Répondre aux questions sur les biens immobiliers de manière naturelle et professionnelle
2. Suggérer des biens en fonction des critères de l'utilisateur
3. Fournir des informations précises basées sur les données disponibles
4. Être amical et serviable

Réponds en français de manière conversationnelle et naturelle. Si l'utilisateur cherche un bien spécifique, mentionne les IDs des biens pertinents dans ta réponse.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-5), // Keep last 5 messages for context
          { role: 'user', content: message }
        ];

        const completion = await aiClient.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        });

        responseText = completion.choices[0].message.content;

        // Extract property IDs from response if mentioned
        const propertyIdMatches = responseText.match(/[0-9a-f]{24}/gi);
        if (propertyIdMatches && propertyIdMatches.length > 0) {
          properties = await Property.find({
            _id: { $in: propertyIdMatches }
          }).limit(3);
        }

      } catch (aiError) {
        console.error('❌ OpenAI error:', aiError.message);
        // Fallback to rule-based if AI fails
        console.log('⚠️ Falling back to rule-based response');
        const fallback = await generateRuleBasedResponse(message, context);
        responseText = fallback.message;
        properties = fallback.properties || [];
      }
    } else {
      // Use rule-based responses if OpenAI not available
      console.log('📋 Using rule-based response (OpenAI not configured)');
      const fallback = await generateRuleBasedResponse(message, context);
      responseText = fallback.message;
      properties = fallback.properties || [];
    }

    console.log('✅ Response generated successfully');
    console.log(`📊 Properties found: ${properties.length}`);
    
    res.json({
      message: responseText,
      properties: properties.map(p => ({
        _id: p._id,
        title: p.title,
        type: p.type,
        price: p.price,
        location: p.location,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        surface: p.surface,
        primaryPhoto: p.primaryPhoto
      })),
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
  }
});

/**
 * Generate rule-based response (fallback)
 */
async function generateRuleBasedResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  let responseMessage = '';
  let properties = [];

  try {
    // Search for properties
    if (
      lowerMessage.includes('cherche') || lowerMessage.includes('recherche') ||
      lowerMessage.includes('trouve') || lowerMessage.includes('veux') ||
      lowerMessage.includes('montre') || lowerMessage.includes('affiche')
    ) {
      const query = {};
      
      // Extract type
      if (lowerMessage.includes('appartement')) query.type = 'appartement';
      else if (lowerMessage.includes('maison')) query.type = 'maison';
      else if (lowerMessage.includes('villa')) query.type = 'villa';
      else if (lowerMessage.includes('studio')) query.type = 'studio';

      // Extract city
      for (const city of context.cities) {
        if (lowerMessage.includes(city.toLowerCase())) {
          query['location.city'] = city;
          break;
        }
      }

      // Extract price
      const priceMatch = lowerMessage.match(/(\d+)\s*(k|mille|million)?/);
      if (priceMatch && (lowerMessage.includes('moins') || lowerMessage.includes('max'))) {
        const amount = parseInt(priceMatch[1]);
        query.price = { $lte: amount * (lowerMessage.includes('k') ? 1000 : 1) };
      }

      // Extract bedrooms
      const bedroomMatch = lowerMessage.match(/(\d+)\s*(chambre|ch)/);
      if (bedroomMatch) {
        query.bedrooms = parseInt(bedroomMatch[1]);
      }

      properties = await Property.find(query).limit(3);
      
      if (properties.length > 0) {
        responseMessage = `J'ai trouvé ${properties.length} bien(s) qui correspondent à vos critères. `;
        if (query.type) responseMessage += `Type: ${query.type}. `;
        if (query['location.city']) responseMessage += `Ville: ${query['location.city']}. `;
        responseMessage += 'Voici les résultats :';
      } else {
        responseMessage = "Je n'ai trouvé aucun bien correspondant exactement. Voulez-vous élargir vos critères de recherche ?";
      }
    }
    // Latest properties
    else if (lowerMessage.includes('nouveau') || lowerMessage.includes('récent') || lowerMessage.includes('dernier')) {
      properties = await Property.find({}).sort({ createdAt: -1 }).limit(3);
      responseMessage = `Voici les ${properties.length} derniers biens ajoutés à notre catalogue :`;
    }
    // Cheapest properties
    else if (lowerMessage.includes('moins cher') || lowerMessage.includes('pas cher') || lowerMessage.includes('économique')) {
      properties = await Property.find({}).sort({ price: 1 }).limit(3);
      responseMessage = 'Voici les biens les plus abordables disponibles actuellement :';
    }
    // Most expensive
    else if (lowerMessage.includes('cher') || lowerMessage.includes('luxe') || lowerMessage.includes('haut de gamme')) {
      properties = await Property.find({}).sort({ price: -1 }).limit(3);
      responseMessage = 'Voici nos biens haut de gamme :';
    }
    // Property count
    else if (lowerMessage.includes('combien')) {
      responseMessage = `Nous avons actuellement ${context.totalProperties} biens disponibles dans notre catalogue. Types disponibles : ${context.propertyTypes.join(', ')}. Que recherchez-vous précisément ?`;
    }
    // Default
    else {
      responseMessage = `Bonjour ${context.userName} ! Je peux vous aider à trouver un bien immobilier. Nous avons ${context.totalProperties} biens disponibles. Dites-moi ce que vous recherchez (type, ville, budget, nombre de chambres...) et je vous montrerai les meilleures options.`;
    }

  } catch (error) {
    console.error('Rule-based response error:', error);
    responseMessage = "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question ?";
  }

  return { message: responseMessage, properties };
}

module.exports = router;
