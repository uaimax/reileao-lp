/**
 * Meta Pixel Initialization Component
 * This component initializes the Meta Pixel on the client side
 */

import { useEffect } from 'react';
import metaPixel from '@/lib/meta-pixel';
import { SITE_NAME } from '@/lib/site-config';

const MetaPixelInit = () => {
  useEffect(() => {
    // Initialize Meta Pixel
    metaPixel.trackPageView();

    // Track app initialization
    metaPixel.trackCustomEvent('AppInitialized', {
      content_name: `${SITE_NAME} App`,
      content_category: 'app',
      app_version: '1.0.0'
    });
  }, []);

  return null; // This component doesn't render anything
};

export default MetaPixelInit;
