# Quick Publishing Commands

## Prerequisites
```bash
# 1. Create npm account at https://www.npmjs.com/signup

# 2. Login to npm
npm login
```

## Publish Package

### Option 1: Public Package (Recommended)
```bash
# Publish to npm registry
npm publish
```

### Option 2: Scoped Package
If you want to use a scoped name like `@yourorg/telemed-ai-agent`:

1. Update `package.json`:
   ```json
   "name": "@yourorg/telemed-ai-agent"
   ```

2. Publish:
   ```bash
   npm publish --access public
   ```

## Verify Publication
```bash
# Check your package on npm
# Visit: https://www.npmjs.com/package/telemed-ai-agent

# Test installation
mkdir test-install
cd test-install
npm init -y
npm install telemed-ai-agent
```

## Update Version (For Future Updates)
```bash
# Patch version (bug fixes): 1.0.0 → 1.0.1
npm version patch
npm publish

# Minor version (new features): 1.0.0 → 1.1.0
npm version minor
npm publish

# Major version (breaking changes): 1.0.0 → 2.0.0
npm version major
npm publish
```

## Troubleshooting

### Package name already taken?
Use a scoped package: `@yourorg/telemed-ai-agent`

### Not logged in?
```bash
npm login
npm whoami  # Verify login
```

### Permission denied?
For scoped packages, add `--access public`

---

**For detailed instructions, see [PUBLISHING.md](./PUBLISHING.md)**
