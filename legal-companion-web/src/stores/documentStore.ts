import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Document, DocumentCategory, DocumentStatus } from '@/types';
import { mockDocuments, mockInsuranceDocuments } from '@/lib/mock-data';

interface DocumentStore {
  // State
  documents: Document[];
  selectedDocument: Document | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    category: DocumentCategory | 'all';
    status: DocumentStatus | 'all';
    searchQuery: string;
  };

  // Actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  selectDocument: (id: string | null) => void;

  // Filters
  setFilter: (key: keyof DocumentStore['filters'], value: any) => void;
  resetFilters: () => void;

  // Computed/Derived
  getDocumentById: (id: string) => Document | undefined;
  getFilteredDocuments: () => Document[];
  getDocumentsByCategory: (category: DocumentCategory) => Document[];
  getDocumentsByStatus: (status: DocumentStatus) => Document[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  documents: [...mockDocuments, ...mockInsuranceDocuments],
  selectedDocument: null,
  isLoading: false,
  error: null,
  filters: {
    category: 'all' as const,
    status: 'all' as const,
    searchQuery: '',
  },
};

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setDocuments: (documents) => set({ documents }),

      addDocument: (document) =>
        set((state) => ({
          documents: [document, ...state.documents],
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
          ),
          selectedDocument:
            state.selectedDocument?.id === id
              ? { ...state.selectedDocument, ...updates }
              : state.selectedDocument,
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
          selectedDocument:
            state.selectedDocument?.id === id ? null : state.selectedDocument,
        })),

      selectDocument: (id) =>
        set((state) => ({
          selectedDocument: id
            ? state.documents.find((doc) => doc.id === id) || null
            : null,
        })),

      // Filters
      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),

      resetFilters: () =>
        set({
          filters: initialState.filters,
        }),

      // Computed/Derived
      getDocumentById: (id) => {
        return get().documents.find((doc) => doc.id === id);
      },

      getFilteredDocuments: () => {
        const { documents, filters } = get();
        let filtered = [...documents];

        // Filter by category
        if (filters.category !== 'all') {
          filtered = filtered.filter((doc) => doc.category === filters.category);
        }

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter((doc) => doc.status === filters.status);
        }

        // Filter by search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (doc) =>
              doc.title.toLowerCase().includes(query) ||
              doc.documentType.toLowerCase().includes(query) ||
              doc.tags.some((tag) => tag.toLowerCase().includes(query)) ||
              doc.parties.some((party) => party.toLowerCase().includes(query))
          );
        }

        // Sort by uploadedAt (newest first)
        filtered.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

        return filtered;
      },

      getDocumentsByCategory: (category) => {
        return get().documents.filter((doc) => doc.category === category);
      },

      getDocumentsByStatus: (status) => {
        return get().documents.filter((doc) => doc.status === status);
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'document-storage', // LocalStorage key
      partialize: (state) => ({
        // Only persist documents and filters
        documents: state.documents,
        filters: state.filters,
      }),
    }
  )
);
