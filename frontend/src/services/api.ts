// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If we have an explicit API URL set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For all environments, use the Vite proxy
  // The proxy will handle routing to the correct backend
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  website?: string;
}

export interface PortfolioStats {
  projectsCompleted: number;
  yearsExperience: number;
  clientSatisfaction: number;
}

export interface SiteSettings {
  seoTitle: string;
  seoDescription: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  emailUrl: string | null;
  analyticsEnabled: boolean;
  contactFormEnabled: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDesc?: string;
  demoUrl?: string;
  githubUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPaid: boolean;
  price?: number;
  currency: string;
  order: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  screenshots: {
    id: string;
    url: string;
    alt?: string;
    order: number;
  }[];
}

export interface ProjectPurchase {
  id: string;
  projectId: string;
  project: Project;
  customerEmail: string;
  customerName?: string;
  amount: number;
  currency: string;
  paystackReference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentGateway: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitializeData {
  projectId: string;
  customerEmail: string;
  customerName?: string;
}

export interface PaymentInitializeResponse {
  success: boolean;
  data: {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  };
  message: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  data: {
    purchase: ProjectPurchase;
    accessGranted: boolean;
  };
  message: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  longDesc?: string;
  demoUrl?: string;
  githubUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPaid?: boolean;
  price?: number;
  currency?: string;
  tags: string[];
  screenshots?: {
    url: string;
    alt?: string;
    order: number;
  }[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  order?: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  title: string;
  description: string;
  icon: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> { }

export interface Skill {
  id: string;
  name: string;
  percentage: number;
  category: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillData {
  name: string;
  percentage: number;
  category: string;
  color?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateSkillData extends Partial<CreateSkillData> { }

export interface Technology {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnologyData {
  name: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateTechnologyData extends Partial<CreateTechnologyData> { }

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  email: string;
  linkedin?: string;
  github?: string;
  isActive: boolean;
  order: number;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberData {
  name: string;
  role: string;
  bio: string;
  image: string;
  email: string;
  linkedin?: string;
  github?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> { }

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  ipAddress: string;
  userAgent?: string;
  submittedAt: string;
}

export interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  ipAddress: string;
  userAgent?: string;
}

export interface UpdateContactData {
  status?: 'UNREAD' | 'READ' | 'ARCHIVED';
}

// Notification Interfaces
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CONTACT' | 'SYSTEM';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  readAt?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  actionUrl?: string;
  metadata?: any;
}

export interface UpdateNotificationData {
  isRead?: boolean;
  readAt?: string;
}

// User Settings Interfaces
export interface UserSettings {
  id: string;
  userId: string;
  // Notification Settings
  emailNotifications: boolean;
  browserNotifications: boolean;
  newContactMessages: boolean;
  projectViews: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
  // Security Settings
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  passwordLastChanged: string;
  activeSessions: number;
  // Site Settings
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  contactFormEnabled: boolean;
  seoTitle: string;
  seoDescription: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  emailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  avatar?: string;
  cvUrl?: string;
  createdAt: string;
  updatedAt: string;
  settings?: UserSettings;
}

export interface UpdateUserProfileData {
  name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  avatar?: string;
  cvUrl?: string;
}

export interface UpdateUserSettingsData {
  // Notification Settings
  emailNotifications?: boolean;
  browserNotifications?: boolean;
  newContactMessages?: boolean;
  projectViews?: boolean;
  weeklyReports?: boolean;
  securityAlerts?: boolean;
  // Security Settings
  twoFactorEnabled?: boolean;
  loginAlerts?: boolean;
  activeSessions?: number;
  // Site Settings
  maintenanceMode?: boolean;
  analyticsEnabled?: boolean;
  contactFormEnabled?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  emailUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AboutContent {
  heading: string | null;
  subtitle: string | null;
  paragraph1: string | null;
  paragraph2: string | null;
}

export interface AboutContentResponse {
  content: AboutContent;
  imageUrl: string | null;
  urls: {
    heading: string | null;
    subtitle: string | null;
    paragraph1: string | null;
    paragraph2: string | null;
    image: string | null;
  };
}

export interface UploadAboutContentResponse {
  message: string;
  url: string;
  contentType: 'heading' | 'subtitle' | 'paragraph1' | 'paragraph2';
}

export interface UploadAboutImageResponse {
  message: string;
  imageUrl: string;
  user: {
    id: string;
    aboutImage: string;
  };
  uploadResult: {
    publicId: string;
    url: string;
    secureUrl: string;
  };
}

// Analytics Interfaces
export type TimePeriod = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'this_year' | 'custom';
export type GroupBy = 'day' | 'week' | 'month';

export interface AnalyticsOverview {
  totalVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  visitorGrowth: number;
}

export interface TrafficGrowthData {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface DeviceBreakdown {
  deviceType: string;
  visitors: number;
  percentage: number;
}

export interface BrowserStats {
  browser: string | null;
  _count: {
    id: number;
  };
}

export interface TrafficSourceData {
  source: string;
  visitors: number;
  percentage: number;
}

export interface PagePerformanceData {
  path: string;
  pageViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface ProjectEngagementData {
  path: string;
  _count: {
    id: number;
  };
  _avg: {
    duration: number | null;
  };
}

export interface ComprehensiveAnalytics {
  overview: AnalyticsOverview;
  trafficGrowth: TrafficGrowthData[];
  deviceBreakdown: DeviceBreakdown[];
  browserStats: BrowserStats[];
  osStats: BrowserStats[];
  trafficSources: TrafficSourceData[];
  topPages: PagePerformanceData[];
  contactSubmissions: number;
  projectEngagement: ProjectEngagementData[];
  cvDownloads: number;
  period: {
    start: string;
    end: string;
    type: TimePeriod;
  };
}

// API Service Class

export interface UpdateProjectData extends Partial<CreateProjectData> {
  order?: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  title: string;
  description: string;
  icon: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> { }

// API Service Class
class ApiService {
  private getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // No authorization header needed - cookies are sent automatically
    };

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = '';

      try {
        // Try to parse as JSON first
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = JSON.stringify(errorData, null, 2);
        console.error('API Error Details:', errorData);
      } catch {
        // If JSON parsing fails, try to get text content
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
            errorDetails = errorText;
          }
          console.error('API Error Text:', errorText);
        } catch {
          // If all parsing fails, use the default message
          console.warn('Could not parse error response');
        }
      }

      console.error(`API Error: ${response.status} ${response.statusText}`, {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        errorDetails
      });

      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Auth endpoints
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Send cookies
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<{ user: User }>(response);

    // Backend sets HTTP-only cookies, we just return the response
    return {
      access_token: '', // Not needed since it's in HTTP-only cookie
      refresh_token: '',
      user: result.user
    };
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Send cookies
    });

    const result = await this.handleResponse<AuthResponse>(response);
    return result;
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Send cookies
    });

    const result = await this.handleResponse<{ user: User }>(response);
    return result.user;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies
    });

    await this.handleResponse(response);
  }

  // Projects endpoints
  async getProjects(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    published?: boolean;
  }): Promise<{
    projects: Project[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const queryString = params ? new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';

    const url = queryString ? `${API_BASE_URL}/projects?${queryString}` : `${API_BASE_URL}/projects`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<{
      projects: Project[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>(response);
  }

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.status}`);
    }
  }

  // Service endpoints
  async getServices(query?: { search?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{
    services: Service[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    const searchParams = new URLSearchParams();
    if (query?.search) searchParams.append('search', query.search);
    if (query?.isActive !== undefined) searchParams.append('isActive', query.isActive.toString());
    if (query?.page) searchParams.append('page', query.page.toString());
    if (query?.limit) searchParams.append('limit', query.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${API_BASE_URL}/services?${queryString}` : `${API_BASE_URL}/services`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getService(id: string): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async createService(data: CreateServiceData): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteService(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete service: ${response.status}`);
    }
  }

  // Skills endpoints
  async getSkills(query?: { search?: string; category?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{
    skills: Skill[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    const searchParams = new URLSearchParams();
    if (query?.search) searchParams.append('search', query.search);
    if (query?.category) searchParams.append('category', query.category);
    if (query?.isActive !== undefined) searchParams.append('isActive', query.isActive.toString());
    if (query?.page) searchParams.append('page', query.page.toString());
    if (query?.limit) searchParams.append('limit', query.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${API_BASE_URL}/skills?${queryString}` : `${API_BASE_URL}/skills`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  // Public method for getting skills without authentication (for home page)
  async getPublicSkills(query?: { search?: string; category?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{
    skills: Skill[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    const searchParams = new URLSearchParams();
    if (query?.search) searchParams.append('search', query.search);
    if (query?.category) searchParams.append('category', query.category);
    if (query?.isActive !== undefined) searchParams.append('isActive', query.isActive.toString());
    if (query?.page) searchParams.append('page', query.page.toString());
    if (query?.limit) searchParams.append('limit', query.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${API_BASE_URL}/skills?${queryString}` : `${API_BASE_URL}/skills`;
    const response = await fetch(url);

    return this.handleResponse(response);
  }

  async getSkill(id: string): Promise<Skill> {
    const response = await fetch(`${API_BASE_URL}/skills/${id}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async createSkill(data: CreateSkillData): Promise<Skill> {
    const response = await fetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async updateSkill(id: string, data: UpdateSkillData): Promise<Skill> {
    const response = await fetch(`${API_BASE_URL}/skills/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteSkill(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/skills/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete skill: ${response.status}`);
    }
  }

  // Technologies endpoints
  async getTechnologies(query?: { isActive?: boolean }): Promise<{
    technologies: Technology[];
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    if (query?.isActive !== undefined) searchParams.append('isActive', query.isActive.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${API_BASE_URL}/technologies?${queryString}` : `${API_BASE_URL}/technologies`;
    const response = await fetch(url);

    return this.handleResponse(response);
  }

  async createTechnology(data: CreateTechnologyData): Promise<Technology> {
    const response = await fetch(`${API_BASE_URL}/technologies`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async updateTechnology(id: string, data: UpdateTechnologyData): Promise<Technology> {
    const response = await fetch(`${API_BASE_URL}/technologies/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteTechnology(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/technologies/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete technology: ${response.status}`);
    }
  }

  // Team endpoints
  async getTeamMembers(query?: { search?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{
    teamMembers: TeamMember[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    const searchParams = new URLSearchParams();
    if (query?.search) searchParams.append('search', query.search);
    if (query?.isActive !== undefined) searchParams.append('isActive', query.isActive.toString());
    if (query?.page) searchParams.append('page', query.page.toString());
    if (query?.limit) searchParams.append('limit', query.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${API_BASE_URL}/team?${queryString}` : `${API_BASE_URL}/team`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getTeamMember(id: string): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/team/${id}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async createTeamMember(data: CreateTeamMemberData): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/team`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async updateTeamMember(id: string, data: UpdateTeamMemberData): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/team/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteTeamMember(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/team/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete team member: ${response.status}`);
    }
  }

  // Contacts endpoints
  async getContacts(query?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{
    contacts: Contact[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    const searchParams = new URLSearchParams();
    if (query?.search) searchParams.append('search', query.search);
    if (query?.status) searchParams.append('status', query.status);
    if (query?.page) searchParams.append('page', query.page.toString());
    if (query?.limit) searchParams.append('limit', query.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${API_BASE_URL}/contacts?${queryString}` : `${API_BASE_URL}/contacts`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getContact(id: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async createContact(data: CreateContactData): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  // Public contact form submission (no authentication required)
  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async updateContact(id: string, data: UpdateContactData): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteContact(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.status}`);
    }
  }

  // Upload endpoints
  async generateUploadSignature(data: {
    filename: string;
    folder?: string;
  }): Promise<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
    publicId: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/upload/signature`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async uploadToCloudinary(file: File, uploadData: {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
    publicId: string;
  }): Promise<{ url: string; secureUrl: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', uploadData.apiKey);
    formData.append('timestamp', uploadData.timestamp.toString());
    formData.append('signature', uploadData.signature);
    formData.append('folder', uploadData.folder);
    formData.append('public_id', uploadData.publicId);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${uploadData.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to upload to Cloudinary: ${errorData.error?.message || response.status}`);
    }

    const result = await response.json();
    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
    };
  }

  async directUploadToCloudinary(file: File, folder: string = 'portfolio'): Promise<{ url: string; secureUrl: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${API_BASE_URL}/upload/direct`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type header for FormData, let browser set it
      },
      credentials: 'include',
      body: formData,
    });

    return this.handleResponse(response);
  }

  async confirmUpload(publicId: string, url: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/upload/confirm`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ publicId, url }),
    });

    await this.handleResponse(response);
  }

  // Combined upload method for easier usage
  async uploadImage(file: File, folder: string = 'portfolio'): Promise<string> {
    try {
      // Option 1: Use direct upload (simpler)
      const result = await this.directUploadToCloudinary(file, folder);

      // Confirm upload
      await this.confirmUpload(result.publicId, result.secureUrl);

      // Return the secure URL
      return result.secureUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Alternative method using signed upload (more secure)
  async uploadImageSigned(file: File, folder: string = 'portfolio'): Promise<string> {
    try {
      // Step 1: Generate upload signature
      const uploadData = await this.generateUploadSignature({
        filename: file.name,
        folder,
      });

      // Step 2: Upload to Cloudinary
      const result = await this.uploadToCloudinary(file, uploadData);

      // Step 3: Confirm upload
      await this.confirmUpload(result.publicId, result.secureUrl);

      // Return the secure URL
      return result.secureUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Users endpoints
  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getPublicProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/public-profile`, {
      // No auth headers needed for public endpoint
      credentials: 'omit',
    });

    return this.handleResponse(response);
  }

  async getPortfolioStats(): Promise<PortfolioStats> {
    const response = await fetch(`${API_BASE_URL}/users/portfolio-stats`, {
      // No auth headers needed for public endpoint
      credentials: 'omit',
    });

    return this.handleResponse(response);
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const response = await fetch(`${API_BASE_URL}/users/site-settings`, {
      // No auth headers needed for public endpoint
      credentials: 'omit',
    });

    return this.handleResponse(response);
  }

  async updateUserProfile(data: UpdateUserProfileData): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async uploadUserAvatar(file: File): Promise<{ user: UserProfile; uploadResult: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/users/profile/avatar`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for multipart/form-data - let browser set it with boundary
        // Only need credentials for auth (sent via cookies)
      },
      credentials: 'include',
      body: formData,
    });

    return this.handleResponse(response);
  }

  async uploadUserCV(file: File): Promise<{ user: UserProfile; uploadResult: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/users/profile/cv`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for multipart/form-data - let browser set it with boundary
        // Only need credentials for auth (sent via cookies)
      },
      credentials: 'include',
      body: formData,
    });

    return this.handleResponse(response);
  }

  async getUserSettings(): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async updateUserSettings(data: UpdateUserSettingsData): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  // About Content Methods
  async getAboutContent(): Promise<AboutContentResponse> {
    const response = await fetch(`${API_BASE_URL}/users/about-content`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
    });

    return this.handleResponse(response);
  }

  async uploadAboutContent(
    contentType: 'heading' | 'subtitle' | 'paragraph1' | 'paragraph2',
    file: File
  ): Promise<UploadAboutContentResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/users/profile/about-content/${contentType}`, {
      method: 'POST',
      headers: {},
      credentials: 'include',
      body: formData,
    });

    return this.handleResponse(response);
  }

  async uploadAboutImage(file: File): Promise<UploadAboutImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/users/profile/about-image`, {
      method: 'POST',
      headers: {},
      credentials: 'include',
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Helper method to create text file from string
  createTextFile(text: string, filename: string): File {
    const blob = new Blob([text], { type: 'text/plain' });
    return new File([blob], filename, { type: 'text/plain' });
  }

  // Notification methods
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }): Promise<{
    success: boolean;
    data: {
      notifications: Notification[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
    if (params?.type) queryParams.append('type', params.type);

    const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Send cookies for authentication
    });

    return this.handleResponse(response);
  }

  async getUnreadNotificationCount(): Promise<{
    success: boolean;
    data: { count: number };
  }> {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Send cookies for authentication
    });

    return this.handleResponse(response);
  }

  async markNotificationAsRead(id: string): Promise<{
    success: boolean;
    data: Notification;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies for authentication
    });

    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead(): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies for authentication
    });

    return this.handleResponse(response);
  }

  async deleteNotification(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Send cookies for authentication
    });

    return this.handleResponse(response);
  }

  async deleteNotifications(ids: string[]): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/notifications/bulk`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies for authentication
      body: JSON.stringify({ ids }),
    });

    return this.handleResponse(response);
  }

  // Payment methods
  async initializePayment(data: PaymentInitializeData): Promise<PaymentInitializeResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getProjectPurchases(projectId?: string): Promise<{
    success: boolean;
    data: {
      purchases: ProjectPurchase[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasMore: boolean;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append('projectId', projectId);

    const response = await fetch(`${API_BASE_URL}/payments/purchases?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async checkProjectAccess(projectId: string, customerEmail: string): Promise<{
    success: boolean;
    data: { hasAccess: boolean; purchase?: ProjectPurchase };
  }> {
    const response = await fetch(`${API_BASE_URL}/payments/access/${projectId}?email=${customerEmail}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse(response);
  }

  // Analytics methods
  async getAnalyticsOverview(
    period: TimePeriod = 'last_30_days',
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsOverview> {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/overview?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getTrafficGrowthChart(
    period: TimePeriod = 'last_30_days',
    groupBy: GroupBy = 'day',
    startDate?: string,
    endDate?: string
  ): Promise<TrafficGrowthData[]> {
    const queryParams = new URLSearchParams({ period, groupBy });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/traffic-growth?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getDeviceBreakdown(
    period: TimePeriod = 'last_30_days',
    startDate?: string,
    endDate?: string
  ): Promise<DeviceBreakdown[]> {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/devices?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getBrowserStats(
    period: TimePeriod = 'last_30_days',
    startDate?: string,
    endDate?: string
  ): Promise<BrowserStats[]> {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/browsers?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getOperatingSystemStats(
    period: TimePeriod = 'last_30_days',
    startDate?: string,
    endDate?: string
  ): Promise<BrowserStats[]> {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/operating-systems?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getTrafficSources(
    period: TimePeriod = 'last_30_days',
    startDate?: string,
    endDate?: string
  ): Promise<TrafficSourceData[]> {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/traffic-sources?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getTopPages(
    period: TimePeriod = 'last_30_days',
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<PagePerformanceData[]> {
    const queryParams = new URLSearchParams({ period, limit: limit.toString() });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/top-pages?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getContactFormSubmissions(
    period: TimePeriod = 'last_30_days',
    startDate?: string,
    endDate?: string
  ): Promise<{ count: number }> {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/contact-submissions?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getProjectEngagement(
    period: TimePeriod = 'last_30_days',
    startDate?: string,
    endDate?: string
  ): Promise<ProjectEngagementData[]> {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/project-engagement?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getMockAnalyticsData(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/analytics/mock-data`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async getComprehensiveAnalytics(
    period: TimePeriod = 'last_30_days',
    startDate?: string,
    endDate?: string
  ): Promise<ComprehensiveAnalytics> {
    const queryParams = new URLSearchParams({ period });
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/comprehensive?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
