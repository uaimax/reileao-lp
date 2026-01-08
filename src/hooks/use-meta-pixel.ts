/**
 * Meta Pixel Hooks for React Components
 * Provides easy-to-use hooks for tracking Meta Pixel events
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import metaPixel from '@/lib/meta-pixel';

/**
 * Hook to automatically track page views
 */
export const usePageTracking = (pageName?: string) => {
  const location = useLocation();

  useEffect(() => {
    const currentPageName = pageName || location.pathname;
    metaPixel.trackPageView(currentPageName);
  }, [location.pathname, pageName]);
};

/**
 * Hook to track custom events
 */
export const useMetaPixelTracking = () => {
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    metaPixel.trackEvent(eventName, parameters);
  }, []);

  const trackLead = useCallback((value?: number, currency?: string) => {
    metaPixel.trackLead(value, currency);
  }, []);

  const trackPurchase = useCallback((value: number, currency: string = 'BRL', contentIds?: string[]) => {
    metaPixel.trackPurchase(value, currency, contentIds);
  }, []);

  const trackAddToCart = useCallback((value: number, currency: string = 'BRL', contentIds?: string[]) => {
    metaPixel.trackAddToCart(value, currency, contentIds);
  }, []);

  const trackInitiateCheckout = useCallback((value: number, currency: string = 'BRL', contentIds?: string[]) => {
    metaPixel.trackInitiateCheckout(value, currency, contentIds);
  }, []);

  const trackCompleteRegistration = useCallback((value?: number, currency?: string) => {
    metaPixel.trackCompleteRegistration(value, currency);
  }, []);

  const trackViewContent = useCallback((contentName: string, contentIds?: string[]) => {
    metaPixel.trackViewContent(contentName, contentIds);
  }, []);

  const trackContact = useCallback(() => {
    metaPixel.trackContact();
  }, []);

  const trackVideoPlay = useCallback((videoTitle?: string) => {
    metaPixel.trackVideoPlay(videoTitle);
  }, []);

  const trackVideoComplete = useCallback((videoTitle?: string) => {
    metaPixel.trackVideoComplete(videoTitle);
  }, []);

  const trackCustomEvent = useCallback((
    eventName: string,
    parameters: {
      value?: number;
      currency?: string;
      content_name?: string;
      content_ids?: string[];
      content_type?: string;
      content_category?: string;
      [key: string]: any;
    }
  ) => {
    metaPixel.trackCustomEvent(eventName, parameters);
  }, []);

  const trackSearch = useCallback((searchQuery: string) => {
    metaPixel.trackEvent('Search', {
      search_string: searchQuery,
      content_category: 'search'
    });
  }, []);

  return {
    trackEvent,
    trackLead,
    trackPurchase,
    trackAddToCart,
    trackInitiateCheckout,
    trackCompleteRegistration,
    trackViewContent,
    trackContact,
    trackVideoPlay,
    trackVideoComplete,
    trackCustomEvent,
    trackSearch
  };
};

/**
 * Hook to track form interactions
 */
export const useFormTracking = (formName: string) => {
  const { trackEvent } = useMetaPixelTracking();

  const trackFormStart = useCallback(() => {
    trackEvent('FormStart', {
      content_name: formName,
      content_category: 'form'
    });
  }, [trackEvent, formName]);

  const trackFormSubmit = useCallback(() => {
    trackEvent('FormSubmit', {
      content_name: formName,
      content_category: 'form'
    });
  }, [trackEvent, formName]);

  const trackFormComplete = useCallback(() => {
    trackEvent('FormComplete', {
      content_name: formName,
      content_category: 'form'
    });
  }, [trackEvent, formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormComplete
  };
};

/**
 * Hook to track button clicks
 */
export const useButtonTracking = () => {
  const { trackEvent } = useMetaPixelTracking();

  const trackButtonClick = useCallback((buttonName: string, buttonCategory?: string) => {
    trackEvent('ButtonClick', {
      content_name: buttonName,
      content_category: buttonCategory || 'button'
    });
  }, [trackEvent]);

  return {
    trackButtonClick
  };
};

/**
 * Hook to track video interactions
 */
export const useVideoTracking = (videoTitle: string) => {
  const { trackVideoPlay, trackVideoComplete } = useMetaPixelTracking();

  const handleVideoPlay = useCallback(() => {
    trackVideoPlay(videoTitle);
  }, [trackVideoPlay, videoTitle]);

  const handleVideoComplete = useCallback(() => {
    trackVideoComplete(videoTitle);
  }, [trackVideoComplete, videoTitle]);

  return {
    handleVideoPlay,
    handleVideoComplete
  };
};
