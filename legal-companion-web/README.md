# Legal Companion - Personal Legal Assistant

A comprehensive web application for managing personal legal documents, tracking obligations, and getting AI-powered legal assistance.

## 🌟 Features

### Core Features
- **Google OAuth & Drive Integration**: 🔐 Sign in with Google and auto-sync documents from Drive folder
- **Document Management**: Upload, categorize, and organize all your legal documents
- **Smart Event Extraction**: Automatically extract deadlines, payment dates, and obligations
- **AI Legal Assistant**: Chat interface to ask questions about your documents
- **Email Integration & Terms Extraction**: 📧 Connect email to automatically extract T&C from subscriptions and agreements
- **General Legal Help**: 💡 Get proactive legal guidance before taking any action (renting, hiring, business, etc.)
- **Calendar & Reminders**: Track important dates with automated notifications
- **Template Generator**: Create legal documents from country/region-specific templates
- **Multi-tenant Support**: Designed for SaaS deployment (India/Tamil Nadu as default)

### Key Capabilities
- 🔐 **Google OAuth authentication** - Sign in with Google account
- ☁️ **Google Drive sync** - Auto-import documents from designated Drive folder
- 📄 Support for multiple document types (Employment, Property, Business, Financial, etc.)
- 🤖 AI-powered Q&A with document citations
- 📧 Email integration to extract T&C from subscriptions (Netflix, Spotify, SaaS, etc.)
- 💡 Proactive legal guidance for scenarios (renting, hiring, business, lending)
- 📅 Automatic event detection and reminder scheduling
- ✅ Task management for legal obligations
- 🔔 Smart notifications system
- 📊 Legal health score and analytics
- 🌍 Country and region-specific templates
- ⚖️ Risk assessment and red flags identification
- 🔄 Real-time and scheduled document syncing
- 📁 Folder-based organization with subfolder support

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI patterns
- **Icons**: Lucide React
- **State Management**: Zustand
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

## 🚀 Getting Started

### Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd legal-companion-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
legal-companion-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── documents/         # Documents library
│   │   ├── assistant/         # AI Assistant chat
│   │   ├── calendar/          # Calendar view
│   │   ├── notifications/     # Notifications center
│   │   ├── templates/         # Template generator
│   │   └── settings/          # User settings
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── layout/            # Layout components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── documents/         # Document-related components
│   │   └── chat/              # Chat components
│   ├── lib/                   # Utility functions
│   │   ├── utils.ts           # Common utilities
│   │   └── mock-data.ts       # Mock data for development
│   ├── types/                 # TypeScript type definitions
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   └── utils/                 # Additional utilities
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.mjs           # Next.js configuration
└── package.json              # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563EB) - Actions, links, primary buttons
- **Secondary**: Purple (#8B5CF6) - AI features, suggestions
- **Success**: Green (#10B981) - Active status, completed tasks
- **Warning**: Orange (#F59E0B) - Upcoming deadlines, warnings
- **Critical**: Red (#EF4444) - Urgent alerts, overdue items

### Typography
- **Font Family**: Inter (from Google Fonts)
- **Font Sizes**: 12px, 14px, 16px (body), 20px, 24px, 32px

## 📱 Current Pages

### 1. Dashboard (`/`)
- Quick actions bar
- Urgent attention alerts
- Legal health score
- Overview statistics
- Recent documents
- Upcoming events timeline
- AI suggestions

### 2. Documents Library (`/documents`)
- Filterable document list
- Category and status filters
- Search functionality
- Document cards with metadata
- Quick actions (View, Ask AI, Download, etc.)

### 3. AI Assistant (`/assistant`)
- Chat interface with AI
- Message history
- Quick question templates
- Document source citations
- Voice and file attachment support

### 4. Legal Help (`/legal-help`) 💡 NEW
- Ask questions before taking action
- Popular legal scenarios
- Browse by category
- Detailed guidance with risk assessment
- Do's, Don'ts, and Red Flags
- Interactive checklist
- Required documents list
- Applicable laws and regulations
- Lawyer recommendation

### 5. Calendar (To be implemented)
- Monthly/weekly/list views
- Event filtering
- Event details and actions
- Calendar export functionality

### 6. Notifications (To be implemented)
- Notification center
- Filter by type
- Action buttons per notification
- Mark as read functionality

### 7. Templates (To be implemented)
- Template browser
- Country/region filtering
- Form-based template generation
- Preview and download

### 8. Settings (`/settings`) ⚙️ NEW
- Profile management
- Google Drive integration
  - Connect/disconnect Drive
  - Select folder to sync
  - Sync settings (frequency, file types, subfolders)
  - Sync statistics
  - Manual sync trigger
- Notification preferences
- Security settings
- Data & storage management

### 9. Email Integration (To be implemented)
- Connect email accounts (Gmail, Outlook)
- Automatic T&C extraction
- Subscription monitoring
- Email classification
- Review and approve extracted terms

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration (when backend is ready)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AI_API_KEY=your-openai-api-key

# App Configuration
NEXT_PUBLIC_DEFAULT_COUNTRY=India
NEXT_PUBLIC_DEFAULT_REGION=Tamil Nadu
```

## 📊 Mock Data

The application currently uses mock data defined in `src/lib/mock-data.ts`. This includes:
- Sample documents (employment, rental, NDA, insurance)
- Events and deadlines
- Tasks and notifications
- Chat messages

To connect to a real backend:
1. Create API service files in `src/lib/api/`
2. Replace mock data imports with API calls
3. Update environment variables

## 🎯 Roadmap

### Phase 1 - MVP (Current)
- [x] Project setup with Next.js and TypeScript
- [x] Core UI components
- [x] Dashboard with overview
- [x] Document library with filtering
- [x] AI Assistant chat interface
- [ ] Calendar and events view
- [ ] Notifications center
- [ ] Template generator

### Phase 2 - Backend Integration
- [ ] REST API integration
- [ ] User authentication
- [ ] Document upload and storage
- [ ] OCR and text extraction
- [ ] AI/LLM integration for Q&A

### Phase 3 - Advanced Features
- [ ] Event extraction using AI
- [ ] Automated reminders
- [ ] Calendar sync (Google, Outlook)
- [ ] Email notifications
- [ ] Document analytics

### Phase 4 - Mobile App
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Document scanner
- [ ] Biometric authentication

## 🤝 Contributing

This is a personal project for legal document management. Contributions and suggestions are welcome!

## 📄 License

ISC License

## 🔐 Security & Privacy

- All documents are stored securely (when backend is implemented)
- End-to-end encryption for sensitive data
- No sharing of user data with AI providers for training
- GDPR and data privacy compliance

## 📞 Support

For questions or support, please refer to the project documentation or create an issue.

---

## 📚 Additional Documentation

For detailed architecture on the new features:

- **[GOOGLE_INTEGRATION.md](./GOOGLE_INTEGRATION.md)** - Complete Google OAuth & Drive integration guide:
  - OAuth 2.0 authentication flow
  - Google Drive API integration
  - File sync pipeline (initial, scheduled, real-time)
  - Folder selection and permissions
  - Security & token management
  - Database schemas and API endpoints
  - UI/UX flows
  - Error handling and recovery

- **[ARCHITECTURE_UPDATE.md](./ARCHITECTURE_UPDATE.md)** - Comprehensive documentation on:
  - Email Integration & Terms Extraction architecture
  - General Legal Help service design
  - LLM prompts and workflows
  - Database schemas and API endpoints

---

**Note**: This is the frontend web application. Backend API development is in progress and will provide:
- **Google OAuth authentication** and token management
- **Google Drive API integration** for document syncing
- Document storage and management
- OCR and PDF processing
- AI/LLM integration for Q&A and legal guidance
- Email integration and terms extraction
- Event extraction and scheduling
- Real-time webhooks for Drive changes
- User authentication and authorization
- Risk assessment and compliance checking
