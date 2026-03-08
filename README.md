# zone-01

Documentation et outils de la pédagogie Zone01 / 01-edu — tout est centralisé **dans ce dépôt**, pas besoin de cloner des repos externes.

---

## Cloner ce dépôt

```bash
git clone https://github.com/Tednoob17/zone-01
cd zone-01
```

Tous les outils de test sont déjà inclus dans `01-edu-repos/`.

---

## Outils de test — La moulinette

### 🐹 go-tests — Piscine Go

**Emplacement :** `01-edu-repos/go-tests/`

```bash
cd 01-edu-repos/go-tests

# Build de l'image Docker
docker build -t go_tests .

# Tester un exercice
./test_one.sh isnegative

# Tester tous les exercices
./test_all.sh

# Tester dans le conteneur Docker (comme en production)
./test_with_docker.sh getalpha getalpha/main.go --allow-builtin github.com/01-edu/z01.PrintRune strconv.Atoi os.Args
```

---

### 🦀 rust-tests — Piscine Rust

**Emplacement :** `01-edu-repos/rust-tests/`

```bash
cd 01-edu-repos/rust-tests

# Build de l'image Docker
docker build -t rust_tests .

# Prérequis Rust
rustup component add rustfmt
rustup component add clippy

# Tester tous les exercices
bash tests/test_exercises.sh

# Tester en environnement de production
bash tests/test_exercises.sh -real

# Aide
bash tests/test_exercises.sh -h
```

---

### 🚔 rc — Restrictions Checker

**Emplacement :** `01-edu-repos/rc/`

```bash
# Option 1 — build depuis ce dépôt
cd 01-edu-repos/rc
go build -o rc .
./rc main.go fmt.* github.com/01-edu/z01.PrintRune len

# Option 2 — installer avec go directement
go install github.com/01-edu/rc@latest
```

Flags utiles :
- `-allow-builtin` — autorise toutes les fonctions built-in
- `-no-for` — interdit les boucles `for`
- `-cast` — autorise le casting vers les types built-in
- `--no-lit="{PATTERN}"` — interdit les littéraux correspondant au pattern

---

### 🏋️ go-tests-training — Entraînement pédagogique

**Emplacement :** `01-edu-repos/go-tests-training/`

```bash
cd 01-edu-repos/go-tests-training

# Build de l'image Docker
docker build -t go_tests_training .

# Tester un exercice
./test_one.sh nom_exercice

# Tester tous les exercices
./test_all.sh
```

---

## Structure du dépôt

```
01-edu-repos/
  go-tests/            # Moulinette Go (Docker)
  rust-tests/          # Moulinette Rust (Docker)
  rc/                  # Restrictions Checker (Go binary)
  go-tests-training/   # Version training de go-tests
  public/              # Sujets piscine Go, Shell, AI
  Branch-AI/           # Branche spécialisation IA
  Branch-Blockchain/   # Branche Blockchain & Crypto
  UX-UI/               # Branche UX/UI
  ...
```

---

## Deploiement Vercel (index public + sec + archivage)

Objectif:
- `index.html` visible par tout le monde
- `sec.html` accessible pour ton training
- archivage actif via API `/api/archive`

Important:
- Si tu heberges seulement un fichier statique (`sec.html` seul), l'archivage ne peut pas marcher.
- L'archivage a besoin des fonctions serverless dans `api/archive/*.js`.

### 1. Preparer le repo

Verifier que ces fichiers existent:
- `sec.html`
- `index.html`
- `api/archive/index.js`
- `api/archive/[id].js`
- `api/_lib/archive-store.js`
- `api/_lib/sanitize-html.js`

Puis push:

```bash
git add .
git commit -m "Configure Vercel archive API"
git push
```

### 2. Configurer Vercel

1. Importer le repo dans Vercel.
2. Framework Preset: `Other`.
3. Root directory: `/` (racine du repo).
4. Build command: laisser vide.
5. Output directory: laisser vide.

### 3. Activer le Storage (obligatoire pour l'archivage)

Si tu vois la liste Marketplace (Neon, Upstash, Supabase, etc.), prends `Upstash`.

Option A (si tu vois Vercel KV directement):
1. Vercel Dashboard -> Storage -> Create -> `KV`.
2. Connecter KV au projet.
3. Verifier les variables:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`

Option B (si KV n'apparait pas et tu vois Marketplace):
1. Vercel Dashboard -> Storage -> Marketplace -> `Upstash`.
2. Choisir `Redis` et connecter au projet.
3. Verifier les variables:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

Puis redeployer le projet.

Sans storage configure, l'API repondra `503` et l'UI affichera une erreur archive.

### 4. URLs attendues apres deploiement

- `https://ton-projet.vercel.app/` -> `index.html`
- `https://ton-projet.vercel.app/sec.html` -> page training
- `https://ton-projet.vercel.app/api/archive` -> JSON (liste des archives)

Test rapide:

```bash
curl -i https://ton-projet.vercel.app/api/archive
```

Tu dois obtenir `200 OK` (ou `503` si KV manque), mais pas `404`.

### 5. Pourquoi la Galaxy peut afficher 0.0%

La progression Galaxy est stockee dans `localStorage` du navigateur:
- domaine local (`localhost`) != domaine Vercel
- navigateur A != navigateur B
- mode prive peut repartir de zero

Donc `0.0%` sur Vercel apres avoir coche en local est normal.

### 6. Depannage concret

- `Archivage echoue: HTTP 404`:
  - l'API n'est pas deployee (ou mauvais repo/root sur Vercel)
  - verifier la route `/api/archive`

- `Archivage echoue: HTTP 503`:
  - storage non configure
  - ajouter `KV_REST_API_*` ou `UPSTASH_REDIS_REST_*`, puis redeploy

- `Galaxy reste a 0%`:
  - recocher les taches sur le meme domaine et meme navigateur
  - verifier que le navigateur n'efface pas le `localStorage`

### 7. Option locale (hors Vercel)

Pour tester localement avec serveur Node:

```bash
npm start
```

Puis ouvrir:
- `http://localhost:4173/` (index)
- `http://localhost:4173/sec` ou `http://localhost:4173/sec.html`
