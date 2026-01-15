'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  FileText,
  Calendar,
  CheckSquare,
  Shield,
  Mail,
  MessageSquare,
  Loader2,
  Filter,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
  type: string;
  id: string;
  title: string;
  snippet: string;
  relevance: number;
  metadata: any;
  createdAt: string;
  url: string;
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Fetch search results
  useEffect(() => {
    if (!query || query.length < 2) {
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          limit: '20',
        });

        if (selectedTypes.length > 0) {
          params.set('types', selectedTypes.join(','));
        }

        const response = await fetch(`/api/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.data.results || []);
          setTotal(data.data.total || 0);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, page, selectedTypes]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-purple-600" />;
      case 'insurance':
        return <Shield className="w-5 h-5 text-orange-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-red-600" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5 text-teal-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const highlightQuery = (text: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-200 text-yellow-900 font-medium"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
    setPage(1);
  };

  const types = ['document', 'event', 'task', 'insurance', 'email', 'chat'];

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Search className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Start Searching
        </h2>
        <p className="text-gray-600">
          Use the search bar above to find documents, events, and more
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Search Results
          </h1>
          <p className="text-sm text-gray-600">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                Found {total} result{total !== 1 ? 's' : ''} for "
                <strong>{query}</strong>"
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="space-y-2">
              {types.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {getTypeLabel(type)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-12 text-center bg-white">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-sm text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              {results.map((result) => (
                <a
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  className="block border border-gray-200 rounded-lg p-6 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {getTypeLabel(result.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(result.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {highlightQuery(result.title)}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {highlightQuery(result.snippet)}
                      </p>

                      {/* Metadata */}
                      {result.metadata && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {result.metadata.category && (
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              {result.metadata.category}
                            </span>
                          )}
                          {result.metadata.status && (
                            <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded capitalize">
                              {result.metadata.status}
                            </span>
                          )}
                          {result.metadata.priority && (
                            <span
                              className={`text-xs px-2 py-1 rounded capitalize ${
                                result.metadata.priority === 'high'
                                  ? 'bg-red-50 text-red-700'
                                  : result.metadata.priority === 'medium'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-green-50 text-green-700'
                              }`}
                            >
                              {result.metadata.priority}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ))}

              {/* Pagination */}
              {total > 20 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {Math.ceil(total / 20)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / 20)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
