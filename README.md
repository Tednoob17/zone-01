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

