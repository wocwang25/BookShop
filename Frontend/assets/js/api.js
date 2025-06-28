// API Service for frontend
const API_BASE_URL = window.location.origin + '/api';

class ApiService {
    // Debounce mechanism to prevent multiple calls
    static _pendingOperations = new Set();

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        // Tự động thêm Authorization header nếu có token
        const authHeaders = window.AuthManager ? AuthManager.getAuthHeaders() : {};

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            // Kiểm tra nếu response không thành công
            if (!response.ok) {
                // Thử parse JSON để lấy error message
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                } catch (e) {
                    // Nếu không parse được JSON, dùng status text
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Books API
    static async getAllBooks(limit = 0, sort = '-createdAt') {
        try {
            const queryParams = new URLSearchParams();
            if (limit > 0) queryParams.append('limit', limit);
            if (sort) queryParams.append('sort', sort);

            const endpoint = `/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await this.request(endpoint);

            // Đảm bảo response có định dạng phù hợp
            return {
                success: true,
                books: response.books || [],
                total: response.books ? response.books.length : 0
            };
        } catch (error) {
            console.error('Error in getAllBooks:', error);
            return {
                success: false,
                books: [],
                total: 0,
                error: error.message
            };
        }
    }

    static async getBookById(id) {
        try {
            if (!id) {
                throw new Error('Book ID is required');
            }

            const response = await this.request(`/books/${id}`);
            // Kiểm tra định dạng response từ backend
            if (response.success && response.book) {
                return response;
            } else if (response.book) {
                // Nếu backend không trả về success flag
                return {
                    success: true,
                    book: response.book
                };
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error in getBookById:', error);
            return {
                success: false,
                book: null,
                error: error.message
            };
        }
    }

    static async searchBooks(keyword) {
        try {
            const queryParams = new URLSearchParams();
            if (keyword) queryParams.append('keyword', keyword);

            const response = await this.request(`/books/search?${queryParams.toString()}`);
            // Đảm bảo response có định dạng phù hợp
            return {
                success: true,
                books: response.books || [],
                total: response.total || 0
            };
        } catch (error) {
            console.error('Error in searchBooks:', error);
            return {
                success: false,
                books: [],
                total: 0,
                error: error.message
            };
        }
    }

    // Cart API
    static async addToCart(bookId, quantity = 1, type = 'buy') {
        const operationKey = `addToCart-${bookId}`;

        // Prevent duplicate operations
        if (this._pendingOperations.has(operationKey)) {
            return { success: false, message: 'Operation already in progress' };
        }

        try {
            this._pendingOperations.add(operationKey);

            const result = await this.request('/cart', {
                method: 'POST',
                body: JSON.stringify({
                    bookId,
                    quantity,
                    type
                })
            });

            return result;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        } finally {
            this._pendingOperations.delete(operationKey);
        }
    }

    static async getCart() {
        try {
            return await this.request('/cart');
        } catch (error) {
            console.error('Error getting cart:', error);
            throw error;
        }
    }

    static async updateCartItem(bookId, quantity, type = 'buy') {
        try {
            return await this.request('/cart', {
                method: 'PUT',
                body: JSON.stringify({
                    bookId,
                    quantity,
                    type
                })
            });
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        }
    }

    static async removeCartItem(bookId) {
        try {
            return await this.request(`/cart/${bookId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error removing cart item:', error);
            throw error;
        }
    }

    // Sales Invoice API
    static async createSalesInvoice(customerName, items) {
        try {
            // Validate input
            if (!customerName || customerName.trim() === '') {
                throw new Error('Customer name is required');
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new Error('Items array is required and cannot be empty');
            }

            // Validate each item
            for (const item of items) {
                if (!item.title || !item.quantity) {
                    console.error('❌ Invalid item:', item);
                    throw new Error('Each item must have title and quantity');
                }
            }

            const requestData = {
                customer_name: customerName,
                items: items
            };


            // Check if user is authenticated
            if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
                throw new Error('User not authenticated. Please login first.');
            }

            const token = window.AuthManager.getToken();

            return await this.request('/invoice/sale', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
        } catch (error) {
            console.error('❌ [API] Error creating sales invoice:', error);
            throw error;
        }
    }

    // Favourite API
    static async addToFavourites(bookId) {
        const operationKey = `addToFav-${bookId}`;

        // Prevent duplicate operations
        if (this._pendingOperations.has(operationKey)) {
            return { success: false, message: 'Operation already in progress' };
        }

        try {
            this._pendingOperations.add(operationKey);

            const result = await this.request(`/favourite/${bookId}`, {
                method: 'POST'
            });

            return result;
        } catch (error) {
            console.error('❌ [API] Error adding to favourite:', error);
            throw error;
        } finally {
            this._pendingOperations.delete(operationKey);
        }
    }

    static async removeFromFavourites(bookId) {
        const operationKey = `removeFav-${bookId}`;

        // Prevent duplicate operations
        if (this._pendingOperations.has(operationKey)) {
            return { success: false, message: 'Operation already in progress' };
        }

        try {
            this._pendingOperations.add(operationKey);

            const result = await this.request(`/favourite/${bookId}`, {
                method: 'PATCH'
            });

            return result;
        } catch (error) {
            console.error('❌ [API] Error removing from favourites:', error);
            throw error;
        } finally {
            this._pendingOperations.delete(operationKey);
        }
    }

    static async getFavourites() {
        try {
            return await this.request('/favourite');
        } catch (error) {
            console.error('Error getting favourites:', error);
            throw error;
        }
    }

    // Reviews API
    static async getReviews(bookId) {
        try {
            if (!bookId) {
                throw new Error('Book ID is required for getting reviews');
            }
            return await this.request(`/reviews/${bookId}`);
        } catch (error) {
            console.error('Error getting reviews:', error);
            throw error;
        }
    }

    static async addReview(bookId, rating, comment) {
        try {
            return await this.request(`/reviews/${bookId}`, {
                method: 'POST',
                body: JSON.stringify({
                    rating,
                    comment,
                    content: comment  // Send both field names for compatibility
                })
            });
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }

    static async updateReview(reviewId, rating, comment) {
        try {
            return await this.request(`/reviews/${reviewId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    rating,
                    comment,
                    content: comment  // Send both field names for compatibility
                })
            });
        } catch (error) {
            console.error('Error updating review:', error);
            throw error;
        }
    }

    static async deleteReview(reviewId) {
        try {
            return await this.request(`/reviews/${reviewId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }

    // Stats API (if available)
    static async getStats() {
        try {
            return await this.request('/reports/stats');
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }

    // Category API
    static async getAllCategory() {
        try {
            const response = await this.request('/category');

            // Đảm bảo response có định dạng phù hợp
            return {
                success: true,
                categories: Array.isArray(response) ? response : (response.categories || [])
            };
        } catch (error) {
            console.error('Error getting Category:', error);
            return {
                success: false,
                categories: [],
                error: error.message
            };
        }
    }

    static async getCategoryById(id) {
        try {
            return await this.request(`/category/${id}`)
        } catch (error) {
            throw error;
        }
    }

    // Customer API
    static async getMyInvoices() {
        try {

            // Check if user is authenticated
            if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
                throw new Error('User not authenticated. Please login first.');
            }

            const response = await this.request('/customer/profile');

            // Extract invoices from profile
            const user = response.user;
            const customerProfile = user?.customerProfile;

            if (!customerProfile) {
                console.warn('⚠️ No customer profile found');
                return {
                    success: true,
                    salesInvoices: [],
                    rentalInvoices: [],
                    total: 0
                };
            }

            const salesInvoices = customerProfile.salesInvoices || [];
            const rentalInvoices = customerProfile.rentalInvoices || [];


            return {
                success: true,
                salesInvoices,
                rentalInvoices,
                total: salesInvoices.length + rentalInvoices.length
            };
        } catch (error) {
            console.error('❌ [API] Error getting my invoices:', error);
            return {
                success: false,
                salesInvoices: [],
                rentalInvoices: [],
                total: 0,
                error: error.message
            };
        }
    }

    // Auth API
    static async login(identifier, password) {
        try {
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    identifier,
                    password
                })
            });

            // Lưu token nếu có
            if (response.token && window.AuthManager) {
                if (response.user) {
                    // Full auth save with user data
                    AuthManager.saveAuth(response.token, response.user, false);
                } else {
                    // Fallback for token-only responses
                    console.warn('⚠️ Login response missing user data, using setToken fallback');
                    AuthManager.setToken(response.token);
                }
            }

            return response;
        } catch (error) {
            console.error('Error in login:', error);
            throw error;
        }
    }

    static async register(name, username, email, password) {
        try {
            return await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    username,
                    email,
                    password
                })
            });
        } catch (error) {
            console.error('Error in register:', error);
            throw error;
        }
    }

    static async logout() {
        try {
            const response = await this.request('/auth/logout', {
                method: 'POST'
            });

            // Clear token
            if (window.AuthManager) {
                AuthManager.logout();
            }

            return response;
        } catch (error) {
            console.error('Error in logout:', error);
            throw error;
        }
    }

    static async getProfile() {
        try {
            return await this.request('/auth/me');
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    static async updateProfile(profileData) {
        try {
            return await this.request('/customer/profile', {
                method: 'PATCH',
                body: JSON.stringify(profileData)
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    static async changePassword(currentPassword, newPassword) {
        try {
            return await this.request('/auth/change-password', {
                method: 'PUT',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }
}

// Export for use in other files
window.ApiService = ApiService;
