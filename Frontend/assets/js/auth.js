// Authentication utility functions
class AuthManager {
    static TOKEN_KEY = 'authToken';
    static USER_KEY = 'userData';
    static REMEMBER_KEY = 'rememberLogin';

    // Kiểm tra xem user đã đăng nhập chưa
    static isAuthenticated() {
        const token = this.getToken();
        
        if (!token || token.trim() === '') {
            return false;
        }
        
        try {
            // Kiểm tra format của JWT token
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                this.logout();
                return false;
            }
            
            // Decode JWT token để kiểm tra expiry
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Date.now() / 1000;
            
            if (payload.exp && payload.exp < currentTime) {
                this.logout();
                return false;
            }
            
            // Kiểm tra xem có thông tin user không
            const user = this.getUser();
            if (!user) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking token:', error);
            this.logout();
            return false;
        }
    }

    // Lấy token
    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    }

    // Lấy thông tin user
    static getUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    // Lưu thông tin đăng nhập
    static saveAuth(token, user, remember = false) {
        if (remember) {
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            localStorage.setItem(this.REMEMBER_KEY, 'true');
        } else {
            sessionStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            localStorage.removeItem(this.REMEMBER_KEY);
        }
        
        // Trigger auth state change event
        this.triggerAuthStateChange('login', user);
    }

    // Đăng xuất
    static logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.REMEMBER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        
        // Gọi API logout nếu cần
        try {
            ApiService.logout().catch(err => console.error('Logout API error:', err));
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Trigger auth state change event
        this.triggerAuthStateChange('logout');
    }

    // Redirect dựa vào role
    static redirectByRole(user) {

            window.location.href = '/';

    }

    // Bảo vệ trang cần authentication
    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    // Cập nhật header với token cho các request
    static getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
    
    // Trigger auth state change event
    static triggerAuthStateChange(type, user = null) {
        console.log(`🔄 Auth state changed: ${type}`, user);
        
        // Dispatch custom event
        const event = new CustomEvent('authStateChanged', {
            detail: { type, user }
        });
        window.dispatchEvent(event);
        
        // Also update header if function is available
        if (typeof window.updateHeaderAuthState === 'function') {
            setTimeout(() => {
                window.updateHeaderAuthState();
            }, 10);
        }
    }
}

// Export để sử dụng ở các file khác
window.AuthManager = AuthManager; 