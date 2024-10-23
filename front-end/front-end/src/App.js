import SearchBox from './components/SearchBox';
import TagSelect from './components/TagSelect';
import './App.css';
import { Button } from "antd";
import { DownloadOutlined } from '@ant-design/icons';
import { getImageTags } from './components/TagSelect';
import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageTags, setImageTags] = useState(null);
  const [selectedImageTag, setSelectedImageTag] = useState(null);
  const [currentPage, setCurrentPage] = useState("StartingPage");
  const imageTagRef = useRef();

  useEffect(() => {
    if (selectedImage) {
      const fetchImageTags = async () => {
        const imageName = selectedImage.rate_plans[0].repositories[0].name
        const imageNamespace = selectedImage.rate_plans[0].repositories[0].namespace
        const tags = await getImageTags(imageNamespace, imageName);
        setImageTags(tags);
      };
      fetchImageTags();
    }
  }, [selectedImage]);


  const downloadFile = (url, fileName) => {
    const response = fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "downloaded-file";
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setCurrentPage("SuccessPage")
      }).catch((error) => {
        alert("Failed to download image... Try again later");
        setCurrentPage("StartingPage")
      });
    if (response.status === 200) {
      setCurrentPage("SuccessPage")
    }
  };

  function handleImageSelect(selectedItem) {
    if (selectedItem) {
      setSelectedImage(selectedItem);
      imageTagRef.current?.focus();
    }
    console.log(selectedItem)
  }

  function handleImageTagSelect(selectedItem) {
    if (selectedItem) {
      setSelectedImageTag(selectedItem.value)
    }
    
  }


  function handleSearchBoxChange(query) {
    if (query === "") {
      setSelectedImage(null);
      setImageTags(null);
      setSelectedImageTag(null)
      imageTagRef.current?.clearValue();
    }
  }

  function handleDownload() {
    setCurrentPage("LoadingPage")
    downloadFile(
      `http://localhost:8080/install/image-tar?image_name=${selectedImage.name}&image_tag=${selectedImageTag}`,
      `${selectedImage.name}-${selectedImageTag}.tar`
    )
  }


  return (
    <div>
      <div className='mx-auto w-full flex justify-center items-center flex-col mt-20'>
        <div class="flex items-center">
          <a href="/">
            <img src="/docker-icon-new.png" alt="icon" class="h-20"></img>
          </a>
          <h1 class="text-8xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl p-6 mb-2">
            <a href="/">
              <span class="block">
                <span class="text-transparent bg-clip-text bg-gradient-to-tr text-white">
                  Docker Tar
                </span>
              </span>
            </a>
          </h1>
        </div>



        {currentPage === "StartingPage" &&
          (
            // Headline
            <>

              <div className='mt-20 mx-auto w-10/12 sm:w-5/12 h-50 flex items-center justify-between bg-gray-800 rounded-lg p-4 shadow-lg'>
                <div className='mr-4 w-8/12'>
                  <SearchBox onSelect={handleImageSelect} onChange={handleSearchBoxChange} />
                </div>
                <h2 className='text-3xl font-bold text-white'>:</h2>
                <div className='ml-4 w-4/12'>
                  <TagSelect innerRef={imageTagRef} options={imageTags} isDisabled={!selectedImage} onChange={handleImageTagSelect}/>
                </div>
              </div>

              {selectedImage ? (
                <div className='w-10/12 sm:w-5/12 text-left mt-2 ml-10' >
                  <a target="_blank" rel="noreferrer" href={`https://hub.docker.com/${selectedImage.rate_plans[0].repositories[0].namespace === 'library' ? '_' : 'r'}/${selectedImage.name}`}
                    className="text-blue-500 text-lg font-semibold underline hover:text-blue-700"
                  >See Image Overview</a>
                </div>
              ) : <a href="http://dummy" className="text-blue-500 text-lg font-semibold underline hover:text-blue-700" style={{ opacity: 0 }}>Summy</a>}

              <Button disabled={!selectedImageTag} type={selectedImageTag ? 'primary' : 'dashed'} size="large"
                className={selectedImageTag ? 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded-lg text-2xl items-center justify-center flex' : 'bg-gray-300  text-white font-bold py-6 px-10 rounded-lg text-2xl items-center justify-center flex'}
                onClick={
                  handleDownload
                }
              >
                Donwload Image Tar
                
                <DownloadOutlined/>
               </Button>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900/50 mt-96">What is Docker Tar?</h2>
              <p className="text-xl font-bold tracking-tight text-gray-900/50 mt-4 text-center">
                A website that lets you download Docker Images as Tar files in a click!<br></br><br></br>
                It came to solve the problem where you could only download images with a docker client installed.<br></br><br></br>
                Now you can download any image you want. From any computer. Online.
              </p>
            </>
          )
        }
        {currentPage === "LoadingPage" &&
          (
            <div className='mt-10 mx-auto w-full flex justify-center items-center flex-col mt-20'>
              <h1 className="text-5xl font-bold sm:text-5xl md:text-5xl p-6 mb-2 text-gray-900/75">
                <span className="block">
                  Downloading Image Tar...
                </span>
              </h1>
              <img src="https://alphaville.github.io/optimization-engine/img/docker.gif" alt="loading..." />
              <p className="text-l font-bold">it might take a minute or two depending on image size</p>
            </div>
          )}
        {currentPage === "SuccessPage" &&
          (
            <div className='mt-10 mx-auto w-full flex justify-center items-center flex-col mt-20'>
              <h1 className="text-5xl font-extrabold sm:text-5xl md:text-5xl p-6 mb-2 text-gray-900/85">
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
