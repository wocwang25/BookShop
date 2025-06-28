document.addEventListener('DOMContentLoaded', function () {
    // Kiểm tra nếu user đã đăng nhập thì redirect
    try {
        if (typeof AuthManager !== 'undefined' && AuthManager.isAuthenticated()) {
            const user = AuthManager.getUser();
            if (user) {
                AuthManager.redirectByRole(user);
                return;
            }
        }
    } catch (error) {
        // Continue to show login page if there's any error
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const toggleToRegister = document.getElementById('toggle-to-register');
    const toggleToLogin = document.getElementById('toggle-to-login');

    // Hiệu ứng chuyển đổi
    function showForm(formToShow, formToHide, toggleShow, toggleHide) {
        formToHide.classList.add('opacity-0');
        setTimeout(() => {
            formToHide.classList.add('hidden');
            formToShow.classList.remove('hidden');
            setTimeout(() => {
                formToShow.classList.remove('opacity-0');
            }, 10);
        }, 300);
        toggleShow.classList.remove('hidden');
        toggleHide.classList.add('hidden');
    }

    // Hiển thị thông báo
    function showMessage(message, type = 'error') {
        // Xóa thông báo cũ nếu có
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message p-3 rounded-md mb-4 ${type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`;
        messageDiv.textContent = message;

        // Thêm vào form hiện tại
        const currentForm = document.querySelector('#login-form:not(.hidden)') || document.querySelector('#register-form:not(.hidden)');
        if (currentForm) {
            currentForm.insertBefore(messageDiv, currentForm.firstChild);
        }

        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Khởi tạo opacity cho hiệu ứng
    loginForm.classList.remove('hidden');
    loginForm.classList.remove('opacity-0');
    registerForm.classList.add('opacity-0');

    // Kiểm tra nếu URL là /register thì mở form đăng ký
    const currentPath = window.location.pathname;
    if (currentPath === '/register') {
        // Mở form đăng ký ngay lập tức
        setTimeout(() => {
            showForm(registerForm, loginForm, toggleToLogin, toggleToRegister);
        }, 100);
    }

    showRegister.addEventListener('click', function (e) {
        e.preventDefault();
        showForm(registerForm, loginForm, toggleToLogin, toggleToRegister);
    });

    showLogin.addEventListener('click', function (e) {
        e.preventDefault();
        showForm(loginForm, registerForm, toggleToRegister, toggleToLogin);
    });

    // Xử lý đăng nhập
    const loginButton = loginForm.querySelector('button[type="button"]:not(.social-btn)') ||
        Array.from(loginForm.querySelectorAll('button[type="button"]')).find(btn =>
            btn.textContent.includes('Đăng nhập') && !btn.classList.contains('social-btn'));

    if (loginButton) {
        loginButton.addEventListener('click', async function (e) {
            e.preventDefault();

            const identifier = document.getElementById('identifier').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            // Validation
            if (!identifier || !password) {
                showMessage('Vui lòng nhập đầy đủ thông tin đăng nhập');
                return;
            }

            // Disable button và hiển thị loading
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Đang đăng nhập...';

            try {
                const response = await ApiService.login(identifier, password);

                if (response.success) {
                    // Lưu token và thông tin user
                    AuthManager.saveAuth(response.token, response.user, remember);

                    showMessage('Đăng nhập thành công! Đang chuyển hướng...', 'success');

                    // Force update header if function is available
                    if (typeof window.updateHeaderAuthState === 'function') {
                        setTimeout(() => {
                            window.updateHeaderAuthState();
                        }, 100);
                    }

                    // Chuyển hướng dựa vào role
                    setTimeout(() => {
                        AuthManager.redirectByRole(response.user);
                    }, 1500);
                }
            } catch (error) {
                showMessage(error.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
            } finally {
                // Restore button
                loginButton.disabled = false;
                loginButton.innerHTML = 'Đăng nhập';
            }
        });
    }

    // Xử lý đăng ký với event delegation
    document.addEventListener('click', async function (e) {
        const target = e.target;

        // Kiểm tra xem có phải là register button không
        if (target.tagName === 'BUTTON' &&
            target.type === 'button' &&
            target.innerText.trim().startsWith('Đăng ký') &&
            !target.classList.contains('social-btn') &&
            registerForm && registerForm.contains(target)) {

            e.preventDefault();

            const email = document.getElementById('reg-email').value.trim();
            const name = document.getElementById('reg-name').value.trim();
            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm').value;

            // Validation
            if (!email || !name || !username || !password || !confirmPassword) {
                showMessage('Vui lòng điền đầy đủ thông tin');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Mật khẩu xác nhận không khớp');
                return;
            }

            if (password.length < 6) {
                showMessage('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Email không hợp lệ');
                return;
            }

            // Disable button và hiển thị loading
            target.disabled = true;
            target.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Đang đăng ký...';

            try {
                // // Tạo username từ email (lấy phần trước @)
                // const username = email.split('@')[0];

                const response = await ApiService.register(name, username, email, password);

                if (response.success) {
                    showMessage('Đăng ký thành công! Bạn đã được tự động đăng nhập.', 'success');

                    // Lưu token và thông tin user
                    AuthManager.saveAuth(response.token, response.user, false);

                    // Force update header if function is available
                    if (typeof window.updateHeaderAuthState === 'function') {
                        setTimeout(() => {
                            window.updateHeaderAuthState();
                        }, 100);
                    }

                    // Chuyển về trang chủ sau 2 giây
                    setTimeout(() => {
                        AuthManager.redirectByRole(response.user);
                    }, 2000);
                }
            } catch (error) {
                showMessage(error.message || 'Đăng ký không thành công. Vui lòng thử lại.');
            } finally {
                // Restore button
                target.disabled = false;
                target.innerHTML = 'Đăng ký';
            }
        }
    });
});

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('ri-eye-off-line');
        icon.classList.add('ri-eye-line');
    } else {
        input.type = "password";
        icon.classList.remove('ri-eye-line');
        icon.classList.add('ri-eye-off-line');
    }
}