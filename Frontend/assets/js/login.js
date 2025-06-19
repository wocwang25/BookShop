document.addEventListener('DOMContentLoaded', function() {
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

    // Khởi tạo opacity cho hiệu ứng
    loginForm.classList.remove('hidden');
    loginForm.classList.remove('opacity-0');
    registerForm.classList.add('opacity-0');

    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(registerForm, loginForm, toggleToLogin, toggleToRegister);
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(loginForm, registerForm, toggleToRegister, toggleToLogin);
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