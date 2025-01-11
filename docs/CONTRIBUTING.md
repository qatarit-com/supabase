# Contributing to Bwibber

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Git
- Supabase CLI (optional)

### Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a new branch: `git checkout -b feature/your-feature`

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Follow React best practices

### Component Guidelines
- Use functional components
- Implement proper error handling
- Add loading states
- Include proper TypeScript types
- Document complex logic

### Testing
- Write unit tests for utilities
- Test components in isolation
- Test error cases
- Verify mobile responsiveness

### Commit Guidelines
- Use conventional commits
- Keep commits atomic
- Include clear descriptions
- Reference issues when applicable

## Pull Request Process
1. Update documentation
2. Add/update tests
3. Ensure CI passes
4. Request review
5. Address feedback

## Branch Strategy
- main: Production branch
- develop: Development branch
- feature/*: Feature branches
- fix/*: Bug fix branches

## Release Process
1. Version bump
2. Update changelog
3. Create release PR
4. Deploy to staging
5. Deploy to production