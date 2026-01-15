# State Management with Zustand

This directory contains all global state management stores for the Legal Companion application using Zustand.

## Available Stores

### 1. Document Store (`useDocumentStore`)

Manages document state including CRUD operations, filtering, and search.

**Usage:**
```typescript
import { useDocumentStore } from '@/stores';

function MyComponent() {
  const { documents, addDocument, setFilter, getFilteredDocuments } = useDocumentStore();

  // Get filtered documents
  const filteredDocs = getFilteredDocuments();

  // Add a new document
  addDocument(newDocument);

  // Set filters
  setFilter('category', 'employment');
  setFilter('status', 'active');
}
```

**Features:**
- CRUD operations (add, update, delete)
- Filtering by category, status, and search query
- Document selection
- Derived selectors for filtered results

---

### 2. Event Store (`useEventStore`)

Manages calendar events, deadlines, and reminders.

**Usage:**
```typescript
import { useEventStore } from '@/stores';

function CalendarComponent() {
  const { events, addEvent, getUpcomingEvents, setViewMode } = useEventStore();

  // Get upcoming events in next 30 days
  const upcoming = getUpcomingEvents(30);

  // Add new event
  addEvent(newEvent);

  // Toggle view mode
  setViewMode('month'); // or 'list'
}
```

**Features:**
- Event CRUD operations
- Filter by type, priority, status, and date range
- View mode toggle (month/list)
- Get upcoming events, critical events
- Mark events as completed/dismissed

---

### 3. Task Store (`useTaskStore`)

Manages tasks and to-do items.

**Usage:**
```typescript
import { useTaskStore } from '@/stores';

function TaskList() {
  const { tasks, toggleTaskStatus, getTasksStats, setFilter } = useTaskStore();

  // Get task statistics
  const stats = getTasksStats();

  // Toggle task status
  toggleTaskStatus(taskId);

  // Filter by status
  setFilter('status', 'pending');
}
```

**Features:**
- Task CRUD operations
- Status toggling (pending → in_progress → completed)
- Filter by status and priority
- Get overdue tasks
- Task statistics

---

### 4. Notification Store (`useNotificationStore`)

Manages user notifications and alerts.

**Usage:**
```typescript
import { useNotificationStore } from '@/stores';

function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore();

  // Get unread count
  const unreadCount = getUnreadCount();

  // Mark single as read
  markAsRead(notificationId);

  // Mark all as read
  markAllAsRead();
}
```

**Features:**
- Add/delete notifications
- Mark as read/unread
- Filter by type and read status
- Get critical notifications
- Unread count

---

### 5. Insurance Store (`useInsuranceStore`)

Manages insurance policies and claims.

**Usage:**
```typescript
import { useInsuranceStore } from '@/stores';

function InsuranceDashboard() {
  const { policies, summary, getExpiringPolicies, setFilter } = useInsuranceStore();

  // Get expiring policies in next 30 days
  const expiring = getExpiringPolicies(30);

  // Filter by type
  setFilter('insuranceType', 'health');

  // Summary data
  console.log(summary.totalCoverage);
}
```

**Features:**
- Policy CRUD operations
- Automatic summary calculation
- Filter by type and status
- Get expiring policies
- Policy selection

---

### 6. Auth Store (`useAuthStore`)

Manages user authentication state.

**Usage:**
```typescript
import { useAuthStore } from '@/stores';

function UserProfile() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();

  // Login
  await login(email, password);

  // Logout
  logout();

  // Update user profile
  updateUser({ fullName: 'New Name' });
}
```

**Features:**
- Login/logout/register (mocked, ready for API integration)
- User state management
- Authentication status
- Token storage
- User profile updates

---

### 7. Preferences Store (`usePreferencesStore`)

Manages user preferences and settings.

**Usage:**
```typescript
import { usePreferencesStore } from '@/stores';

function SettingsPage() {
  const { preferences, setLanguage, updateNotificationPreferences } = usePreferencesStore();

  // Update language
  setLanguage('en');

  // Update notification preferences
  updateNotificationPreferences({
    email: true,
    push: false,
  });
}
```

**Features:**
- Country/region/language settings
- Notification preferences (email, push, SMS)
- Quiet hours configuration
- Reminder default schedule
- AI assistance level

---

## Persistence

All stores use Zustand's `persist` middleware to save state to localStorage:

- **Document Store**: `document-storage`
- **Event Store**: `event-storage`
- **Task Store**: `task-storage`
- **Notification Store**: `notification-storage`
- **Insurance Store**: `insurance-storage`
- **Auth Store**: `auth-storage`
- **Preferences Store**: `preferences-storage`

Only essential data is persisted (not loading states or errors).

---

## Best Practices

### 1. Use Selectors for Performance

```typescript
// ❌ Bad - Re-renders on any store change
const store = useDocumentStore();

// ✅ Good - Only re-renders when documents change
const documents = useDocumentStore((state) => state.documents);
const addDocument = useDocumentStore((state) => state.addDocument);
```

### 2. Use Derived State

```typescript
// ✅ Use store methods for computed values
const filteredDocs = useDocumentStore((state) => state.getFilteredDocuments());
const stats = useTaskStore((state) => state.getTasksStats());
```

### 3. Reset Store on Logout

```typescript
function logout() {
  useAuthStore.getState().logout();
  useDocumentStore.getState().reset();
  useEventStore.getState().reset();
  useTaskStore.getState().reset();
  // ... reset other stores
}
```

### 4. Loading States

```typescript
async function loadDocuments() {
  const { setLoading, setError, setDocuments } = useDocumentStore.getState();

  setLoading(true);
  try {
    const docs = await api.getDocuments();
    setDocuments(docs);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}
```

---

## Integration with API

All stores are currently using mock data. To integrate with a real API:

1. Replace mock data initialization with empty arrays
2. Implement API calls in action methods
3. Use loading and error states
4. Handle errors gracefully

**Example:**

```typescript
// Before (mock)
addDocument: (document) => set((state) => ({
  documents: [document, ...state.documents],
})),

// After (with API)
addDocument: async (document) => {
  set({ isLoading: true, error: null });
  try {
    const newDoc = await api.createDocument(document);
    set((state) => ({
      documents: [newDoc, ...state.documents],
      isLoading: false,
    }));
  } catch (error) {
    set({ error: error.message, isLoading: false });
    throw error;
  }
},
```

---

## Testing

To test stores:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDocumentStore } from '@/stores';

describe('useDocumentStore', () => {
  beforeEach(() => {
    useDocumentStore.getState().reset();
  });

  it('should add a document', () => {
    const { result } = renderHook(() => useDocumentStore());

    act(() => {
      result.current.addDocument(mockDocument);
    });

    expect(result.current.documents).toHaveLength(1);
  });
});
```

---

## Migration from Component State

To migrate from local useState to Zustand:

**Before:**
```typescript
function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load documents
  }, []);
}
```

**After:**
```typescript
function DocumentList() {
  const documents = useDocumentStore((state) => state.getFilteredDocuments());
  const setFilter = useDocumentStore((state) => state.setFilter);

  // Documents persist across navigation!
}
```

---

## Next Steps

- [ ] Integrate with real API endpoints
- [ ] Add optimistic updates
- [ ] Implement WebSocket for real-time updates
- [ ] Add middleware for logging/analytics
- [ ] Create custom hooks for common patterns
