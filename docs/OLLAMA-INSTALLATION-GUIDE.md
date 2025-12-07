# 🦙 Guide d'Installation Ollama (IA Gratuite 100%)

## 📋 Pourquoi Ollama ?

- ✅ **100% GRATUIT** - Aucun frais, aucune limite
- ✅ **Privé** - Tout fonctionne sur ton PC (aucune donnée envoyée à l'extérieur)
- ✅ **Rapide** - Réponses instantanées une fois installé
- ✅ **Pas de compte nécessaire** - Pas besoin de créer de compte ou de carte bancaire

## 📥 Étape 1 : Installer Ollama

### Windows
1. Va sur : https://ollama.ai/download/windows
2. Télécharge `OllamaSetup.exe` (~500 MB)
3. Lance l'installateur
4. Suis les instructions d'installation
5. Redémarre ton ordinateur (recommandé)

## 🤖 Étape 2 : Télécharger le Modèle IA

Après l'installation, ouvre PowerShell et lance :

```powershell
# Télécharger le modèle Llama 3.2 (3B) - petit et rapide
ollama pull llama3.2:3b
```

**Temps de téléchargement** : ~2-5 minutes (1.7 GB)

### Modèles disponibles (tu peux choisir)
```powershell
# Petit et rapide (recommandé pour chatbot)
ollama pull llama3.2:3b        # ~1.7 GB, très rapide

# Moyen (meilleure qualité)
ollama pull llama3.2:8b        # ~4 GB, bon équilibre

# Grand (meilleure qualité mais plus lent)
ollama pull llama3.1:8b        # ~4.7 GB, très bon
```

## ✅ Étape 3 : Vérifier l'Installation

```powershell
# Vérifier la version
ollama --version

# Lister les modèles installés
ollama list

# Tester Ollama
ollama run llama3.2:3b "Bonjour, comment vas-tu?"
```

Si ça fonctionne, tu verras une réponse en français !

## 🚀 Étape 4 : Lancer le Serveur Ollama

```powershell
# Lancer Ollama en arrière-plan
ollama serve
```

Laisse cette fenêtre ouverte en arrière-plan.

**Alternative** : Ollama se lance automatiquement au démarrage de Windows après l'installation.

## 🔧 Étape 5 : Configurer ton Backend

Le fichier `.env` est déjà configuré avec :

```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

C'est tout ! Aucune clé API nécessaire.

## 🎯 Étape 6 : Tester le Chatbot

1. **Redémarre le backend** :
   ```powershell
   cd backend
   npm run dev
   ```

2. **Vérifie les logs** - tu devrais voir :
   ```
   🦙 Attempting to connect to Ollama...
   📍 URL: http://localhost:11434
   🤖 Model: llama3.2:3b
   ✅ Ollama AI configured successfully (FREE!)
   ```

3. **Teste sur ton site web** - le chatbot utilisera maintenant Ollama !

## 🔍 Dépannage

### Erreur : "Ollama not found"
- Redémarre PowerShell après l'installation
- Vérifie l'installation : `ollama --version`

### Erreur : "Connection refused"
- Lance Ollama : `ollama serve`
- Vérifie que le port 11434 est disponible

### Réponses lentes
- Utilise un modèle plus petit : `llama3.2:3b`
- Ton PC a besoin de 8GB+ RAM pour de bonnes performances

### Changer de modèle
Modifie dans `.env` :
```env
OLLAMA_MODEL=llama3.2:8b  # Pour meilleure qualité
```

## 📊 Configuration Système Recommandée

- **RAM** : 8GB minimum (16GB recommandé)
- **Espace disque** : 5-10 GB libre
- **CPU** : N'importe quel processeur moderne (GPU optionnel mais accélère les réponses)

## 🔄 Revenir à OpenAI si besoin

Si tu veux utiliser OpenAI plus tard, change dans `.env` :
```env
AI_PROVIDER=openai
OPENAI_API_KEY=ta-clé-api
```

## 📚 Ressources

- Site officiel : https://ollama.ai
- Documentation : https://github.com/ollama/ollama/blob/main/README.md
- Modèles disponibles : https://ollama.ai/library

## ✨ Avantages vs OpenAI

| Caractéristique | Ollama | OpenAI |
|----------------|--------|--------|
| **Prix** | 100% Gratuit ✅ | $1-2/1000 conversations ❌ |
| **Confidentialité** | 100% Local ✅ | Données envoyées au cloud ❌ |
| **Vitesse** | Instantané (après chargement) ✅ | Dépend d'Internet 🟡 |
| **Qualité** | Très bon 🟡 | Excellent ✅ |
| **Installation** | Nécessite installation 🟡 | Juste une clé API ✅ |

---

**Résumé** : Ollama est parfait pour un chatbot gratuit, privé et rapide ! 🎉
