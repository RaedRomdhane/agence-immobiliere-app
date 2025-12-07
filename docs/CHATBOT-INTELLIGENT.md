# Chatbot Intelligent - Documentation

## Vue d'ensemble

Le chatbot intelligent offre une assistance instantanée aux utilisateurs sur toutes les pages de l'application, avec des réponses contextuelles et la possibilité de transférer vers un administrateur.

## Fonctionnalités

### ✅ Interface de chat accessible sur toutes les pages

- **Bouton flottant** en bas à droite de l'écran (icône de message)
- **Disponible sur toutes les pages** grâce à l'intégration dans le layout principal
- **Design moderne** avec animations fluides

### ✅ Réponses contextuelles sur les biens

Le chatbot comprend et répond aux questions sur :

#### 🏠 Biens immobiliers
- Types de biens disponibles
- Recherche de propriétés
- Caractéristiques des biens

#### 💰 Prix et tarifs
- Fourchettes de prix
- Filtres par budget
- Informations tarifaires

#### 📅 Rendez-vous
- Prise de rendez-vous
- Visites de biens
- Disponibilités

#### 📞 Contact
- Coordonnées de l'agence
- Horaires d'ouverture
- Moyens de contact

#### 📍 Localisation
- Villes et quartiers
- Carte interactive
- Filtres géographiques

#### 🔧 Équipements
- Équipements disponibles (piscine, parking, jardin)
- Filtres d'équipements
- Caractéristiques spécifiques

### ✅ Transfert vers un admin si nécessaire

- **Bouton "Contacter un admin"** toujours visible dans le chat
- **Détection intelligente** : le bot suggère le transfert si l'utilisateur mentionne "admin", "humain", "personne", "agent"
- **Message système** confirmant la transmission de la demande
- **Statut du transfert** sauvegardé dans le contexte

### ✅ Historique de la conversation

- **Persistance** : l'historique est sauvegardé dans localStorage par utilisateur
- **Rechargement** : les conversations sont restaurées au retour
- **Effacement** : bouton pour nettoyer l'historique
- **Horodatage** : chaque message affiche l'heure d'envoi

## Architecture Technique

### Composants

#### 1. ChatContext.tsx
**Rôle** : Gestion de l'état global du chat

**États gérés** :
- `messages`: Liste des messages de la conversation
- `isOpen`: État d'ouverture/fermeture du chat
- `isTyping`: Indicateur de saisie du bot
- `isTransferRequested`: Statut de la demande de transfert admin

**Fonctions** :
- `addMessage(content, role, context)`: Ajoute un message
- `clearHistory()`: Efface l'historique
- `toggleChat()`: Ouvre/ferme le chat
- `requestAdminTransfer()`: Demande un transfert vers admin

**Persistance** :
```typescript
// Clé localStorage
const historyKey = `chatHistory_${userId}`;

// Sauvegarde automatique
localStorage.setItem(historyKey, JSON.stringify(messages));

// Chargement au montage
const savedHistory = localStorage.getItem(historyKey);
```

#### 2. ChatWidget.tsx
**Rôle** : Interface utilisateur du chatbot

**Fonctionnalités UI** :
- Widget flottant en bas à droite
- Liste des messages avec scroll automatique
- Zone de saisie avec support de la touche Enter
- Animation de "typing" pendant la réponse du bot
- Badges de rôle (utilisateur, assistant, système)

**Algorithme de réponse** :
```typescript
const generateResponse = (message: string, currentPath: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Détection par mots-clés
  if (lowerMessage.includes('bien') || lowerMessage.includes('propriété')) {
    return "Réponse sur les biens...";
  }
  
  // ... autres cas
  
  return "Réponse par défaut";
};
```

### Intégration

**Layout principal** (`app/layout.tsx`) :
```tsx
<AuthProvider>
  <NotificationProvider>
    <ChatProvider>
      {children}
      <ChatWidget />
    </ChatProvider>
  </NotificationProvider>
</AuthProvider>
```

## Utilisation

### Pour l'utilisateur

1. **Ouvrir le chat** : Cliquer sur l'icône de message en bas à droite
2. **Poser une question** : Taper le message et appuyer sur Enter ou cliquer sur "Envoyer"
3. **Contacter un admin** : Cliquer sur "Contacter un admin" si besoin d'aide personnalisée
4. **Effacer l'historique** : Cliquer sur l'icône corbeille dans l'en-tête

### Messages d'accueil

Au premier ouverture, le bot envoie automatiquement :
```
Bonjour [Prénom] ! 👋

Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?

Vous pouvez me poser des questions sur :
• Nos biens immobiliers
• Les prix et disponibilités
• La prise de rendez-vous
• Les informations sur un bien spécifique

Si nécessaire, je peux aussi vous mettre en contact avec un administrateur.
```

## Exemples de conversations

### Exemple 1 : Recherche de bien
```
User: Je cherche un appartement à Nice
Bot: Nous avons une large sélection de biens immobiliers disponibles. 
     Vous pouvez consulter tous nos biens sur la page 'Biens' ou utiliser 
     les filtres pour affiner votre recherche (type, ville, prix, etc.).
```

### Exemple 2 : Question sur les prix
```
User: Combien coûte un appartement ?
Bot: Les prix de nos biens varient selon le type, la localisation et les 
     caractéristiques. Vous pouvez filtrer les biens par budget sur la page 
     de recherche.
```

### Exemple 3 : Demande de contact admin
```
User: Je voudrais parler à un humain
Bot: Je comprends que vous souhaitez parler à un administrateur. Cliquez 
     sur le bouton 'Contacter un admin' ci-dessous pour transmettre votre demande.

[Clic sur "Contacter un admin"]

System: Votre demande a été transmise à notre équipe. Un administrateur vous 
        contactera bientôt via votre email ou le chat.
```

## Mots-clés reconnus

### Biens immobiliers
- bien, propriété, appartement, maison, villa

### Prix
- prix, coût, tarif, combien

### Rendez-vous
- rendez-vous, visite, rdv, visiter

### Contact
- contact, téléphone, email, joindre

### Disponibilité
- disponible, libre, loué, vendu

### Localisation
- où, ville, quartier, localisation

### Équipements
- équipement, piscine, parking, jardin, balcon

### Transfert admin
- admin, humain, personne, agent

### Salutations
- bonjour, salut, hello, bonsoir

### Remerciements
- merci, thanks

## Personnalisation

### Ajouter de nouvelles réponses

Modifier la fonction `generateResponse` dans `ChatWidget.tsx` :

```typescript
// Nouvelle catégorie de questions
if (
  lowerMessage.includes('votre_mot_clé') ||
  lowerMessage.includes('autre_mot_clé')
) {
  return "Votre réponse personnalisée ici";
}
```

### Modifier le message d'accueil

Éditer le `useEffect` dans `ChatContext.tsx` :

```typescript
useEffect(() => {
  if (isOpen && messages.length === 0) {
    setTimeout(() => {
      addMessage(
        `Votre nouveau message d'accueil personnalisé`,
        'assistant'
      );
    }, 500);
  }
}, [isOpen]);
```

## Améliorations futures

### Court terme
- [ ] Intégration avec l'API backend pour des réponses dynamiques
- [ ] Suggestions de questions rapides (boutons prédéfinis)
- [ ] Détection de la langue (français/anglais)

### Moyen terme
- [ ] Affichage de cartes de biens dans le chat
- [ ] Liens rapides vers des biens recommandés
- [ ] Notifications push pour les réponses admin

### Long terme
- [ ] IA générative (GPT) pour des réponses plus naturelles
- [ ] Analyse de sentiment pour détecter la frustration
- [ ] Support multilingue complet
- [ ] Intégration avec un système de ticketing pour les demandes admin

## Tests

### Scénarios de test

1. **Test d'ouverture/fermeture**
   - Cliquer sur le bouton flottant → Le chat s'ouvre
   - Cliquer sur X → Le chat se ferme
   - Le bouton flottant réapparaît

2. **Test de conversation**
   - Taper "Bonjour" → Message d'accueil personnalisé
   - Taper "appartement" → Réponse sur les biens
   - Taper "prix" → Réponse sur les tarifs

3. **Test de persistance**
   - Envoyer plusieurs messages
   - Fermer et rouvrir le chat → Les messages sont conservés
   - Rafraîchir la page → L'historique persiste

4. **Test de transfert admin**
   - Cliquer sur "Contacter un admin" → Message système confirmé
   - Le bouton disparaît après la demande

5. **Test d'effacement**
   - Cliquer sur l'icône corbeille → L'historique est effacé
   - Le message d'accueil réapparaît à la prochaine ouverture

## Critères d'acceptation validés

- ✅ Interface de chat accessible sur toutes les pages
- ✅ Réponses contextuelles sur les biens
- ✅ Transfert vers un admin si nécessaire
- ✅ Historique de la conversation

## Fichiers créés/modifiés

### Nouveaux fichiers
1. `frontend/components/chat/ChatContext.tsx` - Contexte et logique du chat
2. `frontend/components/chat/ChatWidget.tsx` - Interface utilisateur du chatbot

### Fichiers modifiés
1. `frontend/app/layout.tsx` - Intégration du ChatProvider et ChatWidget
