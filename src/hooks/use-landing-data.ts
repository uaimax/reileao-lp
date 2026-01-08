import { useQuery } from '@tanstack/react-query';
import { getLandingPageData } from '@/lib/api';
import * as mockData from '@/lib/mock-data';

export const useLandingData = () => {
  return useQuery({
    queryKey: ['landing-page-data'],
    queryFn: async () => {
      try {
        return await getLandingPageData();
      } catch (error) {
        console.warn('API not available, using mock data:', error);
        // Return mock data when API is not available
        return {
          event: mockData.mockEventConfig,
          hero: mockData.mockHeroContent,
          about: mockData.mockAboutContent,
          stats: mockData.mockStatsContent,
          artists: mockData.mockArtists,
          artistsSection: mockData.mockArtistsContent,
          testimonials: mockData.mockTestimonials,
          testimonialsSection: mockData.mockTestimonialsContent,
          location: mockData.mockLocationContent,
          participation: mockData.mockParticipationContent,
          footer: mockData.mockFooterContent,
          faqs: mockData.mockFAQs,
          faqSection: mockData.mockFAQSection
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once before falling back to mock data
  });
};

export const useRefreshLandingData = () => {
  const { refetch } = useLandingData();
  return refetch;
};