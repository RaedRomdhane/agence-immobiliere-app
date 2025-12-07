# Système de Recommandations Personnalisées

## Vue d'ensemble

Le système de recommandations personnalisées offre aux utilisateurs des suggestions de biens immobiliers adaptées à leurs préférences et comportements de navigation.

## Fonctionnalités

### 1. Algorithme de Recommandation

Le système utilise plusieurs sources de données pour générer des recommandations :

- **Historique de navigation** : Propriétés récemment consultées
- **Critères de recherche** : Dernières recherches effectuées (type, ville, prix, chambres)
- **Exclusion intelligente** : Les biens déjà vus ne sont pas recommandés

### 2. Affichage des Recommandations

Sur la page d'accueil utilisateur (`/dashboard`), section "Recommandés pour vous" :

- **Maximum 3 suggestions** affichées
- **Badge "Recommandé"** avec icône Sparkles
- **Explication contextuelle** sous chaque bien
- **Image du bien** ou gradient par défaut
- **Informations clés** : Prix, localisation, chambres, salles de bain, surface

### 3. Explications des Recommandations

Chaque recommandation affiche la raison pour laquelle elle est suggérée :

- `Type: Appartement` - Correspond au type recherché
- `Localisation: Nice` - Correspond à la ville recherchée
- `3 chambres` - Correspond au nombre de chambres recherché
- `Nouvelle annonce` - Bien récent (si aucun critère ne correspond)

### 4. Système de Feedback

Les utilisateurs peuvent évaluer la pertinence des recommandations :

- **Pouce levé (ThumbsUp)** : J'aime cette suggestion
- **Pouce baissé (ThumbsDown)** : Pas intéressé

#### Comportement du feedback :

- **Like** : Sauvegarde la préférence, affiche "Merci ! Nous vous proposerons plus de biens similaires."
- **Dislike** : Retire le bien des recommandations, affiche "Merci pour votre retour ! Nous améliorerons vos recommandations."
- Les feedbacks sont stockés dans `localStorage` : `recommendationFeedback_${userId}`

## Stockage des Données

### localStorage

1. **`recentlyViewedProperties_${userId}`**
   - Liste des IDs de propriétés récemment consultées (max 6)
   - Mis à jour lors de la consultation d'une propriété

2. **`lastSearchCriteria_${userId}`**
   - Derniers critères de recherche utilisés
   - Structure :
     ```json
     {
       "type": "appartement",
       "city": "Nice",
       "priceMax": "500000",
       "bedrooms": "3",
       "timestamp": "2025-01-07T10:30:00.000Z"
     }
     ```

3. **`recommendationFeedback_${userId}`**
   - Feedbacks des utilisateurs sur les recommandations
   - Structure :
     ```json
     {
       "propertyId1": {
         "feedback": "like",
         "timestamp": "2025-01-07T10:30:00.000Z"
       },
       "propertyId2": {
         "feedback": "dislike",
         "timestamp": "2025-01-07T11:00:00.000Z"
       }
     }
     ```

## Flux de Données

### 1. Capture des Critères de Recherche

**Fichier** : `frontend/app/properties/page.tsx`

- La fonction `saveCriteria()` sauvegarde automatiquement les critères de recherche
- Déclenchée lors de :
  - Changement de type de bien
  - Changement de ville
  - Changement de critères (chambres, prix, etc.)
  - Soumission du formulaire de recherche

### 2. Suivi des Propriétés Consultées

**Fichier** : `frontend/app/properties/[id]/page.tsx`

- Ajoute automatiquement l'ID de la propriété consultée à l'historique
- Limite à 6 propriétés récemment vues

### 3. Génération des Recommandations

**Fichier** : `frontend/components/dashboard/DashboardHome.tsx`

```typescript
const fetchPersonalizedRecommendations = async () => {
  // 1. Récupérer l'historique et les critères
  const viewedIds = localStorage.getItem(`recentlyViewedProperties_${userId}`);
  const lastSearch = localStorage.getItem(`lastSearchCriteria_${userId}`);
  
  // 2. Construire les paramètres de recherche
  const params = {
    limit: 6,
    sort: '-createdAt',
    type: lastSearch.type,
    city: lastSearch.city,
    priceMax: lastSearch.priceMax,
    bedrooms: lastSearch.bedrooms
  };
  
  // 3. Récupérer les propriétés
  const properties = await apiClient.get('/properties', { params });
  
  // 4. Filtrer les propriétés déjà vues
  const filteredProperties = properties.filter(p => !viewedIds.includes(p._id));
  
  // 5. Générer les explications
  const reasons = generateReasons(filteredProperties, lastSearch);
  
  // 6. Afficher les 3 meilleures suggestions
  setRecommended(filteredProperties.slice(0, 3));
};
```

## Améliorations Futures

### Court terme
- [ ] Utiliser un toast/notification au lieu d'`alert()` pour le feedback
- [ ] Ajouter un loader pendant le chargement des recommandations
- [ ] Afficher "Aucune recommandation" avec un message invitant à explorer

### Moyen terme
- [ ] Prendre en compte les favoris de l'utilisateur
- [ ] Pondération des critères (ex: ville > type > chambres)
- [ ] Enregistrer les feedbacks côté backend pour analyse

### Long terme
- [ ] Algorithme de machine learning basé sur les comportements
- [ ] Recommandations collaboratives (utilisateurs similaires)
- [ ] API dédiée `/recommendations/:userId` côté backend
- [ ] Score de pertinence pour chaque recommandation

## Tests

### Test du système de recommandations

1. **Connexion** : Se connecter en tant qu'utilisateur
2. **Recherche** : Effectuer une recherche (ex: "Appartement à Nice, 3 chambres")
3. **Consultation** : Consulter 2-3 biens
4. **Retour au dashboard** : Vérifier la section "Recommandés pour vous"
5. **Vérifier** :
   - Les biens recommandés correspondent aux critères
   - Les explications sont affichées
   - Les biens consultés ne sont pas recommandés

### Test du feedback

1. Cliquer sur le pouce levé : Vérifier le message de confirmation
2. Cliquer sur le pouce baissé : Vérifier que le bien disparaît
3. Vérifier localStorage : `recommendationFeedback_${userId}` contient les feedbacks

## Critères d'Acceptation

- ✅ Algorithmes basés sur l'historique de navigation
- ✅ Suggestions affichées sur la page d'accueil
- ✅ Explication des recommandations (raisons)
- ✅ Feedback sur la pertinence des suggestions (like/dislike)
- ✅ Exclusion des biens déjà consultés
- ✅ Sauvegarde des critères de recherche
- ✅ Maximum 3 recommandations affichées

## Fichiers Modifiés

1. **frontend/components/dashboard/DashboardHome.tsx**
   - Ajout des états `recommended` et `recommendationReasons`
   - Hook `useEffect` pour fetch des recommandations
   - Fonction `handleRecommendationFeedback`
   - Import des icônes Sparkles, ThumbsUp, ThumbsDown, Info

2. **frontend/app/properties/page.tsx**
   - Mise à jour de `saveCriteria()` pour sauvegarder dans localStorage
   - Stockage de `lastSearchCriteria_${userId}`

3. **frontend/app/properties/[id]/page.tsx**
   - (Déjà présent) Tracking des propriétés consultées
