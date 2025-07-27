import React, { useRef } from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import SearchBox from '../SearchBox';
import TagSelect from '../TagSelect';
import { EXTERNAL_LINKS } from '../../constants/config';

/**
 * Starting page component with search and download functionality
 * @param {Object} props - Component props
 * @param {Object} props.selectedImage - Currently selected image
 * @param {Array} props.imageTags - Available image tags
 * @param {string} props.selectedImageTag - Selected tag
 * @param {boolean} props.emptyTagSelected - Whether empty tag is selected
 * @param {boolean} props.isTagsLoading - Loading state for tags
 * @param {Object} props.tagPaginationInfo - Tag pagination information
 * @param {Function} props.onImageSelect - Image selection handler
 * @param {Function} props.onImageTagSelect - Tag selection handler
 * @param {Function} props.onSearchChange - Search change handler
 * @param {Function} props.onLoadMoreTags - Load more tags handler
 * @param {Function} props.onDownload - Download handler
 * @param {string} props.dockerHubUrl - Docker Hub URL for selected image
 * @returns {JSX.Element} StartingPage component
 */
const StartingPage = ({
  selectedImage,
  imageTags,
  selectedImageTag,
  emptyTagSelected,
  isTagsLoading,
  tagPaginationInfo,
  onImageSelect,
  onImageTagSelect,
  onSearchChange,
  onLoadMoreTags,
  onDownload,
  dockerHubUrl
}) => {
  const imageTagRef = useRef();

  const isDownloadDisabled = !selectedImage || (selectedImageTag === null && !emptyTagSelected);
  const isDownloadEnabled = selectedImage && (selectedImageTag !== null || emptyTagSelected);

  return (
    <>
      {/* Search Container */}
      <div className="search-container mt-20 md:mt-20 mx-auto w-11/12 md:w-5/12 flex flex-col md:flex-row items-center justify-between bg-gray-800 rounded-lg p-4 shadow-lg">
        <div className="w-full md:w-8/12 md:mr-4 mb-0">
          <SearchBox 
            onSelect={onImageSelect} 
            onChange={onSearchChange} 
          />
        </div>
        <h2 className="text-3xl font-bold text-white my-2 md:my-0">:</h2>
        <div className="w-full md:w-4/12 md:ml-4">
          <TagSelect 
            innerRef={imageTagRef} 
            options={imageTags} 
            isDisabled={!selectedImage} 
            isLoading={isTagsLoading}
            onChange={onImageTagSelect}
            paginationInfo={tagPaginationInfo}
            onLoadMore={onLoadMoreTags}
          />
        </div>
      </div>

      {/* Docker Hub Link */}
      {selectedImage ? (
        <div className="w-11/12 md:w-5/12 text-left mt-2 ml-4 md:ml-10">
          <a 
            target="_blank" 
            rel="noreferrer" 
            href={dockerHubUrl}
            className="text-blue-500 text-lg font-semibold underline hover:text-blue-700"
          >
            See Image Overview
          </a>
        </div>
      ) : (
        <a 
          href="http://dummy" 
          className="text-blue-500 text-lg font-semibold underline hover:text-blue-700" 
          style={{ opacity: 0 }}
        >
          Dummy
        </a>
      )}

      {/* Download Button */}
      <Button 
        disabled={isDownloadDisabled} 
        type={isDownloadEnabled ? 'primary' : 'dashed'} 
        size="large"
        className={`${
          isDownloadEnabled
            ? 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 md:py-6 px-6 md:px-10 rounded-lg text-xl md:text-2xl items-center justify-center flex' 
            : 'bg-gray-300 text-white font-bold py-4 md:py-6 px-6 md:px-10 rounded-lg text-xl md:text-2xl items-center justify-center flex'
        }`}
        onClick={onDownload}
      >
        Download Image Tar
        <DownloadOutlined className="ml-2" />
      </Button>

      {/* Information Section */}
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900/50 mt-96">
        What is Docker Tar?
      </h2>
      <p className="text-lg md:text-xl font-bold tracking-tight text-gray-900/50 mt-4 text-center px-4 md:px-0">
        A website that lets you download Docker Images as Tar files in a click!<br /><br />
        It came to solve the problem where you could only download images with a docker client installed.<br /><br />
        Now you can download any image you want. From any computer. Online.
      </p>
      
      {/* Feedback Button */}
      <div className="mt-8 flex justify-center">
        <a
          href={EXTERNAL_LINKS.FEEDBACK_FORM}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-100 text-lg font-bold tracking-tight text-gray-900/50 font-bold py-3 px-6 rounded hover:bg-gray-300"
        >
          Have a Feedback?
        </a>
      </div>
    </>
  );
};

export default StartingPage;