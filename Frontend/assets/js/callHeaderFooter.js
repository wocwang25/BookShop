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
  // Tạo overlay nếu chưa có
  let searchOverlay = document.getElementById('searchOverlay');
  if (!searchOverlay) {
    searchOverlay = document.createElement('div');
    searchOverlay.id = 'searchOverlay';
    searchOverlay.className = 'fixed inset-0 z-[10000] bg-white bg-opacity-95 flex flex-col items-center justify-start pt-16';
    searchOverlay.innerHTML = `
      <div class="w-full max-w-2xl mx-auto px-4">
        <form id="searchForm" class="flex items-center gap-2">
          <input id="searchInputOverlay" type="text" placeholder="Tìm kiếm sách, tác giả, ISBN..." class="flex-1 border-b-2 border-gray-300 focus:border-primarynavy outline-none text-lg py-2 bg-transparent" autofocus />
          <button type="submit" class="ml-2 px-4 py-2 bg-primarynavy text-white rounded">Tìm kiếm</button>
          <button type="button" id="closeSearchOverlay" class="ml-2 text-2xl text-gray-500 hover:text-primarynavy" aria-label="Đóng">&times;</button>
        </form>
      </div>
    `;
    document.body.appendChild(searchOverlay);
  } else {
    searchOverlay.style.display = 'flex';
    setTimeout(() => {
      document.getElementById('searchInputOverlay').focus();
    }, 50);
  }
  document.body.style.overflow = 'hidden'; // Ngăn scroll nền
}

function hideSearchOverlay() {
  const searchOverlay = document.getElementById('searchOverlay');
  if (searchOverlay) {
    searchOverlay.style.display = 'none';
  }
  document.body.style.overflow = '';
}

// Khởi tạo sự kiện cho nút search trên header
function initSearchOverlay() {
  // Đảm bảo chỉ gắn 1 lần
  const header = document.getElementById('header-placeholder') || document;
  const searchBtn = header.querySelector('.search-btn');
  if (!searchBtn) return;

  searchBtn.onclick = function (e) {
    e.preventDefault();
    showSearchOverlay();
  };

  // Đóng overlay khi click nút đóng hoặc submit form
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'closeSearchOverlay') {
      hideSearchOverlay();
    }
  });

  // Đóng overlay khi nhấn ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideSearchOverlay();
  });

  // Xử lý submit form tìm kiếm
  document.addEventListener('submit', async function (e) {
    if (e.target && e.target.id === 'searchForm') {
      e.preventDefault();
      const query = document.getElementById('searchInputOverlay').value.trim();
      if (query) {
        window.location.href = `/searchBooks?query=${encodeURIComponent(query)}`;
      } else {
        window.location.href = `/searchBooks`;
      }
      hideSearchOverlay();
    }
  });
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
      <form id="headerSearchForm" class="w-full max-w-md flex items-center gap-2 bg-white rounded-lg shadow px-2 py-1 border border-gray-200" autocomplete="off" style="height:42px;">
        <input id="headerSearchInput" type="text" placeholder="Tìm kiếm sách, tác giả, ISBN..." class="flex-1 border-0 focus:ring-0 outline-none text-base px-2 bg-transparent" autofocus style="height:38px;" />
        <button type="submit" class="px-3 py-1 bg-primarynavy text-white rounded">Tìm</button>
        <button id="closeHeaderSearchBar"></button>
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
  document.getElementById('closeHeaderSearchBar').onclick = function () {
    closeHeaderSearchBarWithTransition();
  };

  // Đóng search bar khi submit
  document.getElementById('headerSearchForm').onsubmit = function (e) {
    e.preventDefault();
    const query = document.getElementById('headerSearchInput').value.trim();
    if (query) {
      window.location.href = `/searchBooks?query=${encodeURIComponent(query)}`;
    }
  };

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
  searchBtn.onclick = function (e) {
    e.preventDefault();
    showHeaderSearchBar();
  };
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