# WebSecFr Setup - Quick Reference

## 🎯 Objectif
Créer une plateforme de défis de sécurité web 100% fonctionnelle et offline sur ta machine Linux avec stockage swap sur un DD externe.

---

## ✅ Ce Qui Est Fait

### 📦 Structure Créée
```
websecfr/
├── websec.fr/              # Archive originale des défis
│   ├── level01-level33/    # 33 niveaux de défis
│   ├── static/             # Assets (CSS, JS, Bootstrap)
│   ├── scoreboard/         # Système de classement
│   └── index.html          # Page d'accueil
├── app.py                  # Serveur Flask (CŒUR)
├── setup.py                # Alternative PHP
├── requirements.txt        # pip dependencies
├── run.sh                  # Script de démarrage
└── README.md               # Documentation complète
```

### 🚀 Comment Lancer

**Méthode Recommandée (Flask - Fonctionne partout):**
```bash
cd /workspaces/zone-01/websecfr
bash run.sh                    # Crée venv + installe + lance
```

**OU Manuellement:**
```bash
cd /workspaces/zone-01/websecfr
python3 -m venv venv          # Une fois
source venv/bin/activate      # À chaque démarrage
pip install -r requirements.txt # Une fois
python app.py                  # Lance le serveur
```

**URL d'accès:**
```
http://localhost:5000
```

---

## 💻 Architecture

### Backend (Flask - app.py)
- ✅ Homepage avec liste des défis
- ✅ Serveuse les pages HTML statiques des défis
- ✅ API `/api/verify/<level_id>` pour validation des flags
- ✅ Système de sessions pour tracker la progression
- ✅ Initialisation SQLite automatique

### Frontend (Static - websec.fr/)
- ✅ 33+ défis (level01 à level33)
- ✅ Code source avec syntax highlighting
- ✅ Pages de description individuelles
- ✅ Scoreboard
- ✅ FAQ et documentation

### Stockage
- **Défis**: HTML statique (lecture seule)
- **Progrès**: Sessions Flask (en mémoire)
- **Bases de données**: SQLite auto-créées

---

## 🎮 Utilisation

### Pour un Utilisateur
1. Ouvre http://localhost:5000
2. Clique sur un niveau de défi
3. Lis le code source (View Source)
4. Trouve et soumets le flag
5. Reçois une confirmation de succès

### Pour un Admin
- Modifier les flags dans `app.py` ligne ~100
- Ajouter des niveaux en créant `level_XX/` folders
- Personnaliser les messages/UI en editant les templates

---

## 🔧 Dépannage

### Port déjà utilisé?
```bash
python app.py --port 8080
```

### Package Flask manquant?
```bash
pip install Flask==2.3.0
```

### Permission denied au run.sh?
```bash
chmod +x run.sh
bash run.sh
```

---

## 📊 Résumé de Sécurité

**Ce que la plateforme enseigne:**
- ✅ SQL Injection (levels 1-10)
- ✅ XSS / Cross-Site Scripting (levels 11-20)
- ✅ Server-Side Template Injection (levels 21-30)
- ✅ SSRF et File Uploads (levels 31-33)

**Points clés:**
- Chaque défi a du code source visible pour étudier la vulnérabilité
- Les flags sont pré-définis et facilement trouvables en exploitant la faille
- Système de scoring basé sur la difficulté

---

## 📚 Fichiers Importants

| Fichier | Rôle | Modifiable?
|---------|------|----------
| `app.py` | Serveur principal | ✅ Oui
| `setup.py` | Setup PHP | ✅ Oui
| `websec.fr/` | Défis statiques | ⚠️ Lecture seule
| `requirements.txt` | Dependencies | ✅ Oui
| `README.md` | Doc complète | ✅ Oui

---

## 🎓 Prochaines Étapes

1. **Lancer le serveur**: `bash run.sh`
2. **Accéder à la plateforme**: http://localhost:5000
3. **Commencer par level01**: SQL Injection basique
4. **Progresser graduellement**: Les niveaux augmentent en difficulté
5. **Consulter la FAQ** pour des hints quand tu es bloqué

---

**C'est une plateforme complète, self-contained, et 100% offline!** 🎉
