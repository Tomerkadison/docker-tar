import React from 'react';

/**
 * Application header component with logo and title
 * @returns {JSX.Element} AppHeader component
 */
const AppHeader = () => {
  return (
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
  );
};

export default AppHeader;