import { API_ENDPOINTS, UI_CONFIG } from '../constants/config';

/**
 * Fetches image tags from Docker Hub API with pagination support
 * @param {string} namespace - Image namespace
 * @param {string} image - Image name
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Tags data with pagination info
 */
export async function getImageTags(namespace, image, page = 1) {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.DOCKERHUB_TAGS}/${namespace}/${image}/tags/?page_size=${UI_CONFIG.TAGS_PAGE_SIZE}&page=${page}&name&ordering`
    );
    
    if (!response.ok) {
      return { tags: [], hasMore: false, count: 0 };
    }
    
    const data = await response.json();
    const tags = data.results || [];

    // Add 'latest' tag if no tags exist and it's the first page
    if (tags.length === 0 && page === 1) {
      return { 
        tags: [{ value: 'latest', label: 'latest' }],
        hasMore: false,
        count: 1
      };
    }

    // Transform tags to the expected format
    const formattedTags = tags.map(tag => ({
      value: tag.name, 
      label: tag.name
    }));

    // Calculate pagination info
    const count = data.count || 0;
    const hasMore = page * UI_CONFIG.TAGS_PAGE_SIZE < count;

    return {
      tags: formattedTags,
      hasMore,
      count
    };
  } catch (error) {
    console.warn('Error fetching image tags:', error);
    return {
      tags: [],
      hasMore: false,
      count: 0
    };
  }
}