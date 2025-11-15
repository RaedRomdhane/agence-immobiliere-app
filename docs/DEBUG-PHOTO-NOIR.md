# 🔍 Guide de Diagnostic - Images Noires

## Problème
Les images uploadées s'affichent en noir dans le composant PhotoUploader.

## Outils de Diagnostic Créés

### 1. Test HTML Standalone (`test-photo-preview.html`)
**Comment l'utiliser:**
1. Ouvrir le fichier directement dans le navigateur
2. Sélectionner des photos
3. Observer les 3 méthodes de test en parallèle
4. Vérifier la console (F12) pour les logs détaillés

**Ce qu'il teste:**
- ✅ Méthode 1: `URL.createObjectURL()` (blob URLs)
- ✅ Méthode 2: `FileReader` avec base64
- ✅ Méthode 3: Styles inline forcés

**Résultat attendu:**
- Les 3 méthodes doivent afficher les images correctement
- Si l'une échoue, on identifie quelle méthode a un problème

### 2. Composant de Diagnostic React (`/debug/photo-test`)
**Comment l'utiliser:**
1. Aller sur: http://localhost:3000/debug/photo-test
2. Uploader des photos
3. Observer les résultats en temps réel
4. Consulter les logs dans l'interface

**Ce qu'il teste:**
- ✅ Comportement dans l'environnement Next.js
- ✅ Interaction avec Turbopack
- ✅ Les 3 mêmes méthodes dans React
- ✅ Logs détaillés à l'écran

## Étapes de Diagnostic

### Étape 1: Test HTML Standalone
```bash
# Ouvrir dans le navigateur
start test-photo-preview.html
```

**Questions à vérifier:**
1. Les 3 méthodes affichent-elles toutes les images ?
2. Y a-t-il des erreurs dans la console ?
3. Les dimensions des images sont-elles détectées ?

**Résultats possibles:**
- ✅ **Toutes les méthodes fonctionnent** → Le problème vient de Next.js/React
- ❌ **Aucune méthode ne fonctionne** → Problème avec les fichiers images eux-mêmes
- ⚠️ **Certaines méthodes fonctionnent** → Problème spécifique à une méthode

### Étape 2: Test dans Next.js
```bash
# Aller sur
http://localhost:3000/debug/photo-test
```

**Questions à vérifier:**
1. Le comportement est-il différent du test HTML ?
2. Y a-t-il des erreurs spécifiques à Next.js ?
3. Les blob URLs fonctionnent-elles avec Turbopack ?

### Étape 3: Inspection du DOM
**Dans le navigateur (F12):**
1. Ouvrir les DevTools
2. Onglet "Elements" / "Inspecteur"
3. Trouver l'élément `<img>` noir
4. Vérifier:
   ```
   - src="..." (URL présente ?)
   - Computed styles (display, width, height, z-index ?)
   - Background colors qui pourraient cacher l'image ?
   ```

### Étape 4: Vérification Console
**Console JavaScript (F12):**
Chercher ces messages:
```javascript
✅ Base64 créé pour: [nom fichier]
❌ Erreur lecture: [détails]
🖼️ Image chargée: [dimensions]
```

### Étape 5: Network Tab
**Onglet Réseau (F12):**
1. Recharger la page
2. Uploader des images
3. Vérifier:
   - Les blob URLs apparaissent-elles ?
   - Statut HTTP: 200 OK ?
   - Taille des fichiers correcte ?

## Causes Possibles et Solutions

### Cause 1: Z-index ou Overlay
**Symptôme:** Image existe mais cachée sous un autre élément

**Vérification:**
```javascript
// Dans la console
document.querySelectorAll('img').forEach(img => {
  console.log(img.src, window.getComputedStyle(img).zIndex);
});
```

**Solution:**
```tsx
<img style={{ zIndex: 10 }} ... />
```

### Cause 2: Background noir qui cache l'image
**Symptôme:** Container a un background qui cache l'image

**Vérification:**
```javascript
// Dans la console
document.querySelectorAll('.preview-item').forEach(div => {
  console.log(window.getComputedStyle(div).backgroundColor);
});
```

**Solution:**
```tsx
<div style={{ background: 'white' }}>
```

### Cause 3: Object-fit avec dimensions incorrectes
**Symptôme:** Image a les bonnes dimensions mais ne s'affiche pas

**Vérification:**
```javascript
document.querySelectorAll('img').forEach(img => {
  const computed = window.getComputedStyle(img);
  console.log({
    width: computed.width,
    height: computed.height,
    objectFit: computed.objectFit,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight
  });
});
```

**Solution:**
```tsx
<img style={{ 
  width: '100%', 
  height: '100%', 
  objectFit: 'cover',
  display: 'block'
}} />
```

### Cause 4: Turbopack / Next.js Image Optimization
**Symptôme:** Fonctionne en HTML standalone mais pas dans Next.js

**Solution:**
Désactiver temporairement l'optimisation d'images:
```tsx
// next.config.ts
export default {
  images: {
    unoptimized: true
  }
}
```

### Cause 5: CSP (Content Security Policy)
**Symptôme:** Blob URLs bloquées par la politique de sécurité

**Vérification console:**
```
Refused to load blob:... because it violates the following Content Security Policy directive
```

**Solution:**
```tsx
// next.config.ts
async headers() {
  return [{
    source: '/:path*',
    headers: [{
      key: 'Content-Security-Policy',
      value: "img-src 'self' data: blob:;"
    }]
  }]
}
```

## Commandes de Debug Utiles

### Console Browser
```javascript
// Lister toutes les images et leurs sources
document.querySelectorAll('img').forEach((img, i) => {
  console.log(`Image ${i}:`, {
    src: img.src.substring(0, 50),
    complete: img.complete,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    displayed: {
      width: img.offsetWidth,
      height: img.offsetHeight
    }
  });
});

// Vérifier les styles computed
const img = document.querySelector('img');
const styles = window.getComputedStyle(img);
console.log({
  display: styles.display,
  width: styles.width,
  height: styles.height,
  objectFit: styles.objectFit,
  backgroundColor: styles.backgroundColor,
  zIndex: styles.zIndex
});

// Forcer l'affichage
document.querySelectorAll('img').forEach(img => {
  img.style.backgroundColor = 'red'; // Pour voir si l'élément existe
  img.style.border = '5px solid lime';
});
```

## Checklist de Diagnostic

- [ ] Test HTML standalone fonctionne
- [ ] Test Next.js fonctionne
- [ ] Console ne montre aucune erreur
- [ ] Network tab montre les blob URLs
- [ ] Images ont des dimensions > 0
- [ ] Pas de background noir qui cache
- [ ] z-index correct
- [ ] object-fit défini
- [ ] CSP autorise blob: et data:

## Rapporter le Problème

Une fois le diagnostic fait, noter:
1. **Navigateur:** Chrome/Firefox/Safari + version
2. **Méthode qui fonctionne:** Blob / Base64 / Aucune
3. **Erreurs console:** Copier les erreurs exactes
4. **Styles computed:** Copier les valeurs CSS
5. **Screenshots:** Avant/après avec DevTools ouvert

---

**Prochaine étape:** Exécutez les tests et rapportez les résultats ! 🚀
