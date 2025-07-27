import { useState, useEffect, useCallback } from 'react';
import { getImageTags } from '../services/dockerHubApi';

/**
 * Custom hook for managing Docker image tags
 * @param {Object} selectedImage - Currently selected image
 * @returns {Object} Tags state and handlers
 */
export const useImageTags = (selectedImage) => {
  const [imageTags, setImageTags] = useState([]);
  const [selectedImageTag, setSelectedImageTag] = useState(null);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [tagPaginationInfo, setTagPaginationInfo] = useState(null);
  const [emptyTagSelected, setEmptyTagSelected] = useState(false);

  /**
   * Fetches image tags with pagination support
   * @param {number} page - Page number to fetch
   */
  const fetchImageTags = useCallback(async (page = 1) => {
    if (!selectedImage) return;
    
    try {
      // Check if this is an explicitly entered image with proper structure
      if (selectedImage.rate_plans?.[0]?.repositories?.[0]) {
        const imageName = selectedImage.rate_plans[0].repositories[0].name || selectedImage.name;
        const imageNamespace = selectedImage.rate_plans[0].repositories[0].namespace;
        
        try {
          const result = await getImageTags(imageNamespace, imageName, page);
          
          if (result.tags) {
            // If this is the first page, replace tags; otherwise, append
            if (page === 1) {
              setImageTags(result.tags);
            } else {
              setImageTags(prevTags => [...prevTags, ...result.tags]);
            }
            
            // Update pagination info
            setTagPaginationInfo({
              hasMore: result.hasMore,
              count: result.count
            });
          } else {
            // Handle unexpected response format
            console.warn('Unexpected response format:', result);
            if (page === 1) {
              setImageTags(Array.isArray(result) ? result : []);
              setTagPaginationInfo({ 
                hasMore: false, 
                count: Array.isArray(result) ? result.length : 0 
              });
            }
          }
        } catch (error) {
          console.warn('Error fetching tags:', error);
          // Set empty array to allow manual tag entry on API failure
          if (page === 1) {
            setImageTags([]);
            setTagPaginationInfo({ hasMore: false, count: 0 });
          }
        }
      } else {
        // For explicitly entered images without proper structure
        if (page === 1) {
          setImageTags([]);
          setTagPaginationInfo({ hasMore: false, count: 0 });
        }
      }
    } catch (error) {
      console.warn('Error in fetchImageTags:', error);
      if (page === 1) {
        setImageTags([]);
        setTagPaginationInfo({ hasMore: false, count: 0 });
      }
    }
  }, [selectedImage]);

  /**
   * Handles loading more tags (pagination)
   * @param {number} nextPage - Next page to load
   */
  const handleLoadMoreTags = useCallback((nextPage) => {
    fetchImageTags(nextPage);
  }, [fetchImageTags]);

  /**
   * Handles image tag selection
   * @param {Object} selectedItem - Selected tag object
   */
  const handleImageTagSelect = useCallback((selectedItem) => {
    if (selectedItem) {
      console.log('Tag selected:', selectedItem);
      
      // Check if this is the empty tag option
      if (selectedItem.value === '') {
        setSelectedImageTag('');
        setEmptyTagSelected(true);
      } else {
        setSelectedImageTag(selectedItem.value);
        setEmptyTagSelected(false);
      }
    } else {
      // Handle null or undefined selection
      console.log('No tag selected or empty tag');
      setSelectedImageTag(null);
      setEmptyTagSelected(false);
    }
  }, []);

  /**
   * Resets tag-related state
   */
  const resetTags = useCallback(() => {
    setImageTags([]);
    setSelectedImageTag(null);
    setTagPaginationInfo(null);
    setEmptyTagSelected(false);
  }, []);

  // Effect to fetch tags when selected image changes
  useEffect(() => {
    if (selectedImage) {
      // Reset tags and fetch first page when image changes
      setImageTags([]);
      setTagPaginationInfo(null);
      setIsTagsLoading(true);
      fetchImageTags(1).finally(() => {
        setIsTagsLoading(false);
      });
    }
  }, [selectedImage, fetchImageTags]);

  return {
    imageTags,
    selectedImageTag,
    isTagsLoading,
    tagPaginationInfo,
    emptyTagSelected,
    handleImageTagSelect,
    handleLoadMoreTags,
    resetTags
  };
};