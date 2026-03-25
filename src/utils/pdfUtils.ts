/**
 * PDF Management Utilities
 * Helper functions for PDF operations, validation, and formatting
 */

import { Resource } from '../types';

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;

    return formatDate(dateString);
  } catch {
    return 'Unknown';
  }
};

/**
 * Calculate total topics across all resources
 */
export const getTotalTopics = (resources: Resource[]): number => {
  return resources.reduce((sum, resource) => sum + resource.topics.length, 0);
};

/**
 * Calculate completed topics
 */
export const getCompletedTopics = (resources: Resource[]): number => {
  return resources.reduce(
    (sum, resource) =>
      sum + resource.topics.filter((topic) => topic.completed).length,
    0
  );
};

/**
 * Calculate average score
 */
export const getAverageScore = (resources: Resource[]): number => {
  const completedTopics = resources.reduce((items: any[], resource) => {
    return [...items, ...resource.topics.filter((t) => t.completed && t.score !== undefined)];
  }, []);

  if (completedTopics.length === 0) return 0;

  const totalScore = completedTopics.reduce((sum, topic) => sum + (topic.score || 0), 0);
  return Math.round(totalScore / completedTopics.length);
};

/**
 * Calculate total size of all resources
 */
export const getTotalSize = (resources: Resource[]): number => {
  return resources.reduce((sum, resource) => sum + (resource.fileSize || 0), 0);
};

/**
 * Sort resources by date
 */
export const sortByDate = (resources: Resource[], order: 'asc' | 'desc' = 'desc'): Resource[] => {
  return [...resources].sort((a, b) => {
    const dateA = new Date(a.uploadDate).getTime();
    const dateB = new Date(b.uploadDate).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Sort resources by title
 */
export const sortByTitle = (resources: Resource[], order: 'asc' | 'desc' = 'asc'): Resource[] => {
  return [...resources].sort((a, b) => {
    const cmp = a.title.localeCompare(b.title);
    return order === 'desc' ? -cmp : cmp;
  });
};

/**
 * Filter resources by topics count
 */
export const filterByTopicCount = (
  resources: Resource[],
  minTopics: number
): Resource[] => {
  return resources.filter((r) => r.topics.length >= minTopics);
};

/**
 * Search resources
 */
export const searchResources = (
  resources: Resource[],
  query: string
): Resource[] => {
  const lowerQuery = query.toLowerCase();
  return resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(lowerQuery) ||
      resource.fileName?.toLowerCase().includes(lowerQuery) ||
      resource.topics.some(
        (topic) =>
          topic.title.toLowerCase().includes(lowerQuery) ||
          topic.content.toLowerCase().includes(lowerQuery)
      )
  );
};

/**
 * Group resources by upload month
 */
export const groupByMonth = (
  resources: Resource[]
): { [key: string]: Resource[] } => {
  const groups: { [key: string]: Resource[] } = {};

  resources.forEach((resource) => {
    const date = new Date(resource.uploadDate);
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(resource);
  });

  return groups;
};

/**
 * Validate PDF URL
 */
export const isValidPdfUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      url.includes('blob:') ||
      url.includes('http') ||
      parsedUrl.pathname.endsWith('.pdf')
    );
  } catch {
    return url.includes('blob:');
  }
};

/**
 * Check if resource is recent (within last N days)
 */
export const isRecentResource = (resource: Resource, days: number = 7): boolean => {
  const uploadDate = new Date(resource.uploadDate);
  const now = new Date();
  const diff = now.getTime() - uploadDate.getTime();
  return diff < days * 24 * 60 * 60 * 1000;
};

/**
 * Get resource statistics
 */
export const getResourceStats = (resource: Resource) => {
  const completedTopics = resource.topics.filter((t) => t.completed).length;
  const completionPercentage = resource.topics.length > 0
    ? Math.round((completedTopics / resource.topics.length) * 100)
    : 0;

  const scores = resource.topics
    .filter((t) => t.score !== undefined)
    .map((t) => t.score as number);

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    totalTopics: resource.topics.length,
    completedTopics,
    completionPercentage,
    averageScore,
    isComplete: completedTopics === resource.topics.length,
  };
};

/**
 * Export resource as JSON
 */
export const exportResourceAsJSON = (resource: Resource): string => {
  return JSON.stringify(resource, null, 2);
};

/**
 * Export multiple resources as JSON
 */
export const exportResourcesAsJSON = (resources: Resource[]): string => {
  return JSON.stringify(resources, null, 2);
};
