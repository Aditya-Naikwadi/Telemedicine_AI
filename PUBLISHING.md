# Publishing Guide for telemed-ai-agent

This guide walks you through publishing the `telemed-ai-agent` package to npm.

## Prerequisites

### 1. Create an npm Account
If you don't have an npm account:
1. Visit https://www.npmjs.com/signup
2. Create an account with your email
3. Verify your email address

### 2. Verify Package Name Availability
Check if your desired package name is available:
```bash
npm search telemed-ai-agent
```

Or visit: https://www.npmjs.com/package/telemed-ai-agent

**Important**: If the name is taken, you have two options:
- Choose a different name (update `name` in `package.json`)
- Use a scoped package: `@yourorg/telemed-ai-agent` (recommended)

### 3. Update Package Metadata
Edit `package.json` and update:
```json
{
  "name": "telemed-ai-agent",  // or "@yourorg/telemed-ai-agent"
  "author": "Your Name or Organization",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/telemed-ai-agent"
  }
}
```

## Publishing Steps

### Step 1: Login to npm
```bash
npm login
```

Enter your:
- Username
- Password
- Email (this is public)
- One-time password (if 2FA is enabled)

Verify you're logged in:
```bash
npm whoami
```

### Step 2: Clean Build
Ensure a fresh build:
```bash
# Remove existing build
rm -rf dist

# Clean install dependencies
npm ci

# Build the package
npm run build
```

### Step 3: Test Locally (IMPORTANT!)
Before publishing, test the package locally:

```bash
# Create a tarball (this simulates what will be published)
npm pack

# This creates a file like: telemed-ai-agent-1.0.0.tgz
```

**Test in a separate project:**
```bash
# Create a test directory
mkdir ../test-package
cd ../test-package
npm init -y

# Install your local package
npm install ../AI\ Package/telemed-ai-agent-1.0.0.tgz

# Test it works
node
> const { TelemedAgent } = require('telemed-ai-agent');
> console.log(TelemedAgent);
```

### Step 4: Verify Package Contents
Check what files will be published:
```bash
npm pack --dry-run
```

This should show:
- ✅ `dist/` directory (compiled JavaScript)
- ✅ `README.md`
- ✅ `LICENSE`
- ✅ `package.json`
- ❌ NOT `src/` (TypeScript source)
- ❌ NOT `node_modules/`
- ❌ NOT test files

### Step 5: Publish to npm

**For public packages:**
```bash
npm publish
```

**For scoped packages (first time):**
```bash
npm publish --access public
```

**For private packages (requires paid npm account):**
```bash
npm publish --access restricted
```

### Step 6: Verify Publication
1. Visit your package page: `https://www.npmjs.com/package/telemed-ai-agent`
2. Check the version, README, and files
3. Test installation from npm:
   ```bash
   mkdir ../test-npm-install
   cd ../test-npm-install
   npm init -y
   npm install telemed-ai-agent
   ```

## Version Management

### Semantic Versioning
Follow semantic versioning (semver):
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Publishing Updates
```bash
# Patch version (bug fixes)
npm version patch
npm publish

# Minor version (new features)
npm version minor
npm publish

# Major version (breaking changes)
npm version major
npm publish
```

The `npm version` command automatically:
- Updates `package.json`
- Creates a git commit
- Creates a git tag

## Troubleshooting

### Error: "You do not have permission to publish"
- Make sure you're logged in: `npm whoami`
- Check package name isn't taken
- For scoped packages, use `--access public`

### Error: "Package name too similar to existing package"
- Choose a different name or use a scoped package

### Package is too large
- Check `.npmignore` is working
- Run `npm pack --dry-run` to see what's included
- Ensure `src/` and `node_modules/` are excluded

### TypeScript types not working after installation
- Verify `types` field in `package.json` points to `dist/index.d.ts`
- Ensure `.d.ts` files are in the `dist/` directory
- Check `.npmignore` doesn't exclude `.d.ts` files

## Best Practices

1. **Always test locally first** using `npm pack`
2. **Use semantic versioning** consistently
3. **Write a good README** with examples
4. **Include a LICENSE** file
5. **Keep package size small** (exclude unnecessary files)
6. **Use `.npmignore`** to control what's published
7. **Test installation** from npm after publishing
8. **Consider using npm tags** for beta releases:
   ```bash
   npm publish --tag beta
   ```

## Quick Reference

```bash
# One-time setup
npm login

# Before each publish
npm run build
npm pack --dry-run
npm pack  # Test locally

# Publish
npm publish

# Update version
npm version patch/minor/major
npm publish
```

## Support

- npm documentation: https://docs.npmjs.com/
- Semantic versioning: https://semver.org/
- Package.json reference: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
