import React from 'react';
import './App.css';

// Components
import AppHeader from './components/AppHeader';
import StartingPage from './components/pages/StartingPage';
import LoadingPage from './components/pages/LoadingPage';
import SuccessPage from './components/pages/SuccessPage';

// Custom Hooks
import { useAppState } from './hooks/useAppState';
import { useImageSearch } from './hooks/useImageSearch';
import { useImageTags } from './hooks/useImageTags';
import { useDownload } from './hooks/useDownload';

/**
 * Main application component
 * @returns {JSX.Element} App component
 */
function App() {
  // Application state management
  const { goToStarting, goToLoading, goToSuccess, isStarting, isLoading, isSuccess } = useAppState();
  
  // Image search functionality
  const { 
    selectedImage, 
    handleImageSelect, 
    handleSearchChange, 
    getDockerHubUrl 
  } = useImageSearch();
  
  // Image tags functionality
  const {
    imageTags,
    selectedImageTag,
    isTagsLoading,
    tagPaginationInfo,
    emptyTagSelected,
    handleImageTagSelect,
    handleLoadMoreTags
  } = useImageTags(selectedImage);
  
  // Download functionality
  const { downloadError, downloadDockerImage } = useDownload();

  /**
   * Handles the download process
   */
  const handleDownload = async () => {
    goToLoading();
    
    const success = await downloadDockerImage(selectedImage, selectedImageTag, emptyTagSelected);
    
    if (success) {
      goToSuccess();
    } else {
      alert(downloadError || 'Failed to download image... Try again later');
      goToStarting();
    }
  };


return (
    <div>
      <div className="mx-auto w-full flex justify-center items-center flex-col mt-24 md:mt-20">
        <AppHeader />

        {isStarting && (
          <StartingPage
            selectedImage={selectedImage}
            imageTags={imageTags}
            selectedImageTag={selectedImageTag}
            emptyTagSelected={emptyTagSelected}
            isTagsLoading={isTagsLoading}
            tagPaginationInfo={tagPaginationInfo}
            onImageSelect={handleImageSelect}
            onImageTagSelect={handleImageTagSelect}
            onSearchChange={handleSearchChange}
            onLoadMoreTags={handleLoadMoreTags}
            onDownload={handleDownload}
            dockerHubUrl={getDockerHubUrl()}
          />
        )}

        {isLoading && <LoadingPage />}

        {isSuccess && <SuccessPage />}
      </div>
    </div>
  );
}
export default App;
