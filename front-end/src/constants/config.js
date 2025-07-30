/**
 * Application configuration constants
 * Uses environment variables for deployment flexibility
 */

// Get base URL from environment or default to current host
const getBaseURL = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080';
  }
  
  // In production, use current host
  return window.location.origin;
};

const BASE_URL = getBaseURL();

export const API_ENDPOINTS = {
  DOCKERHUB_SEARCH: `${BASE_URL}/dockerhub/api/search/v3/catalog/search`,
  DOCKERHUB_TAGS: `${BASE_URL}/dockerhub/v2/repositories`,
  DOWNLOAD_SERVICE: `${BASE_URL}/install`
};

export const SEARCH_CONFIG = {
  VERIFIED_IMAGES: {
    source: 'store',
    official: true,
    open_source: true,
    size: 4
  },
  COMMUNITY_IMAGES: {
    source: 'community',
    size: 4
  }
};

export const UI_CONFIG = {
  DEBOUNCE_DELAY: 250,
  TAGS_PAGE_SIZE: 100,
  MIN_FILE_SIZE: 10 // bytes
};

export const EXTERNAL_LINKS = {
  FEEDBACK_FORM: 'https://forms.gle/Mr3vmAk5Fz81VRKh6',
  DOCKER_HUB_BASE: 'https://hub.docker.com'
};