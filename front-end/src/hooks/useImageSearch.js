import { useState, useCallback } from 'react';

/**
 * Custom hook for managing Docker image search functionality
 * @returns {Object} Search state and handlers
 */
export const useImageSearch = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Handles image selection from search results
   * @param {Object} selectedItem - Selected image object
   */
  const handleImageSelect = useCallback((selectedItem) => {
    if (selectedItem) {
      setSelectedImage(selectedItem);
      console.log('Image selected:', selectedItem);
    }
  }, []);

  /**
   * Handles search query changes
   * @param {string} query - New search query
   */
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    if (query === '') {
      setSelectedImage(null);
    }
  }, []);

  /**
   * Resets the search state
   */
  const resetSearch = useCallback(() => {
    setSelectedImage(null);
    setSearchQuery('');
  }, []);

  /**
   * Gets Docker Hub URL for selected image
   * @returns {string|null} Docker Hub URL or null if no image selected
   */
  const getDockerHubUrl = useCallback(() => {
    if (!selectedImage?.rate_plans?.[0]?.repositories?.[0]) {
      return null;
    }

    const { namespace } = selectedImage.rate_plans[0].repositories[0];
    const imageName = selectedImage.name;
    const namespacePrefix = namespace === 'library' ? '_' : 'r';
    
    return `https://hub.docker.com/${namespacePrefix}/${imageName}`;
  }, [selectedImage]);

  return {
    selectedImage,
    searchQuery,
    handleImageSelect,
    handleSearchChange,
    resetSearch,
    getDockerHubUrl
  };
};