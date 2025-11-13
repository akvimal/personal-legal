# Component Documentation

Complete reference for all UI components in the Personal Legal Companion application.

## Table of Contents

- [UI Components](#ui-components)
  - [Button](#button)
  - [Card](#card)
  - [Badge](#badge)
  - [Input](#input)
- [Layout Components](#layout-components)
  - [Sidebar](#sidebar)
- [Feature Components](#feature-components)
  - [Upload Document Modal](#upload-document-modal)
  - [Create Event Modal](#create-event-modal)
- [Usage Guidelines](#usage-guidelines)

---

## UI Components

Base UI components located in `src/components/ui/`. These are reusable, atomic components used throughout the application.

### Button

A versatile button component with multiple variants and sizes.

**Location:** `src/components/ui/button.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'default'` | Button style variant |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` | Button size |
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `ButtonHTMLAttributes` | - | All standard button HTML attributes |

#### Variants

**Default / Primary** - Blue background, white text
```tsx
<Button variant="default">Default Button</Button>
<Button variant="primary">Primary Button</Button>
```

**Secondary** - Purple background, white text
```tsx
<Button variant="secondary">Secondary Button</Button>
```

**Outline** - White background with border
```tsx
<Button variant="outline">Outline Button</Button>
```

**Ghost** - Transparent background
```tsx
<Button variant="ghost">Ghost Button</Button>
```

**Danger** - Red background for destructive actions
```tsx
<Button variant="danger">Delete</Button>
```

#### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### Examples

```tsx
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

// Basic usage
<Button>Click me</Button>

// With icon
<Button variant="primary">
  <Plus className="w-4 h-4" />
  Add Document
</Button>

// Disabled state
<Button disabled>Loading...</Button>

// As submit button
<Button type="submit" variant="primary">
  Save Changes
</Button>

// Custom styling
<Button className="w-full">
  Full Width Button
</Button>
```

#### Accessibility

- Supports all standard button HTML attributes
- Includes focus ring for keyboard navigation
- Disabled state prevents interaction
- Use `aria-label` for icon-only buttons

```tsx
<Button size="icon" aria-label="Add new document">
  <Plus className="w-4 h-4" />
</Button>
```

---

### Card

A container component for grouping related content.

**Location:** `src/components/ui/card.tsx`

#### Components

- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section with actions

#### Props

All components accept standard HTML div attributes plus:

| Component | Additional Props |
|-----------|-----------------|
| All | `className`, `ref` |

#### Examples

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Basic card
<Card>
  <CardContent>
    Simple card content
  </CardContent>
</Card>

// Full card structure
<Card>
  <CardHeader>
    <CardTitle>Employment Contract</CardTitle>
    <CardDescription>
      Signed on January 15, 2024
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contract details and key terms...</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">View Details</Button>
    <Button variant="primary">Download</Button>
  </CardFooter>
</Card>

// Clickable card
<Card className="cursor-pointer hover:shadow-md transition-shadow">
  <CardContent>
    Interactive content
  </CardContent>
</Card>
```

#### Layout Patterns

**Grid of cards:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

**Stacked cards:**
```tsx
<div className="space-y-4">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

### Badge

Small status indicators and labels.

**Location:** `src/components/ui/badge.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'critical' \| 'info' \| 'outline'` | `'default'` | Badge style variant |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Badge content |

#### Variants

**Default** - Gray badge
```tsx
<Badge>Default</Badge>
```

**Success** - Green badge for positive states
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="success">Completed</Badge>
```

**Warning** - Orange badge for warnings
```tsx
<Badge variant="warning">Expiring Soon</Badge>
<Badge variant="warning">Pending</Badge>
```

**Critical** - Red badge for urgent items
```tsx
<Badge variant="critical">Expired</Badge>
<Badge variant="critical">Overdue</Badge>
```

**Info** - Blue badge for informational content
```tsx
<Badge variant="info">New</Badge>
<Badge variant="info">Updated</Badge>
```

**Outline** - Border-only variant
```tsx
<Badge variant="outline">Draft</Badge>
```

#### Examples

```tsx
import { Badge } from '@/components/ui/badge'

// Document status
<Badge variant="success">Active</Badge>
<Badge variant="warning">Expiring in 7 days</Badge>
<Badge variant="critical">Expired</Badge>

// Document category
<Badge>Employment</Badge>
<Badge>Property</Badge>
<Badge>Insurance</Badge>

// With icon
<Badge variant="success">
  <CheckCircle className="w-3 h-3 mr-1" />
  Verified
</Badge>

// Multiple badges
<div className="flex gap-2">
  <Badge variant="info">PDF</Badge>
  <Badge>5 pages</Badge>
  <Badge>2.4 MB</Badge>
</div>
```

#### Use Cases

- Document status (active, expired, expiring soon)
- Document categories
- File types (PDF, DOC, etc.)
- Priority indicators
- Tags and labels
- Notification counts

---

### Input

Text input component with label support.

**Location:** `src/components/ui/input.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | `'text'` | Input type |
| `placeholder` | `string` | - | Placeholder text |
| `disabled` | `boolean` | `false` | Whether input is disabled |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `InputHTMLAttributes` | - | All standard input HTML attributes |

#### Examples

```tsx
import { Input } from '@/components/ui/input'

// Basic input
<Input placeholder="Enter document title" />

// With label
<div>
  <label className="block text-sm font-medium mb-2">
    Document Title
  </label>
  <Input placeholder="e.g., Employment Contract" />
</div>

// Different types
<Input type="text" placeholder="Text input" />
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Amount" />
<Input type="date" />

// Disabled state
<Input disabled value="Cannot edit" />

// With error state
<Input
  className="border-critical focus:ring-critical"
  placeholder="Invalid input"
/>

// Full-width
<Input className="w-full" placeholder="Full width input" />
```

#### Form Pattern

```tsx
const [formData, setFormData] = useState({
  title: '',
  category: '',
  notes: ''
})

<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">
        Title
      </label>
      <Input
        value={formData.title}
        onChange={(e) => setFormData({
          ...formData,
          title: e.target.value
        })}
        placeholder="Enter title"
        required
      />
    </div>

    <Button type="submit">Submit</Button>
  </div>
</form>
```

---

## Layout Components

Components that define the application layout structure.

### Sidebar

Main navigation sidebar component.

**Location:** `src/components/layout/sidebar.tsx`

#### Features

- Navigation menu with icons
- Active route highlighting
- User profile section
- Mobile responsive (collapsible)
- Fixed positioning

#### Navigation Items

The sidebar includes navigation to:
- Dashboard (/)
- Documents (/documents)
- Insurance (/insurance)
- AI Assistant (/assistant)
- Legal Help (/legal-help)
- Calendar (/calendar)
- Tasks (/tasks)
- Templates (/templates)
- Notifications (/notifications)
- Settings (/settings)

#### Usage

```tsx
import Sidebar from '@/components/layout/sidebar'

// In layout.tsx
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1 overflow-auto">
    {children}
  </main>
</div>
```

#### Customization

The sidebar automatically:
- Highlights the current active route
- Shows notification counts (when available)
- Adapts to mobile screens
- Provides logout functionality

---

## Feature Components

Complex, feature-specific components.

### Upload Document Modal

Modal dialog for uploading documents.

**Location:** `src/components/features/upload-document-modal.tsx`

#### Features

- File selection (drag & drop + click)
- File type validation
- Size limit enforcement
- Preview before upload
- Category selection
- Metadata input

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `onClose` | `() => void` | Close handler |
| `onUpload` | `(file: File, metadata: Metadata) => void` | Upload handler |

#### Usage

```tsx
import { UploadDocumentModal } from '@/components/features/upload-document-modal'

const [isOpen, setIsOpen] = useState(false)

const handleUpload = async (file: File, metadata: Metadata) => {
  // Upload logic
  await uploadDocument(file, metadata)
  setIsOpen(false)
}

<>
  <Button onClick={() => setIsOpen(true)}>
    Upload Document
  </Button>

  <UploadDocumentModal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    onUpload={handleUpload}
  />
</>
```

---

### Create Event Modal

Modal for creating calendar events.

**Location:** `src/components/features/create-event-modal.tsx`

#### Features

- Event details form
- Date/time picker
- Document linking
- Reminder configuration
- Recurrence options

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `onClose` | `() => void` | Close handler |
| `onCreate` | `(event: Event) => void` | Create handler |
| `documentId?` | `string` | Pre-selected document |

#### Usage

```tsx
import { CreateEventModal } from '@/components/features/create-event-modal'

const [isOpen, setIsOpen] = useState(false)

const handleCreate = async (event: Event) => {
  await createEvent(event)
  setIsOpen(false)
}

<CreateEventModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onCreate={handleCreate}
  documentId={selectedDocumentId}
/>
```

---

## Usage Guidelines

### Composition Patterns

#### Button Groups
```tsx
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

#### Form with Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Document Information</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <label>Title</label>
      <Input placeholder="Enter title" />
    </div>
    <div>
      <label>Category</label>
      <select className="...">...</select>
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

#### Badge Collections
```tsx
<div className="flex flex-wrap gap-2">
  <Badge variant="success">Active</Badge>
  <Badge>Employment</Badge>
  <Badge>Important</Badge>
  <Badge variant="warning">Expires in 30 days</Badge>
</div>
```

### Responsive Design

All components are mobile-responsive. Use Tailwind breakpoints:

```tsx
<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

<Button className="w-full sm:w-auto">
  Button
</Button>
```

### Accessibility Best Practices

1. **Keyboard Navigation**
   - All interactive elements are keyboard accessible
   - Use Tab to navigate, Enter to activate

2. **Screen Readers**
   - Use `aria-label` for icon-only buttons
   - Provide descriptive labels

3. **Focus Indicators**
   - All components have visible focus states
   - Never remove focus outlines

4. **Semantic HTML**
   - Components use proper HTML elements
   - Headings are in logical order

### Performance Tips

1. **Avoid Inline Functions in Renders**
   ```tsx
   // ❌ Bad
   <Button onClick={() => handleClick(id)}>Click</Button>

   // ✅ Good
   const onClick = useCallback(() => handleClick(id), [id])
   <Button onClick={onClick}>Click</Button>
   ```

2. **Memoize Heavy Components**
   ```tsx
   const MemoizedCard = React.memo(DocumentCard)
   ```

3. **Use Keys in Lists**
   ```tsx
   {documents.map(doc => (
     <Card key={doc.id}>...</Card>
   ))}
   ```

### Styling Customization

All components accept `className` prop for custom styling:

```tsx
// Extend styles
<Button className="w-full shadow-lg">
  Custom Button
</Button>

// Override with Tailwind
<Card className="border-2 border-blue-500 shadow-xl">
  Custom Card
</Card>

// Conditional styles
<Badge className={cn(
  isUrgent && "animate-pulse",
  isHighPriority && "ring-2 ring-red-500"
)}>
  Status
</Badge>
```

### Color System

Components use the theme colors from `tailwind.config.ts`:

- `primary` - #2563EB (Blue)
- `secondary` - #8B5CF6 (Purple)
- `success` - #10B981 (Green)
- `warning` - #F59E0B (Amber)
- `critical` - #EF4444 (Red)
- `neutral` - Gray scale

Use these consistently across custom components.

---

## Creating New Components

When creating new components:

1. **Choose the right location:**
   - UI primitives → `src/components/ui/`
   - Layout components → `src/components/layout/`
   - Feature-specific → `src/components/features/`

2. **Follow the pattern:**
   ```tsx
   'use client'

   import * as React from 'react'
   import { cn } from '@/lib/utils'

   interface ComponentProps {
     // Props
   }

   const Component = React.forwardRef<HTMLElement, ComponentProps>(
     ({ className, ...props }, ref) => {
       return (
         <element
           ref={ref}
           className={cn('base-classes', className)}
           {...props}
         />
       )
     }
   )
   Component.displayName = 'Component'

   export { Component }
   ```

3. **Export from index** (optional):
   ```tsx
   // src/components/ui/index.ts
   export { Component } from './component'
   ```

4. **Document the component:**
   - Add to this file
   - Include props table
   - Provide examples
   - Note accessibility considerations

---

## Need Help?

- Check the [Contributing Guide](./CONTRIBUTING.md) for coding standards
- See [Architecture Documentation](./ARCHITECTURE.md) for design patterns
- Review existing components for examples
- Open an issue for component requests or bugs
