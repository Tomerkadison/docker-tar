import { API_ENDPOINTS } from '../constants/config';

/**
 * Fetches all image tags from Docker Hub API at once (async pagination)
 * @param {string} namespace - Image namespace
 * @param {string} image - Image name
 * @returns {Promise<Array>} All tags for the image
 */
export async function getAllImageTags(namespace, image) {
  try {
    // First, fetch the first page to get the total count
    const firstPageRes = await fetch(
      `${API_ENDPOINTS.DOCKERHUB_TAGS}/${namespace}/${image}/tags/?page_size=100&page=1&name&ordering`
    );
    
    if (!firstPageRes.ok) {
      return []; // Return empty array for non-200 responses
    }
    
    const firstPageData = await firstPageRes.json();
    const totalCount = firstPageData.count || 0;
    const firstPageTags = firstPageData.results || [];
    
    // If there are no tags, return default latest tag
    if (totalCount === 0) {
      return [{ value: 'latest', label: 'latest' }];
    }
    
    // If all tags fit in the first page, return them
    if (totalCount <= 100) {
      return firstPageTags.map(tag => ({
        value: tag.name,
        label: tag.name
      }));
    }
    
    // Calculate how many additional pages we need
    const totalPages = Math.ceil(totalCount / 100);
    const additionalPages = [];
    
    // Create promises for all remaining pages
    for (let page = 2; page <= totalPages; page++) {
      additionalPages.push(
        fetch(`${API_ENDPOINTS.DOCKERHUB_TAGS}/${namespace}/${image}/tags/?page_size=100&page=${page}&name&ordering`)
          .then(res => res.ok ? res.json() : { results: [] })
          .catch(() => ({ results: [] }))
      );
    }
    
    // Fetch all additional pages concurrently
    const additionalPagesData = await Promise.all(additionalPages);
    
    // Combine all tags
    let allTags = [...firstPageTags];
    additionalPagesData.forEach(pageData => {
      if (pageData.results) {
        allTags = [...allTags, ...pageData.results];
      }
    });
    
    // Convert to options format
    return allTags.map(tag => ({
      value: tag.name,
      label: tag.name
    }));
    
  } catch (error) {
    console.warn("Error fetching all image tags:", error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches image tags from Docker Hub API with pagination support
 * Legacy function for backward compatibility - now uses getAllImageTags
 * @param {string} namespace - Image namespace
 * @param {string} image - Image name
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Tags data with pagination info
 */
export async function getImageTags(namespace, image, page = 1) {
  if (page === 1) {
    const allTags = await getAllImageTags(namespace, image);
    return {
      tags: allTags,
      hasMore: false,
      count: allTags.length
    };
  }
  
  // For pages > 1, return empty (since we now fetch everything at once)
  return {
    tags: [],
    hasMore: false,
    count: 0
  };
}