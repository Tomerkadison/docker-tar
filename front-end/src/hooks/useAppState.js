import { useState, useCallback } from 'react';

/**
 * Application states enum
 */
export const APP_STATES = {
  STARTING: 'StartingPage',
  LOADING: 'LoadingPage',
  SUCCESS: 'SuccessPage'
};

/**
 * Custom hook for managing application state
 * @returns {Object} Application state and handlers
 */
export const useAppState = () => {
  const [currentPage, setCurrentPage] = useState(APP_STATES.STARTING);

  /**
   * Navigates to starting page
   */
  const goToStarting = useCallback(() => {
    setCurrentPage(APP_STATES.STARTING);
  }, []);

  /**
   * Navigates to loading page
   */
  const goToLoading = useCallback(() => {
    setCurrentPage(APP_STATES.LOADING);
  }, []);

  /**
   * Navigates to success page
   */
  const goToSuccess = useCallback(() => {
    setCurrentPage(APP_STATES.SUCCESS);
  }, []);

  return {
    currentPage,
    goToStarting,
    goToLoading,
    goToSuccess,
    isStarting: currentPage === APP_STATES.STARTING,
    isLoading: currentPage === APP_STATES.LOADING,
    isSuccess: currentPage === APP_STATES.SUCCESS
  };
};