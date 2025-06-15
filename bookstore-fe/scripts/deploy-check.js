// scripts/deploy-check.js
// Script để kiểm tra kết nối API

const checkApiConnection = async () => {
    const apiUrl = process.env.VITE_API_URL || 'https://bookstore-backend.onrender.com/api';
    
    console.log('🔍 Checking API connection...');
    console.log('API URL:', apiUrl);
    
    try {
        const response = await fetch(`${apiUrl}/health`);
        if (response.ok) {
            console.log('✅ API connection successful!');
            return true;
        } else {
            console.log('❌ API response not OK:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ API connection failed:', error.message);
        return false;
    }
};

if (require.main === module) {
    checkApiConnection();
}

module.exports = { checkApiConnection }; 