/**
 * GOV.UK Frontend configuration
 * Implements the GOV.UK Design System for government services
 */
export interface GovukConfig {
  /**
   * Base configuration for GOV.UK Frontend
   */
  base: {
    /**
     * The service name to display in the header
     */
    serviceName: string;
    
    /**
     * The service URL for the header link
     */
    serviceUrl: string;
    
    /**
     * Whether to show the phase banner
     */
    showPhaseBanner: boolean;
    
    /**
     * The phase of the service (alpha, beta, live)
     */
    phase: 'alpha' | 'beta' | 'live';
    
    /**
     * Feedback link URL
     */
    feedbackLink: string;
  };
  
  /**
   * Header configuration
   */
  header: {
    /**
     * Whether to show the navigation
     */
    showNavigation: boolean;
    
    /**
     * Navigation items
     */
    navigationItems?: Array<{
      text: string;
      href: string;
      active?: boolean;
    }>;
  };
  
  /**
   * Footer configuration
   */
  footer: {
    /**
     * Whether to show the footer
     */
    showFooter: boolean;
    
    /**
     * Footer navigation items
     */
    navigationItems?: Array<{
      text: string;
      href: string;
    }>;
    
    /**
     * Meta navigation items
     */
    metaItems?: Array<{
      text: string;
      href: string;
    }>;
  };
  
  /**
   * Cookie banner configuration
   */
  cookieBanner: {
    /**
     * Whether to show the cookie banner
     */
    showCookieBanner: boolean;
    
    /**
     * Cookie policy URL
     */
    cookiePolicyUrl: string;
  };
}

/**
 * Default GOV.UK Frontend configuration
 */
export const govukConfig: GovukConfig = {
  base: {
    serviceName: process.env.SERVICE_NAME || 'Government Service',
    serviceUrl: process.env.SERVICE_URL || '/',
    showPhaseBanner: true,
    phase: (process.env.SERVICE_PHASE as 'alpha' | 'beta' | 'live') || 'beta',
    feedbackLink: process.env.FEEDBACK_LINK || '/feedback',
  },
  
  header: {
    showNavigation: true,
    navigationItems: [
      {
        text: 'Home',
        href: '/',
        active: true,
      },
      {
        text: 'Your account',
        href: '/account',
      },
      {
        text: 'Messages',
        href: '/messages',
      },
    ],
  },
  
  footer: {
    showFooter: true,
    navigationItems: [
      {
        text: 'Help',
        href: '/help',
      },
      {
        text: 'Cookies',
        href: '/cookies',
      },
      {
        text: 'Privacy',
        href: '/privacy',
      },
    ],
    metaItems: [
      {
        text: 'Accessibility statement',
        href: '/accessibility',
      },
      {
        text: 'Terms and conditions',
        href: '/terms',
      },
    ],
  },
  
  cookieBanner: {
    showCookieBanner: true,
    cookiePolicyUrl: '/cookies',
  },
}; 