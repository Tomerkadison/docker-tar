import SearchBox from './components/SearchBox';
import TagSelect from './components/TagSelect';
import './App.css';
import { Button } from "antd";
import { DownloadOutlined } from '@ant-design/icons';
import { getAllImageTags, loadMoreTags } from './components/TagSelect';
import React, { useState, useRef, useEffect } from 'react';
import Turnstile from "react-turnstile";


function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageTags, setImageTags] = useState(null);
  const [tagMetadata, setTagMetadata] = useState(null); // New state for tag pagination metadata
  const [selectedImageTag, setSelectedImageTag] = useState(null);
  const [currentPage, setCurrentPage] = useState("StartingPage");
  const [emptyTagSelected, setEmptyTagSelected] = useState(false);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const imageTagRef = useRef();


  const handleVerify = (token) => {
    handleDownload(token);
  };
  const fetchAllImageTags = async () => {
    if (!selectedImage) return;

    try {
      // Check if this is an explicitly entered image with no namespace
      if (selectedImage.rate_plans &&
          selectedImage.rate_plans[0] &&
          selectedImage.rate_plans[0].repositories &&
          selectedImage.rate_plans[0].repositories[0]) {
        const imageName = selectedImage.rate_plans[0].repositories[0].name || selectedImage.name;
        const imageNamespace = selectedImage.rate_plans[0].repositories[0].namespace;

        try {
          const result = await getAllImageTags(imageNamespace, imageName);
          setImageTags(result.tags);
          setTagMetadata({
            hasMore: result.hasMore,
            totalCount: result.totalCount,
            loadedPages: result.loadedPages,
            totalPages: result.totalPages,
            namespace: imageNamespace,
            imageName: imageName
          });
        } catch (error) {
          console.warn("Error fetching tags:", error);
          // If API fetch fails, set empty array to allow manual tag entry
          setImageTags([]);
          setTagMetadata(null);
        }
      } else {
        // For explicitly entered images without proper structure
        setImageTags([]);
        setTagMetadata(null);
      }
    } catch (error) {
      console.warn("Error in fetchAllImageTags:", error);
      setImageTags([]);
      setTagMetadata(null);
    }
  };

  // Function to handle loading more tags
  const handleLoadMoreTags = async () => {
    if (!tagMetadata || !tagMetadata.hasMore) return;

    try {
      const result = await loadMoreTags(
        tagMetadata.namespace,
        tagMetadata.imageName,
        imageTags,
        tagMetadata.loadedPages,
        tagMetadata.totalPages
      );

      // Append new tags to existing ones
      setImageTags(prevTags => [...prevTags, ...result.newTags]);

      // Update metadata
      setTagMetadata(prevMetadata => ({
        ...prevMetadata,
        hasMore: result.hasMore,
        loadedPages: result.loadedPages
      }));
    } catch (error) {
      console.warn("Error loading more tags:", error);
    }
  };


  useEffect(() => {
    if (selectedImage) {
      setImageTags([]);
      setTagMetadata(null);
      setIsTagsLoading(true);
      fetchAllImageTags().finally(() => {
        setIsTagsLoading(false);
      });
    }
  }, [selectedImage]); // eslint-disable-next-line


  const downloadFile = (url, fileName,token) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        // Check if the blob is empty (0 KB)
        if (blob.size < 10) {
          throw new Error(`Received empty file (${blob.size} KB). Backend operation failed.`);
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "downloaded-file";
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        fetch(`https://dockertar.zapto.org/report/success?token=${token}&size=${blob.size}`, { method: 'POST' }).catch((error) => {
        console.error("Sucess sending error:", error);
      });;
        setCurrentPage("SuccessPage");
      })
      .catch((error) => {
        console.error("Download error:", error);
        alert("Failed to download image... Try again later");
        setCurrentPage("StartingPage");
      });
  };

  function handleImageSelect(selectedItem) {
    if (selectedItem) {
      setSelectedImage(selectedItem);
      setEmptyTagSelected(false);
      imageTagRef.current?.focus();
    }
    console.log(selectedItem)
  }

  function handleImageTagSelect(selectedItem) {
    if (selectedItem) {
      console.log("Tag selected:", selectedItem); // Debug log
      
      // Check if this is the empty tag option
      if (selectedItem.value === '') {
        setSelectedImageTag('');
        setEmptyTagSelected(true);
      } else {
        setSelectedImageTag(selectedItem.value);
        setEmptyTagSelected(false);
      }
    } else {
      // Handle the case where selectedItem is null or undefined
      console.log("No tag selected or empty tag");
      setSelectedImageTag(null);
      setEmptyTagSelected(false);
    }
  }


  function handleSearchBoxChange(query) {
    if (query === "") {
      setSelectedImage(null);
      setImageTags(null);
      setTagMetadata(null);
      setSelectedImageTag(null);
      setEmptyTagSelected(false);
      imageTagRef.current?.clearValue();
    }
  }

  function handleDownload(token) {
    setCurrentPage("LoadingPage");
    const url = emptyTagSelected
      ? `https://dockertar.zapto.org/install?image_name=${selectedImage.name}&token=${token}`
      : `https://dockertar.zapto.org/install?image_name=${selectedImage.name}&image_tag=${selectedImageTag}&token=${token}`;
    const filename = emptyTagSelected
      ? `${selectedImage.name}.tar`
      : `${selectedImage.name}-${selectedImageTag}.tar`;
    downloadFile(url, filename,token);
  }


return (
    <div>
      <div className="mx-auto w-full flex justify-center items-center flex-col mt-24 md:mt-20">
        {/* Updated header container */}
        <div className="header-container flex items-center">
          <a href="/">
            <img src="/docker-icon-new.png" alt="icon" className="h-14 md:h-20" />
          </a>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight p-3 md:p-6 mb-2">
            <a href="/">
              <span className="block">
                <span className="text-transparent bg-clip-text bg-gradient-to-tr text-white">
                  Docker Tar
                </span>
              </span>
            </a>
          </h1>
        </div>


        {currentPage === "StartingPage" && (
          <>
            <div className="search-container mt-20 md:mt-20 mx-auto w-11/12 md:w-5/12 flex flex-col md:flex-row items-center justify-between bg-gray-800 rounded-lg p-4 shadow-lg">
              <div className="w-full md:w-8/12 md:mr-4 mb-0">
                <SearchBox onSelect={handleImageSelect} onChange={handleSearchBoxChange} />
              </div>
              <h2 className="text-3xl font-bold text-white my-2 md:my-0">:</h2>
              <div className="w-full md:w-4/12 md:ml-4">
                <TagSelect
                  innerRef={imageTagRef}
                  options={imageTags}
                  isDisabled={!selectedImage}
                  isLoading={isTagsLoading}
                  selectedImage={selectedImage}
                  tagMetadata={tagMetadata}
                  onLoadMoreTags={handleLoadMoreTags}
                  onChange={handleImageTagSelect}
                />
              </div>
            </div>

            {selectedImage ? (
              <div className="w-11/12 md:w-5/12 text-left mt-2 ml-4 md:ml-10">
                <a 
                  target="_blank" 
                  rel="noreferrer" 
                  href={`https://hub.docker.com/${selectedImage.rate_plans[0].repositories[0].namespace === 'library' ? '_' : 'r'}/${selectedImage.name}`}
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

            <Button 
              disabled={!selectedImage || (selectedImageTag === null && !emptyTagSelected)} 
              type={(selectedImage && (selectedImageTag !== null || emptyTagSelected)) ? 'primary' : 'dashed'} 
              size="large"
              className={`${
                (selectedImage && (selectedImageTag !== null || emptyTagSelected))
                  ? 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 md:py-6 px-6 md:px-10 rounded-lg text-xl md:text-2xl items-center justify-center flex' 
                  : 'bg-gray-300 text-white font-bold py-4 md:py-6 px-6 md:px-10 rounded-lg text-xl md:text-2xl items-center justify-center flex'
              }`}
              onClick={() => setCurrentPage("VerifyPage")}
            >
              Download Image Tar
              <DownloadOutlined className="ml-2" />
            </Button>

            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900/50 mt-96">
              What is Docker Tar?
            </h2>
            <p className="text-lg md:text-xl font-bold tracking-tight text-gray-900/50 mt-4 text-center px-4 md:px-0">
              A website that lets you download Docker Images as Tar files in a click!<br /><br />
              It came to solve the problem where you could only download images with a docker client installed.<br /><br />
              Now you can download any image you want. From any computer. Online.
            </p>
            
            {/* Mobile Feedback Button (Visible only on phones) */}
            <div className=" mt-8 flex justify-center">
            <a
          href="https://forms.gle/Mr3vmAk5Fz81VRKh6"  // <-- Replace with your Google Forms URL
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-100 text-lg font-bold tracking-tight text-gray-900/50 font-bold py-3 px-6 rounded hover:bg-gray-300"
        >
          Have a Feedback?
        </a>
      </div>
          </>
        )}

        {currentPage === "VerifyPage" && (
          <div className='mt-20 mx-auto w-full flex justify-center items-center flex-col'>
             <Turnstile
              sitekey="0x4AAAAAAB02nGeNdVYltnlB"
              onVerify={handleVerify}
              theme="light"
            />
          </div>
        )}

        {currentPage === "LoadingPage" && (
          <div className='mt-10 mx-auto w-full flex justify-center items-center flex-col'>
            <h1 className="text-4xl md:text-5xl font-bold p-6 mb-2 text-gray-900/75 text-center">
              <span className="block">
                Downloading Image Tar...
              </span>
            </h1>
            <img src="https://alphaville.github.io/optimization-engine/img/docker.gif" alt="loading..." />
            <p className="text-base md:text-l font-bold text-center">
              it might take a minute or two depending on image size
            </p>
          </div>
        )}

        {currentPage === "SuccessPage" && (
          <div className='mt-10 mx-auto w-full flex justify-center items-center flex-col'>
            <h1 className="text-4xl md:text-5xl font-extrabold p-6 mb-2 text-gray-900/85 text-center">
              <span className="block">
                Your Image Tar Is Ready!
              </span>
            </h1>
            <img className='mt-10' src="/docker.png" alt="loading..." />
          </div>
        )}
      </div>

    </div>
  );
}
export default App;
