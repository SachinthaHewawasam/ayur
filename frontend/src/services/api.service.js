import axios from 'axios';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupRateLimiting();
  }

  setupInterceptors() {
    // Request interceptor for auth and rate limiting
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request ID for deduplication
        config.headers['X-Request-ID'] = Math.random().toString(36).substr(2, 9);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for rate limiting and retry
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config, response } = error;
        
        // Handle 429 Too Many Requests
        if (response?.status === 429) {
          const retryAfter = response.headers['retry-after'] || 1;
          const delay = parseInt(retryAfter) * 1000;
          
          console.warn(`Rate limited, retrying after ${delay}ms`);
          
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(this.client(config));
            }, delay);
          });
        }
        
        // Handle 401 unauthorized
        if (response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  setupRateLimiting() {
    // Request queue for rate limiting
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.maxConcurrent = 3;
    this.currentRequests = 0;
  }

  async processQueue() {
    if (this.isProcessingQueue || this.currentRequests >= this.maxConcurrent) {
      return;
    }

    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0 && this.currentRequests < this.maxConcurrent) {
      const { config, resolve, reject } = this.requestQueue.shift();
      this.currentRequests++;
      
      try {
        const response = await this.client(config);
        resolve(response);
      } catch (error) {
        reject(error);
      } finally {
        this.currentRequests--;
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Enhanced retry logic
  async requestWithRetry(config, maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await this.client(config);
      } catch (error) {
        if (error.response?.status === 429 && retries < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, retries), 10000);
          console.warn(`Retry ${retries + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          throw error;
        }
      }
    }
  }

  // Generic CRUD methods
  async get(endpoint, params = {}) {
    const response = await this.client.get(endpoint, { params });
    return response.data;
  }

  async post(endpoint, data) {
    const response = await this.client.post(endpoint, data);
    return response.data;
  }

  async put(endpoint, data) {
    const response = await this.client.put(endpoint, data);
    return response.data;
  }

  async patch(endpoint, data) {
    const response = await this.client.patch(endpoint, data);
    return response.data;
  }

  async delete(endpoint) {
    const response = await this.client.delete(endpoint);
    return response.data;
  }

  // File upload
  async upload(endpoint, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });

    return response.data;
  }
}

export default new ApiService();
