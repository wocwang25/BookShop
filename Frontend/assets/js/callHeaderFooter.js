// Global click handler to close panels when clicking outside
document.addEventListener('click', function (e) {
  const userPanel = document.getElementById('userPanel');
  const userBtn = document.getElementById('userBtn');
  const userInfo = document.getElementById('userInfo');
  const userInfoBtn = document.getElementById('userInfoBtn');

  // Check if clicking outside user panel and not on user buttons
  if (
    userPanel &&
    !userPanel.classList.contains('hidden') &&
    !userPanel.contains(e.target) &&
    (!userBtn || !userBtn.contains(e.target)) &&
    (!userInfo || !userInfo.contains(e.target)) &&
    (!userInfoBtn || !userInfoBtn.contains(e.target))
  ) {
    console.log('🖱️ [callHeaderFooter] Clicked outside user panel, closing...');
    closeUserPanel();
  }
});

function openUserPanel() {
  const userPanel = document.getElementById('userPanel');
  if (userPanel) {
    userPanel.classList.remove('hidden');
    setTimeout(() => {
      userPanel.classList.remove('translate-x-full');
    }, 10);
  }
}

function closeUserPanel() {
  const userPanel = document.getElementById('userPanel');
  if (userPanel) {
    userPanel.classList.add('translate-x-full');
    setTimeout(() => {
      userPanel.classList.add('hidden');
    }, 300);
  }
}

function initHeaderPanel() {
  const userBtn = document.getElementById('userBtn');
  const userPanel = document.getElementById('userPanel');
  const closeUserPanelBtn = document.getElementById('closeUserPanel');

  if (!userBtn || !userPanel || !closeUserPanelBtn) return;

  userBtn.onclick = function (e) {
    e.stopPropagation(); // Prevent event bubbling
    console.log('🖱️ [callHeaderFooter] User button clicked');
    openUserPanel();
  };

  closeUserPanelBtn.onclick = function (e) {
    e.stopPropagation();
    console.log('🖱️ [callHeaderFooter] Close button clicked');
    closeUserPanel();
  };

  // Initialize auth state after header is loaded
  setTimeout(() => {
    updateHeaderAuthState();
  }, 100);
}

// Auth state management for header
function updateHeaderAuthState() {
  console.log('🔄 [callHeaderFooter] Updating header auth state...');

  const userBtn = document.getElementById('userBtn');
  const userInfo = document.getElementById('userInfo');
  const guestActions = document.getElementById('guestActions');
  const userActions = document.getElementById('userActions');
  const userName = document.getElementById('userName');
  const headerUserName = document.getElementById('headerUserName');
  const userInfoBtn = document.getElementById('userInfoBtn');

  if (typeof window.AuthManager !== 'undefined' && window.AuthManager.isAuthenticated()) {
    const user = window.AuthManager.getUser();
    console.log('👤 [callHeaderFooter] User authenticated:', user);

    if (user) {
      // Hide guest button, show user info in header
      if (userBtn) userBtn.classList.add('hidden');
      if (userInfo) userInfo.classList.remove('hidden');

      // Update user names
      const displayName = user.name || user.username || 'User';
      if (userName) userName.textContent = displayName;
      if (headerUserName) headerUserName.textContent = displayName;

      // Update panel actions
      if (guestActions) guestActions.classList.add('hidden');
      if (userActions) userActions.classList.remove('hidden');

      // Add click handler for user info
      if (userInfo && !userInfo._clickHandlerAdded) {
        userInfo.addEventListener('click', function (e) {
          e.stopPropagation(); // Prevent event bubbling
          console.log('🖱️ [callHeaderFooter] User info clicked');
          openUserPanel();
        });
        userInfo._clickHandlerAdded = true;
      }
      if (userInfoBtn && !userInfoBtn._clickHandlerAdded) {
        userInfoBtn.addEventListener('click', function (e) {
          e.stopPropagation(); // Prevent event bubbling  
          console.log('🖱️ [callHeaderFooter] User info button clicked');
          openUserPanel();
        });
        userInfoBtn._clickHandlerAdded = true;
      }

      console.log('✅ [callHeaderFooter] Header updated for authenticated user:', displayName);
    }
  } else {
    console.log('🚫 [callHeaderFooter] User not authenticated, showing guest state');

    // Show guest button, hide user info
    if (userBtn) userBtn.classList.remove('hidden');
    if (userInfo) userInfo.classList.add('hidden');

    // Show guest actions in panel
    if (guestActions) guestActions.classList.remove('hidden');
    if (userActions) userActions.classList.add('hidden');
  }
}

// Handle logout button
function handleLogout() {
  console.log('🚪 [callHeaderFooter] Logout button clicked');

  if (typeof window.AuthManager !== 'undefined') {
    // Close user panel first
    closeUserPanel();

    window.AuthManager.logout();

    // Show success message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center space-x-2';
    messageDiv.innerHTML = `
        <i class="ri-check-circle-line text-xl"></i>
        <span>Đăng xuất thành công!</span>
      `;
    document.body.appendChild(messageDiv);

    // Remove message after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);

    // Update header state
    updateHeaderAuthState();

    // Redirect to home page
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  }
}

// Make functions globally available
window.updateHeaderAuthState = updateHeaderAuthState;

function openCartPanel() {
  const cartPanel = document.getElementById('cartPanel');
  if (cartPanel) {
    cartPanel.classList.remove('hidden');
    setTimeout(() => {
      cartPanel.classList.remove('translate-x-full');
    }, 10);
  }
}

function closeCartPanel() {
  const cartPanel = document.getElementById('cartPanel');
  if (cartPanel) {
    cartPanel.classList.add('translate-x-full');
    setTimeout(() => {
      cartPanel.classList.add('hidden');
    }, 300);
  }
}

// Cart logic
let cart = [
  {
    id: 1,
    name: "Tuổi trẻ đáng giá bao nhiêu",
    author: "Rosie Nguyễn",
    price: 120000,
    oldPrice: 150000,
    image: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1495635816i/32521178.jpg",
    quantity: 1
  }
  // Thêm sản phẩm mẫu khác nếu muốn
];

// Định dạng tiền Việt
function formatVND(n) {
  return n.toLocaleString('vi-VN') + "đ";
}

// Render cart items
function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartBadge = document.querySelector('.cart-badge');
  if (!cartItems) return;

  cartItems.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="text-gray-500 text-center" id="cartEmptyMsg">Chưa có sản phẩm nào trong giỏ hàng.</div>`;
    if (cartBadge) cartBadge.removeAttribute('data-count');
    document.getElementById('cartTotal').textContent = formatVND(0);
    return;
  }

  cart.forEach((item, idx) => {
    total += item.price * item.quantity;
    const itemDiv = document.createElement('div');
    itemDiv.className = "flex items-center gap-3";
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="Sách" class="w-14 h-20 object-cover rounded border" />
      <div class="flex-1">
        <div class="font-medium text-gray-800">${item.name}</div>
        <div class="text-sm text-gray-500">${item.author}</div>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-primarynavy font-semibold">${formatVND(item.price)}</span>
          ${item.oldPrice ? `<span class="text-xs text-gray-400 line-through">${formatVND(item.oldPrice)}</span>` : ''}
        </div>
        <div class="flex items-center gap-2 mt-2">
          <button class="px-2 py-1 border rounded" data-action="decrease" data-idx="${idx}">-</button>
          <input type="number" min="1" value="${item.quantity}" class="w-12 text-center border rounded focus:outline-none focus:ring-2 focus:ring-primarynavy no-spinner" data-idx="${idx}" />
          <button class="px-2 py-1 border rounded" data-action="increase" data-idx="${idx}">+</button>
          <button class="ml-2 text-red-500 hover:underline text-l" data-action="remove" data-idx="${idx}">Xóa</button>
        </div>
      </div>
    `;
    cartItems.appendChild(itemDiv);
  });

  document.getElementById('cartTotal').textContent = formatVND(total);
  if (cartBadge) cartBadge.setAttribute('data-count', cart.reduce((s, i) => s + i.quantity, 0));
}

// Xử lý sự kiện tăng/giảm/xóa/nhập số lượng
function cartEventHandler(e) {
  const target = e.target;
  if (target.matches('[data-action="decrease"]')) {
    const idx = +target.getAttribute('data-idx');
    if (cart[idx].quantity > 1) cart[idx].quantity--;
    renderCart();
  }
  if (target.matches('[data-action="increase"]')) {
    const idx = +target.getAttribute('data-idx');
    cart[idx].quantity++;
    renderCart();
  }
  if (target.matches('[data-action="remove"]')) {
    const idx = +target.getAttribute('data-idx');
    cart.splice(idx, 1);
    renderCart();
  }
  if (target.matches('input[type="number"][data-idx]')) {
    const idx = +target.getAttribute('data-idx');
    let val = parseInt(target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    cart[idx].quantity = val;
    renderCart();
  }
}

function initCartPanel() {
  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const closeCartPanelBtn = document.getElementById('closeCartPanel');
  const cartItems = document.getElementById('cartItems');

  if (!cartBtn || !cartPanel || !closeCartPanelBtn || !cartItems) return;

  cartBtn.onclick = openCartPanel;
  closeCartPanelBtn.onclick = closeCartPanel;

  // Đóng panel khi click ra ngoài panel
  document.addEventListener('mousedown', function (e) {
    if (
      cartPanel &&
      !cartPanel.classList.contains('hidden') &&
      !cartPanel.classList.contains('translate-x-full') &&
      !cartPanel.contains(e.target) &&
      (!cartBtn || !cartBtn.contains(e.target))
    ) {
      closeCartPanel();
    }
  });

  // Sự kiện cho các nút trong cart
  cartItems.addEventListener('click', cartEventHandler);
  cartItems.addEventListener('change', cartEventHandler);

  renderCart();
}

// Search overlay logic
function showSearchOverlay() {
  console.log('🔍 [Search] Showing search overlay');
  
  // Tạo overlay nếu chưa có
  let searchOverlay = document.getElementById('searchOverlay');
  if (!searchOverlay) {
    searchOverlay = document.createElement('div');
    searchOverlay.id = 'searchOverlay';
    searchOverlay.className = 'fixed inset-0 z-[10000] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-start pt-20 transition-all duration-300';
    searchOverlay.innerHTML = `
      <div class="w-full max-w-3xl mx-auto px-6">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-primarynavy mb-2">Tìm kiếm sách</h2>
          <p class="text-gray-600">Nhập tên sách, tác giả hoặc từ khóa để tìm kiếm</p>
        </div>
        <form id="searchForm" class="flex items-center gap-3 bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
          <div class="flex-1 relative">
            <i class="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
            <input id="searchInputOverlay" type="text" placeholder="Tìm kiếm sách, tác giả, thể loại..." 
                   class="w-full pl-12 pr-4 py-4 text-lg outline-none border-none rounded-xl bg-transparent" autofocus />
          </div>
          <button type="submit" class="px-6 py-4 bg-primarynavy text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            <i class="ri-search-line"></i>
            Tìm kiếm
          </button>
          <button type="button" id="closeSearchOverlay" class="p-4 text-gray-400 hover:text-primarynavy rounded-xl transition-colors" aria-label="Đóng">
            <i class="ri-close-line text-xl"></i>
          </button>
        </form>
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">Nhấn <kbd class="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd> để đóng</p>
        </div>
      </div>
    `;
    document.body.appendChild(searchOverlay);
  } else {
    searchOverlay.style.display = 'flex';
    setTimeout(() => {
      const input = document.getElementById('searchInputOverlay');
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  }
  
  // Ngăn scroll nền và thêm animation
  document.body.style.overflow = 'hidden';
  
  // Fade in animation
  setTimeout(() => {
    searchOverlay.style.opacity = '1';
  }, 10);
}

function hideSearchOverlay() {
  console.log('🔍 [Search] Hiding search overlay');
  const searchOverlay = document.getElementById('searchOverlay');
  if (searchOverlay) {
    // Fade out animation
    searchOverlay.style.opacity = '0';
    setTimeout(() => {
      searchOverlay.style.display = 'none';
    }, 300);
  }
  document.body.style.overflow = '';
}

// Khởi tạo sự kiện cho nút search trên header
function initSearchOverlay() {
  // Đảm bảo chỉ gắn 1 lần - tránh duplicate event listeners
  if (window._searchOverlayInitialized) return;
  window._searchOverlayInitialized = true;

  // Đóng overlay khi click nút đóng
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'closeSearchOverlay') {
      hideSearchOverlay();
    }
  });

  // Đóng overlay khi nhấn ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideSearchOverlay();
  });

  // Xử lý submit form tìm kiếm overlay
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'searchForm') {
      e.preventDefault();
      const query = document.getElementById('searchInputOverlay').value.trim();
      handleSearchSubmit(query);
      hideSearchOverlay();
    }
  });

  console.log('✅ [Search] Search overlay initialized');
}

// Unified search handling function
function handleSearchSubmit(query) {
  if (query && query.trim()) {
    const trimmedQuery = query.trim();
    // Chuyển đến trang search với search parameter
    const searchUrl = `/searchBooks?search=${encodeURIComponent(trimmedQuery)}`;
    console.log('🔍 [Search] Navigating to:', searchUrl);
    window.location.href = searchUrl;
  } else {
    // Nếu không có query, chuyển đến trang search tổng quát
    console.log('🔍 [Search] Navigating to general search page');
    window.location.href = '/searchBooks';
  }
}

// Hiển thị ô tìm kiếm thay thế phần center của header, giữ logo và các nút hai bên, giữ chiều cao header, trượt ngang mượt mà, click ra ngoài sẽ trở lại bình thường
function showHeaderSearchBar() {
  const header = document.getElementById('header');
  if (!header) return;
  const headerContent = header.querySelector('.header-content');
  if (!headerContent) return;

  // Lưu lại phần center cũ để có thể khôi phục, chỉ nếu chưa có
  if (typeof headerContent._originalInnerHTML === 'undefined') {
    headerContent._originalInnerHTML = headerContent.innerHTML;
    headerContent._originalHeight = headerContent.offsetHeight;
  }

  // Lấy các phần tử hai bên
  const logo = headerContent.querySelector('.logo');
  const headerActions = headerContent.querySelector('.header-actions');

  // Tạo phần center là form search nhỏ gọn, hiệu ứng scale+slide đẹp mắt
  headerContent.innerHTML = `
    ${logo ? logo.outerHTML : ''}
    <div id="headerSearchTransition" class="flex-1 flex justify-center items-center transition-all duration-300 ease-in-out transform translate-x-10 scale-90 opacity-0" style="height:${headerContent._originalHeight}px;">
      <form id="headerSearchForm" class="w-full max-w-lg flex items-center gap-2 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100" autocomplete="off" style="height:44px;">
        <i class="ri-search-line text-gray-400 text-lg"></i>
        <input id="headerSearchInput" type="text" placeholder="Tìm kiếm sách, tác giả, thể loại..." 
               class="flex-1 border-0 focus:ring-0 outline-none text-base px-2 bg-transparent" autofocus style="height:38px;" />
        <button type="submit" class="px-4 py-1.5 bg-primarynavy text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
          <i class="ri-search-line text-sm"></i>
          Tìm
        </button>
        <button type="button" id="closeHeaderSearchBar" class="p-1.5 text-gray-400 hover:text-primarynavy rounded-lg transition-colors">
          <i class="ri-close-line text-lg"></i>
        </button>
      </form>
    </div>
    ${headerActions ? headerActions.outerHTML : ''}
  `;

  // Đảm bảo chiều cao header-content không đổi khi search
  headerContent.style.minHeight = headerContent._originalHeight + "px";
  headerContent.style.height = headerContent._originalHeight + "px";

  // Kích hoạt hiệu ứng trượt ngang + scale + opacity
  setTimeout(() => {
    const searchTransition = document.getElementById('headerSearchTransition');
    if (searchTransition) {
      searchTransition.classList.remove('translate-x-10');
      searchTransition.classList.remove('scale-90');
      searchTransition.classList.remove('opacity-0');
      searchTransition.classList.add('translate-x-0');
      searchTransition.classList.add('scale-100');
      searchTransition.classList.add('opacity-100');
    }
    const input = document.getElementById('headerSearchInput');
    if (input) input.focus();
  }, 10);

  // Đóng search bar khi bấm nút đóng
  const closeBtn = document.getElementById('closeHeaderSearchBar');
  if (closeBtn) {
    closeBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔍 [Search] Close button clicked');
      closeHeaderSearchBarWithTransition();
    };
  }

  // Đóng search bar khi submit
  const searchForm = document.getElementById('headerSearchForm');
  if (searchForm) {
    searchForm.onsubmit = function (e) {
      e.preventDefault();
      const input = document.getElementById('headerSearchInput');
      const query = input ? input.value.trim() : '';
      console.log('🔍 [Search] Header search form submitted with query:', query);
      handleSearchSubmit(query);
    };
  }

  // Đóng search bar khi click ra ngoài form search
  setTimeout(() => {
    function outsideClickHandler(e) {
      const form = document.getElementById('headerSearchForm');
      if (form && !form.contains(e.target)) {
        closeHeaderSearchBarWithTransition();
        document.removeEventListener('mousedown', outsideClickHandler);
      }
    }
    document.addEventListener('mousedown', outsideClickHandler);
  }, 20);

  // Đóng search bar khi nhấn ESC
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeHeaderSearchBarWithTransition();
      document.removeEventListener('keydown', escHandler);
    }
  });
}

// Thêm hiệu ứng transition khi đóng search bar
function closeHeaderSearchBarWithTransition() {
  const searchTransition = document.getElementById('headerSearchTransition');
  if (searchTransition) {
    searchTransition.classList.remove('translate-x-0', 'scale-100', 'opacity-100');
    searchTransition.classList.add('translate-x-10', 'scale-90', 'opacity-0');
    setTimeout(() => {
      restoreHeaderCenter();
    }, 300);
  } else {
    restoreHeaderCenter();
  }
}

function restoreHeaderCenter() {
  const header = document.getElementById('header');
  if (!header) return;
  const headerContent = header.querySelector('.header-content');
  // Chỉ khôi phục nếu đã từng lưu _originalInnerHTML
  if (headerContent && typeof headerContent._originalInnerHTML !== 'undefined') {
    headerContent.innerHTML = headerContent._originalInnerHTML;
    delete headerContent._originalInnerHTML;
    // Reset lại chiều cao về mặc định
    headerContent.style.minHeight = "";
    headerContent.style.height = "";
    delete headerContent._originalHeight;
    if (typeof initHeaderPanel === 'function') initHeaderPanel();
    if (typeof initCartPanel === 'function') initCartPanel();
    if (typeof initSearchBarButton === 'function') initSearchBarButton();
  }
}

// Gắn sự kiện cho nút search trên header để thay thế phần center
function initSearchBarButton() {
  const header = document.getElementById('header');
  if (!header) return;
  const headerContent = header.querySelector('.header-content');
  if (!headerContent) return;
  const searchBtn = headerContent.querySelector('.search-btn');
  if (!searchBtn) return;
  
  // Đảm bảo không gắn nhiều lần
  if (!searchBtn._searchHandlerAdded) {
    searchBtn.onclick = function (e) {
      e.preventDefault();
      console.log('🔍 [Search] Search button clicked');
      showHeaderSearchBar();
    };
    searchBtn._searchHandlerAdded = true;
    console.log('✅ [Search] Search button handler added');
  }
}

// ====== HEADER/FOOTER INIT LOGIC ENHANCED ======

// Debug helper for header state
window.debugHeaderState = function () {
  const user = window.AuthManager && window.AuthManager.getUser ? window.AuthManager.getUser() : null;
  const isAuth = window.AuthManager && window.AuthManager.isAuthenticated ? window.AuthManager.isAuthenticated() : false;
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  console.log('[debugHeaderState] isAuthenticated:', isAuth, '\nuser:', user, '\nauthToken:', token, '\nuserData:', userData);
  return { isAuthenticated: isAuth, user, authToken: token, userData };
};

// Load and render categories in header mega menu
async function loadCategories() {
  try {
    console.log('🏷️ [callHeaderFooter] Loading categories...');
    const response = await window.ApiService.getAllCategory();
    
    if (response.success && response.categories && response.categories.length > 0) {
      renderCategories(response.categories);
      console.log('✅ [callHeaderFooter] Categories loaded successfully:', response.categories.length, 'categories');
    } else {
      console.warn('⚠️ [callHeaderFooter] No categories found:', response.error || 'Empty response');
    }
  } catch (error) {
    console.error('❌ [callHeaderFooter] Error loading categories:', error);
  }
}

// Map categories to appropriate icons
function getCategoryIcon(categoryName) {
  const iconMap = {
    'Tiểu Thuyết': 'ri-book-open-line',
    'Sách tư duy - Kỹ năng sống': 'ri-lightbulb-line',
    'Lĩnh vực khác': 'ri-earth-line',
    'Tác phẩm kinh điển': 'ri-star-line',
    'Truyện ngắn - Tản văn - Tạp Văn': 'ri-quill-pen-line',
    'Truyện Giả tưởng - Huyền Bí - Phiêu Lưu': 'ri-magic-line',
    'Sách kinh tế học': 'ri-bar-chart-2-line',
    'Sách Chiêm Tinh - Horoscope': 'ri-planet-line',
    'Truyện kể cho bé': 'ri-bear-smile-line',
    'Truyện dài': 'ri-bookmark-3-line',
    'Sách tài chính, tiền tệ': 'ri-money-dollar-circle-line',
    'Du ký': 'ri-road-map-line',
    'Truyện trinh thám': 'ri-search-eye-line',
    'Sách kỹ năng làm việc': 'ri-tools-line',
    'Bài học kinh doanh': 'ri-briefcase-4-line',
    'Kiến Thức Bách Khoa': 'ri-graduation-cap-line',
    'Sách Học Tiếng Anh': 'ri-english-input',
    'Sách Marketing - Bán hàng': 'ri-bar-chart-grouped-line',
    'Sách giáo dục': 'ri-book-3-line',
    'Sách Làm Cha Mẹ': 'ri-parent-line',
    'Văn học thiếu nhi': 'ri-user-smile-line',
    'Truyện đam mỹ': 'ri-heart-line',
    'Truyện ngôn tình': 'ri-emotion-happy-line',
    'Sách Tâm Lý Tuổi Teen': 'ri-mental-health-line',
    'Sách Nấu ăn': 'ri-restaurant-line',
    'Sách khởi nghiệp': 'ri-seedling-line',
    'Sách nghệ thuật sống đẹp': 'ri-heart-2-line',
    'Sách hướng nghiệp - Kỹ năng mềm': 'ri-compasses-2-line',
    'Sách Luyện Thi Đại Học - Cao Đẳng': 'ri-booklet-line',
    'Sách doanh nhân': 'ri-user-star-line',
    'Sách Phong Thủy - Kinh Dịch': 'ri-yin-yang-line',
    'Sách Học Tiếng Hoa': 'ri-translate-2',
    'Sách Học Tiếng Nhật': 'ri-translate',
    'Sách Học Tiếng Hàn': 'ri-translate',
    'Sách Làm Đẹp': 'ri-magic-fill',
    'Sách Danh Nhân': 'ri-user-3-line',
    'Sách tham khảo cấp I': 'ri-book-read-line',
    'Sách tham khảo cấp II': 'ri-book-read-line',
    'Sách tham khảo cấp III': 'ri-book-read-line',
    'Sách tài chính, kế toán': 'ri-bank-card-line',
    'Thơ': 'ri-brush-line',
    'Sách Phong Tục - Tập Quán': 'ri-group-line',
    'Sách Kiến Thức - Kỹ Năng Cho Trẻ': 'ri-plant-line',
    'Sách Thai Giáo': 'ri-baby-carriage-line',
    'Sách Hôn Nhân - Giới Tính': 'ri-coupen-line',
    'Sách Tô Màu Dành Cho Người Lớn': 'ri-palette-line',
    'Sách Đường Xưa Mây Trắng': 'ri-roadster-line',
    'Truyện tranh Ehon': 'ri-book-2-line',
    'Truyện kinh dị': 'ri-ghost-line',
    'Truyện kiếm hiệp': 'ri-sword-line',
    'Truyện cười': 'ri-emotion-laugh-line',
    'Truyện cổ tích': 'ri-book-3-line',
    'Tranh Truyện': 'ri-landscape-line',
    'Triết Học': 'ri-brain-line'
  };
  
  return iconMap[categoryName] || 'ri-book-line'; // Default icon
}

// Render categories into the mega menu with multi-column layout
function renderCategories(categories) {
  const megaMenu = document.getElementById('categoryMegaMenu');
  if (!megaMenu) {
    console.warn('⚠️ [callHeaderFooter] Category mega menu not found');
    return;
  }

  // Find the container div that needs to be updated
  const flexContainer = megaMenu.querySelector('.flex.flex-row.w-full.gap-4.overflow-x-auto');
  if (!flexContainer) {
    console.warn('⚠️ [callHeaderFooter] Category container not found');
    return;
  }

  // Clear existing content
  flexContainer.innerHTML = '';

  // Calculate items per column (aim for 4 columns)
  const itemsPerColumn = Math.ceil(categories.length / 4);
  const columns = [];
  
  // Split categories into 4 columns
  for (let i = 0; i < 4; i++) {
    const start = i * itemsPerColumn;
    const end = start + itemsPerColumn;
    columns.push(categories.slice(start, end));
  }

  // Create columns
  columns.forEach((columnCategories, columnIndex) => {
    if (columnCategories.length === 0) return;

    const columnDiv = document.createElement('div');
    columnDiv.className = 'w-[340px] min-w-[320px] max-w-[400px]';

    // Column header
    const headerDiv = document.createElement('div');
    if (columnIndex === 0) {
      headerDiv.className = 'font-bold mb-4 text-primarynavy text-base flex items-center gap-2';
      headerDiv.textContent = 'Danh mục thể loại';
    } else {
      headerDiv.className = 'font-bold mb-4 text-white text-base opacity-0 select-none';
      headerDiv.textContent = 'Ẩn';
    }

    // Categories list
    const ul = document.createElement('ul');
    ul.className = columnIndex === 0 ? 'space-y-2' : 'space-y-2 mt-2';

    columnCategories.forEach(category => {
      const li = document.createElement('li');
      
      const link = document.createElement('a');
      link.href = `/searchBooks?category=${encodeURIComponent(category.name)}`;
      link.setAttribute('data-category', category.name);
      link.className = 'flex items-center gap-2 text-gray-700 hover:text-primarynavy transition font-medium';
      
      const icon = document.createElement('i');
      icon.className = getCategoryIcon(category.name);
      
      link.appendChild(icon);
      link.appendChild(document.createTextNode(category.name));
      
      li.appendChild(link);
      ul.appendChild(li);
    });

    columnDiv.appendChild(headerDiv);
    columnDiv.appendChild(ul);
    flexContainer.appendChild(columnDiv);
  });

  console.log('✅ [callHeaderFooter] Categories rendered in multi-column layout:', categories.length, 'items in', columns.filter(col => col.length > 0).length, 'columns');
}

// Main header/footer loader
function loadHeaderFooter() {
  // Load header
  fetch('/components/header.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      // Gọi updateHeaderAuthState ngay sau khi gắn header vào DOM
      if (typeof updateHeaderAuthState === 'function') updateHeaderAuthState();
      if (typeof initHeaderPanel === 'function') initHeaderPanel();
      if (typeof initCartPanel === 'function') initCartPanel();
      if (typeof initSearchBarButton === 'function') initSearchBarButton();
      if (typeof initSearchOverlay === 'function') initSearchOverlay();
      
      // Load categories after header is loaded
      setTimeout(() => {
        if (typeof window.ApiService !== 'undefined') {
          loadCategories();
        } else {
          console.warn('⚠️ [callHeaderFooter] ApiService not available, retrying...');
          // Retry after ApiService is loaded
          setTimeout(() => {
            if (typeof window.ApiService !== 'undefined') {
              loadCategories();
            }
          }, 1000);
        }
      }, 100);
      // Add logout button handler and auth state management after header is loaded
      setTimeout(() => {
        // Remove any old event listeners to avoid stacking
        document.removeEventListener('click', window._headerLogoutDelegation, true);
        window.removeEventListener('authStateChanged', window._headerAuthStateChanged, true);
        window.removeEventListener('storage', window._headerStorageChanged, true);
        // Delegated logout button handler
        window._headerLogoutDelegation = function (e) {
          if (e.target.id === 'logoutBtn' || (e.target.closest && e.target.closest('#logoutBtn'))) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚪 [callHeaderFooter] Logout button clicked via delegation');
            handleLogout();
          }
        };
        document.addEventListener('click', window._headerLogoutDelegation, true);
        // Auth state changed event
        window._headerAuthStateChanged = function () {
          console.log('🔄 [callHeaderFooter] Auth state changed event received');
          updateHeaderAuthState();
        };
        window.addEventListener('authStateChanged', window._headerAuthStateChanged, true);
        // Storage event for cross-tab sync
        window._headerStorageChanged = function (e) {
          if (e.key === 'authToken' || e.key === 'userData') {
            console.log('🔄 [callHeaderFooter] Storage changed, updating header...', e.key);
            updateHeaderAuthState();
          }
        };
        window.addEventListener('storage', window._headerStorageChanged, true);
        // Update auth state after everything is loaded
        updateHeaderAuthState();
        // Also try again after a short delay to ensure all scripts are loaded
        setTimeout(updateHeaderAuthState, 500);
      }, 200);
    });
  // Load footer
  fetch('/components/footer.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });
}

// Entry point: load header/footer immediately (no dependency wait)
loadHeaderFooter();

// (Đã bỏ hoàn toàn các đoạn fetch header/footer cũ và logic waitForDependencies)
// ====== PATCH AuthManager FOR CROSS-TAB LOGIN/LOGOUT SYNC ======
(function patchAuthManagerForSync() {
  function fireStorageEvent(key, oldValue, newValue) {
    // Tạo sự kiện storage giả lập cho các tab khác
    if (typeof window === 'undefined') return;
    const event = document.createEvent('StorageEvent');
    event.initStorageEvent('storage', false, false, key, oldValue, newValue, window.location.href, localStorage);
    window.dispatchEvent(event);
  }
  function patchLogout() {
    if (!window.AuthManager || !window.AuthManager.logout || window.AuthManager._patchedForSync) return;
    const oldLogout = window.AuthManager.logout;
    window.AuthManager.logout = function () {
      const oldToken = localStorage.getItem('authToken');
      const oldUser = localStorage.getItem('userData');
      const result = oldLogout.apply(this, arguments);
      // Đảm bảo localStorage đã xóa
      setTimeout(() => {
        fireStorageEvent('authToken', oldToken, null);
        fireStorageEvent('userData', oldUser, null);
      }, 10);
      // Phát custom event cho các script khác nếu cần
      window.dispatchEvent(new Event('authStateChanged'));
      return result;
    };
    window.AuthManager._patchedForSync = true;
  }
  function patchLogin() {
    if (!window.AuthManager || !window.AuthManager.login || window.AuthManager._patchedLoginForSync) return;
    const oldLogin = window.AuthManager.login;
    window.AuthManager.login = function () {
      const oldToken = localStorage.getItem('authToken');
      const oldUser = localStorage.getItem('userData');
      const result = oldLogin.apply(this, arguments);
      setTimeout(() => {
        const newToken = localStorage.getItem('authToken');
        const newUser = localStorage.getItem('userData');
        fireStorageEvent('authToken', oldToken, newToken);
        fireStorageEvent('userData', oldUser, newUser);
      }, 10);
      window.dispatchEvent(new Event('authStateChanged'));
      return result;
    };
    window.AuthManager._patchedLoginForSync = true;
  }
  // Patch ngay nếu AuthManager đã có, hoặc patch lại khi AuthManager xuất hiện
  if (window.AuthManager) {
    patchLogout();
    patchLogin();
  } else {
    const interval = setInterval(() => {
      if (window.AuthManager) {
        patchLogout();
        patchLogin();
        clearInterval(interval);
      }
    }, 100);
  }
})();