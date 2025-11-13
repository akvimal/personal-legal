# Contributing to Personal Legal Companion

Thank you for your interest in contributing to Personal Legal Companion! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Component Guidelines](#component-guidelines)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity, sexual orientation, disability, personal appearance, race, ethnicity, age, or religion.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks
- Publishing others' private information
- Trolling or inflammatory comments
- Other unprofessional conduct

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository** (if external contributor)
   ```bash
   # Clone your fork
   git clone https://github.com/your-username/personal-legal.git
   cd personal-legal/legal-companion-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Make your changes**

6. **Test your changes**
   ```bash
   npm run lint
   npm test  # when tests are implemented
   ```

### Project Structure Overview

```
legal-companion-web/
├── src/
│   ├── app/           # Pages (Next.js App Router)
│   ├── components/    # Reusable components
│   ├── lib/           # Utilities and helpers
│   ├── types/         # TypeScript definitions
│   ├── stores/        # State management
│   └── hooks/         # Custom React hooks
├── public/            # Static assets
├── docs/              # Documentation
└── package.json       # Dependencies
```

## Development Workflow

### 1. Choose an Issue

- Look for issues labeled `good first issue` for beginners
- Comment on the issue to let others know you're working on it
- Ask questions if anything is unclear

### 2. Create a Branch

Use descriptive branch names:
```bash
# Feature
git checkout -b feature/add-document-tags

# Bug fix
git checkout -b fix/calendar-date-display

# Documentation
git checkout -b docs/update-api-guide

# Refactor
git checkout -b refactor/optimize-search
```

### 3. Make Changes

- Keep changes focused and atomic
- Write clean, readable code
- Follow the coding standards below
- Add comments for complex logic
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run linter
npm run lint

# Run type checking
npx tsc --noEmit

# Run tests (when implemented)
npm test

# Build the project
npm run build
```

### 5. Commit Your Changes

Follow the commit message convention:

```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(documents): add tag filtering"
git commit -m "fix(calendar): correct date display bug"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(ui): simplify button component"
git commit -m "style(sidebar): improve mobile layout"
git commit -m "test(documents): add upload tests"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Coding Standards

### TypeScript Guidelines

#### Type Safety
```typescript
// ✅ Good: Explicit types
interface DocumentProps {
  id: string
  title: string
  category: DocumentCategory
}

const Document: FC<DocumentProps> = ({ id, title, category }) => {
  // ...
}

// ❌ Bad: Using 'any'
const Document = ({ data }: { data: any }) => {
  // ...
}
```

#### Naming Conventions
```typescript
// Components: PascalCase
export const DocumentCard = () => {}

// Functions: camelCase
export const formatDate = () => {}

// Constants: UPPER_SNAKE_CASE
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Types/Interfaces: PascalCase
interface UserProfile {}
type DocumentStatus = 'active' | 'expired'

// Files: kebab-case
// document-card.tsx, format-date.ts
```

#### Import Order
```typescript
// 1. React/Next.js
import { FC } from 'react'
import Image from 'next/image'

// 2. External libraries
import { format } from 'date-fns'
import { FileText } from 'lucide-react'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Types
import { Document, DocumentStatus } from '@/types'

// 5. Utilities
import { cn, formatCurrency } from '@/lib/utils'

// 6. Styles (if applicable)
import styles from './component.module.css'
```

### React Component Guidelines

#### Component Structure
```tsx
'use client'

import { FC, useState, useEffect } from 'react'
import { ComponentProps } from './types'

/**
 * Component description
 *
 * @param prop1 - Description of prop1
 * @param prop2 - Description of prop2
 */
export const Component: FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState<string>('')

  useEffect(() => {
    // Effect logic
  }, [])

  // 2. Event handlers
  const handleClick = () => {
    setState('new value')
  }

  // 3. Computed values
  const isValid = state.length > 0

  // 4. Render helpers
  const renderContent = () => {
    return <div>{state}</div>
  }

  // 5. Main render
  return (
    <div className="container">
      <button onClick={handleClick}>
        Click me
      </button>
      {renderContent()}
    </div>
  )
}
```

#### Props Best Practices
```typescript
// ✅ Good: Explicit props interface
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

// ✅ Good: Default props
export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}) => {
  // ...
}

// ❌ Bad: No prop types
export const Button = ({ variant, onClick, children }) => {
  // ...
}
```

### Styling Guidelines

#### Tailwind CSS Conventions
```tsx
// ✅ Good: Organized classes
<div className={cn(
  // Layout
  'flex items-center gap-2',
  // Sizing
  'w-full h-12 px-4 py-2',
  // Styling
  'bg-white border border-gray-200 rounded-lg',
  // Typography
  'text-sm font-medium text-gray-900',
  // Interactive
  'hover:bg-gray-50 focus:ring-2 focus:ring-blue-500',
  // Responsive
  'md:w-auto lg:text-base',
  // Conditional
  disabled && 'opacity-50 cursor-not-allowed'
)}>
  Content
</div>

// ❌ Bad: Random order, hard to read
<div className="text-sm px-4 hover:bg-gray-50 flex w-full bg-white border py-2 rounded-lg">
  Content
</div>
```

#### Class Organization Order
1. Layout (flex, grid, position)
2. Sizing (w-, h-, p-, m-)
3. Styling (bg-, border-, rounded-)
4. Typography (text-, font-)
5. Interactive states (hover:, focus:, active:)
6. Responsive (sm:, md:, lg:)
7. Conditional classes

#### Custom Colors
Use theme colors from `tailwind.config.ts`:
```tsx
// ✅ Good
<div className="bg-primary text-white">
<Badge variant="success">Active</Badge>

// ❌ Bad: Hardcoded colors
<div className="bg-blue-600 text-white">
<Badge className="bg-green-500">Active</Badge>
```

### State Management

#### Local State
```typescript
// ✅ Good: Type-safe local state
const [selectedId, setSelectedId] = useState<string | null>(null)
const [documents, setDocuments] = useState<Document[]>([])

// ❌ Bad: No types
const [data, setData] = useState()
```

#### Zustand Store
```typescript
// stores/document-store.ts
interface DocumentStore {
  documents: Document[]
  selectedDocument: Document | null

  // Actions
  addDocument: (doc: Document) => void
  selectDocument: (id: string) => void
  clearSelection: () => void
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  selectedDocument: null,

  addDocument: (doc) => set((state) => ({
    documents: [...state.documents, doc]
  })),

  selectDocument: (id) => set((state) => ({
    selectedDocument: state.documents.find(d => d.id === id) || null
  })),

  clearSelection: () => set({ selectedDocument: null })
}))
```

### Error Handling

```typescript
// ✅ Good: Proper error handling
const uploadDocument = async (file: File) => {
  try {
    const result = await api.upload(file)
    showNotification('success', 'Document uploaded')
    return result
  } catch (error) {
    if (error instanceof APIError) {
      showNotification('error', error.message)
    } else {
      showNotification('error', 'An unexpected error occurred')
      console.error('Upload error:', error)
    }
    throw error
  }
}

// ❌ Bad: Silent errors
const uploadDocument = async (file: File) => {
  const result = await api.upload(file)
  return result
}
```

## Component Guidelines

### Creating New Components

1. **Determine component type:**
   - UI component → `src/components/ui/`
   - Layout component → `src/components/layout/`
   - Feature component → `src/components/features/`

2. **Create component file:**
   ```tsx
   // src/components/ui/new-component.tsx
   'use client'

   import { FC } from 'react'

   interface NewComponentProps {
     // Props
   }

   export const NewComponent: FC<NewComponentProps> = (props) => {
     return <div>Component content</div>
   }
   ```

3. **Export from index (if applicable):**
   ```typescript
   // src/components/ui/index.ts
   export { NewComponent } from './new-component'
   ```

4. **Document the component:**
   - Add JSDoc comments
   - Include usage examples
   - Document props

### Component Documentation

```tsx
/**
 * A button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @param variant - Button style variant
 * @param size - Button size
 * @param disabled - Whether the button is disabled
 * @param onClick - Click handler
 * @param children - Button content
 */
export const Button: FC<ButtonProps> = ({ ... }) => {
  // ...
}
```

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch (if used)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Commit Guidelines

**Good commits:**
- Are atomic (one logical change per commit)
- Have clear, descriptive messages
- Follow the commit message convention
- Include issue references when applicable

```bash
# Good commit message with issue reference
git commit -m "feat(documents): add pagination to document list (#123)"

# Good commit with detailed description
git commit -m "fix(calendar): resolve date timezone issues

- Convert all dates to UTC before storage
- Display dates in user's local timezone
- Add timezone selector in settings

Fixes #456"
```

### Keeping Your Fork Updated

```bash
# Add upstream remote (once)
git remote add upstream https://github.com/original/personal-legal.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git checkout main
git merge upstream/main
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass
- [ ] Linter passes with no errors
- [ ] TypeScript type check passes
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(documents): add bulk document upload
fix(calendar): resolve event overlap issue
docs(contributing): update coding guidelines
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #(issue number)

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### PR Review Process

1. **Submit PR** with clear title and description
2. **Wait for review** from maintainers
3. **Address feedback** promptly and professionally
4. **Update PR** based on review comments
5. **Approval** - PR will be merged by maintainer

### After Your PR is Merged

- Delete your feature branch
- Pull the latest changes from main
- Celebrate your contribution!

## Testing Guidelines

### Unit Tests (Future)

```typescript
// __tests__/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## Documentation

### Code Documentation

- Add JSDoc comments for components and functions
- Explain complex logic with inline comments
- Keep comments up to date with code changes
- Don't comment obvious code

```typescript
// ✅ Good: Helpful comment
// Calculate the number of days until document expires
// Returns negative value if already expired
const daysUntilExpiry = differenceInDays(expiryDate, new Date())

// ❌ Bad: Obvious comment
// Set the value to true
const isActive = true
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing configuration
- Updating dependencies
- Modifying setup process

### API Documentation

When adding API endpoints (future):
- Document request/response format
- Include example requests
- List possible error codes
- Specify authentication requirements

## Questions or Issues?

- Open an issue for bugs or feature requests
- Use discussions for questions
- Join our community chat (if available)
- Email maintainers for sensitive matters

## Recognition

Contributors will be recognized in:
- Repository contributors list
- Release notes
- Project documentation

Thank you for contributing to Personal Legal Companion!
