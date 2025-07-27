import React from 'react';

/**
 * Loading page component displayed during image download
 * @returns {JSX.Element} LoadingPage component
 */
const LoadingPage = () => {
  return (
    <div className='mt-10 mx-auto w-full flex justify-center items-center flex-col'>
      <h1 className="text-4xl md:text-5xl font-bold p-6 mb-2 text-gray-900/75 text-center">
        <span className="block">
          Downloading Image Tar...
        </span>
      </h1>
      <img 
        src="https://alphaville.github.io/optimization-engine/img/docker.gif" 
        alt="loading..." 
      />
      <p className="text-base md:text-l font-bold text-center">
        it might take a minute or two depending on image size
      </p>
    </div>
  );
};

export default LoadingPage;