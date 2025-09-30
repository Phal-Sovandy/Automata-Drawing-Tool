# Contributing to Automata Drawing Tools

Thank you for your interest in contributing to Automata Drawing Tools! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Git Branching Strategy](#git-branching-strategy)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Release Process](#release-process)

## 🤝 Code of Conduct

This project follows a Code of Conduct. By participating, you agree to uphold this code. Please report unacceptable behavior to [phalsovandy007@gmail.com].

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project. See [LICENSE](LICENSE) for details.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- A modern web browser

### Setup

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/automata-drawing-tools.git
   cd automata-drawing-tools
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/Phal-Sovandy/automata-drawing-tools.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### 1. Keep your fork updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-number-description
# or
git checkout -b hotfix/critical-issue
```

### 3. Make your changes

- Write clean, readable code
- Follow the existing code style
- Add tests if applicable
- Update documentation

### 4. Test your changes

```bash
npm run lint
npm run build
npm run preview
```

### 5. Commit your changes

```bash
git add .
git commit -m "feat: add new automata type support"
```

### 6. Push to your fork

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

- Use the provided PR template
- Link related issues
- Request reviews from maintainers

## 🌿 Git Branching Strategy

We follow the **Git Flow** branching model:

### Branch Types

#### `main`

- **Purpose**: Production-ready code
- **Protection**: Protected branch, requires PR reviews
- **Deployment**: Automatically deployed to production

#### `develop`

- **Purpose**: Integration branch for features
- **Protection**: Protected branch, requires PR reviews
- **Deployment**: Automatically deployed to staging

#### `feature/*`

- **Purpose**: New features and enhancements
- **Naming**: `feature/description-of-feature`
- **Examples**:
  - `feature/turing-machine-support`
  - `feature/export-to-pdf`
  - `feature/dark-mode-improvements`

#### `bugfix/*`

- **Purpose**: Bug fixes for the develop branch
- **Naming**: `bugfix/issue-number-description`
- **Examples**:
  - `bugfix/123-canvas-rendering-issue`
  - `bugfix/456-export-fails-on-mobile`

#### `hotfix/*`

- **Purpose**: Critical bug fixes for production
- **Naming**: `hotfix/issue-number-description`
- **Examples**:
  - `hotfix/789-security-vulnerability`
  - `hotfix/101-critical-crash-fix`

#### `release/*`

- **Purpose**: Prepare new releases
- **Naming**: `release/version-number`
- **Examples**:
  - `release/v1.2.0`
  - `release/v1.1.1`

### Branch Naming Conventions

- Use lowercase letters
- Separate words with hyphens
- Be descriptive but concise
- Include issue number when applicable

**Good Examples:**

- `feature/automata-validation`
- `bugfix/123-import-error`
- `hotfix/456-security-patch`

**Bad Examples:**

- `Feature_New_Stuff`
- `fix`
- `my-changes`

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check if it's a bug** or feature request
3. **Gather information** about your environment
4. **Try to reproduce** the issue

### Issue Types

#### 🐛 Bug Report

Use the bug report template and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Environment information

#### ✨ Feature Request

Use the feature request template and include:

- Clear description of the feature
- Use case and motivation
- Proposed solution
- Alternatives considered
- Additional context

#### 📚 Documentation

For documentation improvements:

- What needs to be documented
- Where it should be documented
- Why it's important

#### 🔧 Enhancement

For improvements to existing features:

- What needs to be improved
- Current behavior
- Proposed improvement
- Benefits

### Issue Labels

We use the following labels:

**Type:**

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `question` - Further information is requested

**Priority:**

- `priority: critical` - Blocks development or production
- `priority: high` - Important but not blocking
- `priority: medium` - Normal priority
- `priority: low` - Nice to have

**Status:**

- `status: needs-triage` - Needs initial review
- `status: in-progress` - Being worked on
- `status: blocked` - Waiting on something
- `status: needs-review` - Ready for review

**Component:**

- `component: canvas` - Canvas-related
- `component: export` - Export functionality
- `component: import` - Import functionality
- `component: ui` - User interface
- `component: performance` - Performance issues

## 🔀 Pull Request Guidelines

### Before Submitting

1. **Update your branch** with the latest changes
2. **Run tests** and ensure they pass
3. **Check linting** and fix any issues
4. **Update documentation** if needed
5. **Add tests** for new features

### PR Template

Use the provided PR template and include:

- **Description**: What changes were made and why
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How was it tested
- **Screenshots**: If UI changes
- **Checklist**: Ensure all items are completed

### PR Requirements

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Linked to related issues

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in staging environment
4. **Approval** from at least one maintainer
5. **Merge** by maintainers only

## 💻 Code Style

### JavaScript/React

- Use **ESLint** configuration provided
- Follow **Prettier** formatting
- Use **functional components** with hooks
- Prefer **const** over let
- Use **arrow functions** for consistency

### CSS

- Use **CSS custom properties** for theming
- Follow **BEM methodology** for class naming
- Use **mobile-first** responsive design
- Keep styles **modular** and organized

### File Organization

```
src/
├── components/
│   ├── layout/          # Layout components
│   ├── modals/          # Modal components
│   ├── ui/              # Reusable UI components
│   └── [feature].jsx    # Feature-specific components
├── context/             # React context
├── styles/              # CSS styles
├── utils/               # Utility functions
└── hooks/               # Custom hooks
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.jsx`)
- **Files**: camelCase for utilities (`exportUtils.js`)
- **CSS Classes**: kebab-case (`.my-component`)
- **Variables**: camelCase (`myVariable`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## 🧪 Testing

### Test Types

- **Unit Tests**: Individual functions/components
- **Integration Tests**: Component interactions
- **E2E Tests**: Full user workflows
- **Visual Tests**: UI regression testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

- Test **behavior**, not implementation
- Use **descriptive test names**
- Follow **AAA pattern** (Arrange, Act, Assert)
- Mock **external dependencies**
- Test **edge cases** and error conditions

## 📖 Documentation

### Code Documentation

- Use **JSDoc** for functions and components
- Include **parameter descriptions**
- Document **return values**
- Add **usage examples**

### README Updates

- Update **installation instructions**
- Add **new features** to feature list
- Update **screenshots** if UI changes
- Keep **examples** current

### API Documentation

- Document **new APIs**
- Include **request/response examples**
- Specify **error conditions**
- Update **version information**

## 🚀 Release Process

### Version Numbering

We follow **Semantic Versioning** (SemVer):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Create release branch** from develop
2. **Update version** in package.json
3. **Update CHANGELOG.md**
4. **Run full test suite**
5. **Create PR** to main
6. **Merge and tag** release
7. **Deploy** to production
8. **Create GitHub release**

### Changelog Format

```markdown
## [1.2.0] - 2024-01-15

### Added

- New Turing machine support
- Export to PDF functionality

### Changed

- Improved canvas performance
- Updated UI components

### Fixed

- Fixed import error on mobile devices
- Resolved canvas rendering issues

### Security

- Updated dependencies for security patches
```

## 🏷️ Commit Message Convention

We follow **Conventional Commits**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(canvas): add zoom functionality
fix(export): resolve PNG export issue
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(context): simplify state management
test(canvas): add unit tests for drawing
chore(deps): update dependencies
```

## 🤔 Getting Help

### Resources

- **Documentation**: Check the `/docs` folder
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server (if available)

### Contact

- **Maintainer**: Phal Sovandy
- **Email**: [phalsovandy007@gmail.com]
- **GitHub**: [@Phal-Sovandy](https://github.com/Phal-Sovandy)

## 🙏 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub contributors** page
- **Release notes** for major contributions

Thank you for contributing to Automata Drawing Tools! 🎉
