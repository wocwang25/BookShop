// src/api/apiClient.js
import axios from 'axios';

// Tạo một instance axios với cấu hình chung
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động đính kèm token vào mỗi request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor để xử lý token hết hạn
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn, xóa token và redirect về login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ===== AUTHENTICATION APIs =====
export const authAPI = {
    // Đăng ký
    register: (userData) => apiClient.post('/auth/register', userData),

    // Đăng nhập
    login: (credentials) => apiClient.post('/auth/login', credentials),

    // Đăng xuất
    logout: () => apiClient.post('/auth/logout'),

    // Lấy thông tin user hiện tại
    getProfile: () => apiClient.get('/auth/me'),

    // Thay đổi mật khẩu
    changePassword: (data) => apiClient.put('/auth/change-password', data)
};

// ===== BOOKS APIs =====
export const booksAPI = {
    // Lấy tất cả sách
    getAllBooks: () => apiClient.get('/books'),

    // Tìm kiếm sách
    searchBooks: (keyword) => apiClient.get(`/books/search?keyword=${encodeURIComponent(keyword)}`),

    // Lấy sách theo ID
    getBookById: (id) => apiClient.get(`/books/${id}`),

    // Tạo sách mới (Admin only)
    createBook: (bookData) => apiClient.post('/books/import', bookData),

    // Cập nhật sách (Admin only)
    updateBook: (id, bookData) => apiClient.put(`/books/${id}`, bookData),

    // Xóa sách (Admin only)
    deleteBook: (id) => apiClient.delete(`/books/${id}`),

    // Import sách từ CSV (Admin only)
    importFromCSV: (formData) => apiClient.post('/books/import-csv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    // Helper function để import từ CSV file trực tiếp
    importBooksFromCSV: (csvFile) => {
        const formData = new FormData();
        formData.append('file', csvFile);
        return apiClient.post('/books/import-csv', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

// ===== IMPORT SLIP APIs =====
export const importAPI = {
    // Lấy toàn bộ phiếu nhập sách
    getAllSlip: () => apiClient.get('/import-slip/'),

    // Import sách đơn lẻ
    importBook: (slipData) => apiClient.post('/import-slip/import', slipData),

    // Import sách từ CSV
    importFromCSV: (formData) => apiClient.post('/import-slip/import-csv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

// ===== CUSTOMER APIs =====
export const customerAPI = {
    // Lấy profile khách hàng
    getProfile: () => apiClient.get('/customer/profile'),

    // Cập nhật profile khách hàng
    updateProfile: (profileData) => apiClient.patch('/customer/profile', profileData)
};

// ===== CART APIs =====
export const cartAPI = {
    // Lấy items trong giỏ hàng
    getCartItems: () => apiClient.get('/cart'),

    // Thêm sách vào giỏ hàng
    addToCart: (cartData) => apiClient.post('/cart', cartData),

    // Xóa sách khỏi giỏ hàng
    removeFromCart: (bookId) => apiClient.delete(`/cart/${bookId}`)
};

// ===== FAVOURITE APIs =====
export const favouriteAPI = {
    // Lấy danh sách yêu thích
    getFavouriteBooks: () => apiClient.get('/favourite'),

    // Thêm sách vào yêu thích
    addToFavourite: (bookId) => apiClient.post(`/favourite/${bookId}`),

    // Xóa sách khỏi yêu thích
    removeFromFavourite: (bookId) => apiClient.patch(`/favourite/${bookId}`)
};

// ===== REVIEWS APIs =====
export const reviewsAPI = {
    // Lấy tất cả review của một sách
    getBookReviews: (bookId) => apiClient.get(`/reviews/${bookId}`),

    // Tạo review mới
    createReview: (bookId, reviewData) => apiClient.post(`/reviews/${bookId}`, reviewData),

    // Cập nhật review
    updateReview: (reviewId, reviewData) => apiClient.patch(`/reviews/${reviewId}`, reviewData),

    // Xóa review
    deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`)
};

// ===== INVOICES APIs =====
export const invoiceAPI = {
    // Tạo hóa đơn bán
    createSalesInvoice: (invoiceData) => apiClient.post('/invoice/sale', invoiceData),

    // Tạo hóa đơn thuê
    createRentalInvoice: (invoiceData) => apiClient.post('/invoice/rent', invoiceData)
};

// ===== PAYMENT APIs =====
export const paymentAPI = {
    // Tạo phiếu thu
    createPaymentReceipt: (paymentData) => apiClient.post('/payment-receipt', paymentData)
};

// ===== REPORTS APIs =====
export const reportsAPI = {
    // Báo cáo tồn kho hàng tháng
    getInventoryReport: () => apiClient.get('/reports/inventory-report'),

    // Báo cáo công nợ hàng tháng
    getDebtReport: () => apiClient.get('/reports/debt-report')
};

// ===== RULES APIs =====
export const rulesAPI = {
    // Lấy tất cả quy định
    getAllRules: () => apiClient.get('/rules'),

    // Lấy quy định theo code
    getRuleByCode: (code) => apiClient.get(`/rules/${code}`),

    // Tạo hoặc cập nhật quy định (Admin only)
    createOrUpdateRule: (ruleData) => apiClient.post('/rules', ruleData),

    // Cập nhật quy định theo code (Admin only)
    updateRuleByCode: (code, ruleData) => apiClient.put(`/rules/${code}`, ruleData),

    // Xóa quy định (Admin only)
    deleteRule: (code) => apiClient.delete(`/rules/${code}`)
};

// Export instance chính
export default apiClient;

// Export tất cả APIs dưới dạng object để dễ import
export const API = {
    auth: authAPI,
    books: booksAPI,
    import: importAPI,
    customer: customerAPI,
    cart: cartAPI,
    favourite: favouriteAPI,
    reviews: reviewsAPI,
    invoice: invoiceAPI,
    payment: paymentAPI,
    reports: reportsAPI,
    rules: rulesAPI
};