// Settings page functionality
document.addEventListener('DOMContentLoaded', function () {
    // Wait for header to load before initializing
    function waitForHeader() {
        const header = document.getElementById('header');
        if (header && header.innerHTML.trim() !== '') {
            initializeSettingsPage();
        } else {
            setTimeout(waitForHeader, 100);
        }
    }

    waitForHeader();
});

function initializeSettingsPage() {
    // Initialize the page
    initializePage();

    // Initialize form handlers
    initializeFormHandlers();

    // Initialize navigation
    initializeNavigation();

    // Password visibility toggles removed to avoid duplicates

    // Load user data
    loadUserProfile();
}

// Initialize page components
function initializePage() {
    // Set max date for birthday field to today
    const birthdayField = document.getElementById('input-birthday');
    if (birthdayField) {
        const today = new Date().toISOString().split('T')[0];
        birthdayField.max = today;
    }

    // Load provinces data for dynamic address dropdown
    loadProvinces();

    // Load saved data from localStorage if available
    loadSavedFormData();
}

// Initialize form handlers
function initializeFormHandlers() {
    // Avatar upload handler
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', changeAvatar);
    }

    // Form input handlers for auto-save
    const formInputs = document.querySelectorAll('#account-section input, #account-section select');
    formInputs.forEach(input => {
        input.addEventListener('change', saveFormData);
    });

    // Address field handlers for delivery section
    const streetDetailField = document.getElementById('street-detail');
    if (streetDetailField) {
        streetDetailField.addEventListener('input', updateCompleteAddress);
        streetDetailField.addEventListener('change', updateCompleteAddress);
    }

    // Specific handlers for address dropdowns
    const provinceSelect = document.getElementById('province');
    if (provinceSelect) {
        provinceSelect.addEventListener('change', function () {
            const selectedCode = this.value;
            if (selectedCode) {
                loadDistricts(selectedCode);
            } else {
                // Clear districts and wards when no province selected
                const districtSelect = document.getElementById('district');
                const wardSelect = document.getElementById('ward');
                if (districtSelect) districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
                if (wardSelect) wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            }
            updateCompleteAddress();
        });
    }

    const districtSelect = document.getElementById('district');
    if (districtSelect) {
        districtSelect.addEventListener('change', function () {
            const selectedCode = this.value;
            if (selectedCode) {
                loadWards(selectedCode);
            } else {
                // Clear wards when no district selected
                const wardSelect = document.getElementById('ward');
                if (wardSelect) wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            }
            updateCompleteAddress();
        });
    }

    const wardSelect = document.getElementById('ward');
    if (wardSelect) {
        wardSelect.addEventListener('change', function () {
            updateCompleteAddress();
        });
    }

    // Password change button handler
    const changePasswordBtn = document.querySelector('#security-section .btn-primary');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handleChangePassword);
    }
}

// Initialize navigation between sections
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const targetSection = this.getAttribute('data-target');

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show target section
            contentSections.forEach(section => {
                section.classList.add('hidden');
            });

            const target = document.getElementById(targetSection);
            if (target) {
                target.classList.remove('hidden');
            }
        });
    });
}

// Load user profile from API
async function loadUserProfile() {
    try {
        showLoadingSpinner();

        // Check if user is authenticated
        if (typeof AuthManager === 'undefined' || !AuthManager.isAuthenticated()) {
            showMessage('Bạn cần đăng nhập để truy cập trang này', 'error');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            return;
        }

        // Get profile data
        const response = await ApiService.getProfile();

        if (response.status === 'success' && response.user) {
            populateUserData(response.user);
        } else {
            throw new Error('Failed to load profile');
        }

    } catch (error) {
        showMessage('Không thể tải thông tin tài khoản. Vui lòng thử lại.', 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Populate form with user data
function populateUserData(user) {

    // Update sidebar name
    const sidebarName = document.getElementById('sidebar-name');
    if (sidebarName) {
        sidebarName.textContent = user.name || 'User';
    }

    // Populate form fields
    const customerProfile = user.customerProfile || {};
    const fields = {
        'input-name': customerProfile.name || user.name,
        'input-email': customerProfile.email || user.email,
        'input-phone': customerProfile.phone || '',
        'input-sex': customerProfile.sex || '',
        'input-address': customerProfile.address || '',
        'full-address': customerProfile.address || ''  // Populate full address for delivery
    };

    Object.entries(fields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field && value) {
            field.value = value;
        }
    });

    // Handle birthday field (convert from Date to input date format)
    if (customerProfile.birthday) {
        const birthdayField = document.getElementById('input-birthday');
        if (birthdayField) {
            const date = new Date(customerProfile.birthday);
            const formattedDate = date.toISOString().split('T')[0];
            birthdayField.value = formattedDate;
        }
    }

    // Update avatar if available
    if (customerProfile.avatar) {
        updateAvatarPreview(customerProfile.avatar);
    }

    // Update financial information (read-only)
    updateFinancialInfo(customerProfile);
}

// Update financial information display
function updateFinancialInfo(customerProfile) {
    // Update debt amount
    const debtElement = document.getElementById('debt-amount');
    if (debtElement) {
        const debt = customerProfile.debt || 0;
        debtElement.textContent = formatCurrency(debt);

        // Change color based on debt amount
        if (debt > 0) {
            debtElement.style.color = '#dc2626'; // Red for debt
        } else {
            debtElement.style.color = '#059669'; // Green for no debt
        }
    }

    // Update invoice counts
    const salesCountElement = document.getElementById('sales-invoices-count');
    if (salesCountElement) {
        const salesCount = customerProfile.salesInvoices?.length || 0;
        salesCountElement.textContent = salesCount;
    }

    const rentalCountElement = document.getElementById('rental-invoices-count');
    if (rentalCountElement) {
        const rentalCount = customerProfile.rentalInvoices?.length || 0;
        rentalCountElement.textContent = rentalCount;
    }
}

// Format currency for display
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Save user information
async function saveUserInfo() {
    try {
        showSaveLoading();

        // Collect form data
        const formData = {
            name: document.getElementById('input-name')?.value,
            email: document.getElementById('input-email')?.value || '',
            phone: document.getElementById('input-phone')?.value || '',
            address: document.getElementById('input-address')?.value || '',
            sex: document.getElementById('input-sex')?.value,
            birthday: document.getElementById('input-birthday')?.value
        };

        // Add avatar data if available
        if (window.tempAvatarData) {
            formData.avatar = window.tempAvatarData;
        }

        // Validate required fields
        if (!formData.name || formData.name.trim() === '') {
            showMessage('Vui lòng nhập tên', 'error');
            setTimeout(() => window.location.reload(), 1500);
            throw new Error('Vui lòng nhập tên');
        }

        if (!formData.email || formData.email.trim() === '') {
            showMessage('Email không được bỏ trống', 'error');
            setTimeout(() => window.location.reload(), 1500);
            throw new Error('Email không được bỏ trống');
        }

        if (!/^\d+$/.test(formData.phone)) {
            showMessage("Số điện thoại chỉ được chứa số", 'error');
            const phoneInput = document.getElementById('input-phone');
            if (phoneInput) phoneInput.value = '';
            // Xóa giá trị phone trong localStorage trước khi reload
            const savedData = localStorage.getItem('settingsFormData');
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    data.phone = '';
                    localStorage.setItem('settingsFormData', JSON.stringify(data));
                } catch (e) { }
            }
            setTimeout(() => window.location.reload(), 1500);
            throw new Error("Số điện thoại chỉ được chứa số");
        }

        // // Clean data - remove empty strings and format birthday
        // Object.keys(formData).forEach(key => {
        //     if (formData[key] === '') {
        //         delete formData[key];
        //     }
        // });

        // Convert birthday to proper Date format if provided
        if (formData.birthday) {
            formData.birthday = new Date(formData.birthday).toISOString();
        }

        // Call API to update profile
        const response = await ApiService.updateProfile(formData);

        if (response.success || response.status === 'success') {
            showMessage('Cập nhật thông tin thành công!', 'success');
            saveFormData(); // Save to localStorage as backup

            // Clear temp avatar data after successful save
            if (window.tempAvatarData) {
                delete window.tempAvatarData;
            }

            // Update AuthManager if name or avatar changed
            if ((formData.name || formData.avatar) && typeof AuthManager !== 'undefined') {
                const currentUser = AuthManager.getUser();
                if (currentUser) {
                    if (formData.name) {
                        currentUser.name = formData.name;
                    }

                    // Update avatar in user data
                    if (formData.avatar) {
                        if (!currentUser.customerProfile) {
                            currentUser.customerProfile = {};
                        }
                        currentUser.customerProfile.avatar = formData.avatar;
                    }

                    localStorage.setItem('userData', JSON.stringify(currentUser));

                    // Trigger header update
                    setTimeout(() => {
                        if (typeof window.updateHeaderAuthState === 'function') {
                        }
                    }, 100);
                }
            }

            // Reload profile to get updated data including avatar
            setTimeout(() => {
                loadUserProfile();
            }, 1000);
        } else {
            throw new Error(response.message || 'Cập nhật thất bại');
        }

    } catch (error) {
        showMessage(error.message || 'Có lỗi xảy ra khi cập nhật thông tin', 'error');
    } finally {
        hideSaveLoading();
    }
}

// Change password functionality
async function handleChangePassword() {
    try {
        const currentPassword = document.getElementById('current-password')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;

        // Validation
        if (!currentPassword || currentPassword.trim() === '') {
            throw new Error('Vui lòng nhập mật khẩu hiện tại');
        }

        if (!newPassword || newPassword.trim() === '') {
            throw new Error('Vui lòng nhập mật khẩu mới');
        }

        if (!confirmPassword || confirmPassword.trim() === '') {
            throw new Error('Vui lòng xác nhận mật khẩu mới');
        }

        if (newPassword !== confirmPassword) {
            throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp');
        }

        if (newPassword.length < 6) {
            throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        }

        if (currentPassword === newPassword) {
            throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại');
        }

        showPasswordLoading();

        // Call API
        const response = await ApiService.changePassword(currentPassword, newPassword);

        if (response.status === 'success') {
            showMessage('Đổi mật khẩu thành công!', 'success');
            // Clear password fields
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } else {
            throw new Error(response.message || 'Đổi mật khẩu thất bại');
        }

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        hidePasswordLoading();
    }
}

// Avatar management
function changeAvatar(event) {
    const file = event.target.files[0];
    if (file) {

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showMessage('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF)', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Kích thước ảnh không được vượt quá 5MB', 'error');
            return;
        }

        // Show loading for preview
        showMessage('Đang xử lý ảnh...', 'info');

        // Preview avatar
        const reader = new FileReader();
        reader.onload = function (e) {
            updateAvatarPreview(e.target.result);
            showMessage('Ảnh đại diện đã được cập nhật! Nhấn "Lưu" để lưu thay đổi.', 'success');

            // Store avatar data for saving
            window.tempAvatarData = e.target.result;
        };

        reader.onerror = function () {
            showMessage('Lỗi khi đọc file ảnh', 'error');
        };

        reader.readAsDataURL(file);

        // Auto-save form data
        saveFormData();
    }
}

function updateAvatarPreview(imageSrc) {
    // Update main avatar preview
    const avatarPreview = document.getElementById('avatar-preview');
    if (avatarPreview) {
        avatarPreview.src = imageSrc;
    }

    // Update sidebar avatar
    const sidebarAvatar = document.querySelector('.sidebar .avatar img');
    if (sidebarAvatar) {
        sidebarAvatar.src = imageSrc;
    }

    // Update header avatars using the global function
    const headerUserAvatar = document.getElementById('headerUserAvatar');
    if (headerUserAvatar) {
        headerUserAvatar.src = imageSrc;
    }

    // Update panel avatar
    const panelUserAvatar = document.getElementById('panelUserAvatar');
    if (panelUserAvatar) {
        panelUserAvatar.src = imageSrc;
    }

    // Update any other avatar elements
    const allAvatars = document.querySelectorAll('[id*="avatar"], [class*="avatar"] img');
    allAvatars.forEach(avatar => {
        if (avatar.tagName === 'IMG' && avatar.id !== 'headerUserAvatar' && avatar.id !== 'panelUserAvatar') {
            avatar.src = imageSrc;
        }
    });
}

function removeAvatar() {
    const defaultAvatar = 'https://img.freepik.com/freie-psd/3d-darstellung-eines-menschlichen-avatars-oder-profils_23-2150671142.jpg';
    updateAvatarPreview(defaultAvatar);

    // Clear file input
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.value = '';
    }

    saveFormData();
}

// Form data persistence (localStorage backup)
function saveFormData() {
    const formData = {
        name: document.getElementById('input-name')?.value || '',
        email: document.getElementById('input-email')?.value || '',
        phone: document.getElementById('input-phone')?.value || '',
        sex: document.getElementById('input-sex')?.value || '',
        address: document.getElementById('input-address')?.value || '',
        birthday: document.getElementById('input-birthday')?.value || ''
    };

    localStorage.setItem('settingsFormData', JSON.stringify(formData));
}

function loadSavedFormData() {
    const savedData = localStorage.getItem('settingsFormData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.entries(data).forEach(([field, value]) => {
                const element = document.getElementById(`input-${field}`);
                if (element && value) {
                    element.value = value;
                }
            });

        } catch (error) {
        }
    }
}

// UI Helper functions
function showMessage(message, type = 'info') {
    // Remove existing message
    const existingMessage = document.querySelector('.settings-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `settings-message fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center space-x-2 ${type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;

    const icon = type === 'success' ? 'ri-check-circle-line' :
        type === 'error' ? 'ri-error-warning-line' :
            'ri-information-line';

    messageDiv.innerHTML = `
        <i class="${icon} text-xl"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]';
    spinner.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="text-gray-700">Đang tải thông tin...</span>
        </div>
    `;
    document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

function showSaveLoading() {
    const saveBtn = document.querySelector('#account-section .btn-primary');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Đang lưu...';
    }
}

function hideSaveLoading() {
    const saveBtn = document.querySelector('#account-section .btn-primary');
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Lưu';
    }
}

function showPasswordLoading() {
    const passwordBtn = document.querySelector('#security-section .btn-primary');
    if (passwordBtn) {
        passwordBtn.disabled = true;
        passwordBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Đang đổi mật khẩu...';
    }
}

function hidePasswordLoading() {
    const passwordBtn = document.querySelector('#security-section .btn-primary');
    if (passwordBtn) {
        passwordBtn.disabled = false;
        passwordBtn.innerHTML = 'Thay đổi mật khẩu';
    }
}

// ================= DYNAMIC ADDRESS API INTEGRATION =================
// API tỉnh - quận - phường
function loadProvinces() {
    fetch("https://provinces.open-api.vn/api/?depth=2")
        .then(res => res.json())
        .then(data => {
            const provinceSelect = document.getElementById("province");
            if (provinceSelect) {
                provinceSelect.innerHTML = '<option value="">Chọn tỉnh/thành</option>';
                data.forEach(p => {
                    provinceSelect.innerHTML += `<option value="${p.code}">${p.name}</option>`;
                });
            }
        })
        .catch(error => {
        });
}

// Load districts when province changes
function loadDistricts(provinceCode) {
    if (!provinceCode) {
        const districtSelect = document.getElementById("district");
        const wardSelect = document.getElementById("ward");
        if (districtSelect) districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
        if (wardSelect) wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        updateCompleteAddress();
        return;
    }

    fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
        .then(res => res.json())
        .then(data => {
            const districtSelect = document.getElementById("district");
            const wardSelect = document.getElementById("ward");
            if (districtSelect) {
                districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
                data.districts.forEach(d => {
                    districtSelect.innerHTML += `<option value="${d.code}">${d.name}</option>`;
                });
            }
            if (wardSelect) {
                wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            }
            updateCompleteAddress();
        })
        .catch(error => {
        });
}

// Load wards when district changes
function loadWards(districtCode) {
    if (!districtCode) {
        const wardSelect = document.getElementById("ward");
        if (wardSelect) wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        updateCompleteAddress();
        return;
    }

    fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        .then(res => res.json())
        .then(data => {
            const wardSelect = document.getElementById("ward");
            if (wardSelect) {
                wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
                data.wards.forEach(w => {
                    wardSelect.innerHTML += `<option value="${w.code}">${w.name}</option>`;
                });
            }
            updateCompleteAddress();
        })
        .catch(error => {
        });
}

// Handle dropdown changes and update address
function updateAddress() {
    // Just update the complete address - don't handle loading here
    // Loading is handled by individual event listeners
    updateCompleteAddress();
}

// Generate and update the complete address field
function updateCompleteAddress() {
    const country = document.getElementById('country')?.value || 'Việt Nam';
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    const streetDetail = document.getElementById('street-detail')?.value || '';
    const fullAddressField = document.getElementById('full-address');

    if (!fullAddressField) return;

    // Get text values from selected options (not codes)
    let provinceName = '';
    let districtName = '';
    let wardName = '';

    if (provinceSelect && provinceSelect.selectedIndex > 0) {
        provinceName = provinceSelect.options[provinceSelect.selectedIndex].text;
    }

    if (districtSelect && districtSelect.selectedIndex > 0) {
        districtName = districtSelect.options[districtSelect.selectedIndex].text;
    }

    if (wardSelect && wardSelect.selectedIndex > 0) {
        wardName = wardSelect.options[wardSelect.selectedIndex].text;
    }

    // Build address parts array (street first, then ward, district, province, country)
    const addressParts = [];

    if (streetDetail.trim()) {
        addressParts.push(streetDetail.trim());
    }
    if (wardName) {
        addressParts.push(wardName);
    }
    if (districtName) {
        addressParts.push(districtName);
    }
    if (provinceName) {
        addressParts.push(provinceName);
    }
    if (country && country !== 'Việt Nam') {
        addressParts.push(country);
    }

    // Update the complete address field
    fullAddressField.value = addressParts.join(', ');
}

// Save delivery address functionality
async function saveDeliveryAddress() {
    try {
        showDeliveryLoading();

        // Get full address from textarea
        const fullAddress = document.getElementById('full-address')?.value;

        // Validate required field
        if (!fullAddress || fullAddress.trim() === '') {
            throw new Error('Vui lòng chọn địa chỉ hoàn chỉnh');
        }

        // Prepare data
        const addressData = {
            address: fullAddress.trim()
        };

        // Call API to update profile with new address
        const response = await ApiService.updateProfile(addressData);

        if (response.success || response.status === 'success') {
            showMessage('Cập nhật địa chỉ giao hàng thành công!', 'success');

            // Also update the main address field
            const mainAddressField = document.getElementById('input-address');
            if (mainAddressField) {
                mainAddressField.value = fullAddress;
            }

        } else {
            throw new Error(response.message || 'Cập nhật địa chỉ thất bại');
        }

    } catch (error) {
        showMessage(error.message || 'Có lỗi xảy ra khi cập nhật địa chỉ', 'error');
    } finally {
        hideDeliveryLoading();
    }
}

// Loading states for delivery address
function showDeliveryLoading() {
    const saveBtn = document.querySelector('#delivery-section .btn-primary');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Đang lưu...';
    }
}

function hideDeliveryLoading() {
    const saveBtn = document.querySelector('#delivery-section .btn-primary');
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Lưu địa chỉ';
    }
}

// Removed password strength validation and visibility toggle functions
// Backend will handle password format validation

// Global functions for HTML onclick handlers
window.saveUserInfo = saveUserInfo;
window.changeAvatar = changeAvatar;
window.removeAvatar = removeAvatar;
window.handleChangePassword = handleChangePassword;
window.saveDeliveryAddress = saveDeliveryAddress;
window.updateAddress = updateAddress;
window.updateCompleteAddress = updateCompleteAddress;
window.loadProvinces = loadProvinces;
window.loadDistricts = loadDistricts;
window.loadWards = loadWards;