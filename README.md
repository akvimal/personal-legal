# Personal Legal Companion

A comprehensive web application designed to help individuals manage their legal documents, insurance policies, and legal obligations with AI-powered assistance.

## Overview

Personal Legal Companion is a full-stack Next.js application that serves as your personal legal assistant. It helps you organize legal documents, track important deadlines, manage insurance policies, and get AI-powered legal guidance.

## Key Features

- **Document Management** - Upload, categorize, and organize legal documents (contracts, agreements, policies)
- **Insurance Tracking** - Manage multiple insurance types (health, auto, life, property, travel)
- **Event Calendar** - Track deadlines, obligations, and important dates with reminders
- **AI Assistant** - Get answers about your documents with citation tracking
- **Legal Guidance** - Receive risk assessments and AI-powered legal recommendations
- **Task Management** - Create and track action items related to your legal matters
- **Notifications** - Smart alerts for expiring documents and upcoming deadlines
- **Templates** - Access pre-built legal document templates
- **Dashboard** - Comprehensive overview with legal health score

## Project Structure

```
personal-legal/
├── .claude/                    # Claude Code configuration
├── legal-companion-web/        # Main Next.js application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/               # Utilities and mock data
│   │   ├── types/             # TypeScript type definitions
│   │   ├── stores/            # State management (Zustand)
│   │   └── hooks/             # Custom React hooks
│   ├── public/                # Static assets
│   └── docs/                  # Documentation
└── README.md                  # This file
```

## Tech Stack

- **Framework:** Next.js 16.0.1 (App Router)
- **UI Library:** React 19.2.0
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand 5.0.8
- **Icons:** Lucide React
- **Date Utilities:** date-fns 4.1.0

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-legal
```

2. Navigate to the web application:
```bash
cd legal-companion-web
```

3. Install dependencies:
```bash
npm install
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development Status

### Current Status: Early Development

**Completed:**
- ✓ UI component library
- ✓ Page routing structure (10 main pages)
- ✓ TypeScript type system
- ✓ Mock data layer
- ✓ Responsive design
- ✓ Navigation system

**In Progress:**
- ⚠ State management implementation
- ⚠ Component feature completion

**Planned:**
- ☐ Backend API integration
- ☐ Database setup
- ☐ Authentication & authorization
- ☐ Real AI/LLM integration
- ☐ Email integration
- ☐ Google Drive integration
- ☐ User data persistence

## Documentation

- [Architecture Guide](./legal-companion-web/docs/ARCHITECTURE.md) - System architecture and design patterns
- [Component Documentation](./legal-companion-web/docs/COMPONENTS.md) - UI component library reference
- [API Documentation](./legal-companion-web/docs/API.md) - API endpoints and data structures
- [Contributing Guide](./legal-companion-web/docs/CONTRIBUTING.md) - How to contribute to the project
- [Type System](./legal-companion-web/docs/TYPES.md) - TypeScript type definitions reference

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with overview and health score |
| `/documents` | Document management and browsing |
| `/documents/[id]` | Individual document detail view |
| `/insurance` | Insurance policy management |
| `/assistant` | AI-powered document Q&A |
| `/legal-help` | Legal guidance and recommendations |
| `/calendar` | Event and deadline calendar |
| `/tasks` | Task management |
| `/templates` | Document template library |
| `/notifications` | Notification center |
| `/settings` | User settings and preferences |

## Configuration

### Environment Variables

Create a `.env.local` file in the `legal-companion-web` directory:

```env
# Add environment variables as needed
# NEXT_PUBLIC_API_URL=http://localhost:3001
# OPENAI_API_KEY=your_api_key_here
```

### Tailwind Theme

The application uses a custom color palette defined in `tailwind.config.ts`:
- Primary: Blue (#2563EB)
- Secondary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Critical: Red (#EF4444)

## Contributing

Please read [CONTRIBUTING.md](./legal-companion-web/docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue in the repository.

## Roadmap

### Phase 1: Foundation (Current)
- Complete UI components
- Finalize mock data structure
- Implement state management

### Phase 2: Backend Integration
- Set up API server
- Database design and implementation
- Authentication system

### Phase 3: AI Integration
- Connect to LLM service
- Document analysis features
- Legal guidance engine

### Phase 4: Integrations
- Email inbox monitoring
- Google Drive sync
- Calendar integrations

### Phase 5: Production
- Testing and QA
- Performance optimization
- Deployment setup

## Acknowledgments

- Built with Next.js and React
- UI components inspired by shadcn/ui
- Icons by Lucide
