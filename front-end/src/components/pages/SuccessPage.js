import React from 'react';

/**
 * Success page component displayed after successful download
 * @returns {JSX.Element} SuccessPage component
 */
const SuccessPage = () => {
  return (
    <div className='mt-10 mx-auto w-full flex justify-center items-center flex-col'>
      <h1 className="text-4xl md:text-5xl font-extrabold p-6 mb-2 text-gray-900/85 text-center">
        <span className="block">
          Your Image Tar Is Ready!
        </span>
      </h1>
      <img 
        className='mt-10' 
        src="/docker.png" 
        alt="success" 
      />
    </div>
  );
};

export default SuccessPage;