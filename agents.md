# 🤖 Agent Development Policies & Guidelines

## 📋 Table of Contents
1. [Git Workflow Policy](#git-workflow-policy)
2. [Git Commit Message Convention](#git-commit-message-convention)
3. [Development Guidelines](#development-guidelines)
4. [Code Review Standards](#code-review-standards)

---

## 🔄 Git Workflow Policy

### Core Principles
- **Commit Early, Commit Often**: After every meaningful change, commit immediately
- **Never Break Main**: Main branch must always be deployable
- **Atomic Commits**: Each commit should represent one logical change
- **Push Regularly**: Push commits to remote at least daily

### Mandatory Workflow

#### 1. Before Starting Work
```bash
# Always pull latest changes first
git pull origin main

# Check current status
git status
```

#### 2. After Every Change
```bash
# Stage changes
git add .

# Commit with proper message (see conventions below)
git commit -m "type(scope): description"

# Push to remote
git push origin main
```

#### 3. When Adding New Features
```bash
# Optional: Create feature branch for major features
git checkout -b feature/feature-name

# Make changes and commit regularly
git add .
git commit -m "feat(feature-name): add new capability"

# Merge back to main when complete
git checkout main
git merge feature/feature-name
git push origin main
```

### Frequency Requirements
- ✅ **Minimum**: Commit after every file creation/modification
- ✅ **Recommended**: Commit after every logical unit of work
- ✅ **Best Practice**: Commit multiple times per feature implementation

### What Triggers a Commit
- Created new file(s)
- Modified existing file(s)
- Fixed a bug
- Added a feature
- Updated documentation
- Refactored code
- Changed configuration
- Updated dependencies

---

## 📝 Git Commit Message Convention

### Format Standard
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type Classification

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(payment): add voice recognition` |
| `fix` | Bug fix | `fix(tts): resolve audio playback issue` |
| `docs` | Documentation only | `docs(readme): update deployment steps` |
| `style` | Code style/formatting | `style(css): improve button spacing` |
| `refactor` | Code refactoring | `refactor(api): simplify error handling` |
| `perf` | Performance improvement | `perf(db): optimize query performance` |
| `test` | Adding/updating tests | `test(payment): add unit tests` |
| `build` | Build system changes | `build(deps): update wrangler to v4` |
| `ci` | CI/CD changes | `ci(github): add deployment workflow` |
| `chore` | Maintenance tasks | `chore(deps): update dependencies` |
| `revert` | Revert previous commit | `revert: revert feat(payment)` |

### Scope Examples
- `payment` - Payment processing
- `tts` - Text-to-speech functionality
- `stt` - Speech-to-text functionality
- `db` - Database operations
- `api` - API endpoints
- `ui` - User interface
- `config` - Configuration files
- `deploy` - Deployment related

### Subject Line Rules
- ✅ Use imperative mood ("add" not "added" or "adds")
- ✅ No capitalization of first letter
- ✅ No period at the end
- ✅ Maximum 50 characters
- ✅ Be concise but descriptive

### Body Guidelines (Optional)
- Wrap at 72 characters
- Explain **what** and **why**, not **how**
- Separate from subject with blank line
- Use bullet points for multiple items

### Footer (Optional)
- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: description`
- Related commits: `Related to #456`

### Examples

#### ✅ Good Commit Messages
```bash
# Simple feature
git commit -m "feat(payment): add Persian voice recognition"

# Bug fix with details
git commit -m "fix(elevenlabs): resolve 403 API authentication error

- Updated API endpoint to use correct voice ID
- Added proper error handling for quota limits
- Tested with Persian text samples"

# Documentation update
git commit -m "docs(deployment): add D1 binding instructions"

# Configuration change
git commit -m "chore(wrangler): update compatibility date to 2025-12-19"

# Performance improvement
git commit -m "perf(tts): implement audio caching for repeated phrases"
```

#### ❌ Bad Commit Messages
```bash
# Too vague
git commit -m "updates"
git commit -m "fix bug"
git commit -m "changes"

# Not imperative
git commit -m "added new feature"
git commit -m "fixing issue"

# Too long subject
git commit -m "feat: add new Persian voice recognition system with ElevenLabs integration and database logging"

# Missing type
git commit -m "update readme file"
```

### Multi-File Commits
When committing multiple related files:
```bash
git commit -m "feat(payment): implement complete payment flow

- Add payment processing service
- Create D1 database schema
- Implement API endpoints
- Add frontend UI components
- Update documentation"
```

---

## 🛠️ Development Guidelines

### Code Organization
1. **Separation of Concerns**: Each file has one clear responsibility
2. **DRY Principle**: Don't Repeat Yourself
3. **KISS Principle**: Keep It Simple, Stupid
4. **Documentation**: Comment complex logic, document all APIs

### File Naming Conventions
- **JavaScript/TypeScript**: `camelCase.js`, `PascalCase.js` for classes
- **CSS**: `kebab-case.css`
- **HTML**: `kebab-case.html`
- **Config**: `kebab-case.config.js`
- **Documentation**: `UPPERCASE.md` or `lowercase.md`

### Code Style
- **Indentation**: 4 spaces (or 2 for specific languages)
- **Line Length**: Maximum 100 characters
- **Comments**: Use `//` for single-line, `/* */` for multi-line
- **Naming**: Descriptive names over short names

### Error Handling
```javascript
// Always handle errors gracefully
try {
    await someAsyncOperation();
} catch (error) {
    console.error('Descriptive error message:', error);
    // Provide fallback or user-friendly error
}
```

### Security Best Practices
- ✅ Never commit API keys, secrets, or credentials
- ✅ Use environment variables for sensitive data
- ✅ Sanitize all user inputs
- ✅ Implement proper CORS policies
- ✅ Validate data on both client and server

---

## 🔍 Code Review Standards

### Before Committing
- [ ] Code runs without errors
- [ ] All console.log statements removed (or made conditional)
- [ ] No commented-out code blocks
- [ ] Variables have meaningful names
- [ ] Functions are properly documented
- [ ] Tests pass (if applicable)
- [ ] No security vulnerabilities introduced

### Self-Review Checklist
- [ ] Does this code do what it's supposed to?
- [ ] Can I understand this code 6 months from now?
- [ ] Is this the simplest solution?
- [ ] Are there any edge cases not handled?
- [ ] Does this introduce technical debt?

### Testing Requirements
- Test locally before committing
- Verify production deployment after pushing
- Check logs for errors: `npm run tail`
- Validate database operations

---

## 📦 Deployment Policy

### Pre-Deployment Checklist
- [ ] All changes committed and pushed
- [ ] Local testing completed successfully
- [ ] Environment variables/secrets configured
- [ ] Database migrations applied
- [ ] Documentation updated

### Deployment Commands
```bash
# 1. Commit all changes
git add .
git commit -m "type(scope): description"
git push origin main

# 2. Deploy to production
npm run deploy

# 3. Verify deployment
npm run tail

# 4. Test production URL
# Visit: https://your-app.pages.dev
```

### Post-Deployment
- Monitor logs for 5-10 minutes
- Test critical user flows
- Verify database connectivity
- Check API endpoints
- Document any issues

---

## 🚀 Quick Reference Commands

### Daily Workflow
```bash
# Start of day
git pull origin main
npm run dev

# During development (after each change)
git add .
git commit -m "type(scope): description"

# End of day
git push origin main
npm run deploy
```

### Emergency Rollback
```bash
# View commit history
git log --oneline

# Revert to specific commit
git revert <commit-hash>

# Or reset (use with caution)
git reset --hard <commit-hash>
git push origin main --force
```

### Branch Management
```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# List all branches
git branch -a

# Switch branches
git checkout main

# Delete branch
git branch -d feature/old-feature
```

---

## 📊 Metrics & KPIs

### Commit Quality Metrics
- **Frequency**: At least 5 commits per day
- **Message Quality**: 95%+ follow convention
- **Atomic Changes**: Each commit < 500 lines modified
- **Build Success**: 98%+ commits build successfully

### Code Quality Metrics
- **Test Coverage**: > 70% (when tests implemented)
- **Code Duplication**: < 5%
- **Linting Errors**: 0 errors, < 10 warnings
- **Security Vulnerabilities**: 0 critical, < 5 moderate

---

## 🎯 Agent-Specific Policies

### AI Assistant Guidelines
When working as an AI coding assistant:

1. **Always Commit After Changes**
   - After creating new files → commit
   - After modifying existing files → commit
   - After fixing bugs → commit
   - After refactoring → commit

2. **Provide Git Commands**
   - Show exact git commands to user
   - Explain what each command does
   - Include commit message suggestions

3. **Documentation Requirements**
   - Update README.md when adding features
   - Create/update TESTING.md for test procedures
   - Maintain DEPLOYMENT.md for deployment steps
   - Keep this agents.md file current

4. **Error Handling**
   - Always provide fallback solutions
   - Log errors with context
   - Never leave broken code uncommitted

5. **Communication**
   - Explain changes clearly
   - Provide file paths with links
   - Show diffs when helpful
   - Confirm successful operations

---

## 📚 Resources

### Git Documentation
- [Git Official Docs](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)

### Cloudflare Documentation
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [D1 Database](https://developers.cloudflare.com/d1/)

### Project Documentation
- [README.md](README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [TESTING.md](TESTING.md) - Testing procedures

---

## 🔄 Policy Updates

This document is living documentation. Update it when:
- New development patterns emerge
- Better practices are discovered
- Team feedback requires changes
- Technology stack changes

**Last Updated:** December 19, 2025

---

**Remember:** Good commits make good teammates. Write commit messages for your future self and others who will maintain this code.
