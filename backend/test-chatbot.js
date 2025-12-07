#!/usr/bin/env node

/**
 * Test Script pour l'API Chatbot
 * 
 * Ce script teste l'endpoint /api/chat/message avec et sans OpenAI
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Simuler un token JWT (remplacer par un vrai token)
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE';

const testQueries = [
  "Bonjour, je cherche un appartement à Tunis",
  "Montre-moi les biens les moins chers",
  "Y a-t-il des villas avec piscine ?",
  "Je veux un appartement de 3 chambres pour moins de 500000 TND",
  "Combien de biens avez-vous disponibles ?"
];

async function testChatEndpoint() {
  console.log('🧪 Test de l\'API Chatbot');
  console.log('=' .repeat(50));

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n📝 Test ${i + 1}/${testQueries.length}`);
    console.log(`Question: "${query}"`);
    console.log('-'.repeat(50));

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/message`,
        {
          message: query,
          conversationHistory: []
        },
        {
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Status: ${response.status}`);
      console.log(`📨 Réponse: ${response.data.message.substring(0, 200)}...`);
      
      if (response.data.properties && response.data.properties.length > 0) {
        console.log(`🏠 Biens trouvés: ${response.data.properties.length}`);
        response.data.properties.forEach((prop, idx) => {
          console.log(`   ${idx + 1}. ${prop.title} - ${prop.price} TND`);
        });
      }

    } catch (error) {
      if (error.response) {
        console.log(`❌ Erreur ${error.response.status}: ${error.response.data.error || 'Erreur inconnue'}`);
      } else {
        console.log(`❌ Erreur: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests terminés !');
}

// Test de santé du serveur
async function checkHealth() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Serveur backend actif');
    return true;
  } catch (error) {
    console.log('❌ Serveur backend non disponible sur', API_URL);
    return false;
  }
}

// Exécution
(async () => {
  console.log('🚀 Démarrage des tests...\n');
  
  const serverOk = await checkHealth();
  
  if (!serverOk) {
    console.log('\n⚠️  Veuillez démarrer le serveur backend avec: npm run dev');
    process.exit(1);
  }

  console.log('⚠️  Note: Pour tester avec authentification, remplacer AUTH_TOKEN dans ce script');
  console.log('⚠️  Pour l\'instant, ce script nécessite un token JWT valide\n');

  // Décommenter cette ligne une fois qu'un token valide est fourni
  // await testChatEndpoint();
  
  console.log('\n💡 Instructions:');
  console.log('1. Connectez-vous à l\'application');
  console.log('2. Récupérez le token JWT (F12 > Application > Local Storage)');
  console.log('3. Remplacez AUTH_TOKEN dans ce fichier');
  console.log('4. Relancez: node backend/test-chatbot.js');
})();
