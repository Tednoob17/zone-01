#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

echo "=== [1/5] Nettoyage des .git résiduels dans 01-edu-repos/ ==="
find 01-edu-repos -mindepth 2 -maxdepth 2 -name ".git" -exec rm -rf {} + 2>/dev/null || true
find 01-edu-repos -mindepth 2 -maxdepth 2 -name ".gitignore" -delete 2>/dev/null || true
find 01-edu-repos -mindepth 2 -maxdepth 2 -name ".github" -exec rm -rf {} + 2>/dev/null || true
echo "  ✓ .git / .gitignore / .github supprimés"

echo ""
echo "=== [2/5] Vérification des gitlinks dans l'index Git ==="
GITLINKS=$(git ls-files --stage 01-edu-repos/ | grep "^160000" | wc -l)
echo "  Gitlinks trouvés : $GITLINKS"

echo ""
echo "=== [3/5] Suppression des entrées de l'index Git ==="
git rm --cached -r 01-edu-repos/ 2>/dev/null || true
echo "  ✓ Index vidé pour 01-edu-repos/"

echo ""
echo "=== [4/5] Ré-indexation du contenu réel ==="
git add 01-edu-repos/
STAGED=$(git status --short | grep "^A" | wc -l)
echo "  ✓ $STAGED fichiers ajoutés au staging"

echo ""
echo "=== [5/5] Commit + Push ==="
git commit -m "fix: inclure contenu repos 01-edu (correction gitlinks)"
git push
echo ""
echo "✅ Terminé ! Les repos devraient être visibles sur GitHub."
