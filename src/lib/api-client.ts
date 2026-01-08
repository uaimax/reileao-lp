// API Client for communicating with the backend
// Detecta automaticamente o ambiente
const getApiBaseUrl = () => {
  // Se VITE_API_URL está definida, usa ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Em produção, detecta o ambiente
  if (import.meta.env.PROD) {
    // Se está na Vercel (detecta pelo hostname)
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return window.location.origin;
    }
    // Para outros ambientes (Caprover, etc.), usa URL relativa
    return '';
  }

  // Desenvolvimento local
  return 'http://localhost:3002';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Event Configuration
  async getEventConfig() {
    return this.request('/api/event-config');
  }

  async updateEventConfig(data: any) {
    return this.request('/api/event-config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Hero Content
  async getHeroContent() {
    return this.request('/api/hero-content');
  }

  async updateHeroContent(data: any) {
    return this.request('/api/hero-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // About Content
  async getAboutContent() {
    return this.request('/api/about-content');
  }

  async updateAboutContent(data: any) {
    return this.request('/api/about-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Stats Content
  async getStatsContent() {
    return this.request('/api/stats-content');
  }

  async updateStatsContent(data: any) {
    return this.request('/api/stats-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Artists
  async getArtists(includeInactive?: boolean) {
    const params = includeInactive ? '?includeInactive=true' : '';
    return this.request(`/api/artists${params}`);
  }

  async createArtist(data: any) {
    return this.request('/api/artists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArtist(id: number, data: any) {
    return this.request(`/api/artists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArtist(id: number) {
    return this.request(`/api/artists/${id}`, {
      method: 'DELETE',
    });
  }

  // Artists Content
  async getArtistsContent() {
    return this.request('/api/artists-content');
  }

  async updateArtistsContent(data: any) {
    return this.request('/api/artists-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Testimonials
  async getTestimonials() {
    return this.request('/api/testimonials');
  }

  async createTestimonial(data: any) {
    return this.request('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTestimonial(id: number, data: any) {
    return this.request(`/api/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTestimonial(id: number) {
    return this.request(`/api/testimonials/${id}`, {
      method: 'DELETE',
    });
  }

  // Testimonials Content
  async getTestimonialsContent() {
    return this.request('/api/testimonials-content');
  }

  async updateTestimonialsContent(data: any) {
    return this.request('/api/testimonials-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Location Content
  async getLocationContent() {
    return this.request('/api/location-content');
  }

  async updateLocationContent(data: any) {
    return this.request('/api/location-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Participation Content
  async getParticipationContent() {
    return this.request('/api/participation-content');
  }

  async updateParticipationContent(data: any) {
    return this.request('/api/participation-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Footer Content
  async getFooterContent() {
    return this.request('/api/footer-content');
  }

  async updateFooterContent(data: any) {
    return this.request('/api/footer-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Redirects
  async getRedirects() {
    return this.request('/api/redirects');
  }

  async createRedirect(data: any) {
    return this.request('/api/redirects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRedirect(id: number, data: any) {
    return this.request(`/api/redirects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRedirect(id: number) {
    return this.request(`/api/redirects/${id}`, {
      method: 'DELETE',
    });
  }

  // Bulk landing page data
  async getLandingPageData() {
    return this.request('/api/landing-data');
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Authentication methods

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyAuth(email: string) {
    return this.request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // PRIMEIRINHO - Leads
  async createPrimeirinhoLead(data: any) {
    return this.request('/api/primeirinho/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPrimeirinhoLead(uuid: string) {
    return this.request(`/api/primeirinho/leads/${uuid}`);
  }

  async getPrimeirinhoLeads() {
    return this.request('/api/primeirinho/leads');
  }

  async updatePrimeirinhoLeadStatus(leadId: string, status: 'approved' | 'rejected' | 'confirmed') {
    return this.request(`/api/primeirinho/leads/${leadId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updatePrimeirinhoLeadConfirmation(uuid: string, confirmationData: any) {
    // Por enquanto, vamos usar o endpoint de atualização de status
    // e armazenar os dados de confirmação no localStorage para demonstração
    try {
      // Simular salvamento dos dados de confirmação
      const existingData = JSON.parse(localStorage.getItem('primeirinho_confirmations') || '{}');
      existingData[uuid] = {
        ...confirmationData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('primeirinho_confirmations', JSON.stringify(existingData));

      // Retornar sucesso
      return { success: true, data: confirmationData };
    } catch (error) {
      throw new Error('Erro ao salvar dados de confirmação');
    }
  }

  // PRIMEIRINHO - Cidades
  async getCidades(estado: string) {
    return this.request(`/api/primeirinho/cidades/${estado}`);
  }

  async getCidadesConfiguradas() {
    return this.request('/api/primeirinho/cidades-configuradas');
  }

  async addCidadeConfigurada(data: any) {
    return this.request('/api/primeirinho/cidades-configuradas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeCidadeConfigurada(id: string) {
    return this.request(`/api/primeirinho/cidades-configuradas/${id}`, {
      method: 'DELETE',
    });
  }

  // Event Form Configuration
  async getFormConfig() {
    return this.request('/api/form-config');
  }

  async createFormConfig(data: any) {
    return this.request('/api/form-config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFormConfig(id: number, data: any) {
    return this.request(`/api/form-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Event Registrations
  async createRegistration(data: any) {
    return this.request('/api/registrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRegistration(id: number) {
    return this.request(`/api/registrations/${id}`);
  }

  async getRegistrationInstallments(id: number, simulateAllPaid = false) {
    const url = simulateAllPaid
      ? `/api/registrations/${id}/installments?simulateAllPaid=true`
      : `/api/registrations/${id}/installments`;
    return this.request(url);
  }

  async getAllRegistrations() {
    return this.request('/api/registrations');
  }

  async updateRegistration(id: number, data: any) {
    return this.request(`/api/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRegistration(id: number) {
    return this.request(`/api/registrations/${id}`, {
      method: 'DELETE',
    });
  }

  async searchRegistrations(searchData: { email?: string; cpf?: string; whatsapp?: string }) {
    return this.request('/api/registrations/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  // ASAAS Checkout
  async createCheckout(registrationId: number) {
    return this.request('/api/checkout/create', {
      method: 'POST',
      body: JSON.stringify({ registrationId }),
    });
  }

  async createCharge(registrationId: number) {
    return this.request('/api/charges/create', {
      method: 'POST',
      body: JSON.stringify({ registrationId }),
    });
  }

  // Generic HTTP methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;