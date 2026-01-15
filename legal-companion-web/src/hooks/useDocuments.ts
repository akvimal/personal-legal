import { useCallback, useMemo } from 'react';
import { useDocumentStore } from '@/stores';
import type { Document, DocumentCategory, DocumentStatus } from '@/types';

/**
 * Hook for managing documents with common operations
 */
export function useDocuments() {
  const {
    documents,
    selectedDocument,
    isLoading,
    error,
    filters,
    addDocument,
    updateDocument,
    deleteDocument,
    selectDocument,
    setFilter,
    resetFilters,
    getDocumentById,
    getFilteredDocuments,
    getDocumentsByCategory,
    getDocumentsByStatus,
    setLoading,
    setError,
  } = useDocumentStore();

  // Memoized filtered documents
  const filteredDocuments = useMemo(() => getFilteredDocuments(), [getFilteredDocuments]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: documents.length,
      active: documents.filter((d) => d.status === 'active').length,
      expiring: documents.filter((d) => d.status === 'expiring_soon').length,
      expired: documents.filter((d) => d.status === 'expired').length,
      byCategory: {
        employment: documents.filter((d) => d.category === 'employment').length,
        property: documents.filter((d) => d.category === 'property').length,
        business: documents.filter((d) => d.category === 'business').length,
        financial: documents.filter((d) => d.category === 'financial').length,
        insurance: documents.filter((d) => d.category === 'insurance').length,
        consumer: documents.filter((d) => d.category === 'consumer').length,
        family: documents.filter((d) => d.category === 'family').length,
        legal: documents.filter((d) => d.category === 'legal').length,
      },
    };
  }, [documents]);

  // Search documents
  const searchDocuments = useCallback(
    (query: string) => {
      setFilter('searchQuery', query);
    },
    [setFilter]
  );

  // Filter by category
  const filterByCategory = useCallback(
    (category: DocumentCategory | 'all') => {
      setFilter('category', category);
    },
    [setFilter]
  );

  // Filter by status
  const filterByStatus = useCallback(
    (status: DocumentStatus | 'all') => {
      setFilter('status', status);
    },
    [setFilter]
  );

  // Create a new document
  const createDocument = useCallback(
    async (document: Document) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        addDocument(document);
        return document;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addDocument, setLoading, setError]
  );

  // Update an existing document
  const editDocument = useCallback(
    async (id: string, updates: Partial<Document>) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateDocument(id, updates);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateDocument, setLoading, setError]
  );

  // Remove a document
  const removeDocument = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        deleteDocument(id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deleteDocument, setLoading, setError]
  );

  return {
    // State
    documents,
    filteredDocuments,
    selectedDocument,
    isLoading,
    error,
    filters,
    stats,

    // Actions
    createDocument,
    editDocument,
    removeDocument,
    selectDocument,
    searchDocuments,
    filterByCategory,
    filterByStatus,
    resetFilters,

    // Selectors
    getDocumentById,
    getDocumentsByCategory,
    getDocumentsByStatus,
  };
}

/**
 * Hook for a single document by ID
 */
export function useDocument(id: string | null) {
  const { getDocumentById, updateDocument, isLoading, error } = useDocumentStore();

  const document = useMemo(() => {
    return id ? getDocumentById(id) : null;
  }, [id, getDocumentById]);

  const update = useCallback(
    async (updates: Partial<Document>) => {
      if (!id) return;
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateDocument(id, updates);
    },
    [id, updateDocument]
  );

  return {
    document,
    update,
    isLoading,
    error,
  };
}
