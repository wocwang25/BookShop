// Utility to clear authentication data
function clearAllAuthData() {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberLogin');

    // Clear sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
}

// Clear on load if there's any corrupted data
document.addEventListener('DOMContentLoaded', function () {
    // Check for corrupted token
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        try {
            // Try to parse token
            const parts = token.split('.');
            if (parts.length !== 3) {
                clearAllAuthData();
            } else {
                const payload = JSON.parse(atob(parts[1]));
                const currentTime = Date.now() / 1000;
                if (payload.exp && payload.exp < currentTime) {
                    clearAllAuthData();
                }
            }
        } catch (error) {
            clearAllAuthData();
        }
    }
});

// Export function
window.clearAllAuthData = clearAllAuthData;