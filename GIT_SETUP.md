# 🔗 Git Repository Setup Guide

## ✅ Local Repository Initialized

Your project is now under version control with Git!

**Current Status:**
- ✅ Git repository initialized
- ✅ Initial commit created (commit hash: 1916c23)
- ✅ 14 files committed
- ✅ All policies documented in agents.md

---

## 🚀 Push to GitHub (Recommended)

### Option 1: Using GitHub CLI (Fastest)

```bash
# Install GitHub CLI if not already installed
# Windows: winget install GitHub.cli

# Login to GitHub
gh auth login

# Create repository and push
gh repo create persian-voice-assistant --public --source=. --remote=origin --push

# Done! Your repo is now on GitHub
```

### Option 2: Using GitHub Web Interface

#### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `persian-voice-assistant`
3. Description: `Persian voice-activated payment assistant on Cloudflare`
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

#### Step 2: Push Your Local Repository
```bash
# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/persian-voice-assistant.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 3: Verify Upload
Visit: `https://github.com/YOUR_USERNAME/persian-voice-assistant`

---

## 📋 Repository Information

### Files Committed (14 files)
```
✅ .gitignore                    - Git ignore rules
✅ DEPLOYMENT.md                 - Deployment guide
✅ README.md                     - Project documentation
✅ TESTING.md                    - Testing procedures
✅ agents.md                     - Development policies
✅ package.json                  - Dependencies
✅ package-lock.json             - Lock file
✅ wrangler.toml                 - Cloudflare config
✅ schema.sql                    - Database schema
✅ public/index.html             - Frontend UI
✅ public/script.js              - Voice logic
✅ public/style.css              - Styles
✅ functions/api/elevenlabs.js   - TTS proxy
✅ functions/api/payments.js     - Payment API
```

### Files NOT Committed (Gitignored)
```
❌ node_modules/                 - Dependencies
❌ .dev.vars                     - Local secrets
❌ .wrangler/                    - Wrangler cache
```

---

## 🔄 Daily Git Workflow (From agents.md)

### After Every Change
```bash
# 1. Check what changed
git status

# 2. Stage changes
git add .

# 3. Commit with proper message
git commit -m "type(scope): description"

# 4. Push to GitHub
git push origin main
```

### Commit Message Examples
```bash
# Adding new feature
git commit -m "feat(ui): add payment history page"

# Fixing bug
git commit -m "fix(tts): resolve audio playback on Safari"

# Updating documentation
git commit -m "docs(readme): add installation instructions"

# Refactoring code
git commit -m "refactor(api): simplify error handling logic"
```

---

## 🌿 Branch Strategy

### Main Branch
- Always deployable
- Protected (recommend setting branch protection on GitHub)
- Receives merged features

### Feature Branches (Optional)
```bash
# Create feature branch
git checkout -b feature/payment-history

# Work on feature, commit regularly
git add .
git commit -m "feat(history): add database query function"

# Push feature branch to GitHub
git push origin feature/payment-history

# Create Pull Request on GitHub, then merge

# Switch back to main and pull
git checkout main
git pull origin main
```

---

## 🔐 GitHub Repository Settings

### Recommended Settings

#### 1. Branch Protection (Settings → Branches)
- Protect `main` branch
- Require pull request reviews (for teams)
- Require status checks to pass

#### 2. Secrets (Settings → Secrets → Actions)
Add these secrets for GitHub Actions CI/CD:
- `CLOUDFLARE_API_TOKEN`
- `ELEVENLABS_API_KEY`

#### 3. Description & Topics
- **Description**: `Persian voice-activated payment assistant powered by Cloudflare Pages, ElevenLabs, and Web Speech API`
- **Topics**: `cloudflare`, `elevenlabs`, `voice-assistant`, `persian`, `payment`, `d1`, `pages-functions`
- **Website**: Your Cloudflare Pages URL

---

## 🤖 Automated Deployment (Optional)

### GitHub Actions + Cloudflare

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy public --project-name=persian-voice-assistant
```

**Setup:**
```bash
# Create workflow directory
mkdir -p .github/workflows

# Create the file with content above
# Then commit and push

git add .github/workflows/deploy.yml
git commit -m "ci(github): add automated deployment workflow"
git push origin main
```

---

## 📊 Git Statistics

### View Commit History
```bash
# Detailed log
git log

# One-line format
git log --oneline

# With graph
git log --graph --oneline --all
```

### View Changes
```bash
# See uncommitted changes
git diff

# See changes in specific file
git diff public/script.js

# See changes between commits
git diff HEAD~1 HEAD
```

### Current Status
```bash
# Initial commit created
Commit: 1916c23
Author: (your git config)
Date: December 19, 2025
Files: 14 files, 3816 insertions
Message: feat(init): initialize Persian voice payment assistant project
```

---

## 🔗 Remote Repository URLs

### HTTPS (Default)
```bash
git remote add origin https://github.com/YOUR_USERNAME/persian-voice-assistant.git
```

### SSH (More Secure)
```bash
# Setup SSH key first
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add to GitHub: Settings → SSH Keys

# Then use SSH URL
git remote add origin git@github.com:YOUR_USERNAME/persian-voice-assistant.git
```

---

## 📝 Quick Reference

### Essential Commands
```bash
git status              # Check current state
git add .               # Stage all changes
git commit -m "msg"     # Commit with message
git push                # Push to remote
git pull                # Pull from remote
git log --oneline       # View history
git diff                # See changes
```

### Undo Commands
```bash
git restore <file>      # Discard changes in file
git reset HEAD~1        # Undo last commit (keep changes)
git reset --hard HEAD~1 # Undo last commit (discard changes)
git revert <commit>     # Create new commit that undoes changes
```

### Branch Commands
```bash
git branch              # List branches
git checkout -b <name>  # Create and switch to branch
git checkout <name>     # Switch to branch
git merge <branch>      # Merge branch into current
git branch -d <name>    # Delete branch
```

---

## ✅ Next Steps

1. **Push to GitHub** (choose Option 1 or 2 above)
2. **Add repository description** on GitHub
3. **Enable branch protection** for main
4. **Set up GitHub Actions** for auto-deployment (optional)
5. **Add repository to Cloudflare** Pages dashboard (optional Git integration)

---

## 🎯 Repository Best Practices

- ✅ Commit frequently with clear messages
- ✅ Push at least once daily
- ✅ Never commit secrets or API keys
- ✅ Write descriptive commit messages
- ✅ Review changes before committing
- ✅ Keep main branch deployable
- ✅ Use branches for major features
- ✅ Document all changes

---

## 📞 Troubleshooting

### Issue: "Permission denied (publickey)"
**Solution:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/persian-voice-assistant.git
```

### Issue: "Failed to push"
**Solution:**
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue: "Merge conflicts"
**Solution:**
```bash
# View conflicted files
git status

# Edit files to resolve conflicts
# Then:
git add .
git commit -m "fix(merge): resolve merge conflicts"
git push origin main
```

---

**Your repository is ready! Follow the steps above to push to GitHub.** 🚀

**Current Commit:** `1916c23`  
**Files Tracked:** 14  
**Lines of Code:** 3,816  
**Status:** ✅ Ready to push
