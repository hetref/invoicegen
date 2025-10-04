# Contributing to InvoiceGen

Thank you for considering contributing to InvoiceGen! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or helping others in our community.

## 🚀 How to Contribute

### Reporting Bugs

We use GitHub Issues to track bugs. When reporting a bug, please include:

- **Clear description** of the bug
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **System information** (OS, browser, Node.js version)
- **Error messages** and logs

### Suggesting Features

Great ideas for new features! Please:

- Check existing [Issues](https://github.com/hetref/invoicegen/issues) first
- Explain the **use case** and **benefits**
- Describe the **expected behavior**
- Consider **implementation complexity**
- Help prioritize with 👍 reactions

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**:
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed
4. **Commit your changes**: `git commit -m 'Add some amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/hetref/invoicegen.git
cd invoicegen

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your development settings

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start development server
npm run dev
```

## 📝 Code Style Guidelines

### TypeScript/React
- Use TypeScript for all new code
- Prefer functional components with hooks
- Follow React best practices
- Use proper TypeScript types

### Database
- Use Prisma migrations for schema changes
- Include proper indexes for queries
- Validate data at both client and server level

### API Routes
- Use proper HTTP status codes
- Include proper error handling
- Validate input data
- Follow RESTful conventions

### UI Components
- Use Shadcn UI components when possible
- Follow existing design patterns
- Ensure responsive design
- Include proper loading states

## 🧪 Testing

- Add tests procedure for new functionality
- Update existing tests if needed
- Ensure tests pass before submitting PR
- Test on multiple browsers/devices when possible

## 📖 Documentation

- Update README.md for new features
- Add inline code comments
- Document API changes
- Update environment variable documentation

## 🐛 Bug Fix Process

1. Create issue if one doesn't exist
2. Create feature branch: `git checkout -b fix/bug-description`
3. Fix the bug
4. Add test to prevent regression
5. Submit PR with clear description

## ✨ Feature Request Process

1. Discuss in Issues first (unless small)
2. Wait for approval from maintainers
3. Create feature branch: `git checkout -b feature/feature-name`
4. Implement feature with tests
5. Update documentation
6. Submit PR

## 🔍 Review Process

- All PRs require review
- Address feedback promptly
- Keep PRs focused and small
- Update documentation as needed
- Ensure CI passes

## 📋 Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: add invoice template customization
fix: resolve mail from address validation issue
docs: update deployment guide
refactor: simplify invoice component
test: add unit tests for email validation
```

## 🤝 Community Guidelines

Be respectful and helpful:

- Use welcoming and inclusive language
- Be respectful of different viewpoints
- Focus on constructive feedback
- Help others learn and grow
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## 📞 Getting Help

- 💬 [GitHub Discussions](https://github.com/hetref/invoicegen/discussions)
- 🐛 [GitHub Issues](https://github.com/hetref/invoicegen/issues)
- 📖 [Project Wiki](https://github.com/hetref/invoicegen/wiki)

## 🎯 Areas Needing Help

- 🌍 Internationalization (i18n)
- 📱 Mobile responsiveness
- 📚 Documentation improvements
- 🐳 Docker configuration
- 🔌 API documentation

## 📝 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured in project README
- Recognized in community discussions

Thank you for contributing to InvoiceGen! 🙏
