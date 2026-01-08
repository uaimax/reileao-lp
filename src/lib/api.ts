import apiClient from './api-client';

// Types
export interface Artist {
  id: number;
  name: string;
  role: string;
  cityState: string;
  photoUrl: string | null;
  description: string | null;
  promotionalVideoUrl: string | null;
  displayOrder: number | null;
  isActive: boolean | null;
}

export interface Testimonial {
  id: number;
  name: string;
  city_state: string;
  testimonial_text: string;
  photo_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

export interface Redirect {
  id: number;
  alias: string;
  targetUrl: string;
  displayOrder: number | null;
  isActive: boolean | null;
}

// Event Configuration
export const getEventConfig = () => apiClient.getEventConfig();
export const updateEventConfig = (data: any) => apiClient.updateEventConfig(data);

// Hero Content
export const getHeroContent = () => apiClient.getHeroContent();
export const updateHeroContent = (data: any) => apiClient.updateHeroContent(data);

// About Content
export const getAboutContent = () => apiClient.getAboutContent();
export const updateAboutContent = (data: any) => apiClient.updateAboutContent(data);

// Stats Content
export const getStatsContent = () => apiClient.getStatsContent();
export const updateStatsContent = (data: any) => apiClient.updateStatsContent(data);

// Artists
export const getArtists = (includeInactive?: boolean): Promise<Artist[]> => apiClient.getArtists(includeInactive);
export const createArtist = (data: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>) => apiClient.createArtist(data);
export const updateArtist = (id: number, data: Partial<Artist>) => apiClient.updateArtist(id, data);
export const deleteArtist = (id: number) => apiClient.deleteArtist(id);

// Artists Content
export const getArtistsContent = () => apiClient.getArtistsContent();
export const updateArtistsContent = (data: any) => apiClient.updateArtistsContent(data);

// Testimonials
export const getTestimonials = (): Promise<Testimonial[]> => apiClient.getTestimonials();
export const createTestimonial = (data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) => apiClient.createTestimonial(data);
export const updateTestimonial = (id: number, data: Partial<Testimonial>) => apiClient.updateTestimonial(id, data);
export const deleteTestimonial = (id: number) => apiClient.deleteTestimonial(id);

// Testimonials Content
export const getTestimonialsContent = () => apiClient.getTestimonialsContent();
export const updateTestimonialsContent = (data: any) => apiClient.updateTestimonialsContent(data);

// Location Content
export const getLocationContent = () => apiClient.getLocationContent();
export const updateLocationContent = (data: any) => apiClient.updateLocationContent(data);

// Participation Content
export const getParticipationContent = () => apiClient.getParticipationContent();
export const updateParticipationContent = (data: any) => apiClient.updateParticipationContent(data);

// Footer Content
export const getFooterContent = () => apiClient.getFooterContent();
export const updateFooterContent = (data: any) => apiClient.updateFooterContent(data);

// Redirects
export const getRedirects = (): Promise<Redirect[]> => apiClient.getRedirects();
export const createRedirect = (data: Omit<Redirect, 'id' | 'createdAt' | 'updatedAt'>) => apiClient.createRedirect(data);
export const updateRedirect = (id: number, data: Partial<Redirect>) => apiClient.updateRedirect(id, data);
export const deleteRedirect = (id: number) => apiClient.deleteRedirect(id);

// Bulk data fetching for landing page
export const getLandingPageData = () => apiClient.getLandingPageData();