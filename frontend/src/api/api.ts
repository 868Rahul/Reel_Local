export class ApiClient {
  private baseUrl: string;

constructor() {
  this.baseUrl = import.meta.env.VITE_API_URL;
  if (!this.baseUrl) {
    throw new Error("VITE_API_URL is not defined. Please check your .env files or Vercel env settings.");
  }
  console.log('API Client initialized with Base URL:', this.baseUrl);
}

  async login(email: string, password: string) {
    try {
      console.log('API Client - Attempting login with URL:', `${this.baseUrl}/auth/login`);
      console.log('API Client - Email:', email);
      console.log('API Client - Password length:', password.length);

      // First test if the server is reachable
      await this.testServerConnection();

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      console.log('API Client - Response status:', response.status);
      console.log('API Client - Response headers:', Array.from(response.headers.entries()));

      // Handle non-2xx responses
      if (!response.ok) {
        let errorData;
        try {
          // Try to parse error response as JSON
          errorData = await response.json();
        } catch (parseError) {
          // If response is not JSON, create a generic error
          errorData = { 
            message: `HTTP error! status: ${response.status} ${response.statusText}`,
            status: response.status
          };
        }
        
        const errorMessage = errorData.message || `Login failed with status: ${response.status}`;
        console.error('API Client - Login failed:', errorMessage);
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = await response.json();
      console.log('API Client - Login successful:', data);
      return data;

    } catch (error) {
      console.error('API Client - Login error:', error);
      
      // Enhance error message for network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Cannot connect to the server. Please check your internet connection and ensure the backend is running.');
      }
      
      throw error;
    }
  }

  // Test if server is reachable
  private async testServerConnection(): Promise<void> {
    try {
      console.log('Testing server connection...');
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Server connection test - Status:', response.status);
      
      if (!response.ok) {
        console.warn('Server responded but with non-200 status:', response.status);
      } else {
        const data = await response.text();
        console.log('Server response:', data.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error('Server connection test failed:', error);
      throw new Error(`Cannot connect to server at ${this.baseUrl}. Please ensure the backend is running and accessible.`);
    }
  }

  // Test specific auth endpoint
  async testAuthEndpoint(): Promise<void> {
    try {
      console.log('Testing auth endpoint...');
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'OPTIONS', // Use OPTIONS to test CORS and endpoint existence
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Auth endpoint test - Status:', response.status);
      console.log('Auth endpoint test - Headers:', Array.from(response.headers.entries()));
      
    } catch (error) {
      console.error('Auth endpoint test failed:', error);
      throw new Error(`Auth endpoint not accessible at ${this.baseUrl}/auth/login`);
    }
  }

  // Additional utility method for better error handling
  private async handleResponse(response: Response) {
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
  }

  // You can add other API methods following the same pattern
  async register(userData: any) {
    return this.fetchWithHandler(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
  }

  // Generic fetch method with error handling
  private async fetchWithHandler(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error(`API Client - Request to ${url} failed:`, error);
      throw error;
    }
  }
}