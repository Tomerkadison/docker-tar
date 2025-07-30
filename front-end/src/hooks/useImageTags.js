import { useState, useEffect, useCallback } from 'react';
import { getAllImageTags } from '../services/dockerHubApi';

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
   * Fetches all image tags at once using async pagination
   */
  const fetchAllImageTags = useCallback(async () => {
    if (!selectedImage) return;
    
    try {
      // Check if this is an explicitly entered image with proper structure
      if (selectedImage.rate_plans?.[0]?.repositories?.[0]) {
        const imageName = selectedImage.rate_plans[0].repositories[0].name || selectedImage.name;
        const imageNamespace = selectedImage.rate_plans[0].repositories[0].namespace;
        
        try {
          const allTags = await getAllImageTags(imageNamespace, imageName);
          setImageTags(allTags);
          setTagPaginationInfo({ 
            hasMore: false, 
            count: allTags.length 
          });
        } catch (error) {
          console.warn('Error fetching tags:', error);
          // Set empty array to allow manual tag entry on API failure
          setImageTags([]);
          setTagPaginationInfo({ hasMore: false, count: 0 });
        }
      } else {
        // For explicitly entered images without proper structure
        setImageTags([]);
        setTagPaginationInfo({ hasMore: false, count: 0 });
      }
    } catch (error) {
      console.warn('Error in fetchAllImageTags:', error);
      setImageTags([]);
      setTagPaginationInfo({ hasMore: false, count: 0 });
    }
  }, [selectedImage]);

  /**
   * Legacy function for compatibility - no longer used since we fetch all at once
   * @param {number} nextPage - Next page to load
   */
  const handleLoadMoreTags = useCallback((nextPage) => {
    // No-op since we now fetch all tags at once
    console.log('Load more tags called, but not needed since all tags are fetched at once');
  }, []);

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
      // Reset tags and fetch all tags when image changes
      setImageTags([]);
      setTagPaginationInfo(null);
      setIsTagsLoading(true);
      fetchAllImageTags().finally(() => {
        setIsTagsLoading(false);
      });
    }
  }, [selectedImage, fetchAllImageTags]);

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