'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from './ChatContext';
import { 
  MessageCircle, 
  X, 
  Send, 
  Trash2, 
  User, 
  Bot,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname } from 'next/navigation';
import apiClient from '@/lib/api/client';
import Link from 'next/link';

export default function ChatWidget() {
  const { 
    messages, 
    isOpen, 
    addMessage, 
    clearHistory, 
    toggleChat,
    requestAdminTransfer,
    isTransferRequested
  } = useChatContext();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [propertyCards, setPropertyCards] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, propertyCards]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    addMessage(userMessage, 'user', { page: pathname });

    // Simulate bot typing
    setIsTyping(true);
    setPropertyCards([]);

    try {
      // Send message to backend AI endpoint
      console.log('🚀 Sending message to AI backend:', userMessage);
      
      const response = await apiClient.post('/chat/message', {
        message: userMessage,
        conversationHistory: messages.map(msg => ({
          role: msg.role || 'user',
          content: msg.content
        }))
      });

      console.log('✅ AI Response received:', response.data);
      
      addMessage(response.data.message, 'assistant');
      
      if (response.data.properties && response.data.properties.length > 0) {
        setPropertyCards(response.data.properties);
      }
      
      setIsTyping(false);
    } catch (error: any) {
      console.error('❌ Chat error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Fallback to local generation if API fails
      console.log('⚠️ Falling back to local response generation');
      const fallbackResult = await generateIntelligentResponse(userMessage, pathname || '/');
      addMessage(fallbackResult.message, 'assistant');
      if (fallbackResult.properties) {
        setPropertyCards(fallbackResult.properties);
      }
      setIsTyping(false);
    }
  };

  const generateIntelligentResponse = async (message: string, currentPath: string): Promise<{ message: string; properties?: any[] }> => {
    const lowerMessage = message.toLowerCase();

    try {
      // Search for properties based on user query
      if (
        lowerMessage.includes('cherche') || lowerMessage.includes('recherche') || 
        lowerMessage.includes('trouve') || lowerMessage.includes('veux') ||
        lowerMessage.includes('besoin') || lowerMessage.includes('montre') ||
        lowerMessage.includes('affiche') || lowerMessage.includes('voir')
      ) {
        const params: any = { limit: 5 };
        let responseMessage = '';

        // Extract property type
        if (lowerMessage.includes('appartement')) {
          params.type = 'appartement';
          responseMessage = "Voici les appartements disponibles :\n\n";
        } else if (lowerMessage.includes('maison')) {
          params.type = 'maison';
          responseMessage = "Voici les maisons disponibles :\n\n";
        } else if (lowerMessage.includes('villa')) {
          params.type = 'villa';
          responseMessage = "Voici nos villas :\n\n";
        } else if (lowerMessage.includes('studio')) {
          params.type = 'studio';
          responseMessage = "Voici les studios disponibles :\n\n";
        }

        // Extract city
        const cities = ['tunis', 'sousse', 'sfax', 'nabeul', 'hammamet', 'bizerte', 'monastir', 'mahdia', 'gabes', 'ariana'];
        for (const city of cities) {
          if (lowerMessage.includes(city)) {
            params.city = city.charAt(0).toUpperCase() + city.slice(1);
            responseMessage += `Localisation : ${params.city}\n`;
            break;
          }
        }

        // Extract price range
        const priceMatch = lowerMessage.match(/(\d+)\s*(k|mille|million|m)?/g);
        if (priceMatch && (lowerMessage.includes('moins') || lowerMessage.includes('max') || lowerMessage.includes('jusqu'))) {
          const amount = parseInt(priceMatch[0].replace(/\D/g, ''));
          params.maxPrice = amount * (lowerMessage.includes('k') || lowerMessage.includes('mille') ? 1000 : 1);
          responseMessage += `Budget max : ${params.maxPrice} TND\n`;
        }

        // Extract number of bedrooms
        const bedroomMatch = lowerMessage.match(/(\d+)\s*(chambre|bedroom|ch)/);
        if (bedroomMatch) {
          params.bedrooms = parseInt(bedroomMatch[1]);
          responseMessage += `Nombre de chambres : ${params.bedrooms}\n`;
        }

        // Fetch properties
        const response = await apiClient.get('/properties', { params });
        const properties = response.data?.data || [];

        if (properties.length > 0) {
          responseMessage += `\nJ'ai trouvé ${properties.length} bien(s) qui correspond(ent) à vos critères. Cliquez sur un bien ci-dessous pour voir plus de détails :`;
          return { message: responseMessage, properties: properties.slice(0, 3) };
        } else {
          return { 
            message: "Je n'ai trouvé aucun bien correspondant exactement à vos critères. Voulez-vous élargir votre recherche ou modifier certains critères ?"
          };
        }
      }

      // Get property count and statistics
      if (lowerMessage.includes('combien') && (lowerMessage.includes('bien') || lowerMessage.includes('propriété'))) {
        const response = await apiClient.get('/properties', { params: { limit: 1000 } });
        const properties = response.data?.data || [];
        const total = properties.length;
        
        // Calculate statistics
        const types = properties.reduce((acc: any, p: any) => {
          acc[p.type] = (acc[p.type] || 0) + 1;
          return acc;
        }, {});
        
        let stats = `Nous avons actuellement **${total} biens** disponibles dans notre catalogue :\n\n`;
        Object.entries(types).forEach(([type, count]) => {
          stats += `• ${count} ${type}(s)\n`;
        });
        stats += `\nSouhaitez-vous que je vous aide à trouver un bien spécifique ?`;
        
        return { message: stats };
      }

      // Get user's appointments/favorites
      if (user && (lowerMessage.includes('mes rendez-vous') || lowerMessage.includes('mes rdv') || lowerMessage.includes('mes visites'))) {
        try {
          const response = await apiClient.get('/appointments');
          const appointments = response.data?.data || [];
          
          if (appointments.length > 0) {
            return {
              message: `Vous avez ${appointments.length} rendez-vous prévu(s). Consultez votre tableau de bord pour plus de détails.`
            };
          } else {
            return {
              message: "Vous n'avez aucun rendez-vous prévu pour le moment. Trouvez un bien qui vous intéresse et prenez rendez-vous directement depuis sa fiche !"
            };
          }
        } catch (error) {
          return {
            message: "Pour consulter vos rendez-vous, rendez-vous dans votre tableau de bord."
          };
        }
      }

      // Get user's favorites
      if (user && (lowerMessage.includes('mes favoris') || lowerMessage.includes('mes coups de coeur'))) {
        const favCount = user.favorites?.length || 0;
        return {
          message: favCount > 0 
            ? `Vous avez ${favCount} bien(s) dans vos favoris. Consultez votre tableau de bord pour les voir !`
            : "Vous n'avez pas encore de favoris. Cliquez sur le ❤️ sur les biens qui vous plaisent pour les sauvegarder !"
        };
      }

      // Get latest properties
      if (lowerMessage.includes('nouveau') || lowerMessage.includes('récent') || lowerMessage.includes('dernier') || lowerMessage.includes('ajouté')) {
        const response = await apiClient.get('/properties', { 
          params: { limit: 3, sort: '-createdAt' } 
        });
        const properties = response.data?.data || [];
        
        if (properties.length > 0) {
          return { 
            message: `Voici nos ${properties.length} derniers biens ajoutés récemment :`,
            properties
          };
        }
      }

      // Get properties with specific features
      if (lowerMessage.includes('avec piscine')) {
        const response = await apiClient.get('/properties', {
          params: { 'features.pool': true, limit: 3 }
        });
        const properties = response.data?.data || [];
        
        if (properties.length > 0) {
          return {
            message: `J'ai trouvé ${properties.length} bien(s) avec piscine :`,
            properties
          };
        } else {
          return { message: "Désolé, aucun bien avec piscine n'est disponible actuellement. Voulez-vous explorer d'autres options ?" };
        }
      }

      if (lowerMessage.includes('avec parking') || lowerMessage.includes('avec garage')) {
        const response = await apiClient.get('/properties', {
          params: { 'features.parking': true, limit: 3 }
        });
        const properties = response.data?.data || [];
        
        if (properties.length > 0) {
          return {
            message: `J'ai trouvé ${properties.length} bien(s) avec parking/garage :`,
            properties
          };
        }
      }

      if (lowerMessage.includes('avec jardin')) {
        const response = await apiClient.get('/properties', {
          params: { 'features.garden': true, limit: 3 }
        });
        const properties = response.data?.data || [];
        
        if (properties.length > 0) {
          return {
            message: `J'ai trouvé ${properties.length} bien(s) avec jardin :`,
            properties
          };
        }
      }

      // Cheapest/most expensive properties
      if (lowerMessage.includes('moins cher') || lowerMessage.includes('pas cher') || lowerMessage.includes('économique')) {
        const response = await apiClient.get('/properties', {
          params: { limit: 3, sort: 'price' }
        });
        const properties = response.data?.data || [];
        
        if (properties.length > 0) {
          return {
            message: `Voici les biens les plus abordables actuellement :`,
            properties
          };
        }
      }

      if (lowerMessage.includes('plus cher') || lowerMessage.includes('luxe') || lowerMessage.includes('haut de gamme')) {
        const response = await apiClient.get('/properties', {
          params: { limit: 3, sort: '-price' }
        });
        const properties = response.data?.data || [];
        
        if (properties.length > 0) {
          return {
            message: `Voici nos biens haut de gamme :`,
            properties
          };
        }
      }

      // Largest properties
      if (lowerMessage.includes('grand') || lowerMessage.includes('spacieux') || lowerMessage.includes('surface')) {
        const response = await apiClient.get('/properties', {
          params: { limit: 3, sort: '-surface' }
        });
        const properties = response.data?.data || [];
        
        if (properties.length > 0) {
          return {
            message: `Voici les biens les plus spacieux :`,
            properties
          };
        }
      }

      // Get property details by price range
      if (lowerMessage.includes('entre') && lowerMessage.includes('et') && lowerMessage.includes('tnd')) {
        const prices = lowerMessage.match(/\d+/g);
        if (prices && prices.length >= 2) {
          const response = await apiClient.get('/properties', {
            params: {
              minPrice: parseInt(prices[0]),
              maxPrice: parseInt(prices[1]),
              limit: 3
            }
          });
          const properties = response.data?.data || [];
          
          if (properties.length > 0) {
            return {
              message: `J'ai trouvé ${properties.length} bien(s) entre ${prices[0]} et ${prices[1]} TND :`,
              properties
            };
          }
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }

    // Fallback to rule-based responses
    return { message: generateResponse(message, currentPath) };
  };

  const generateResponse = (message: string, currentPath: string): string => {
    const lowerMessage = message.toLowerCase();

    // Check for admin transfer request
    if (
      lowerMessage.includes('admin') ||
      lowerMessage.includes('humain') ||
      lowerMessage.includes('personne') ||
      lowerMessage.includes('agent')
    ) {
      return "Je comprends que vous souhaitez parler à un administrateur. Cliquez sur le bouton 'Contacter un admin' ci-dessous pour transmettre votre demande.";
    }

    // Greeting
    if (
      lowerMessage.includes('bonjour') ||
      lowerMessage.includes('salut') ||
      lowerMessage.includes('hello') ||
      lowerMessage.includes('bonsoir')
    ) {
      return `Bonjour ${user?.firstName || ''} ! Comment puis-je vous aider aujourd'hui ? N'hésitez pas à me poser vos questions sur nos biens immobiliers.`;
    }

    // Thank you
    if (
      lowerMessage.includes('merci') ||
      lowerMessage.includes('thanks')
    ) {
      return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider. 😊";
    }

    // Specific price question with amount
    if (
      (lowerMessage.includes('moins de') || lowerMessage.includes('moins que') || 
       lowerMessage.includes('inférieur') || lowerMessage.includes('maximum')) &&
      (lowerMessage.includes('tnd') || lowerMessage.includes('dinar') || /\d+/.test(lowerMessage))
    ) {
      const numbers = lowerMessage.match(/\d+/g);
      const amount = numbers ? numbers[0] : 'votre budget';
      return `Pour trouver des biens à moins de ${amount} TND, je vous recommande d'utiliser les filtres de prix sur la page 'Biens'. Vous pouvez définir un prix maximum et voir tous les biens disponibles dans votre budget. Voulez-vous que je vous guide ?`;
    }

    // Specific property type search
    if (lowerMessage.includes('cherche') || lowerMessage.includes('recherche') || lowerMessage.includes('veux')) {
      if (lowerMessage.includes('appartement')) {
        return "Vous recherchez un appartement ? Excellent choix ! Sur la page 'Biens', utilisez le filtre 'Type' et sélectionnez 'Appartement'. Vous pouvez aussi ajouter d'autres critères comme la ville, le nombre de chambres ou votre budget. Avez-vous une ville en particulier en tête ?";
      }
      if (lowerMessage.includes('maison')) {
        return "Une maison, c'est parfait pour une famille ! Je vous suggère d'aller sur la page 'Biens' et de filtrer par type 'Maison'. N'oubliez pas d'ajouter vos critères de localisation et de budget pour affiner la recherche.";
      }
      if (lowerMessage.includes('villa')) {
        return "Nos villas sont des propriétés haut de gamme ! Rendez-vous sur la page 'Biens', sélectionnez le type 'Villa' dans les filtres. Vous pouvez aussi filtrer par équipements (piscine, jardin, etc.) pour trouver la villa de vos rêves.";
      }
      if (lowerMessage.includes('studio')) {
        return "Les studios sont parfaits pour les étudiants ou jeunes actifs ! Utilisez le filtre 'Studio' sur la page 'Biens'. Vous pouvez aussi trier par prix pour trouver les meilleures opportunités.";
      }
    }

    // Property-related questions (general)
    if (
      lowerMessage.includes('bien') ||
      lowerMessage.includes('propriété') ||
      lowerMessage.includes('appartement') ||
      lowerMessage.includes('maison') ||
      lowerMessage.includes('villa') ||
      lowerMessage.includes('studio')
    ) {
      return "Nous avons une large sélection de biens immobiliers disponibles. Vous pouvez consulter tous nos biens sur la page 'Biens' ou utiliser les filtres pour affiner votre recherche (type, ville, prix, etc.). Souhaitez-vous que je vous aide à trouver un bien spécifique ?";
    }

    // Price-related questions
    if (
      lowerMessage.includes('prix') ||
      lowerMessage.includes('coût') ||
      lowerMessage.includes('tarif') ||
      lowerMessage.includes('combien') ||
      lowerMessage.includes('budget')
    ) {
      return "Les prix de nos biens varient selon le type, la localisation et les caractéristiques. Vous pouvez filtrer les biens par budget sur la page de recherche en définissant un prix minimum et maximum. Pour connaître le prix d'un bien spécifique, consultez sa fiche détaillée.";
    }

    // Appointment questions
    if (
      lowerMessage.includes('rendez-vous') ||
      lowerMessage.includes('visite') ||
      lowerMessage.includes('rdv') ||
      lowerMessage.includes('visiter')
    ) {
      return "Pour prendre rendez-vous et visiter un bien, cliquez sur le bouton 'Prendre rendez-vous' sur la fiche du bien qui vous intéresse. Vous pourrez choisir une date et un créneau horaire qui vous conviennent.";
    }

    // Contact questions
    if (
      lowerMessage.includes('contact') ||
      lowerMessage.includes('téléphone') ||
      lowerMessage.includes('email') ||
      lowerMessage.includes('joindre')
    ) {
      return "Vous pouvez nous contacter via le formulaire de contact dans le menu ou directement depuis une fiche bien. Nos horaires sont du lundi au vendredi, 9h-18h. Pour une urgence, utilisez le bouton 'Contacter un admin' pour une réponse prioritaire.";
    }

    // Availability questions
    if (
      lowerMessage.includes('disponible') ||
      lowerMessage.includes('libre') ||
      lowerMessage.includes('loué') ||
      lowerMessage.includes('vendu')
    ) {
      return "Le statut de chaque bien (disponible, loué, vendu) est indiqué sur sa fiche. Seuls les biens disponibles apparaissent dans les résultats de recherche par défaut. Pour plus d'informations sur un bien spécifique, n'hésitez pas à nous contacter.";
    }

    // Location/city questions
    if (
      lowerMessage.includes('où') ||
      lowerMessage.includes('ville') ||
      lowerMessage.includes('quartier') ||
      lowerMessage.includes('localisation')
    ) {
      return "Nous proposons des biens dans plusieurs villes et quartiers. Utilisez le filtre 'Ville' sur la page de recherche pour voir les biens disponibles dans une localisation spécifique. Vous pouvez également utiliser la carte interactive pour explorer les biens par zone.";
    }

    // Features/amenities questions
    if (lowerMessage.includes('piscine')) {
      return "Vous recherchez un bien avec piscine ? Sur la page 'Biens', cochez la case 'Piscine' dans les filtres d'équipements. C'est parfait pour profiter de l'été ! Souhaitez-vous aussi filtrer par ville ou par type de bien ?";
    }
    if (lowerMessage.includes('parking') || lowerMessage.includes('garage')) {
      return "Un parking est essentiel ! Sur la page de recherche, activez le filtre 'Parking' pour voir uniquement les biens avec cet équipement. Vous pouvez combiner ce critère avec d'autres filtres.";
    }
    if (lowerMessage.includes('jardin')) {
      return "Un jardin c'est agréable ! Utilisez le filtre 'Jardin' sur la page 'Biens' pour trouver des propriétés avec espace extérieur. Idéal pour les familles ou les amoureux de la nature.";
    }
    if (lowerMessage.includes('balcon') || lowerMessage.includes('terrasse')) {
      return "Pour trouver des biens avec balcon ou terrasse, utilisez les filtres d'équipements sur la page de recherche. Ces espaces sont parfaits pour profiter du beau temps !";
    }
    if (
      lowerMessage.includes('équipement') ||
      lowerMessage.includes('meublé') ||
      lowerMessage.includes('climatisation')
    ) {
      return "Chaque bien dispose d'équipements spécifiques listés dans sa fiche détaillée. Sur la page de recherche, vous trouverez des filtres pour : piscine, parking, jardin, balcon, meublé, climatisation, etc. Quel équipement vous intéresse particulièrement ?";
    }

    // Location/city specific
    if (lowerMessage.includes('tunis') || lowerMessage.includes('sousse') || 
        lowerMessage.includes('sfax') || lowerMessage.includes('nabeul')) {
      const city = lowerMessage.includes('tunis') ? 'Tunis' :
                   lowerMessage.includes('sousse') ? 'Sousse' :
                   lowerMessage.includes('sfax') ? 'Sfax' : 'Nabeul';
      return `Vous cherchez à ${city} ? Excellente ville ! Sur la page 'Biens', utilisez le filtre 'Ville' et tapez "${city}". Vous verrez tous nos biens disponibles dans cette région. Quel type de bien recherchez-vous ?`;
    }

    // Help/guidance
    if (lowerMessage.includes('aide') || lowerMessage.includes('comment') || lowerMessage.includes('utiliser')) {
      return "Je suis là pour vous aider ! Voici ce que je peux faire pour vous :\n\n• Vous guider vers les biens qui correspondent à vos critères\n• Expliquer comment utiliser les filtres de recherche\n• Vous donner des infos sur les rendez-vous\n• Répondre à vos questions sur nos services\n\nQue puis-je faire pour vous ?";
    }

    // Default response with variations
    const defaultResponses = [
      "Je ne suis pas sûr de bien comprendre. Pouvez-vous préciser votre question ? Par exemple : 'Je cherche un appartement à Tunis' ou 'Quels sont les prix des villas ?'",
      "Hmm, je n'ai pas bien compris. Essayez de me poser une question plus précise sur nos biens, les prix, ou la localisation que vous recherchez.",
      "Je peux vous aider à trouver un bien ! Dites-moi ce que vous recherchez : type de bien (appartement, maison, villa), ville, budget, nombre de chambres..."
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
        title="Ouvrir le chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Assistant virtuel</h3>
            <p className="text-xs text-blue-100">En ligne</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearHistory}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Effacer l'historique"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={toggleChat}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`p-2 rounded-full shrink-0 ${
                  message.role === 'user'
                    ? 'bg-blue-600'
                    : message.role === 'system'
                    ? 'bg-yellow-500'
                    : 'bg-gray-300'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : message.role === 'system' ? (
                  <AlertCircle className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-700" />
                )}
              </div>
              <div>
                <div
                  className={`rounded-2xl p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.role === 'system'
                      ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Property Cards */}
        {propertyCards.length > 0 && (
          <div className="space-y-3">
            {propertyCards.map((property) => (
              <Link 
                key={property._id} 
                href={`/properties/${property._id}`}
                className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative h-32 bg-linear-to-br from-blue-400 to-indigo-500">
                  {property.primaryPhoto?.url && (
                    <img
                      src={property.primaryPhoto.url.startsWith('http') 
                        ? property.primaryPhoto.url 
                        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${property.primaryPhoto.url}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {property.price?.toLocaleString()} TND
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h4>
                  <p className="text-xs text-gray-600 mb-2 flex items-center">
                    📍 {property.location?.city || property.location?.address}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>🛏️ {property.bedrooms || '-'} ch</span>
                    <span>🚿 {property.bathrooms || '-'} sdb</span>
                    <span>📐 {property.surface} m²</span>
                  </div>
                  <div className="mt-2 flex items-center justify-end text-blue-600 text-xs font-medium">
                    <span>Voir détails</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="p-2 rounded-full bg-gray-300 shrink-0">
                <Bot className="h-4 w-4 text-gray-700" />
              </div>
              <div className="bg-white rounded-2xl p-3 border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Transfer to admin button */}
      {!isTransferRequested && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
          <button
            onClick={requestAdminTransfer}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-2 py-2"
          >
            <User className="h-4 w-4" />
            <span>Contacter un admin</span>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
