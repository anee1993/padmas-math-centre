# Git Push Instructions

## Your project has been committed to Git! 🎉

The initial commit includes all your code with proper security (credentials are NOT included).

## Next Steps: Push to GitHub

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `padmas-math-centre` (or your preferred name)
3. Description: "Virtual classroom platform for mathematics tuition"
4. Choose: **Private** (recommended) or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 2: Link Your Local Repository to GitHub

Copy the commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/YOUR-USERNAME/padmas-math-centre.git
git branch -M main
git push -u origin main
```

Or run these commands (replace YOUR-USERNAME with your GitHub username):

```bash
# Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/padmas-math-centre.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Verify

1. Refresh your GitHub repository page
2. You should see all your files
3. **Verify .env is NOT there** (only .env.example should be visible)

## Important Security Notes

### ✅ What's Committed (Safe)
- All source code
- `.env.example` (template without real credentials)
- Documentation
- Configuration files with environment variables

### ❌ What's NOT Committed (Secure)
- `.env` file (contains your actual credentials)
- `node_modules/` folder
- `target/` folder (compiled Java files)
- IDE-specific files

## Future Commits

### Making Changes

```bash
# Check what changed
git status

# Add specific files
git add src/main/java/org/student/SomeFile.java

# Or add all changes
git add .

# Commit with message
git commit -m "Add new feature: description"

# Push to GitHub
git push
```

### Common Git Commands

```bash
# View commit history
git log --oneline

# View current status
git status

# View differences
git diff

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Pull latest changes
git pull

# View remote repositories
git remote -v
```

## Collaborating with Team

### For Team Members

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/padmas-math-centre.git
cd padmas-math-centre
```

2. Copy environment template:
```bash
copy .env.example .env
```

3. Fill in their own credentials in `.env`

4. Run the application:
```bash
.\load-env-and-run.bat
```

### Sharing Credentials Securely

**Never share via:**
- ❌ Email
- ❌ Chat (Slack, Teams, WhatsApp)
- ❌ Git commits
- ❌ Screenshots

**Share via:**
- ✅ Password manager (1Password, LastPass, Bitwarden)
- ✅ Encrypted file sharing
- ✅ In-person or secure video call
- ✅ Company secrets management system

## Branching Strategy (Recommended)

### Main Branch
- Always stable, production-ready code
- Protected branch (require pull requests)

### Development Branch
```bash
git checkout -b development
```
- Active development happens here
- Merge to main when stable

### Feature Branches
```bash
git checkout -b feature/learning-materials
git checkout -b fix/login-bug
```
- One feature/fix per branch
- Merge to development when complete

### Workflow
```
feature/new-feature → development → main
```

## GitHub Repository Settings (Recommended)

### 1. Branch Protection
- Settings → Branches → Add rule
- Branch name pattern: `main`
- ✅ Require pull request reviews
- ✅ Require status checks to pass

### 2. Secrets (for CI/CD)
- Settings → Secrets and variables → Actions
- Add secrets for automated deployments:
  - `DATABASE_PASSWORD`
  - `JWT_SECRET`
  - `SUPABASE_KEY`
  - `MAIL_PASSWORD`

### 3. Collaborators
- Settings → Collaborators
- Add team members with appropriate permissions

## Continuous Integration (Optional)

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build and Test

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
    
    - name: Build with Maven
      run: mvn clean install
      env:
        DATABASE_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
        JWT_SECRET: ${{ secrets.JWT_SECRET }}
        SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

## Troubleshooting

### "Permission denied (publickey)"

**Solution:** Set up SSH key or use HTTPS with personal access token

```bash
# Use HTTPS instead
git remote set-url origin https://github.com/YOUR-USERNAME/repo.git
```

### "Updates were rejected"

**Solution:** Pull first, then push

```bash
git pull origin main
git push origin main
```

### Accidentally Committed .env

**Solution:** Remove from Git history

```bash
# Remove from Git but keep locally
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from Git"

# Push
git push
```

**Important:** If .env was already pushed, consider rotating all credentials!

## Summary

✅ Your code is committed locally
✅ Credentials are secure (not in Git)
✅ Ready to push to GitHub
✅ Team members can clone and use .env.example

**Next:** Create GitHub repository and push your code!

## Need Help?

- GitHub Docs: https://docs.github.com/
- Git Docs: https://git-scm.com/doc
- GitHub Desktop (GUI): https://desktop.github.com/
