# GitHub Repository Setup for Automated Releases

This document outlines the required GitHub repository configuration for the automated semantic-release workflow.

## Required GitHub Secrets

The following secrets must be configured in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

### 1. GITHUB_TOKEN (Automatic)
- **Purpose**: GitHub API access for creating releases and managing repository
- **Setup**: This is automatically provided by GitHub Actions, no manual setup needed
- **Permissions**: The repository needs to allow GitHub Actions to create releases

### 2. VSCE_PAT (Manual Setup Required)
- **Purpose**: Publishing the extension to Visual Studio Code Marketplace
- **Setup**: Create a Personal Access Token for VS Code Marketplace

#### Creating VSCE_PAT:

1. **Go to Azure DevOps**: Visit [dev.azure.com](https://dev.azure.com)
2. **Sign in**: Use the same Microsoft account associated with your VS Code Marketplace publisher
3. **Create Personal Access Token**:
   - Click your profile picture → Personal Access Tokens
   - Click "New Token"
   - Name: `VS Code Extension Publishing`
   - Organization: Select your organization (or use the default)
   - Expiration: Set appropriate expiration (recommend 1 year)
   - Scopes: Select **All accessible organizations**
   - Click "Create"
4. **Copy the token** (you won't see it again!)
5. **Add to GitHub Secrets**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VSCE_PAT`
   - Value: Paste your Azure DevOps PAT
   - Click "Add secret"

## Repository Permissions

Ensure your GitHub repository has the correct permissions:

### Actions Permissions
1. Go to `Settings` → `Actions` → `General`
2. Set "Actions permissions" to: **Allow all actions and reusable workflows**
3. Set "Workflow permissions" to: **Read and write permissions**
4. Check "Allow GitHub Actions to create and approve pull requests"

### Branch Protection (Recommended)
For the `main` branch:
1. Go to `Settings` → `Branches`
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging

## VS Code Marketplace Publisher Setup

Ensure your VS Code publisher account is configured:

1. **Publisher Account**: Must exist on [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. **Publisher Name**: Must match the `publisher` field in `package.json`
3. **Permissions**: The VSCE_PAT must have access to publish under this publisher

## Testing the Setup

### Local Testing (Limited)
```bash
# Test semantic-release configuration (will fail without tokens, but shows plugin loading)
npm run semantic-release:dry

# Test VS Code extension packaging
npm run package:vsix

# Test marketplace publishing (dry run) - requires VSCE_PAT environment variable
npm run publish:dry

# Verify your publisher and extension on marketplace
npm run verify:marketplace
```

### Local Marketplace Testing
To test marketplace publishing locally before pushing to CI:

1. **Set VSCE_PAT environment variable**:
   ```bash
   # Windows (PowerShell)
   $env:VSCE_PAT="your-pat-token"
   
   # Windows (Command Prompt)  
   set VSCE_PAT=your-pat-token
   
   # macOS/Linux
   export VSCE_PAT="your-pat-token"
   ```

2. **Test packaging and dry-run publish**:
   ```bash
   npm run package:vsix
   npm run publish:dry
   ```

3. **Verify extension details**:
   ```bash
   npm run verify:marketplace
   ```

### CI Testing
1. **Create a feature branch** with conventional commits
2. **Open a pull request** to trigger CI
3. **Check GitHub Actions** to see if workflows pass
4. **Merge to main** to trigger actual release

## Workflow Triggers

The release workflow triggers on:
- **Push to main**: Full release process with marketplace publishing
- **Push to beta**: Beta pre-release with marketplace pre-release channel
- **Push to alpha**: Alpha pre-release with marketplace pre-release channel
- **Pull requests**: CI testing only (no release)

### What Happens During Release

When a release is triggered, the workflow:

1. **Runs full test suite** on Ubuntu, Windows, and macOS
2. **Analyzes commits** to determine version bump
3. **Updates package.json** with new version
4. **Generates CHANGELOG.md** with release notes
5. **Builds and packages** the .vsix extension file
6. **Publishes to VS Code Marketplace** using VSCE_PAT
7. **Creates GitHub release** with generated notes and .vsix attachment
8. **Commits changes** back to the repository

The entire process is automated and requires no manual intervention once configured properly.

## Troubleshooting

### Common Issues

#### 1. VSCE_PAT Token Expired
**Error**: Authentication failed when publishing to marketplace
**Solution**: 
- Generate new PAT in Azure DevOps
- Update GitHub secret with new token

#### 2. GitHub Token Permissions
**Error**: Cannot create releases or push tags
**Solution**: 
- Check repository Actions permissions
- Ensure workflow permissions are set to "Read and write"

#### 3. Publisher Access
**Error**: Cannot publish to marketplace
**Solution**:
- Verify publisher exists and you have access
- Ensure `package.json` publisher field matches your account
- Test locally: `npm run publish:dry` (requires VSCE_PAT environment variable)
- Check publisher permissions in Azure DevOps

#### 4. Marketplace Publishing Failures
**Error**: Extension package created but marketplace publish fails
**Solution**:
- Verify VSCE_PAT has correct scopes (All accessible organizations)
- Check if extension name conflicts with existing extensions
- Ensure extension meets marketplace validation requirements
- Test extension validation: `npx vsce package --yarn` (if using yarn) or `npx vsce package`

#### 5. Version Conflicts
**Error**: Version already exists on marketplace
**Solution**:
- This shouldn't happen with semantic-release, but if it does:
- Check if a manual publish happened outside the CI
- Verify semantic-release is incrementing versions correctly
- May need to manually increment version and push

#### 6. Branch Protection Issues
**Error**: Cannot push to protected branch
**Solution**:
- Check if semantic-release commits are blocked by branch protection
- Configure branch protection to allow GitHub Actions

### Debug Information

Check the GitHub Actions logs for detailed error information:
1. Go to your repository
2. Click "Actions" tab
3. Click on a failed workflow run
4. Expand the failed steps to see detailed logs

## Maintenance

### Token Rotation
- **VSCE_PAT**: Rotate annually or if compromised
- **GITHUB_TOKEN**: Automatically managed by GitHub

### Monitoring
- **Release Workflow**: Monitor for failures
- **Marketplace**: Verify extensions are publishing successfully
- **Security Alerts**: Watch for dependency vulnerabilities

This setup ensures secure, automated releases while maintaining proper access controls and audit trails.
