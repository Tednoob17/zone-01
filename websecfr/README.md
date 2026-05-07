# WebSecFr - Local Edition

Une plateforme complète de défis web security pour apprendre PHP et les vulnérabilités web courantes.

**Déjà contenu dans le package :**
- ✅ 33+ niveaux de défis (SQL injection, XSS, CSRF, etc.)
- ✅ Source code viewer pour chaque niveau
- ✅ Scoreboard et système de badges
- ✅ FAQ et documentation
- ✅ Compatible **100% offline** sur une machine sans internet

## 🚀 Démarrage Rapide

### Option 1 : Python/Flask (Recommandé - Fonctionne partout)

```bash
cd websecfr

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python app.py
```

Puis ouvrir : **http://localhost:5000**

### Option 2 : PHP Built-in Server (Si PHP est installé)

```bash
cd websecfr

# Exécuter le setup
python setup.py

# Lancer le serveur PHP
cd websec.fr
php -S localhost:8000
```

Puis ouvrir : **http://localhost:8000**

---

## 📁 Structure du Projet

```
websecfr/
├── websec.fr/
│   ├── level01/ → level33/     # Défis individuels
│   │   ├── index.html          # Page du défi
│   │   └── source.php.html     # Code source (syntaxé)
│   ├── static/                 # CSS, JS, assets
│   ├── scoreboard/             # Système de ranking
│   ├── login.html              # Page de login
│   ├── faq.html                # FAQ
│   └── index.html              # Page d'accueil
├── app.py                       # Serveur Flask
├── setup.py                     # Configuration PHP
├── requirements.txt             # Dépendances Python
└── README.md                    # Ce fichier
```

---

## 🎯 Types de Défis

### SQL Injection (Levels 1-10)
- Injection basique
- Filtrage de mots-clés
- Union-based injection
- Blind SQL injection

### Cross-Site Scripting - XSS (Levels 11-20)
- Reflected XSS
- Stored XSS
- DOM-based XSS
- Évasion de filtres

### Server-Side Template Injection (Levels 21-30)
- SSTI basique
- Accès au filesystem
- Exécution de code

### Advanced (Levels 31-33)
- SSRF (Server-Side Request Forgery)
- File Upload vulnerabilities
- Exploitation chaining

---

## 💡 Comment Utiliser

### 1. Accéder à un Défi
- Clique sur un niveau depuis la page d'accueil
- Lis la description et comprends l'objectif
- Clique sur "View Source" pour voir le code contrôlé

### 2. Trouver la Vulnérabilité
- Analyse le code source
- Identifie comment l'entrée utilisateur est traitée
- Teste avec des payloads simples en premier

### 3. Exploiter et Capturer Le Flag
- Utilise la vulnérabilité pour extraire le flag
- Soumets le flag quand tu l'as trouvé
- Le système te confirmera si c'est correct

### 4. Consulter le Scoreboard
- Voie tu progrès dans la section "Scoreboard"
- Badges et achievements au fur et à mesure

---

## 🔧 Configuration Avancée

### Modifier les Flags
Édite `app.py` et la section `correct_flags` :

```python
correct_flags = {
    'level01': 'ton_flag_ici',
    'level02': 'un_autre_flag',
}
```

### Ajouter des Défis Personnalisés
1. Crée un nouveau dossier `levelXX/` dans `websec.fr/`
2. Ajoute `index.html` (ta page de défi)
3. Ajoute `source.php.html` (ton code source)
4. Ajoute l'entrée à `CHALLENGES` dans `app.py`

### Utiliser Une Base de Données Persistante
Les défis utilisent **SQLite** par défaut. Les données sont sauvegardées dans des fichiers `.db` dans chaque dossier de niveau.

---

## 📊 Système de Points

- Chaque défi résolu = 1 badge
- Points basés sur la difficulté :
  - 🟢 Beginner = 10 pts
  - 🔵 Intermediate = 25 pts
  - 🔴 Hard = 50 pts
  - ⚫ Extreme = 100 pts

---

## 🔌 Problèmes et Solutions

### Le serveur ne démarre pas
```bash
# Vérifiez que le port est libre
lsof -i :5000    # Pour Flask
lsof -i :8000    # Pour PHP

# Utilisez un port différent
python app.py --port 8080
```

### Erreur "ModuleNotFoundError: No module named 'flask'"
```bash
pip install -r requirements.txt --upgrade
```

### Les défis ne chargent pas
- Vérifiez que `websecfr/websec.fr/` existe
- Assurez-vous que les chemins sont corrects (pas d'espaces dans les noms de dossiers)

---

## 📚 Ressources pour Apprendre

### Documentation OWASP
- https://owasp.org/www-community/attacks/SQL_Injection

### Cheat Sheets
- SQL Injection: [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)
- XSS: [PortSwigger](https://portswigger.net/web-security/cross-site-scripting)

---

## 🛡️ Notes de Sécurité

Ce projet est **intentionnellement vulnérable** à des fins éducatives. 
- ⚠️ **NE PAS** déployer en production
- ⚠️ **NE PAS** utiliser sa logique en code réel
- ✅ Utilise-le **uniquement** pour apprendre les vulnérabilités

---

## 📝 Licence

Basé sur le projet original WebSec.fr - Modifié pour l'usage offline local.

---

## 🤝 Contribution

Pour ajouter des niveaux ou corriger des bugs :
1. Fork le projet
2. Crée une branche
3. Fais tes changements
4. Soumets une PR

---

**Bon apprentissage et bon hacking! 🎯**
