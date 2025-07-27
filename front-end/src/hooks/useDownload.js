import { useState, useCallback } from 'react';
import { API_ENDPOINTS, UI_CONFIG } from '../constants/config';

/**
 * Custom hook for managing file downloads
 * @returns {Object} Download state and handlers
 */
export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  /**
   * Downloads a file from the given URL
   * @param {string} url - Download URL
   * @param {string} fileName - Name for the downloaded file
   * @returns {Promise<boolean>} Success status
   */
  const downloadFile = useCallback(async (url, fileName) => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Check if the blob is empty (backend operation failed)
      if (blob.size < UI_CONFIG.MIN_FILE_SIZE) {
        throw new Error(`Received empty file (${blob.size} KB). Backend operation failed.`);
      }
      
      // Create download link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'downloaded-file';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setIsDownloading(false);
      return true;
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error.message);
      setIsDownloading(false);
      return false;
    }
  }, []);

  /**
   * Initiates Docker image download
   * @param {Object} selectedImage - Selected image object
   * @param {string} selectedTag - Selected tag (can be empty string)
   * @param {boolean} emptyTagSelected - Whether empty tag was selected
   * @returns {Promise<boolean>} Success status
   */
  const downloadDockerImage = useCallback(async (selectedImage, selectedTag, emptyTagSelected) => {
    if (!selectedImage) {
      setDownloadError('No image selected');
      return false;
    }

    const tagToUse = emptyTagSelected ? '' : selectedTag;
    const url = emptyTagSelected 
      ? `${API_ENDPOINTS.DOWNLOAD_SERVICE}?image_name=${selectedImage.name}`
      : `${API_ENDPOINTS.DOWNLOAD_SERVICE}?image_name=${selectedImage.name}&image_tag=${tagToUse}`;
    
    const filename = emptyTagSelected 
      ? `${selectedImage.name}-latest.tar`
      : `${selectedImage.name}-${tagToUse}.tar`;

    return downloadFile(url, filename);
  }, [downloadFile]);

  /**
   * Clears download error state
   */
  const clearDownloadError = useCallback(() => {
    setDownloadError(null);
  }, []);

  return {
    isDownloading,
    downloadError,
    downloadFile,
    downloadDockerImage,
    clearDownloadError
  };
};