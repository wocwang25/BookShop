// src/api/apiClient.js
import axios from 'axios';

// Tự động chọn base URL dựa trên environment
const getBaseURL = () => {
    // Nếu đang ở production (deployed), sử dụng backend URL trên Render
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_API_URL || 'https://bookshop-backend-tfzk.onrender.com/api';
    }
    // Nếu đang development, sử dụng localhost
    return 'http://localhost:5000/api';
};

// Tạo một instance axios với cấu hình chung
const apiClient = axios.create({
    baseURL: getBaseURL(),
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
            // Chỉ xóa token, không redirect trực tiếp
            // Để AuthContext xử lý logic logout
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                localStorage.removeItem('token');
                // Không dùng window.location.href để tránh conflict với React Router
                // AuthContext sẽ tự động phát hiện token bị xóa và xử lý
            }
        }
        return Promise.reject(error);
    }
);

//             =================== START ADMIN RELATED API ===================
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

// ===== USER MANAGEMENT APIs (Admin only) =====
export const userAPI = {
    // Lấy tất cả users (Admin only)
    getAllUsers: () => apiClient.get('/auth/users'),

    // Tìm kiếm users (Admin only)
    searchUsers: (keyword) => apiClient.get(`/auth/users/search?keyword=${encodeURIComponent(keyword)}`),

    // Tạo user mới (Admin only)
    createUser: (userData) => apiClient.post('/auth/users', userData),

    // Cập nhật user (Admin only)
    updateUser: (id, userData) => apiClient.put(`/auth/users/${id}`, userData),

    // Xóa user (Admin only)
    deleteUser: (id) => apiClient.delete(`/auth/users/${id}`)
};

// ===== BOOKS APIs =====
export const booksAPI = {
    // Lấy tất cả sách
    getAllBooks: (config = {}) => apiClient.get('/books', config),

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
//             =================== END ADMIN RELATED API ===================

//             =================== START CUSTOMER RELATED API ===================
// ===== CUSTOMER APIs =====
export const customerAPI = {
    // Lấy profile khách hàng
    getProfile: () => apiClient.get('/customer/profile'),

    // Lấy profile khách hàng
    getCustomerById: (customerId) => apiClient.get(`/customer/${customerId}`),

    // Cập nhật profile khách hàng
    updateProfile: (profileData) => apiClient.patch('/customer/profile', profileData),

    // Lấy tất cả khách hàng (Staff/Admin only)
    getAllCustomers: () => apiClient.get('/customer')
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

//              =================== END CUSTOMER RELATED API ===================

//              =================== START STAFF RELATED API ===================
// ===== IMPORT SLIP APIs =====
export const importAPI = {
    // Lấy toàn bộ phiếu nhập sách trong tháng: data: {totals, slips}
    getAllSlip: ({ month, year }) => apiClient.get('/import-slip/', { params: { month, year } }),

    // Import sách đơn lẻ
    importBook: (slipData) => apiClient.post('/import-slip/import', slipData),

    // Import sách từ CSV
    importFromCSV: (formData) => apiClient.post('/import-slip/import-csv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

// ===== INVOICES APIs =====
export const invoiceAPI = {
    // Tạo/Lấy hóa đơn bán: data: {totalAmount, invoices}
    getSalesInvoice: ({ month, year }) => apiClient.get('/invoice/sale', { params: { month, year } }),
    createSalesInvoice: (invoiceData) => apiClient.post('/invoice/sale', invoiceData),

    // Tạo/Lấy hóa đơn thuê: data: {totalAmount, invoices}
    getRentalInvoice: ({ month, year }) => apiClient.get('/invoice/rent', { params: { month, year } }),
    createRentalInvoice: (invoiceData) => apiClient.post('/invoice/rent', invoiceData)
};

// ===== PAYMENT APIs =====
export const paymentAPI = {
    // Tạo phiếu thu
    getAllPaymentReceipt: ({ month, year }) => apiClient.get('/payment-receipt', { params: { month, year } }),
    createPaymentReceipt: (paymentData) => apiClient.post('/payment-receipt', paymentData)
};

// ===== REPORTS APIs =====
export const reportsAPI = {
    // Báo cáo tồn kho hàng tháng
    getInventoryReport: ({ month, year }) => apiClient.get('/reports/inventory-report', { params: { month, year } }),

    // Báo cáo công nợ hàng tháng
    getDebtReport: ({ month, year }) => apiClient.get('/reports/debt-report', { params: { month, year } }),
};

// ===== CATEGORIES APIs =====
export const categoriesAPI = {
    // Lấy tất cả thể loại
    getAllCategories: () => apiClient.get('/category'),

    // Lấy thể loại theo ID
    getCategoryById: (id) => apiClient.get(`/category/${id}`),

    // Tạo thể loại mới (Admin only)
    createCategory: (categoryData) => apiClient.post('/category', categoryData),

    // Xóa thể loại (Admin only)
    deleteCategory: (id) => apiClient.delete(`/category/${id}`)
};

//           =================== END STAFF RELATED API ===================

// Export instance chính
export default apiClient;

// Export tất cả APIs dưới dạng object để dễ import
export const API = {
    auth: authAPI,
    books: booksAPI,
    categories: categoriesAPI,
    import: importAPI,
    customer: customerAPI,
    cart: cartAPI,
    favourite: favouriteAPI,
    reviews: reviewsAPI,
    invoice: invoiceAPI,
    payment: paymentAPI,
    reports: reportsAPI,
    rules: rulesAPI,
    user: userAPI
};