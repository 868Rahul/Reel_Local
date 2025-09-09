// lib/api.ts
export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL;
    if (!this.baseUrl) {
      throw new Error("VITE_API_URL is not defined. Please check your .env files or Vercel env settings.");
    }
    console.log('API Client initialized with Base URL:', this.baseUrl);
  }

  // Generic fetch method with error handling
  private async fetchWithHandler(url: string, options: RequestInit = {}) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore JSON parsing errors
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API Client - Request to ${url} failed:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.fetchWithHandler(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData: any) {
    return this.fetchWithHandler(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getCurrentUser() {
    return this.fetchWithHandler(`${this.baseUrl}/auth/me`);
  }

  // Project methods
  async getAvailableJobs() {
    return this.fetchWithHandler(`${this.baseUrl}/projects/available-jobs`);
  }

  async getEditorProjects() {
    return this.fetchWithHandler(`${this.baseUrl}/projects/editor-projects`);
  }

  async getProject(projectId: string) {
    return this.fetchWithHandler(`${this.baseUrl}/projects/${projectId}`);
  }

  async addCollaborator(projectId: string, userId: string, role: string) {
    return this.fetchWithHandler(`${this.baseUrl}/projects/${projectId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ userId, role })
    });
  }

  async getEditorEarnings() {
    return this.fetchWithHandler(`${this.baseUrl}/projects/editor/earnings`);
  }

  async getEditorReviews(editorId: string) {
    return this.fetchWithHandler(`${this.baseUrl}/projects/editor/${editorId}/reviews`);
  }

  // Notification methods
  async getNotifications() {
    return this.fetchWithHandler(`${this.baseUrl}/notifications`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.fetchWithHandler(`${this.baseUrl}/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  // Upload methods - this needs special handling for FormData
  async uploadFinalVideo(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/upload/final/${projectId}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Deliver project method
  async deliverProject(projectId: string) {
    return this.fetchWithHandler(`${this.baseUrl}/projects/${projectId}/deliver`, {
      method: 'PATCH'
    });
  }
}

export const apiClient = new ApiClient();