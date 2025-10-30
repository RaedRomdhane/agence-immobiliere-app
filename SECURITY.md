# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in this project, please report it by emailing the maintainers.

**Please do not report security vulnerabilities through public GitHub issues.**

## Important Notes on Credentials

### ⚠️ Template Files (Not Real Credentials)

The following files contain **TEMPLATE values** for configuration, not real credentials:

- `backend/.env.example` - Development environment template
- `backend/.env.staging.example` - Staging environment template
- `docs/*.md` - Documentation with example configurations

**These files use placeholder patterns:**
- `<USERNAME>` - Replace with your actual username
- `<PASSWORD>` - Replace with your actual password
- `<CLUSTER>` - Replace with your MongoDB cluster name
- `<YOUR_EMAIL>` - Replace with your actual email
- `<YOUR_APP_PASSWORD>` - Replace with your actual app password

### ✅ How to Use Safely

1. **Never commit real credentials to Git**
2. Copy template files to create your local configuration:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Replace placeholder values with your real credentials in `.env`
4. The `.env` file is gitignored and will never be committed

### 🔒 Real Credentials Storage

Real credentials should be stored in:
- Local `.env` files (gitignored)
- Environment variables in CI/CD pipelines
- Secure secret management systems (Azure Key Vault, AWS Secrets Manager, etc.)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Best Practices

- Use strong, randomly generated passwords
- Enable 2FA on all accounts
- Rotate credentials regularly
- Use environment-specific credentials (dev, staging, production)
- Never share credentials in chat, email, or documentation
- Use MongoDB Atlas IP whitelisting in production
- Enable TLS/SSL for all database connections

## GitGuardian False Positives

If GitGuardian flags template files as containing secrets, this is a **false positive**. 
The configuration file `.gitguardian.yaml` explicitly marks these as templates.

The patterns in our templates use angle brackets `<>` to clearly indicate placeholders:
- ❌ Bad: `password123` (looks like a real password)
- ✅ Good: `<YOUR_PASSWORD>` (clearly a placeholder)
