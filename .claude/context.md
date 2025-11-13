# Personal Legal Companion - Project Context

This document provides important context about the Personal Legal Companion project for AI assistants working with this codebase.

## Project Overview

**Name:** Personal Legal Companion
**Type:** Full-stack web application
**Status:** Early development phase
**Primary Purpose:** Help individuals manage legal documents, insurance policies, and legal obligations with AI-powered assistance

## Technology Stack

### Frontend
- **Framework:** Next.js 16.0.1 (App Router)
- **UI Library:** React 19.2.0
- **Language:** TypeScript 5.9.3 (strict mode)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand 5.0.8
- **Icons:** Lucide React
- **Date Utilities:** date-fns

### Backend (Planned)
- REST API (framework TBD)
- SQL/NoSQL database (TBD)
- AI/LLM integration (OpenAI API or similar)
- File storage service
- OCR/PDF processing

## Project Structure

```
personal-legal/
├── .claude/                    # Claude Code configuration
│   ├── commands/              # Custom slash commands
│   └── context.md             # This file
├── legal-companion-web/        # Main Next.js application
│   ├── src/
│   │   ├── app/               # Pages (App Router)
│   │   ├── components/        # Reusable components
│   │   ├── lib/               # Utilities and mock data
│   │   ├── types/             # TypeScript definitions
│   │   ├── stores/            # State management
│   │   └── hooks/             # Custom React hooks
│   ├── public/                # Static assets
│   ├── docs/                  # Documentation
│   └── package.json           # Dependencies
└── README.md                  # Main project README
```

## Key Features

1. **Document Management** - Upload, organize, and search legal documents
2. **Insurance Tracking** - Manage multiple types of insurance policies
3. **Event Calendar** - Track deadlines and obligations with reminders
4. **AI Assistant** - Ask questions about documents with citation support
5. **Legal Guidance** - Get AI-powered legal advice for various scenarios
6. **Task Management** - Create and track action items
7. **Notifications** - Smart alerts for expiring documents and deadlines
8. **Templates** - Generate documents from pre-built templates
9. **Dashboard** - Overview with legal health score
10. **Settings** - User preferences and integrations

## Core Entities & Types

Located in `src/types/index.ts`:

- **Document** - Legal documents with metadata, parties, terms, and events
- **Event** - Calendar events and deadlines with reminders
- **Task** - Action items with priority and status
- **Notification** - Alert messages
- **InsurancePolicy** - Insurance policy details
- **Template** - Document templates
- **ChatMessage** - AI assistant conversation history

## Coding Standards

### TypeScript
- **Strict mode enabled** - Always use explicit types
- **No `any` types** - Use proper type definitions
- **Naming:**
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case

### React Components
- **Use functional components** with hooks
- **TypeScript for all components** with proper prop types
- **'use client'** directive for client components
- **React.forwardRef** for components that need refs
- **Composition over inheritance**

### Component Structure
```tsx
'use client'

import { FC } from 'react'
import { ComponentProps } from './types'

export const Component: FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks
  // 2. Event handlers
  // 3. Derived data
  // 4. Render

  return <div>JSX</div>
}
```

### Styling
- **Tailwind CSS** for all styling
- **No inline styles** - Use Tailwind classes
- **Custom colors** from theme (primary, secondary, success, warning, critical)
- **Responsive design** - Mobile-first approach
- **Use `cn()` utility** from lib/utils for conditional classes

### Import Order
1. React/Next.js
2. External libraries
3. Internal components
4. Types
5. Utilities/styles

## Current Development State

### ✅ Completed
- Project setup and configuration
- UI component library (Button, Card, Badge, Input)
- Page routing structure (10 main pages)
- TypeScript type system
- Mock data layer (890+ lines)
- Responsive design
- Navigation system
- Comprehensive documentation

### ⚠ In Progress
- State management implementation
- Feature component development
- Chat/Assistant UI

### ☐ Planned
- Backend API development
- Database integration
- Authentication system
- Real AI/LLM integration
- Email integration
- Google Drive integration
- OCR/PDF processing
- Testing suite
- Deployment setup

## Important Files

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode, path aliases)
- `tailwind.config.ts` - Theme colors and customization
- `next.config.mjs` - Next.js settings

### Core Code
- `src/types/index.ts` - All TypeScript type definitions (850+ lines)
- `src/lib/mock-data.ts` - Development mock data (890+ lines)
- `src/lib/utils.ts` - Utility functions
- `src/app/layout.tsx` - Root layout with sidebar

### Documentation
- `README.md` - Main project overview
- `legal-companion-web/README.md` - Web app specific guide
- `docs/ARCHITECTURE.md` - System architecture and patterns
- `docs/COMPONENTS.md` - Component library reference
- `docs/API.md` - Future API documentation
- `docs/CONTRIBUTING.md` - Contribution guidelines

## Common Tasks

### Start Development Server
```bash
cd legal-companion-web
npm run dev
# Opens at http://localhost:3000
```

### Build for Production
```bash
cd legal-companion-web
npm run build
npm start
```

### Lint Code
```bash
cd legal-companion-web
npm run lint
```

### Type Check
```bash
cd legal-companion-web
npx tsc --noEmit
```

## Design Principles

1. **Type Safety First** - Leverage TypeScript's type system
2. **Component Reusability** - Build composable, reusable components
3. **Performance** - Optimize bundle size, lazy load when appropriate
4. **Accessibility** - Follow WCAG guidelines, keyboard navigation
5. **Security** - Input validation, XSS prevention, secure auth
6. **User Experience** - Responsive, intuitive, fast
7. **Code Quality** - Consistent style, clear naming, proper documentation

## Mock Data Usage

Currently using mock data from `src/lib/mock-data.ts` for development:
- 25+ sample documents
- 30+ calendar events
- 20+ tasks
- 15+ notifications
- 10+ insurance policies
- Document templates
- Chat history

**When building features:**
- Import mock data: `import { mockDocuments, mockEvents } from '@/lib/mock-data'`
- Use mock data until backend is ready
- Structure components to easily swap mock data with real API calls

## Path Aliases

TypeScript configured with path alias:
```typescript
import { Button } from '@/components/ui/button'
import { Document } from '@/types'
import { formatDate } from '@/lib/utils'
```

`@/` maps to `src/`

## Color System

From `tailwind.config.ts`:
- **primary** - #2563EB (Blue) - Primary actions, links
- **secondary** - #8B5CF6 (Purple) - Secondary elements, AI features
- **success** - #10B981 (Green) - Success states, active status
- **warning** - #F59E0B (Amber) - Warnings, upcoming deadlines
- **critical** - #EF4444 (Red) - Errors, urgent items
- **neutral** - Gray scale (50-900)

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `app/page.tsx` | Dashboard |
| `/documents` | `app/documents/page.tsx` | Document list |
| `/documents/[id]` | `app/documents/[id]/page.tsx` | Document detail |
| `/insurance` | `app/insurance/page.tsx` | Insurance policies |
| `/assistant` | `app/assistant/page.tsx` | AI assistant |
| `/legal-help` | `app/legal-help/page.tsx` | Legal guidance |
| `/calendar` | `app/calendar/page.tsx` | Event calendar |
| `/tasks` | `app/tasks/page.tsx` | Task management |
| `/templates` | `app/templates/page.tsx` | Document templates |
| `/notifications` | `app/notifications/page.tsx` | Notifications |
| `/settings` | `app/settings/page.tsx` | Settings |

## Available Slash Commands

- `/dev` - Start development server
- `/build` - Build for production
- `/lint` - Run linter
- `/component` - Create new component
- `/page` - Create new page
- `/docs` - View documentation
- `/review` - Code review
- `/setup` - Project setup guide
- `/analyze` - Project analysis

## Common Patterns

### Creating a Component
1. Choose directory: `ui/`, `layout/`, or `features/`
2. Create file: `component-name.tsx`
3. Use TypeScript with proper types
4. Include forwardRef if needed
5. Use cn() for className handling
6. Add JSDoc comments
7. Export from component file

### Creating a Page
1. Create directory in `src/app/`
2. Create `page.tsx` with 'use client'
3. Define page component with TypeScript
4. Import and use UI components
5. Use mock data for development
6. Add route to sidebar if needed

### State Management Pattern
```typescript
// Local state for UI
const [isOpen, setIsOpen] = useState(false)

// Zustand for global state
const documents = useDocumentStore(state => state.documents)
const addDocument = useDocumentStore(state => state.addDocument)

// URL state for filters
const searchParams = useSearchParams()
const category = searchParams.get('category')
```

## Testing Considerations (Future)

When implementing tests:
- Use Jest + React Testing Library
- Test components in isolation
- Mock external dependencies
- Test user interactions
- Maintain >80% code coverage

## Security Considerations

- **Input validation** - Validate all user inputs
- **XSS prevention** - Sanitize user content
- **SQL injection** - Use parameterized queries
- **Authentication** - Implement secure auth flow
- **Authorization** - Check permissions before actions
- **File uploads** - Validate file types and sizes
- **Rate limiting** - Prevent abuse

## Performance Considerations

- **Code splitting** - Use dynamic imports
- **Image optimization** - Use Next.js Image component
- **Lazy loading** - Load components when needed
- **Memoization** - Use React.memo for expensive renders
- **Bundle size** - Monitor and optimize bundle size
- **Caching** - Implement appropriate caching strategies

## Deployment

Not yet configured. Future options:
- Vercel (recommended for Next.js)
- AWS (EC2 + RDS + S3)
- Google Cloud Platform
- DigitalOcean

## Git Status

- **Repository:** Not initialized as git repository
- **Version Control:** To be set up

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs)

## Notes for AI Assistants

1. **Always check types** - This project uses strict TypeScript
2. **Use existing components** - Check components/ui before creating new ones
3. **Follow patterns** - Look at existing code for patterns
4. **Mock data first** - Use mock data until backend is ready
5. **Mobile responsive** - Always consider mobile layout
6. **Accessibility** - Include ARIA labels, keyboard navigation
7. **Documentation** - Update docs when adding features
8. **No emojis** - Avoid using emojis unless explicitly requested
9. **Professional tone** - Keep explanations clear and professional
10. **Read before write** - Always read existing files before modifying

## Quick Reference

### Create Component
```bash
# Use /component command or manually:
# 1. Create file in src/components/ui/
# 2. Follow component pattern
# 3. Export component
```

### Add Page
```bash
# Use /page command or manually:
# 1. Create directory in src/app/
# 2. Create page.tsx
# 3. Add route to sidebar
```

### Update Types
```typescript
// Edit src/types/index.ts
// Add new type or interface
// Export it
// Use throughout application
```

### Add Mock Data
```typescript
// Edit src/lib/mock-data.ts
// Add new mock data following existing patterns
// Export it
```

## Project Goals

**Short-term:**
- Complete UI components
- Implement state management
- Finalize all page layouts

**Mid-term:**
- Backend API development
- Database integration
- Authentication system
- Real AI integration

**Long-term:**
- Mobile app
- Advanced features
- Third-party integrations
- Production deployment

---

**Last Updated:** 2024-11-13
**Project Version:** 1.0.0
**Status:** Early Development
