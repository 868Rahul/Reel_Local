export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log('API_BASE_URL:', API_BASE_URL);

// Types
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
  collaborators: Array<{
    user: User;
    role: 'viewer' | 'editor' | 'admin';
    addedAt: string;
  }>;
  videoFile?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedAt: string;
  };
  finalVideoFile?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedAt: string;
  };
  thumbnailFile?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedAt: string;
  };
  status: 'draft' | 'in-progress' | 'review' | 'completed' | 'archived';
  tags: string[];
  category: 'marketing' | 'educational' | 'entertainment' | 'corporate' | 'personal' | 'other';
  isPublic: boolean;
  views: number;
  likes: Array<{
    user: string;
    likedAt: string;
  }>;
  comments: Array<{
    _id: string;
    user: User;
    text: string;
    timestamp: string;
    replies: Array<{
      _id: string;
      user: User;
      text: string;
      timestamp: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
  reeditRequests?: Array<{
    requestedBy: string;
    reason?: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  reviews?: Array<{
    user: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }>;
  totalPrice?: number;
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

export class ApiClient {
  private baseUrl: string;
  
  constructor() {
    // Use the environment variable or default to relative path in production
    this.baseUrl = import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
    
    console.log('API Client initialized with baseUrl:', this.baseUrl);
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
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

  // Auth API
  async login(email: string, password: string): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/login`;
    console.log('API Client - Attempting to login with URL:', url);
    console.log('API Client - Email:', email);
    console.log('API Client - Password length:', password.length);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('API Client - Response status:', response.status);
    console.log('API Client - Response headers:', [...response.headers.entries()]);
    
    return this.handleResponse<AuthResponse>(response);
  }

  async register(name: string, email: string, password: string, role?: string): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/register`;
    console.log('API Client - Attempting to register with URL:', url);
    console.log('API Client - Base URL:', this.baseUrl);
    console.log('API Client - Environment variable VITE_API_URL:', import.meta.env.VITE_API_URL);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async getMe(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  async updateProfile(name: string, email: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, email }),
    });
    return this.handleResponse<User>(response);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Projects API
  async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{
    projects: Project[];
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${this.baseUrl}/projects?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Project>(response);
  }

  async createProject(data: {
    title: string;
    description: string;
    category?: string;
    tags?: string;
    isPublic?: boolean;
    shopDetails?: any;
    addons?: any;
    editor?: string;
    files?: File[];
  }): Promise<Project> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.tags) formData.append('tags', data.tags);
    if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));
    if (data.shopDetails) formData.append('shopDetails', JSON.stringify(data.shopDetails));
    if (data.addons) formData.append('addons', JSON.stringify(data.addons));
    if (data.editor) formData.append('editor', data.editor);
    if (data.files && data.files.length > 0) {
      data.files.forEach(file => formData.append('files', file));
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Do NOT set Content-Type! Let browser set it for FormData
      },
      body: formData,
    });
    return this.handleResponse<Project>(response);
  }

  async updateProject(id: string, data: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string;
    isPublic?: boolean;
    status?: string;
  }): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Project>(response);
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async addCollaborator(projectId: string, userId: string, role?: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/collaborators`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, role }),
    });
    return this.handleResponse<Project>(response);
  }

  async addComment(projectId: string, text: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return this.handleResponse<Project>(response);
  }

  // Upload API
  async uploadVideo(projectId: string, file: File): Promise<{ message: string; videoFile: any }> {
    const formData = new FormData();
    formData.append('video', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/upload/video/${projectId}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async uploadThumbnail(projectId: string, file: File): Promise<{ message: string; thumbnailFile: any }> {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/upload/thumbnail/${projectId}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async deleteVideo(projectId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/upload/video/${projectId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async uploadFinalVideo(projectId: string, file: File): Promise<{ message: string; finalVideoFile: any }> {
    const formData = new FormData();
    formData.append('video', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/upload/final/${projectId}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async uploadRawFiles(projectId: string, files: File[]): Promise<{ message: string; rawFiles: any[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/upload/raw/${projectId}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Users API
  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/users/search?q=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<User[]>(response);
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return this.handleResponse(response);
  }

  async getNotifications(): Promise<{ notifications: any[] }> {
    const response = await fetch(`${this.baseUrl}/notifications`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async uploadProfilePicture(file: File): Promise<{ profilePicture: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/users/profile-picture`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;

// Fetch testimonials
export async function getTestimonials() {
  const response = await fetch(`${API_BASE_URL}/testimonials`);
  if (!response.ok) throw new Error('Failed to fetch testimonials');
  return response.json();
}

// Fetch templates
export async function getTemplates() {
  const response = await fetch(`${API_BASE_URL}/templates`);
  if (!response.ok) throw new Error('Failed to fetch templates');
  return response.json();
}

// Fetch stats
export async function getStats() {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function getAvailableJobs() {
  const response = await fetch(`${API_BASE_URL}/projects/available-jobs`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch available jobs');
  return response.json();
}

export async function getEditorProjects() {
  const response = await fetch(`${API_BASE_URL}/projects/editor-projects`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch editor projects');
  return response.json();
}
