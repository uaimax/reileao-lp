/**
 * Meta Pixel Integration
 * Dataset ID: 630477477390150
 *
 * This file provides a comprehensive Meta Pixel integration
 * with automatic event tracking and manual event triggers.
 */

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export interface MetaPixelEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

export interface MetaPixelConfig {
  pixelId: string;
  debug?: boolean;
  autoPageView?: boolean;
}

class MetaPixelManager {
  private pixelId: string;
  private debug: boolean;
  private initialized: boolean = false;
  private queue: MetaPixelEvent[] = [];

  constructor(config: MetaPixelConfig) {
    this.pixelId = config.pixelId;
    this.debug = config.debug || false;

    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.initialized) return;

    // Load Meta Pixel script
    this.loadScript();

    // Initialize pixel
    this.initPixel();

    // Process queued events
    this.processQueue();

    this.initialized = true;

    if (this.debug) {
      console.log('Meta Pixel initialized with ID:', this.pixelId);
    }
  }

  private loadScript(): void {
    // Check if script already exists
    if (document.querySelector('script[src*="connect.facebook.net"]')) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://connect.facebook.net/pt_BR/fbevents.js`;
    document.head.appendChild(script);
  }

  private initPixel(): void {
    if (typeof window !== 'undefined') {
      window.fbq = window.fbq || function(...args: any[]) {
        (window.fbq as any).callMethod ? (window.fbq as any).callMethod.apply(window.fbq, args) : (window.fbq as any).queue.push(args);
      };

      if (!(window as any)._fbq) {
        (window as any)._fbq = window.fbq;
      }

      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];

      // Initialize pixel
      window.fbq('init', this.pixelId);
      window.fbq('track', 'PageView');
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.trackEvent(event.eventName, event.parameters);
      }
    }
  }

  /**
   * Track a custom event
   */
  public trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.initialized) {
      this.queue.push({ eventName, parameters });
      return;
    }

    if (typeof window !== 'undefined' && window.fbq) {
      if (parameters) {
        window.fbq('track', eventName, parameters);
      } else {
        window.fbq('track', eventName);
      }

      if (this.debug) {
        console.log('Meta Pixel Event:', eventName, parameters);
      }
    }
  }

  /**
   * Track page view
   */
  public trackPageView(pageName?: string): void {
    const parameters = pageName ? { page_name: pageName } : undefined;
    this.trackEvent('PageView', parameters);
  }

  /**
   * Track custom conversion
   */
  public trackCustomConversion(conversionName: string, value?: number, currency?: string): void {
    const parameters: Record<string, any> = {};

    if (value !== undefined) {
      parameters.value = value;
    }

    if (currency) {
      parameters.currency = currency;
    }

    this.trackEvent(conversionName, parameters);
  }

  /**
   * Track lead generation
   */
  public trackLead(value?: number, currency?: string): void {
    this.trackCustomConversion('Lead', value, currency);
  }

  /**
   * Track purchase
   */
  public trackPurchase(value: number, currency: string = 'BRL', contentIds?: string[]): void {
    const parameters: Record<string, any> = {
      value,
      currency
    };

    if (contentIds) {
      parameters.content_ids = contentIds;
      parameters.content_type = 'product';
    }

    this.trackEvent('Purchase', parameters);
  }

  /**
   * Track add to cart
   */
  public trackAddToCart(value: number, currency: string = 'BRL', contentIds?: string[]): void {
    const parameters: Record<string, any> = {
      value,
      currency
    };

    if (contentIds) {
      parameters.content_ids = contentIds;
      parameters.content_type = 'product';
    }

    this.trackEvent('AddToCart', parameters);
  }

  /**
   * Track initiate checkout
   */
  public trackInitiateCheckout(value: number, currency: string = 'BRL', contentIds?: string[]): void {
    const parameters: Record<string, any> = {
      value,
      currency
    };

    if (contentIds) {
      parameters.content_ids = contentIds;
      parameters.content_type = 'product';
    }

    this.trackEvent('InitiateCheckout', parameters);
  }

  /**
   * Track view content
   */
  public trackViewContent(contentName: string, contentIds?: string[]): void {
    const parameters: Record<string, any> = {
      content_name: contentName
    };

    if (contentIds) {
      parameters.content_ids = contentIds;
      parameters.content_type = 'product';
    }

    this.trackEvent('ViewContent', parameters);
  }

  /**
   * Track search
   */
  public trackSearch(searchString: string): void {
    this.trackEvent('Search', {
      search_string: searchString
    });
  }

  /**
   * Track contact
   */
  public trackContact(): void {
    this.trackEvent('Contact');
  }

  /**
   * Track complete registration
   */
  public trackCompleteRegistration(value?: number, currency?: string): void {
    const parameters: Record<string, any> = {};

    if (value !== undefined) {
      parameters.value = value;
    }

    if (currency) {
      parameters.currency = currency;
    }

    this.trackEvent('CompleteRegistration', parameters);
  }

  /**
   * Track start trial
   */
  public trackStartTrial(value?: number, currency?: string): void {
    const parameters: Record<string, any> = {};

    if (value !== undefined) {
      parameters.value = value;
    }

    if (currency) {
      parameters.currency = currency;
    }

    this.trackEvent('StartTrial', parameters);
  }

  /**
   * Track subscribe
   */
  public trackSubscribe(value?: number, currency?: string): void {
    const parameters: Record<string, any> = {};

    if (value !== undefined) {
      parameters.value = value;
    }

    if (currency) {
      parameters.currency = currency;
    }

    this.trackEvent('Subscribe', parameters);
  }

  /**
   * Track video play
   */
  public trackVideoPlay(videoTitle?: string): void {
    const parameters: Record<string, any> = {};

    if (videoTitle) {
      parameters.content_name = videoTitle;
    }

    this.trackEvent('VideoPlay', parameters);
  }

  /**
   * Track video complete
   */
  public trackVideoComplete(videoTitle?: string): void {
    const parameters: Record<string, any> = {};

    if (videoTitle) {
      parameters.content_name = videoTitle;
    }

    this.trackEvent('VideoComplete', parameters);
  }

  /**
   * Track custom event with advanced parameters
   */
  public trackCustomEvent(
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
  ): void {
    this.trackEvent(eventName, parameters);
  }
}

// Create singleton instance
const metaPixel = new MetaPixelManager({
  pixelId: '630477477390150', // Your Meta Pixel ID
  debug: process.env.NODE_ENV === 'development',
  autoPageView: true
});

export default metaPixel;

// Export individual methods for convenience
export const {
  trackEvent,
  trackPageView,
  trackCustomConversion,
  trackLead,
  trackPurchase,
  trackAddToCart,
  trackInitiateCheckout,
  trackViewContent,
  trackSearch,
  trackContact,
  trackCompleteRegistration,
  trackStartTrial,
  trackSubscribe,
  trackVideoPlay,
  trackVideoComplete,
  trackCustomEvent
} = metaPixel;
