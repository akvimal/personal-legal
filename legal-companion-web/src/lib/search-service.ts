/**
 * Global Search Service
 * PostgreSQL full-text search across all content types
 */

import prisma from './prisma';

export interface SearchResult {
  type: 'document' | 'event' | 'task' | 'insurance' | 'email' | 'chat';
  id: string;
  title: string;
  snippet: string;
  relevance: number;
  metadata: Record<string, any>;
  createdAt: Date;
  url: string;
}

export interface SearchOptions {
  query: string;
  types?: string[];
  limit?: number;
  offset?: number;
  userId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Global search across all content types
 */
export async function globalSearch(options: SearchOptions): Promise<SearchResponse> {
  const {
    query,
    types = ['document', 'event', 'task', 'insurance', 'email', 'chat'],
    limit = 20,
    offset = 0,
    userId,
    dateFrom,
    dateTo,
  } = options;

  const results: SearchResult[] = [];

  // Search documents
  if (types.includes('document')) {
    const documents = await searchDocuments(query, userId, dateFrom, dateTo);
    results.push(...documents);
  }

  // Search events
  if (types.includes('event')) {
    const events = await searchEvents(query, userId, dateFrom, dateTo);
    results.push(...events);
  }

  // Search tasks
  if (types.includes('task')) {
    const tasks = await searchTasks(query, userId, dateFrom, dateTo);
    results.push(...tasks);
  }

  // Search insurance policies
  if (types.includes('insurance')) {
    const insurance = await searchInsurance(query, userId);
    results.push(...insurance);
  }

  // Search processed emails
  if (types.includes('email')) {
    const emails = await searchEmails(query, userId, dateFrom, dateTo);
    results.push(...emails);
  }

  // Search chat messages
  if (types.includes('chat')) {
    const chats = await searchChats(query, userId, dateFrom, dateTo);
    results.push(...chats);
  }

  // Sort by relevance (descending)
  results.sort((a, b) => b.relevance - a.relevance);

  // Paginate
  const total = results.length;
  const paginatedResults = results.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total,
    page: Math.floor(offset / limit) + 1,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Search documents
 */
async function searchDocuments(
  query: string,
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<SearchResult[]> {
  const searchTerm = query.toLowerCase();

  const documents = await prisma.document.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [searchTerm] } },
      ],
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return documents.map((doc) => ({
    type: 'document' as const,
    id: doc.id,
    title: doc.title,
    snippet: doc.description || 'No description available',
    relevance: calculateRelevance(query, doc.title + ' ' + (doc.description || '')),
    metadata: {
      category: doc.category,
      status: doc.status,
      fileUrl: doc.fileUrl,
      tags: doc.tags,
    },
    createdAt: doc.createdAt,
    url: `/documents/${doc.id}`,
  }));
}

/**
 * Search events
 */
async function searchEvents(
  query: string,
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<SearchResult[]> {
  const searchTerm = query.toLowerCase();

  const events = await prisma.event.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } },
      ],
      ...(dateFrom || dateTo
        ? {
            eventDate: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    },
    orderBy: { eventDate: 'desc' },
    take: 50,
  });

  return events.map((event) => ({
    type: 'event' as const,
    id: event.id,
    title: event.title,
    snippet: event.description || 'No description',
    relevance: calculateRelevance(query, event.title + ' ' + (event.description || '')),
    metadata: {
      eventType: event.eventType,
      eventDate: event.eventDate,
      status: event.status,
      priority: event.priority,
    },
    createdAt: event.createdAt,
    url: `/calendar?eventId=${event.id}`,
  }));
}

/**
 * Search tasks
 */
async function searchTasks(
  query: string,
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<SearchResult[]> {
  const searchTerm = query.toLowerCase();

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return tasks.map((task) => ({
    type: 'task' as const,
    id: task.id,
    title: task.title,
    snippet: task.description || 'No description',
    relevance: calculateRelevance(query, task.title + ' ' + (task.description || '')),
    metadata: {
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    },
    createdAt: task.createdAt,
    url: `/tasks?taskId=${task.id}`,
  }));
}

/**
 * Search insurance policies
 */
async function searchInsurance(
  query: string,
  userId: string
): Promise<SearchResult[]> {
  const searchTerm = query.toLowerCase();

  const policies = await prisma.insurancePolicy.findMany({
    where: {
      userId,
      OR: [
        { policyNumber: { contains: searchTerm, mode: 'insensitive' } },
        { insuranceType: { contains: searchTerm, mode: 'insensitive' } },
        { provider: { contains: searchTerm, mode: 'insensitive' } },
        { policyHolder: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return policies.map((policy) => ({
    type: 'insurance' as const,
    id: policy.id,
    title: `${policy.insuranceType} - ${policy.provider}`,
    snippet: `Policy #${policy.policyNumber} - ${policy.policyHolder}`,
    relevance: calculateRelevance(
      query,
      `${policy.policyNumber} ${policy.insuranceType} ${policy.provider} ${policy.policyHolder}`
    ),
    metadata: {
      policyNumber: policy.policyNumber,
      insuranceType: policy.insuranceType,
      provider: policy.provider,
      startDate: policy.startDate,
      endDate: policy.endDate,
    },
    createdAt: policy.createdAt,
    url: `/insurance/${policy.id}`,
  }));
}

/**
 * Search processed emails
 */
async function searchEmails(
  query: string,
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<SearchResult[]> {
  const searchTerm = query.toLowerCase();

  const emails = await prisma.processedEmail.findMany({
    where: {
      connection: {
        userId,
      },
      OR: [
        { subject: { contains: searchTerm, mode: 'insensitive' } },
        { from: { contains: searchTerm, mode: 'insensitive' } },
      ],
      ...(dateFrom || dateTo
        ? {
            receivedAt: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    },
    orderBy: { receivedAt: 'desc' },
    take: 50,
  });

  return emails.map((email) => ({
    type: 'email' as const,
    id: email.id,
    title: email.subject,
    snippet: `From: ${email.from}`,
    relevance: calculateRelevance(query, email.subject + ' ' + email.from),
    metadata: {
      from: email.from,
      category: email.category,
      priority: email.priority,
      receivedAt: email.receivedAt,
    },
    createdAt: email.createdAt,
    url: `/emails/${email.id}`,
  }));
}

/**
 * Search chat messages
 */
async function searchChats(
  query: string,
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<SearchResult[]> {
  const searchTerm = query.toLowerCase();

  const messages = await prisma.chatMessage.findMany({
    where: {
      userId,
      content: { contains: searchTerm, mode: 'insensitive' },
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    },
    include: {
      document: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return messages.map((msg) => ({
    type: 'chat' as const,
    id: msg.id,
    title: msg.document?.title || 'Chat Message',
    snippet: msg.content.substring(0, 150) + (msg.content.length > 150 ? '...' : ''),
    relevance: calculateRelevance(query, msg.content),
    metadata: {
      role: msg.role,
      documentId: msg.documentId,
    },
    createdAt: msg.createdAt,
    url: msg.documentId ? `/chat/${msg.documentId}` : `/chat`,
  }));
}

/**
 * Calculate relevance score (0-1)
 */
function calculateRelevance(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match in title/text
  if (textLower === queryLower) return 1.0;

  // Starts with query
  if (textLower.startsWith(queryLower)) return 0.9;

  // Contains exact query
  if (textLower.includes(queryLower)) return 0.8;

  // Contains all query words
  const queryWords = queryLower.split(/\s+/);
  const matchedWords = queryWords.filter((word) => textLower.includes(word));

  if (matchedWords.length === queryWords.length) return 0.7;

  // Partial match
  if (matchedWords.length > 0) {
    return 0.5 * (matchedWords.length / queryWords.length);
  }

  return 0.1;
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(
  query: string,
  userId: string,
  limit: number = 5
): Promise<string[]> {
  const searchTerm = query.toLowerCase();

  // Get document titles
  const documents = await prisma.document.findMany({
    where: {
      userId,
      title: { contains: searchTerm, mode: 'insensitive' },
    },
    select: { title: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Get event titles
  const events = await prisma.event.findMany({
    where: {
      userId,
      title: { contains: searchTerm, mode: 'insensitive' },
    },
    select: { title: true },
    orderBy: { eventDate: 'desc' },
    take: limit,
  });

  // Get task titles
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      title: { contains: searchTerm, mode: 'insensitive' },
    },
    select: { title: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Combine and deduplicate
  const suggestions = [
    ...documents.map((d) => d.title),
    ...events.map((e) => e.title),
    ...tasks.map((t) => t.title),
  ];

  const uniqueSuggestions = Array.from(new Set(suggestions));

  return uniqueSuggestions.slice(0, limit);
}
