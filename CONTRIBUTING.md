# Contributing to PathWise

Thank you for your interest in contributing to PathWise! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/pathwise/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing [Feature Requests](https://github.com/yourusername/pathwise/issues?q=label%3Aenhancement)
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach

### Pull Requests

1. **Fork the repository** and create a branch from `develop`
2. **Name your branch** descriptively: `feature/add-voice-navigation` or `fix/iep-validation-bug`
3. **Write clear commits**: Use conventional commit format
   ```
   feat: add voice navigation to dashboard
   fix: resolve IEP validation error for special characters
   docs: update API documentation
   ```
4. **Test your changes**:
   ```bash
   npm run test:unit
   npm run test:integration
   npm run lint
   ```
5. **Update documentation** if needed
6. **Submit a pull request** to the `develop` branch

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/pathwise.git
cd pathwise

# Add upstream remote
git remote add upstream https://github.com/original-owner/pathwise.git

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development environment
docker-compose up
```

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with recommended rules
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for classes and components
  - UPPER_CASE for constants

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Testing

- Write unit tests for all new functions
- Maintain test coverage above 80%
- Add integration tests for API endpoints
- Test accessibility features

### Accessibility

- Ensure all UI components are keyboard accessible
- Add proper ARIA labels
- Test with screen readers
- Maintain WCAG 2.2 AA compliance

### Security

- Never commit secrets or API keys
- Sanitize all user inputs
- Follow FERPA compliance guidelines
- Encrypt sensitive data
- Add security tests for new endpoints

## Project Structure

```
services/
  auth-service/       # Authentication
  iep-service/        # IEP operations
  ai-engine/          # AI features
frontend/
  app/                # Next.js pages
  components/         # React components
  lib/                # Utilities
database/
  schemas/            # SQL schemas
  migrations/         # Database migrations
```

## Pull Request Process

1. Ensure all tests pass
2. Update documentation
3. Request review from maintainers
4. Address review feedback
5. Maintainer will merge once approved

## Questions?

- Open a [Discussion](https://github.com/yourusername/pathwise/discussions)
- Join our [Discord](#) (if available)
- Email: dev@pathwise.com

Thank you for contributing to PathWise! 🎉
