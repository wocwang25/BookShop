// API Service for frontend
const API_BASE_URL = window.location.origin + '/api';

class ApiService {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Books API
    static async getAllBooks(limit = 0, sort = '-createdAt') {
        const queryParams = new URLSearchParams();
        if (limit > 0) queryParams.append('limit', limit);
        if (sort) queryParams.append('sort', sort);

        const endpoint = `/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.request(endpoint);
    }

    static async getBookById(id) {
        return this.request(`/books/${id}`);
    }

    static async searchBooks(keyword) {
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.append('keyword', keyword);

        return this.request(`/books/search?${queryParams.toString()}`);
    }

    // Reviews API (if needed)
    static async getReviews() {
        return this.request('/reviews');
    }

    // Stats API (if available)
    static async getStats() {
        return this.request('/reports/stats');
    }
}

// Export for use in other files
window.ApiService = ApiService;

// Example: getBooks().then(data => console.log(data));
