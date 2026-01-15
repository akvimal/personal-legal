# Custom React Hooks

Comprehensive collection of custom React hooks for the Legal Companion application.

## Data Management Hooks

### useDocuments()

Manage documents with CRUD operations, filtering, and statistics.

**Usage:**
```typescript
import { useDocuments } from '@/hooks';

function DocumentList() {
  const {
    filteredDocuments,
    stats,
    searchDocuments,
    filterByCategory,
    createDocument,
  } = useDocuments();

  return (
    <div>
      <input onChange={(e) => searchDocuments(e.target.value)} />
      <p>Total: {stats.total}, Active: {stats.active}</p>
      {filteredDocuments.map(doc => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  );
}
```

**Features:**
- Full CRUD operations
- Search and filtering
- Document statistics
- Memoized filtered results

---

### useDocument(id)

Hook for working with a single document.

**Usage:**
```typescript
import { useDocument } from '@/hooks';

function DocumentDetail({ id }: { id: string }) {
  const { document, update, isLoading } = useDocument(id);

  if (!document) return <div>Not found</div>;

  return (
    <div>
      <h1>{document.title}</h1>
      <button onClick={() => update({ status: 'archived' })}>
        Archive
      </button>
    </div>
  );
}
```

---

### useEvents()

Manage calendar events and deadlines.

**Usage:**
```typescript
import { useEvents } from '@/hooks';

function Calendar() {
  const {
    upcomingEvents,
    criticalEvents,
    stats,
    createEvent,
    filterByType,
  } = useEvents();

  return (
    <div>
      <p>Critical: {criticalEvents.length}</p>
      <select onChange={(e) => filterByType(e.target.value as any)}>
        <option value="all">All Types</option>
        <option value="contract_expiry">Contract Expiry</option>
      </select>
    </div>
  );
}
```

---

### useTasks()

Task management with status tracking.

**Usage:**
```typescript
import { useTasks } from '@/hooks';

function TaskList() {
  const {
    filteredTasks,
    overdueTasks,
    stats,
    toggleTaskStatus,
    filterByStatus,
  } = useTasks();

  return (
    <div>
      <p>Overdue: {overdueTasks.length}</p>
      {filteredTasks.map(task => (
        <div key={task.id} onClick={() => toggleTaskStatus(task.id)}>
          {task.title} - {task.status}
        </div>
      ))}
    </div>
  );
}
```

---

### useNotifications()

Notification management with read status tracking.

**Usage:**
```typescript
import { useNotifications } from '@/hooks';

function NotificationBell() {
  const {
    unreadCount,
    criticalNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div>
      <span>Notifications ({unreadCount})</span>
      <button onClick={markAllAsRead}>Mark All Read</button>
      {criticalNotifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}
        </div>
      ))}
    </div>
  );
}
```

---

### useAuth()

Authentication and user management.

**Usage:**
```typescript
import { useAuth } from '@/hooks';

function LoginForm() {
  const { signIn, signOut, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    const result = await signIn('email@example.com', 'password');
    if (result.success) {
      console.log('Logged in!');
    }
  };

  if (isAuthenticated) {
    return <div>Welcome {user?.fullName} <button onClick={signOut}>Logout</button></div>;
  }

  return <button onClick={handleLogin}>Login</button>;
}
```

---

## Feature Hooks

### useUpload()

File upload with progress tracking and validation.

**Usage:**
```typescript
import { useUpload } from '@/hooks';

function FileUploader() {
  const { progress, status, uploadFile, validateFile, reset } = useUpload();

  const handleUpload = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const result = await uploadFile(file, 'employment', {
        title: 'My Document',
        tags: ['important'],
      });
      console.log('Uploaded:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />
      {status === 'uploading' && <progress value={progress} max={100} />}
    </div>
  );
}
```

---

### useSearch()

Global search across documents, events, and tasks.

**Usage:**
```typescript
import { useSearch } from '@/hooks';

function GlobalSearch() {
  const { query, results, search, filterByType, clearSearch } = useSearch();

  return (
    <div>
      <input
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Search..."
      />
      <select onChange={(e) => filterByType(e.target.value as any)}>
        <option value="all">All</option>
        <option value="document">Documents</option>
        <option value="event">Events</option>
        <option value="task">Tasks</option>
      </select>
      <p>Found {results.length} results</p>
      {results.map(result => (
        <div key={`${result.type}-${result.id}`}>
          {result.title} ({result.type})
        </div>
      ))}
    </div>
  );
}
```

---

### useFilters(initialFilters)

Generic filtering logic.

**Usage:**
```typescript
import { useFilters } from '@/hooks';

function ProductList() {
  const {
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilters({
    category: 'all',
    priceRange: { min: 0, max: 1000 },
    inStock: false,
  });

  return (
    <div>
      <select onChange={(e) => setFilter('category', e.target.value)}>
        <option value="all">All Categories</option>
      </select>
      {hasActiveFilters && (
        <button onClick={resetFilters}>
          Clear {activeFilterCount} filters
        </button>
      )}
    </div>
  );
}
```

---

## Utility Hooks

### useDebounce(value, delay)

Debounce a value to reduce update frequency.

**Usage:**
```typescript
import { useDebounce } from '@/hooks';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  // This effect only runs when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery) {
      // Call API with debounced query
      fetchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

---

### useLocalStorage(key, initialValue)

Persist state in localStorage with sync across tabs.

**Usage:**
```typescript
import { useLocalStorage } from '@/hooks';

function ThemeToggle() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <button onClick={removeTheme}>Reset to Default</button>
    </div>
  );
}
```

---

### useMediaQuery(query)

Detect media query matches for responsive logic.

**Usage:**
```typescript
import { useIsMobile, useIsDesktop } from '@/hooks';

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

**Predefined Breakpoints:**
- `useIsMobile()` - max-width: 768px
- `useIsTablet()` - 769px - 1024px
- `useIsDesktop()` - min-width: 1025px
- `useIsDarkMode()` - prefers-color-scheme: dark

---

### useClickOutside(ref, handler)

Detect clicks outside an element.

**Usage:**
```typescript
import { useRef } from 'react';
import { useClickOutside } from '@/hooks';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

---

### useKeyboardShortcut(keyCombo, callback)

Handle keyboard shortcuts.

**Usage:**
```typescript
import { useCommandK, useEscape } from '@/hooks';

function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  useCommandK(() => setIsOpen(true)); // Cmd/Ctrl + K
  useEscape(() => setIsOpen(false)); // Escape key

  return isOpen ? <div>Search Modal</div> : null;
}
```

**Custom shortcuts:**
```typescript
useKeyboardShortcut(
  { key: 's', ctrl: true, shift: true },
  () => console.log('Ctrl + Shift + S pressed')
);
```

---

### usePagination(items, options)

Pagination logic for lists.

**Usage:**
```typescript
import { usePagination } from '@/hooks';

function PaginatedList({ items }: { items: any[] }) {
  const {
    paginatedItems,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination(items, { pageSize: 10 });

  return (
    <div>
      {paginatedItems.map(item => <div key={item.id}>{item.name}</div>)}
      <div>
        <button onClick={previousPage} disabled={!hasPreviousPage}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={!hasNextPage}>
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Use Memoization Wisely

Hooks like `useDocuments` already memoize expensive computations:

```typescript
// ✅ Good - Uses memoized value
const { filteredDocuments } = useDocuments();

// ❌ Bad - Calling function every render
const { getFilteredDocuments } = useDocuments();
const filtered = getFilteredDocuments(); // Don't do this
```

### 2. Combine Hooks

```typescript
function DocumentSearch() {
  const { filteredDocuments, searchDocuments } = useDocuments();
  const debouncedSearch = useDebouncedCallback(searchDocuments, 300);

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

### 3. Handle Loading States

```typescript
function DocumentList() {
  const { filteredDocuments, isLoading, error } = useDocuments();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;

  return <div>{/* Render documents */}</div>;
}
```

### 4. Clean Up Side Effects

```typescript
// Hooks like useClickOutside, useKeyboardShortcut automatically clean up
// But you can control when they're active:

const [isModalOpen, setIsModalOpen] = useState(false);

// Only active when modal is open
useEscape(() => setIsModalOpen(false), isModalOpen);
```

---

## Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDocuments } from '@/hooks';

describe('useDocuments', () => {
  it('should filter documents', () => {
    const { result } = renderHook(() => useDocuments());

    act(() => {
      result.current.filterByCategory('employment');
    });

    expect(result.current.filters.category).toBe('employment');
  });
});
```

---

## Migration from Component State

**Before:**
```typescript
function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchDocuments = async () => {
    setLoading(true);
    const docs = await api.getDocuments();
    setDocuments(docs);
    setLoading(false);
  };

  // ... filtering logic
}
```

**After:**
```typescript
function DocumentList() {
  const {
    filteredDocuments,
    isLoading,
    filterByCategory,
  } = useDocuments();

  // All logic handled by the hook!
}
```

---

## Next Steps

- Add error boundaries for hook errors
- Implement retry logic for failed API calls
- Add request cancellation for aborted operations
- Create hook composition patterns
- Add analytics tracking to hooks
