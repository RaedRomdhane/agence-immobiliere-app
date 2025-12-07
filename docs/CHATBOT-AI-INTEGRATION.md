# Chatbot IA avec OpenAI GPT

## 🎯 Aperçu

Le chatbot de l'agence immobilière utilise maintenant l'intelligence artificielle de OpenAI (ChatGPT) pour fournir des réponses naturelles et intelligentes aux utilisateurs.

## ✨ Fonctionnalités

### Mode IA (avec OpenAI API)
- **Réponses naturelles** : Le chatbot comprend le langage naturel et répond de manière conversationnelle
- **Contexte conservé** : Les 5 derniers messages sont gardés en mémoire pour des conversations cohérentes
- **Accès aux données** : L'IA a accès aux biens immobiliers de la base de données
- **Suggestions intelligentes** : Recommandations basées sur les critères de l'utilisateur

### Mode Fallback (sans API key)
- **Réponses basées sur des règles** : Système de réponses prédéfinies intelligent
- **Recherche de biens** : Extraction de critères et recherche dans la base de données
- **Fonctionnalité complète** : Toutes les fonctionnalités de base restent disponibles

## 🔧 Configuration

### 1. Obtenir une clé API OpenAI

1. Créer un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Aller dans [API Keys](https://platform.openai.com/api-keys)
3. Créer une nouvelle clé secrète
4. Copier la clé (elle ne sera affichée qu'une seule fois)

### 2. Configurer le backend

Ajouter la clé API dans `backend/.env` :

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Redémarrer le serveur

```bash
cd backend
npm run dev
```

## 💡 Utilisation

### Exemples de questions

**Recherche de biens :**
- "Je cherche un appartement à Tunis avec 3 chambres"
- "Montre-moi les maisons disponibles"
- "Y a-t-il des villas avec piscine à Sousse ?"
- "Je veux un bien immobilier de moins de 500000 TND"

**Questions générales :**
- "Combien de biens avez-vous ?"
- "Quels types de biens proposez-vous ?"
- "Dans quelles villes êtes-vous présents ?"

**Demandes spécifiques :**
- "Montre-moi les 3 biens les moins chers"
- "Quels sont les derniers biens ajoutés ?"
- "Y a-t-il des biens de luxe disponibles ?"

## 🧠 Architecture Technique

### Endpoint Backend

**Route :** `POST /api/chat/message`

**Request :**
```json
{
  "message": "Je cherche un appartement à Tunis",
  "conversationHistory": [
    { "role": "user", "content": "Bonjour" },
    { "role": "assistant", "content": "Bonjour! Comment puis-je vous aider?" }
  ]
}
```

**Response :**
```json
{
  "message": "Voici les appartements disponibles à Tunis...",
  "properties": [
    {
      "_id": "...",
      "title": "Appartement moderne à Tunis",
      "type": "appartement",
      "price": 450000,
      "location": { "city": "Tunis" },
      "bedrooms": 3,
      "surface": 120,
      "primaryPhoto": "..."
    }
  ],
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

### Flux de données

1. **Frontend** : L'utilisateur tape un message
2. **API Call** : Message envoyé à `/api/chat/message` avec historique
3. **Backend** : 
   - Extraction des données contextuelles (biens, villes, types)
   - Construction du prompt pour OpenAI
   - Appel à l'API OpenAI GPT-3.5-turbo
   - Extraction des IDs de biens mentionnés dans la réponse
   - Récupération des détails des biens
4. **Response** : Message + biens renvoyés au frontend
5. **UI** : Affichage du message et des cartes de biens

### Prompt System

Le chatbot reçoit un prompt système qui lui donne :
- Accès aux données de l'agence (nombre total de biens, types, villes)
- Liste des derniers biens ajoutés
- Instructions sur son rôle et comportement
- Contexte de conversation (5 derniers messages)

## 🔄 Mode Fallback

Si OpenAI n'est pas configuré ou en cas d'erreur, le système bascule automatiquement sur le mode basé sur des règles :

```javascript
// Le chatbot détecte automatiquement
if (openai) {
  // Utilise OpenAI
} else {
  // Utilise les règles prédéfinies
}
```

**Avantages du fallback :**
- Pas de dépendance critique à OpenAI
- Fonctionne même sans connexion internet (pour l'API OpenAI)
- Pas de coûts si vous ne voulez pas utiliser l'API

## 💰 Coûts OpenAI

**Modèle utilisé :** GPT-3.5-turbo

**Tarifs approximatifs :**
- ~$0.002 par 1000 tokens (entrée + sortie)
- Une conversation moyenne = 100-300 tokens
- **Coût par message :** ~$0.0002 à $0.0006

**Estimation mensuelle :**
- 1000 conversations/mois ≈ $0.20 - $0.60
- 10000 conversations/mois ≈ $2 - $6

## 🎨 Interface Utilisateur

### Widget Chat
- **Position :** Bouton flottant en bas à droite sur toutes les pages
- **Ouverture :** Click sur le bouton ouvre la fenêtre de chat
- **Messages :** Bulles de conversation (bleu pour utilisateur, gris pour assistant)
- **Cartes de biens :** Affichage automatique avec image, prix, détails
- **Indicateur de frappe :** Animation pendant le traitement de la réponse

### Fonctionnalités UI
- Historique de conversation persistant (localStorage)
- Scroll automatique vers le nouveau message
- Bouton "Contacter un admin" pour transfert vers agent humain
- Bouton "Effacer l'historique"
- Responsive design (mobile & desktop)

## 🔒 Sécurité

### Protection de la clé API
- ✅ Clé stockée uniquement dans `.env` côté backend
- ✅ Jamais exposée au frontend
- ✅ Ajoutée à `.gitignore`

### Validation des requêtes
- ✅ Authentification requise (`protect` middleware)
- ✅ Validation du message (non vide, type string)
- ✅ Limite de tokens pour éviter les abus
- ✅ Gestion d'erreurs robuste

### Rate Limiting
Il est recommandé d'ajouter un rate limiting pour éviter les abus :

```javascript
// À ajouter dans app.js
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // max 50 requêtes par 15 min
});

app.use('/api/chat', chatLimiter);
```

## 📊 Monitoring

### Logs Backend
```javascript
console.log('OpenAI response:', completion.choices[0].message.content);
console.error('OpenAI error:', aiError);
```

### Métriques à suivre
- Nombre de messages traités
- Temps de réponse moyen
- Taux d'erreur OpenAI
- Coût mensuel API
- Satisfaction utilisateur

## 🧪 Tests

### Test manuel
1. Ouvrir l'application
2. Cliquer sur le bouton de chat
3. Tester différents types de questions
4. Vérifier les réponses et l'affichage des biens

### Test sans OpenAI
1. Commenter `OPENAI_API_KEY` dans `.env`
2. Redémarrer le serveur
3. Vérifier que le fallback fonctionne

### Test avec OpenAI
1. Configurer `OPENAI_API_KEY`
2. Redémarrer le serveur
3. Vérifier les logs : `OpenAI configured successfully`
4. Tester des conversations naturelles

## 🚀 Améliorations futures

### Court terme
- [ ] Ajouter rate limiting
- [ ] Implémenter des analytics
- [ ] Améliorer le prompt system
- [ ] Ajouter plus de contexte métier

### Moyen terme
- [ ] Support de plusieurs langues (arabe, anglais)
- [ ] Intégration avec système de rendez-vous
- [ ] Suggestions personnalisées basées sur l'historique
- [ ] Mode vocal (speech-to-text)

### Long terme
- [ ] Fine-tuning d'un modèle personnalisé
- [ ] Intégration avec CRM
- [ ] Chatbot proactif (suggestions automatiques)
- [ ] Multi-modal (images, vidéos dans les réponses)

## 📝 Exemple de conversation réelle

**Utilisateur :** "Bonjour, je cherche un appartement à Tunis avec 3 chambres et un budget maximum de 600000 TND"

**Assistant (AI) :** "Bonjour ! Je vais vous aider à trouver un appartement à Tunis. D'après votre recherche (3 chambres, budget max 600000 TND), voici les biens qui correspondent à vos critères :

[Affichage de 2-3 cartes de biens avec photos]

Ces appartements sont tous situés à Tunis, disposent de 3 chambres et respectent votre budget. Souhaitez-vous plus d'informations sur l'un d'entre eux ou modifier vos critères de recherche ?"

**Utilisateur :** "Le premier m'intéresse, il a un parking ?"

**Assistant (AI) :** "Excellent choix ! Oui, l'appartement 'Appartement moderne à Tunis Centre' dispose effectivement d'un parking privé. Il offre également :
- Surface de 120m²
- 3 chambres spacieuses
- 2 salles de bain
- Cuisine équipée
- Balcon avec vue

Souhaitez-vous planifier une visite ou obtenir plus d'informations ?"

## 🆘 Dépannage

### Le chatbot ne répond pas
- Vérifier que le backend est démarré
- Vérifier les logs backend pour des erreurs
- Vérifier la connexion à la base de données

### Les réponses sont répétitives
- Vérifier que `OPENAI_API_KEY` est configurée
- Vérifier les logs : doit afficher "OpenAI configured"
- Si non configuré, c'est normal (mode fallback)

### Erreur OpenAI
- Vérifier que la clé API est valide
- Vérifier le crédit OpenAI restant
- Vérifier les limites de taux (rate limits)
- Le système basculera automatiquement en mode fallback

### Cartes de biens non affichées
- Vérifier que les biens existent dans la base de données
- Vérifier les logs frontend (console)
- Vérifier que les images sont accessibles

## 📚 Ressources

- [Documentation OpenAI](https://platform.openai.com/docs)
- [Pricing OpenAI](https://openai.com/pricing)
- [Best Practices OpenAI](https://platform.openai.com/docs/guides/safety-best-practices)
- [API Reference](https://platform.openai.com/docs/api-reference)

## 👥 Support

Pour toute question ou problème :
1. Vérifier cette documentation
2. Consulter les logs backend
3. Tester en mode fallback (sans OpenAI)
4. Contacter l'équipe de développement
