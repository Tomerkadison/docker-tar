/**
 * Application configuration constants
 */

export const API_ENDPOINTS = {
  DOCKERHUB_SEARCH: 'https://dockertar.zapto.org/dockerhub/api/search/v3/catalog/search',
  DOCKERHUB_TAGS: 'https://dockertar.zapto.org/dockerhub/v2/repositories',
  DOWNLOAD_SERVICE: 'https://dockertar.zapto.org/install'
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