import { useState, useCallback, useMemo } from 'react';
import { useDocumentStore, useEventStore, useTaskStore } from '@/stores';
import type { Document, Event, Task } from '@/types';

type SearchResultType = 'document' | 'event' | 'task';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  snippet?: string;
  relevance: number;
  data: Document | Event | Task;
}

/**
 * Hook for global search across all content types
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchResultType | 'all'>('all');
  const [isSearching, setIsSearching] = useState(false);

  const documents = useDocumentStore((state) => state.documents);
  const events = useEventStore((state) => state.events);
  const tasks = useTaskStore((state) => state.tasks);

  // Search function
  const performSearch = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) return [];

      const lowerQuery = searchQuery.toLowerCase();
      const results: SearchResult[] = [];

      // Search documents
      if (searchType === 'all' || searchType === 'document') {
        documents.forEach((doc) => {
          let relevance = 0;
          let snippet = '';

          // Title match (highest relevance)
          if (doc.title.toLowerCase().includes(lowerQuery)) {
            relevance += 10;
            snippet = doc.title;
          }

          // Category/type match
          if (
            doc.category.toLowerCase().includes(lowerQuery) ||
            doc.documentType.toLowerCase().includes(lowerQuery)
          ) {
            relevance += 5;
          }

          // Tags match
          const tagMatch = doc.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
          if (tagMatch) {
            relevance += 3;
            snippet = snippet || `Tags: ${doc.tags.join(', ')}`;
          }

          // Parties match
          const partyMatch = doc.parties.some((party) => party.toLowerCase().includes(lowerQuery));
          if (partyMatch) {
            relevance += 3;
            snippet = snippet || `Parties: ${doc.parties.join(', ')}`;
          }

          if (relevance > 0) {
            results.push({
              id: doc.id,
              type: 'document',
              title: doc.title,
              description: doc.documentType,
              snippet,
              relevance,
              data: doc,
            });
          }
        });
      }

      // Search events
      if (searchType === 'all' || searchType === 'event') {
        events.forEach((event) => {
          let relevance = 0;
          let snippet = '';

          // Title match
          if (event.title.toLowerCase().includes(lowerQuery)) {
            relevance += 10;
            snippet = event.title;
          }

          // Description match
          if (event.description.toLowerCase().includes(lowerQuery)) {
            relevance += 5;
            snippet = snippet || event.description;
          }

          // Event type match
          if (event.eventType.toLowerCase().includes(lowerQuery)) {
            relevance += 3;
          }

          if (relevance > 0) {
            results.push({
              id: event.id,
              type: 'event',
              title: event.title,
              description: event.eventType,
              snippet,
              relevance,
              data: event,
            });
          }
        });
      }

      // Search tasks
      if (searchType === 'all' || searchType === 'task') {
        tasks.forEach((task) => {
          let relevance = 0;
          let snippet = '';

          // Title match
          if (task.title.toLowerCase().includes(lowerQuery)) {
            relevance += 10;
            snippet = task.title;
          }

          // Description match
          if (task.description?.toLowerCase().includes(lowerQuery)) {
            relevance += 5;
            snippet = snippet || task.description;
          }

          if (relevance > 0) {
            results.push({
              id: task.id,
              type: 'task',
              title: task.title,
              description: task.status,
              snippet,
              relevance,
              data: task,
            });
          }
        });
      }

      // Sort by relevance (highest first)
      return results.sort((a, b) => b.relevance - a.relevance);
    },
    [documents, events, tasks, searchType]
  );

  // Memoized search results
  const results = useMemo(() => {
    return performSearch(query);
  }, [query, performSearch]);

  // Search with async simulation (for future API integration)
  const search = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery);
      setIsSearching(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setIsSearching(false);
    },
    []
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  // Filter by type
  const filterByType = useCallback((type: SearchResultType | 'all') => {
    setSearchType(type);
  }, []);

  return {
    query,
    results,
    isSearching,
    searchType,
    search,
    clearSearch,
    filterByType,
    setQuery,
  };
}
