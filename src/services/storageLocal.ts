import { Resource } from '../types';

const RESOURCES_KEY = 'edumentor_resources';
const BLOB_URLS_KEY = 'edumentor_blob_urls';

/**
 * Get all resources from localStorage
 */
export const getResourcesFromStorage = (userId: string): Resource[] => {
  try {
    const key = `${RESOURCES_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load resources from localStorage:', error);
    return [];
  }
};

/**
 * Save resources to localStorage
 */
export const saveResourcesToStorage = (
  userId: string,
  resources: Resource[]
): void => {
  try {
    const key = `${RESOURCES_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(resources));
  } catch (error) {
    console.error('Failed to save resources to localStorage:', error);
  }
};

/**
 * Add a single resource to localStorage
 */
export const addResourceToStorage = (userId: string, resource: Resource): void => {
  const resources = getResourcesFromStorage(userId);
  resources.push(resource);
  saveResourcesToStorage(userId, resources);
};

/**
 * Delete a resource from localStorage
 */
export const deleteResourceFromStorage = (userId: string, resourceId: string): void => {
  const resources = getResourcesFromStorage(userId);
  const filtered = resources.filter((r) => r.id !== resourceId);
  saveResourcesToStorage(userId, filtered);
};

/**
 * Update a resource in localStorage
 */
export const updateResourceInStorage = (userId: string, resource: Resource): void => {
  const resources = getResourcesFromStorage(userId);
  const index = resources.findIndex((r) => r.id === resource.id);
  if (index !== -1) {
    resources[index] = resource;
    saveResourcesToStorage(userId, resources);
  }
};

/**
 * Get a single resource by ID
 */
export const getResourceById = (userId: string, resourceId: string): Resource | null => {
  const resources = getResourcesFromStorage(userId);
  return resources.find((r) => r.id === resourceId) || null;
};

/**
 * Track blob URLs for cleanup
 */
export const trackBlobUrl = (userId: string, resourceId: string, blobUrl: string): void => {
  try {
    const key = `${BLOB_URLS_KEY}_${userId}`;
    const urls = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : {};
    urls[resourceId] = blobUrl;
    localStorage.setItem(key, JSON.stringify(urls));
  } catch (error) {
    console.warn('Failed to track blob URL:', error);
  }
};

/**
 * Clean up blob URLs on logout or data reset
 */
export const cleanupBlobUrls = (userId: string): void => {
  try {
    const key = `${BLOB_URLS_KEY}_${userId}`;
    const urls = localStorage.getItem(key);
    if (urls) {
      const parsedUrls = JSON.parse(urls);
      Object.values(parsedUrls).forEach((url) => {
        try {
          URL.revokeObjectURL(url as string);
        } catch (e) {
          console.warn('Failed to revoke URL:', e);
        }
      });
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Failed to cleanup blob URLs:', error);
  }
};

/**
 * Clear all resources for a user
 */
export const clearUserResources = (userId: string): void => {
  try {
    const resourcesKey = `${RESOURCES_KEY}_${userId}`;
    cleanupBlobUrls(userId);
    localStorage.removeItem(resourcesKey);
  } catch (error) {
    console.error('Failed to clear user resources:', error);
  }
};
