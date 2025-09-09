// src/api/api.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

console.log('API_BASE_URL:', API_BASE_URL);

// ---------- Types ----------
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'editor' | 'business' | 'admin';
  profilePicture?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  owner: User;
  status: 'draft' | 'in-progress' | 'review' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  // ... add other fields if needed
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}

// ---------- API Client ----------
export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (!this.baseUrl) {
      throw new Error(
        'API_BASE_URL is not defined. Please check your .env or Vercel env settings.'
      );
    }
    console.log('ApiClient initialized with baseUrl:', this.baseUrl);
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ---------- Auth ----------
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(res);
  }

  async register(name: string, email: string, password: string, role?: string) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async getMe(): Promise<User> {
    const res = await fetch(`${this.baseUrl}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  // ---------- Projects ----------
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${this.baseUrl}/projects`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${this.baseUrl}/projects/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  async createProject(data: any) {
    const res = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  // ---------- Editor ----------
  async getAvailableJobs() {
    const res = await fetch(`${this.baseUrl}/projects/available-jobs`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  async getEditorProjects() {
    const res = await fetch(`${this.baseUrl}/projects/editor-projects`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  async getEditorEarnings() {
    const res = await fetch(`${this.baseUrl}/projects/editor/earnings`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  async getEditorReviews(editorId: string) {
    const res = await fetch(`${this.baseUrl}/projects/editor/${editorId}/reviews`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  // ---------- Notifications ----------
  async getNotifications() {
    const res = await fetch(`${this.baseUrl}/notifications`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  async markNotificationAsRead(notificationId: string) {
    const res = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  // ---------- Project Management ----------
  async addCollaborator(projectId: string, userId: string, role: string) {
    const res = await fetch(`${this.baseUrl}/projects/${projectId}/collaborators`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, role }),
    });
    return this.handleResponse(res);
  }

  async uploadFinalVideo(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${this.baseUrl}/upload/final/${projectId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    return this.handleResponse(res);
  }

  async deliverProject(projectId: string) {
    const res = await fetch(`${this.baseUrl}/projects/${projectId}/deliver`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  async updateProject(projectId: string, data: any) {
    const res = await fetch(`${this.baseUrl}/projects/${projectId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async uploadVideo(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('video', file);
    
    const res = await fetch(`${this.baseUrl}/upload/video/${projectId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    });
    return this.handleResponse(res);
  }

  async uploadThumbnail(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const res = await fetch(`${this.baseUrl}/upload/thumbnail/${projectId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    });
    return this.handleResponse(res);
  }
}

export const apiClient = new ApiClient();

// ---------- Standalone Fetch Helpers ----------
export async function getTestimonials() {
  const res = await fetch(`${API_BASE_URL}/testimonials`);
  if (!res.ok) throw new Error('Failed to fetch testimonials');
  return res.json();
}

export async function getTemplates() {
  const res = await fetch(`${API_BASE_URL}/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE_URL}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
