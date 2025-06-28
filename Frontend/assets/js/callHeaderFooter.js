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
  const headerUserAvatar = document.getElementById('headerUserAvatar');
  const panelUserAvatar = document.getElementById('panelUserAvatar');

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

      // Update user avatars
      updateUserAvatars(user);

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

    // Reset avatars to default
    resetUserAvatars();
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

// Avatar management functions
function getDefaultAvatar() {
  return '../assets/images/default_image.jpg';
}

function convertGoogleDriveLink(url) {
  if (!url || url.trim() === '') return getDefaultAvatar();

  // If already a direct link, return as is
  if (url.includes('drive.google.com/uc?')) {
    return url;
  }

  // Convert Google Drive share link to direct link
  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }

  // If not a Google Drive link, return as is
  return url;
}

function updateUserAvatars(user) {
  console.log('🖼️ [callHeaderFooter] Updating user avatars for user:', user);

  const headerUserAvatar = document.getElementById('headerUserAvatar');
  const panelUserAvatar = document.getElementById('panelUserAvatar');

  let avatarUrl = getDefaultAvatar();

  // Check for avatar in different possible locations
  if (user.customerProfile?.avatar) {
    avatarUrl = convertGoogleDriveLink(user.customerProfile.avatar);
  } else if (user.avatar) {
    avatarUrl = convertGoogleDriveLink(user.avatar);
  }

  // Update header avatar
  if (headerUserAvatar) {
    headerUserAvatar.src = avatarUrl;
    headerUserAvatar.onerror = function () {
      this.src = getDefaultAvatar();
      console.log('⚠️ [callHeaderFooter] Header avatar failed to load, using default');
    };
  }

  // Update panel avatar
  if (panelUserAvatar) {
    panelUserAvatar.src = avatarUrl;
    panelUserAvatar.onerror = function () {
      this.src = getDefaultAvatar();
      console.log('⚠️ [callHeaderFooter] Panel avatar failed to load, using default');
    };
  }

  console.log('✅ [callHeaderFooter] Avatars updated successfully');
}

function resetUserAvatars() {
  console.log('🔄 [callHeaderFooter] Resetting avatars to default');

  const headerUserAvatar = document.getElementById('headerUserAvatar');
  const panelUserAvatar = document.getElementById('panelUserAvatar');

  const defaultAvatar = getDefaultAvatar();

  if (headerUserAvatar) {
    headerUserAvatar.src = defaultAvatar;
  }

  if (panelUserAvatar) {
    panelUserAvatar.src = defaultAvatar;
  }
}

// Make functions globally available
window.updateHeaderAuthState = updateHeaderAuthState;
window.updateUserAvatars = updateUserAvatars;
window.resetUserAvatars = resetUserAvatars;

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
let cart = [];
let isCartLoading = false;

// Định dạng tiền Việt
function formatVND(n) {
  return n.toLocaleString('vi-VN') + "đ";
}

// Load cart from API
async function loadCart() {
  if (!window.ApiService) {
    console.warn('⚠️ [Cart] ApiService not available');
    isCartLoading = false;
    cart = [];
    renderCart();
    return;
  }

  if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
    console.log('🛒 [Cart] User not authenticated, cart will be empty');
    isCartLoading = false;
    cart = [];
    renderCart();
    return;
  }

  try {
    isCartLoading = true;
    renderCart(); // Show loading state immediately
    console.log('🛒 [Cart] Loading cart from API...');

    const response = await window.ApiService.getCart();
    console.log('🛒 [Cart] Raw API response:', JSON.stringify(response, null, 2));

    // Reset cart first
    cart = [];

    // Check for different response formats - prioritize direct array first
    if (response && Array.isArray(response)) {
      // Format: [...] - Direct array response (most common)
      console.log('🛒 [Cart] Direct array format detected, length:', response.length);
      cart = response.map(item => {
        try {
          return transformCartItem(item);
        } catch (error) {
          console.error('❌ [Cart] Error transforming item:', item, error);
          return null;
        }
      }).filter(item => item !== null);
      console.log('✅ [Cart] Cart loaded (direct array):', cart.length, 'items');
    } else if (response && response.success && response.cart) {
      console.log('🛒 [Cart] Using success format, cart:', response.cart);

      if (response.cart.items && Array.isArray(response.cart.items)) {
        // Format: { success: true, cart: { items: [...] } }
        cart = response.cart.items.map(item => {
          try {
            return transformCartItem(item);
          } catch (error) {
            console.error('❌ [Cart] Error transforming item:', item, error);
            return null;
          }
        }).filter(item => item !== null);
        console.log('✅ [Cart] Cart loaded (success.cart.items):', cart.length, 'items');
      } else if (Array.isArray(response.cart)) {
        // Format: { success: true, cart: [...] }
        cart = response.cart.map(item => {
          try {
            return transformCartItem(item);
          } catch (error) {
            console.error('❌ [Cart] Error transforming item:', item, error);
            return null;
          }
        }).filter(item => item !== null);
        console.log('✅ [Cart] Cart loaded (success.cart array):', cart.length, 'items');
      }
    } else if (response && response.cart) {
      console.log('🛒 [Cart] Using direct cart format, cart:', response.cart);

      if (response.cart.items && Array.isArray(response.cart.items)) {
        // Format: { cart: { items: [...] } }
        cart = response.cart.items.map(item => {
          try {
            return transformCartItem(item);
          } catch (error) {
            console.error('❌ [Cart] Error transforming item:', item, error);
            return null;
          }
        }).filter(item => item !== null);
        console.log('✅ [Cart] Cart loaded (cart.items):', cart.length, 'items');
      } else if (Array.isArray(response.cart)) {
        // Format: { cart: [...] }
        cart = response.cart.map(item => {
          try {
            return transformCartItem(item);
          } catch (error) {
            console.error('❌ [Cart] Error transforming item:', item, error);
            return null;
          }
        }).filter(item => item !== null);
        console.log('✅ [Cart] Cart loaded (cart array):', cart.length, 'items');
      }
    } else {
      console.log('📦 [Cart] No items in cart or unrecognized format');
      console.log('🔍 [Cart] Response type:', typeof response, 'Is array:', Array.isArray(response));
      cart = [];
    }

    // After loading cart, fetch book details for items that need them
    if (cart.length > 0) {
      await fetchMissingBookDetails();
    }

  } catch (error) {
    console.error('❌ [Cart] Error loading cart:', error);
    cart = [];
  } finally {
    isCartLoading = false;
    renderCart();
  }
}

// Fetch book details for cart items that only have book IDs
async function fetchMissingBookDetails() {
  const itemsNeedingDetails = cart.filter(item => item.needsBookDetails);

  if (itemsNeedingDetails.length === 0) {
    console.log('🔍 [Cart] No items need book details');
    return;
  }

  console.log('🔍 [Cart] Fetching details for', itemsNeedingDetails.length, 'books...');

  // Fetch details for each book
  const promises = itemsNeedingDetails.map(async (item) => {
    try {
      console.log('📖 [Cart] Fetching book details for ID:', item.id);
      const response = await window.ApiService.getBookById(item.id);

      if (response.success && response.book) {
        const book = response.book;

        // Update cart item with real book details
        const cartIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        if (cartIndex !== -1) {
          cart[cartIndex] = {
            ...cart[cartIndex],
            name: book.title || cart[cartIndex].name,
            author: book.author?.name || book.author || cart[cartIndex].author,
            image: getBookImageForCart(book),
            needsBookDetails: false
          };
          console.log('✅ [Cart] Updated book details for:', book.title);
        }
      } else {
        console.warn('⚠️ [Cart] Failed to fetch book details for ID:', item.id);
      }
    } catch (error) {
      console.error('❌ [Cart] Error fetching book details for ID:', item.id, error);
    }
  });

  await Promise.all(promises);

  // Re-render cart with updated book details
  renderCart();
  console.log('🔄 [Cart] Updated cart with book details');
}

// Transform cart item to consistent format
function transformCartItem(item) {
  console.log('🔄 [Cart] Transforming item:', JSON.stringify(item, null, 2));

  // Handle different item structures
  let book, bookId, title, author, price, quantity;

  if (item.book && typeof item.book === 'object') {
    // Item has book object: { book: {...}, quantity: 1 }
    book = item.book;
    bookId = book._id || book.id;
    title = book.title || book.name;
    author = book.author?.name || book.author;
    price = book.price || item.price; // Fallback to item.price
    quantity = item.quantity;
  } else if (item.book && typeof item.book === 'string') {
    // Item has book ID: { book: "id_string", quantity: 1, price: 107500 }
    bookId = item.book;
    title = `Book ${bookId.slice(-6)}`; // Use last 6 chars of ID as temp title
    author = 'Unknown Author';
    price = item.price;
    quantity = item.quantity;
    book = { _id: bookId }; // Create minimal book object for image handling
  } else {
    // Item is the book itself: { _id, title, author, price, quantity? }
    book = item;
    bookId = item._id || item.id || item.bookId;
    title = item.title || item.name;
    author = item.author?.name || item.author;
    price = item.price;
    quantity = item.quantity || 1;
  }

  // Validate required fields
  if (!bookId) {
    console.warn('⚠️ [Cart] Item missing ID:', item);
    bookId = 'unknown_' + Date.now();
  }

  // For items with only book ID, we need to fetch book details later
  // For now, use placeholder title that can be updated
  if (!title || title.startsWith('Book ')) {
    title = `Book ${bookId.slice(-6)}...`; // Placeholder title
    console.log('📝 [Cart] Using placeholder title for book ID:', bookId);
  }

  const transformed = {
    id: bookId,
    name: title,
    author: author || 'Unknown Author',
    price: parseInt(price) || 0,
    image: getBookImageForCart(book),
    quantity: parseInt(quantity) || 1,
    needsBookDetails: typeof item.book === 'string' // Flag to fetch book details later
  };

  console.log('✅ [Cart] Transformed:', transformed);
  return transformed;
}

// Get book image for cart display
function getBookImageForCart(book) {
  if (!book) return getDefaultCartImage();

  if (!book.imageUrl || book.imageUrl.trim() === '') {
    return getDefaultCartImage();
  }

  return convertGoogleDriveLinkForCart(book.imageUrl);
}

function convertGoogleDriveLinkForCart(url) {
  if (!url) return getDefaultCartImage();

  if (url.includes('drive.google.com/uc?')) {
    return url;
  }

  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }

  return url;
}

function getDefaultCartImage() {
  return '../assets/images/default_image.jpg';
}

// Render cart items
function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartBadge = document.querySelector('.cart-badge');
  const cartTotal = document.getElementById('cartTotal');

  if (!cartItems) return;

  // Show loading state
  if (isCartLoading) {
    cartItems.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primarynavy"></div>
        <span class="ml-3 text-gray-600">Đang tải giỏ hàng...</span>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = '';
  let total = 0;
  let totalItems = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <i class="ri-shopping-cart-line text-2xl text-gray-400"></i>
        </div>
        <div class="text-gray-500 mb-2">Giỏ hàng trống</div>
        <div class="text-sm text-gray-400">Thêm sản phẩm để bắt đầu mua sắm</div>
      </div>
    `;

    // Update badge and total
    if (cartBadge) cartBadge.removeAttribute('data-count');
    if (cartTotal) cartTotal.textContent = formatVND(0);

    // Hide checkout buttons when cart is empty
    const checkoutBtns = document.querySelectorAll('.cart-checkout-btn');
    checkoutBtns.forEach(btn => btn.style.display = 'none');

    return;
  }

  // Show checkout buttons when cart has items
  const checkoutBtns = document.querySelectorAll('.cart-checkout-btn');
  checkoutBtns.forEach(btn => btn.style.display = 'block');

  cart.forEach((item, idx) => {
    total += item.price * item.quantity;
    totalItems += item.quantity;

    const itemDiv = document.createElement('div');
    itemDiv.className = "flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-3 cart-item";
    itemDiv.setAttribute('data-book-id', item.id);

    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${escapeHtmlForCart(item.name)}" 
           class="w-16 h-20 object-cover rounded border border-gray-200 flex-shrink-0"
           onerror="this.src='${getDefaultCartImage()}'"/>
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-gray-800 text-sm line-clamp-2 mb-1">${escapeHtmlForCart(item.name)}</h4>
        <p class="text-xs text-gray-500 mb-2">${escapeHtmlForCart(item.author)}</p>
        <div class="flex items-center justify-between mb-2">
          <span class="text-primarynavy font-semibold text-sm">${formatVND(item.price)}</span>
          <span class="text-xs text-gray-400">× ${item.quantity}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <button class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 transition" 
                    data-action="decrease" data-idx="${idx}" data-book-id="${item.id}">
              <i class="ri-subtract-line text-sm"></i>
            </button>
            <span class="w-8 text-center text-sm font-medium">${item.quantity}</span>
            <button class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 transition" 
                    data-action="increase" data-idx="${idx}" data-book-id="${item.id}">
              <i class="ri-add-line text-sm"></i>
            </button>
          </div>
          <button class="text-red-500 hover:text-red-700 transition text-xs font-medium" 
                  data-action="remove" data-idx="${idx}" data-book-id="${item.id}" title="Xóa khỏi giỏ hàng">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    `;

    cartItems.appendChild(itemDiv);
  });

  // Update total and badge
  if (cartTotal) cartTotal.textContent = formatVND(total);
  if (cartBadge) {
    cartBadge.setAttribute('data-count', totalItems);
    // Update cart badge style
    if (totalItems > 0) {
      cartBadge.classList.add('cart-has-items');
    } else {
      cartBadge.classList.remove('cart-has-items');
    }
  }

  console.log('🛒 [Cart] Rendered', cart.length, 'items, total:', formatVND(total));
}

// Escape HTML for cart display
function escapeHtmlForCart(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Xử lý sự kiện tăng/giảm/xóa/nhập số lượng
async function cartEventHandler(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.getAttribute('data-action');
  const idx = parseInt(target.getAttribute('data-idx'));
  const bookId = target.getAttribute('data-book-id');

  // Prevent multiple clicks
  if (target.disabled || isCartLoading) return;
  target.disabled = true;

  try {
    console.log('🛒 [Cart] Action:', action, 'for book:', bookId, 'index:', idx);

    if (action === 'decrease') {
      if (cart[idx] && cart[idx].quantity > 1) {
        await updateCartQuantity(bookId, cart[idx].quantity - 1);
      } else {
        console.log('🛒 [Cart] Cannot decrease below 1, consider removing item');
        showCartError('Số lượng tối thiểu là 1');
      }
    } else if (action === 'increase') {
      if (cart[idx]) {
        await updateCartQuantity(bookId, cart[idx].quantity + 1);
      } else {
        console.error('❌ [Cart] Item not found in cart for increase action');
        showCartError('Không tìm thấy sản phẩm trong giỏ hàng');
      }
    } else if (action === 'remove') {
      // Confirm removal for better UX
      console.log('🗑️ [Cart] Removing item:', bookId);
      await removeFromCart(bookId);
    } else {
      console.warn('⚠️ [Cart] Unknown action:', action);
    }
  } catch (error) {
    console.error('❌ [Cart] Error handling cart action:', error);
    showCartError('Có lỗi xảy ra khi cập nhật giỏ hàng: ' + (error.message || 'Unknown error'));
  } finally {
    target.disabled = false;
  }
}

// Update cart item quantity via API
async function updateCartQuantity(bookId, newQuantity) {
  if (!window.ApiService || !window.AuthManager?.isAuthenticated()) {
    throw new Error('Cần đăng nhập để cập nhật giỏ hàng');
  }

  try {
    console.log('🛒 [Cart] Updating quantity for book:', bookId, 'to:', newQuantity);

    // Use updateCartItem method instead of addToCart to set absolute quantity
    const response = await window.ApiService.updateCartItem(bookId, newQuantity, 'buy');

    if (response.success || response.message) {
      // Reload cart to get updated data
      await loadCart();
      console.log('✅ [Cart] Quantity updated successfully');
    } else {
      throw new Error(response.error || 'Failed to update cart');
    }
  } catch (error) {
    console.error('❌ [Cart] Error updating cart quantity:', error);

    // Fallback to addToCart with difference calculation if updateCartItem fails
    try {
      console.log('🔄 [Cart] Trying fallback with addToCart difference...');

      // Find current quantity in cart
      const currentItem = cart.find(item => item.id === bookId);
      const currentQuantity = currentItem ? currentItem.quantity : 0;

      // Calculate the difference to send to API (since backend adds to existing quantity)
      const quantityDifference = newQuantity - currentQuantity;

      console.log('🧮 [Cart] Current:', currentQuantity, 'New:', newQuantity, 'Difference:', quantityDifference);

      if (quantityDifference !== 0) {
        const fallbackResponse = await window.ApiService.addToCart(bookId, quantityDifference, 'buy');

        if (fallbackResponse.success || fallbackResponse.message) {
          await loadCart();
          console.log('✅ [Cart] Quantity updated via fallback');
        } else {
          throw new Error(fallbackResponse.error || 'Fallback failed');
        }
      }
    } catch (fallbackError) {
      console.error('❌ [Cart] Fallback also failed:', fallbackError);
      throw error; // Throw original error
    }
  }
}

// Remove item from cart via API
async function removeFromCart(bookId) {
  if (!window.ApiService || !window.AuthManager?.isAuthenticated()) {
    throw new Error('Cần đăng nhập để xóa sản phẩm');
  }

  try {
    console.log('🛒 [Cart] Removing book from cart:', bookId);

    // Find item in local cart
    const itemIndex = cart.findIndex(item => item.id === bookId);
    if (itemIndex === -1) {
      throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
    }

    // Use dedicated remove API (backend issue has been fixed)
    console.log('🗑️ [Cart] Calling removeCartItem API for book:', bookId);
    const response = await window.ApiService.removeCartItem(bookId);

    if (response.success || response.message || response.msg) {
      // Remove from local cart immediately for better UX
      cart.splice(itemIndex, 1);
      renderCart();

      // Reload cart to ensure consistency
      setTimeout(loadCart, 100);

      showCartSuccess('Đã xóa sản phẩm khỏi giỏ hàng');
      console.log('✅ [Cart] Item removed successfully');
    } else {
      console.error('❌ [Cart] Unexpected response format:', response);

      // Last resort: reload cart to check if item was actually removed
      console.log('🔄 [Cart] Reloading cart to verify removal...');
      await loadCart();

      // Check if item is still in cart after reload
      const stillExists = cart.find(item => item.id === bookId);
      if (!stillExists) {
        showCartSuccess('Đã xóa sản phẩm khỏi giỏ hàng');
        console.log('✅ [Cart] Item was removed despite unclear response');
      } else {
        throw new Error('Không thể xóa sản phẩm khỏi giỏ hàng');
      }
    }
  } catch (error) {
    console.error('❌ [Cart] Error removing from cart:', error);
    throw error;
  }
}

// Show cart success message
function showCartSuccess(message) {
  showCartMessage(message, 'success');
}

// Show cart error message
function showCartError(message) {
  showCartMessage(message, 'error');
}

// Show cart message
function showCartMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  messageDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-[10001] flex items-center space-x-2 transform translate-x-full transition-transform duration-300`;
  messageDiv.innerHTML = `
    <i class="ri-${type === 'success' ? 'check-circle' : type === 'error' ? 'error-warning' : 'information'}-line"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(messageDiv);

  // Slide in
  setTimeout(() => {
    messageDiv.classList.remove('translate-x-full');
  }, 10);

  // Slide out and remove
  setTimeout(() => {
    messageDiv.classList.add('translate-x-full');
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 300);
  }, 3000);
}

function initCartPanel() {
  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const closeCartPanelBtn = document.getElementById('closeCartPanel');
  const cartItems = document.getElementById('cartItems');

  if (!cartBtn || !cartPanel || !closeCartPanelBtn || !cartItems) return;

  // Cart button click handler - load cart when opening
  cartBtn.onclick = function (e) {
    e.preventDefault();
    console.log('🛒 [Cart] Cart button clicked');
    openCartPanel();
    // Load cart data when panel opens
    loadCart();
  };

  closeCartPanelBtn.onclick = function (e) {
    e.preventDefault();
    closeCartPanel();
  };

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

  // Sự kiện cho các nút trong cart - use event delegation
  cartItems.addEventListener('click', cartEventHandler);

  // Initial cart load
  if (window.AuthManager && window.AuthManager.isAuthenticated()) {
    loadCart();
  } else {
    renderCart(); // Show empty cart
  }

  console.log('🛒 [Cart] Cart panel initialized');
}

// Add to cart function for external use
async function addToCartFromExternal(bookId, quantity = 1, type = 'buy') {
  if (!window.ApiService) {
    console.error('❌ [Cart] ApiService not available');
    showCartError('Dịch vụ không khả dụng');
    return false;
  }

  if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
    console.log('🔐 [Cart] User not authenticated, redirecting to login');
    showCartError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return false;
  }

  try {
    console.log('🛒 [Cart] Adding to cart:', { bookId, quantity, type });

    const response = await window.ApiService.addToCart(bookId, quantity, type);

    if (response.success || response.message) {
      const actionText = type === 'rent' ? 'thuê' : 'mua';
      showCartSuccess(`Đã thêm sách ${actionText} vào giỏ hàng`);
      // Reload cart to update display
      await loadCart();
      console.log('✅ [Cart] Added to cart successfully');
      return true;
    } else {
      throw new Error(response.error || 'Failed to add to cart');
    }
  } catch (error) {
    console.error('❌ [Cart] Error adding to cart:', error);
    showCartError('Có lỗi xảy ra khi thêm vào giỏ hàng');
    return false;
  }
}

// Refresh cart data (for external use)
async function refreshCart() {
  console.log('🔄 [Cart] Refreshing cart data...');
  await loadCart();
}

// Debug function for cart
function debugCart() {
  console.log('=== CART DEBUG ===');
  console.log('isCartLoading:', isCartLoading);
  console.log('cart array:', cart);
  console.log('cart length:', cart.length);
  console.log('AuthManager available:', !!window.AuthManager);
  console.log('ApiService available:', !!window.ApiService);
  console.log('User authenticated:', window.AuthManager?.isAuthenticated());
  console.log('==================');
  return { isCartLoading, cart, authAvailable: !!window.AuthManager, apiAvailable: !!window.ApiService };
}

// Make functions globally available
window.addToCartFromExternal = addToCartFromExternal;
window.refreshCart = refreshCart;
window.debugCart = debugCart;

// ==================== WISHLIST LOGIC ====================

function openWishlistPanel() {
  const wishlistPanel = document.getElementById('wishlistPanel');
  if (wishlistPanel) {
    wishlistPanel.classList.remove('hidden');
    setTimeout(() => {
      wishlistPanel.classList.remove('translate-x-full');
    }, 10);
  }
}

function closeWishlistPanel() {
  const wishlistPanel = document.getElementById('wishlistPanel');
  if (wishlistPanel) {
    wishlistPanel.classList.add('translate-x-full');
    setTimeout(() => {
      wishlistPanel.classList.add('hidden');
    }, 300);
  }
}

// Wishlist logic
let wishlist = [];
let isWishlistLoading = false;

// Load wishlist from API
async function loadWishlist() {
  if (!window.ApiService) {
    console.warn('⚠️ [Wishlist] ApiService not available');
    isWishlistLoading = false;
    wishlist = [];
    renderWishlist();
    return;
  }

  if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
    console.log('❤️ [Wishlist] User not authenticated, wishlist will be empty');
    isWishlistLoading = false;
    wishlist = [];
    renderWishlist();
    return;
  }

  try {
    isWishlistLoading = true;
    renderWishlist(); // Show loading state immediately
    console.log('❤️ [Wishlist] Loading wishlist from API...');

    const response = await window.ApiService.getFavourites();
    console.log('❤️ [Wishlist] Raw API response:', JSON.stringify(response, null, 2));

    // Reset wishlist first
    wishlist = [];

    // Check for different response formats
    if (response && Array.isArray(response)) {
      // Format: [...] - Direct array response
      console.log('❤️ [Wishlist] Direct array format detected, length:', response.length);
      wishlist = response.map(item => {
        try {
          return transformWishlistItem(item);
        } catch (error) {
          console.error('❌ [Wishlist] Error transforming item:', item, error);
          return null;
        }
      }).filter(item => item !== null);
      console.log('✅ [Wishlist] Wishlist loaded (direct array):', wishlist.length, 'items');
    } else if (response && response.success && response.favourites) {
      console.log('❤️ [Wishlist] Using success format, favourites:', response.favourites);

      if (Array.isArray(response.favourites)) {
        wishlist = response.favourites.map(item => {
          try {
            return transformWishlistItem(item);
          } catch (error) {
            console.error('❌ [Wishlist] Error transforming item:', item, error);
            return null;
          }
        }).filter(item => item !== null);
        console.log('✅ [Wishlist] Wishlist loaded (success.favourites):', wishlist.length, 'items');
      }
    } else if (response && response.favourites && Array.isArray(response.favourites)) {
      console.log('❤️ [Wishlist] Using direct favourites format');
      wishlist = response.favourites.map(item => {
        try {
          return transformWishlistItem(item);
        } catch (error) {
          console.error('❌ [Wishlist] Error transforming item:', item, error);
          return null;
        }
      }).filter(item => item !== null);
      console.log('✅ [Wishlist] Wishlist loaded (favourites array):', wishlist.length, 'items');
    } else {
      console.log('📦 [Wishlist] No items in wishlist or unrecognized format');
      wishlist = [];
    }

  } catch (error) {
    console.error('❌ [Wishlist] Error loading wishlist:', error);
    wishlist = [];
  } finally {
    isWishlistLoading = false;
    renderWishlist();
  }
}

// Transform wishlist item to consistent format
function transformWishlistItem(item) {
  console.log('🔄 [Wishlist] Transforming item:', JSON.stringify(item, null, 2));

  // Handle different item structures - similar to cart but for books
  let book, bookId, title, author, price;

  if (item.book && typeof item.book === 'object') {
    // Item has book object: { book: {...} }
    book = item.book;
    bookId = book._id || book.id;
    title = book.title || book.name;
    author = book.author?.name || book.author;
    price = book.price;
  } else if (item.book && typeof item.book === 'string') {
    // Item has book ID: { book: "id_string" }
    bookId = item.book;
    title = `Book ${bookId.slice(-6)}`; // Use last 6 chars of ID as temp title
    author = 'Unknown Author';
    price = 0;
    book = { _id: bookId }; // Create minimal book object for image handling
  } else {
    // Item is the book itself: { _id, title, author, price }
    book = item;
    bookId = item._id || item.id || item.bookId;
    title = item.title || item.name;
    author = item.author?.name || item.author;
    price = item.price;
  }

  // Validate required fields
  if (!bookId) {
    console.warn('⚠️ [Wishlist] Item missing ID:', item);
    bookId = 'unknown_' + Date.now();
  }

  const transformed = {
    id: bookId,
    name: title || 'Untitled Book',
    author: author || 'Unknown Author',
    price: parseInt(price) || 0,
    image: getBookImageForWishlist(book)
  };

  console.log('✅ [Wishlist] Transformed:', transformed);
  return transformed;
}

// Get book image for wishlist display
function getBookImageForWishlist(book) {
  if (!book) return getDefaultWishlistImage();

  if (!book.imageUrl || book.imageUrl.trim() === '') {
    return getDefaultWishlistImage();
  }

  return convertGoogleDriveLinkForWishlist(book.imageUrl);
}

function convertGoogleDriveLinkForWishlist(url) {
  if (!url) return getDefaultWishlistImage();

  if (url.includes('drive.google.com/uc?')) {
    return url;
  }

  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }

  return url;
}

function getDefaultWishlistImage() {
  return '../assets/images/default_image.jpg';
}

// Render wishlist items
function renderWishlist() {
  const wishlistItems = document.getElementById('wishlistItems');
  const wishlistBadge = document.querySelector('.wishlist-badge');
  const wishlistCount = document.getElementById('wishlistCount');

  if (!wishlistItems) return;

  // Show loading state
  if (isWishlistLoading) {
    wishlistItems.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <span class="ml-3 text-gray-600">Đang tải sách yêu thích...</span>
      </div>
    `;
    return;
  }

  wishlistItems.innerHTML = '';
  let totalItems = 0;

  if (wishlist.length === 0) {
    wishlistItems.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <i class="ri-heart-line text-2xl text-gray-400"></i>
        </div>
        <div class="text-gray-500 mb-2">Chưa có sách yêu thích</div>
        <div class="text-sm text-gray-400">Thêm sách vào danh sách yêu thích để xem tại đây</div>
      </div>
    `;

    // Update badge and count
    if (wishlistBadge) wishlistBadge.removeAttribute('data-count');
    if (wishlistCount) wishlistCount.textContent = '0 sách';

    // Hide view all button when wishlist is empty
    const viewBtn = document.querySelector('.wishlist-view-btn');
    if (viewBtn) viewBtn.style.display = 'none';

    return;
  }

  // Show view all button when wishlist has items
  const viewBtn = document.querySelector('.wishlist-view-btn');
  if (viewBtn) viewBtn.style.display = 'block';

  wishlist.forEach((item, idx) => {
    totalItems += 1;

    const itemDiv = document.createElement('div');
    itemDiv.className = "flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-3 wishlist-item";
    itemDiv.setAttribute('data-book-id', item.id);

    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${escapeHtmlForWishlist(item.name)}" 
           class="w-16 h-20 object-cover rounded border border-gray-200 flex-shrink-0"
           onerror="this.src='${getDefaultWishlistImage()}'"/>
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-gray-800 text-sm line-clamp-2 mb-1">${escapeHtmlForWishlist(item.name)}</h4>
        <p class="text-xs text-gray-500 mb-2">${escapeHtmlForWishlist(item.author)}</p>
        <div class="flex items-center justify-between mb-2">
          <span class="text-red-500 font-semibold text-sm">${formatVND(item.price)}</span>
        </div>
        <div class="flex items-center justify-between">
          <button class="px-3 py-1.5 bg-primarynavy text-white rounded text-xs font-medium hover:bg-blue-700 transition" 
                  data-action="add-to-cart" data-idx="${idx}" data-book-id="${item.id}">
            <i class="ri-shopping-cart-line mr-1"></i>Thêm vào giỏ
          </button>
          <button class="text-red-500 hover:text-red-700 transition text-xs font-medium" 
                  data-action="remove" data-idx="${idx}" data-book-id="${item.id}" title="Xóa khỏi yêu thích">
            <i class="ri-heart-fill"></i>
          </button>
        </div>
      </div>
    `;

    wishlistItems.appendChild(itemDiv);
  });

  // Update count and badge
  if (wishlistCount) wishlistCount.textContent = `${totalItems} sách`;
  if (wishlistBadge) {
    wishlistBadge.setAttribute('data-count', totalItems);
    // Update wishlist badge style
    if (totalItems > 0) {
      wishlistBadge.classList.add('wishlist-has-items');
    } else {
      wishlistBadge.classList.remove('wishlist-has-items');
    }
  }

  console.log('❤️ [Wishlist] Rendered', wishlist.length, 'items');
}

// Escape HTML for wishlist display
function escapeHtmlForWishlist(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle wishlist events (remove, add to cart)
async function wishlistEventHandler(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.getAttribute('data-action');
  const idx = parseInt(target.getAttribute('data-idx'));
  const bookId = target.getAttribute('data-book-id');

  // Prevent multiple clicks
  if (target.disabled || isWishlistLoading) return;
  target.disabled = true;

  try {
    console.log('❤️ [Wishlist] Action:', action, 'for book:', bookId, 'index:', idx);

    if (action === 'remove') {
      console.log('🗑️ [Wishlist] Removing item:', bookId);
      await removeFromWishlist(bookId);
    } else if (action === 'add-to-cart') {
      console.log('🛒 [Wishlist] Adding to cart:', bookId);
      const success = await addToCartFromExternal(bookId, 1, 'buy');
      if (success) {
        showWishlistSuccess('Đã thêm sách vào giỏ hàng');
      }
    } else {
      console.warn('⚠️ [Wishlist] Unknown action:', action);
    }
  } catch (error) {
    console.error('❌ [Wishlist] Error handling wishlist action:', error);
    showWishlistError('Có lỗi xảy ra: ' + (error.message || 'Unknown error'));
  } finally {
    target.disabled = false;
  }
}

// Remove item from wishlist via API
async function removeFromWishlist(bookId) {
  if (!window.ApiService || !window.AuthManager?.isAuthenticated()) {
    throw new Error('Cần đăng nhập để xóa sách yêu thích');
  }

  try {
    console.log('❤️ [Wishlist] Removing book from wishlist:', bookId);

    // Find item in local wishlist
    const itemIndex = wishlist.findIndex(item => item.id === bookId);
    if (itemIndex === -1) {
      throw new Error('Sách không tồn tại trong danh sách yêu thích');
    }

    console.log('🗑️ [Wishlist] Calling removeFromFavourites API for book:', bookId);
    const response = await window.ApiService.removeFromFavourites(bookId);

    if (response.success || response.message || response.msg) {
      // Remove from local wishlist immediately for better UX
      wishlist.splice(itemIndex, 1);
      renderWishlist();

      // Reload wishlist to ensure consistency
      setTimeout(loadWishlist, 100);

      showWishlistSuccess('Đã xóa sách khỏi danh sách yêu thích');
      console.log('✅ [Wishlist] Item removed successfully');
    } else {
      console.error('❌ [Wishlist] Unexpected response format:', response);

      // Last resort: reload wishlist to check if item was actually removed
      console.log('🔄 [Wishlist] Reloading wishlist to verify removal...');
      await loadWishlist();

      // Check if item is still in wishlist after reload
      const stillExists = wishlist.find(item => item.id === bookId);
      if (!stillExists) {
        showWishlistSuccess('Đã xóa sách khỏi danh sách yêu thích');
        console.log('✅ [Wishlist] Item was removed despite unclear response');
      } else {
        throw new Error('Không thể xóa sách khỏi danh sách yêu thích');
      }
    }
  } catch (error) {
    console.error('❌ [Wishlist] Error removing from wishlist:', error);
    throw error;
  }
}

// Show wishlist success message
function showWishlistSuccess(message) {
  showWishlistMessage(message, 'success');
}

// Show wishlist error message
function showWishlistError(message) {
  showWishlistMessage(message, 'error');
}

// Show wishlist message
function showWishlistMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  messageDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-[10001] flex items-center space-x-2 transform translate-x-full transition-transform duration-300`;
  messageDiv.innerHTML = `
    <i class="ri-${type === 'success' ? 'check-circle' : type === 'error' ? 'error-warning' : 'information'}-line"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(messageDiv);

  // Slide in
  setTimeout(() => {
    messageDiv.classList.remove('translate-x-full');
  }, 10);

  // Slide out and remove
  setTimeout(() => {
    messageDiv.classList.add('translate-x-full');
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 300);
  }, 3000);
}

function initWishlistPanel() {
  const wishlistBtn = document.getElementById('wishlistBtn');
  const wishlistPanel = document.getElementById('wishlistPanel');
  const closeWishlistPanelBtn = document.getElementById('closeWishlistPanel');
  const wishlistItems = document.getElementById('wishlistItems');

  if (!wishlistBtn || !wishlistPanel || !closeWishlistPanelBtn || !wishlistItems) return;

  // Wishlist button click handler - load wishlist when opening
  wishlistBtn.onclick = function (e) {
    e.preventDefault();
    console.log('❤️ [Wishlist] Wishlist button clicked');
    openWishlistPanel();
    // Load wishlist data when panel opens
    loadWishlist();
  };

  closeWishlistPanelBtn.onclick = function (e) {
    e.preventDefault();
    closeWishlistPanel();
  };

  // Close panel when click outside panel
  document.addEventListener('mousedown', function (e) {
    if (
      wishlistPanel &&
      !wishlistPanel.classList.contains('hidden') &&
      !wishlistPanel.classList.contains('translate-x-full') &&
      !wishlistPanel.contains(e.target) &&
      (!wishlistBtn || !wishlistBtn.contains(e.target))
    ) {
      closeWishlistPanel();
    }
  });

  // Event delegation for wishlist items
  wishlistItems.addEventListener('click', wishlistEventHandler);

  // Initial wishlist load
  if (window.AuthManager && window.AuthManager.isAuthenticated()) {
    loadWishlist();
  } else {
    renderWishlist(); // Show empty wishlist
  }

  console.log('❤️ [Wishlist] Wishlist panel initialized');
}

// Add to wishlist function for external use
async function addToWishlistFromExternal(bookId) {
  if (!window.ApiService) {
    console.error('❌ [Wishlist] ApiService not available');
    showWishlistError('Dịch vụ không khả dụng');
    return false;
  }

  if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
    console.log('🔐 [Wishlist] User not authenticated, redirecting to login');
    showWishlistError('Vui lòng đăng nhập để thêm sách yêu thích');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return false;
  }

  try {
    console.log('❤️ [Wishlist] Adding to wishlist:', bookId);

    const response = await window.ApiService.addToFavourites(bookId);

    if (response.success || response.message) {
      showWishlistSuccess('Đã thêm sách vào danh sách yêu thích');
      // Reload wishlist to update display
      await loadWishlist();
      console.log('✅ [Wishlist] Added to wishlist successfully');
      return true;
    } else {
      throw new Error(response.error || 'Failed to add to wishlist');
    }
  } catch (error) {
    console.error('❌ [Wishlist] Error adding to wishlist:', error);
    showWishlistError('Có lỗi xảy ra khi thêm vào danh sách yêu thích');
    return false;
  }
}

// Refresh wishlist data (for external use)
async function refreshWishlist() {
  console.log('🔄 [Wishlist] Refreshing wishlist data...');
  await loadWishlist();
}

// Debug function for wishlist
function debugWishlist() {
  console.log('=== WISHLIST DEBUG ===');
  console.log('isWishlistLoading:', isWishlistLoading);
  console.log('wishlist array:', wishlist);
  console.log('wishlist length:', wishlist.length);
  console.log('AuthManager available:', !!window.AuthManager);
  console.log('ApiService available:', !!window.ApiService);
  console.log('User authenticated:', window.AuthManager?.isAuthenticated());
  console.log('======================');
  return { isWishlistLoading, wishlist, authAvailable: !!window.AuthManager, apiAvailable: !!window.ApiService };
}

// Make wishlist functions globally available
window.addToWishlistFromExternal = addToWishlistFromExternal;
window.refreshWishlist = refreshWishlist;
window.debugWishlist = debugWishlist;

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
    if (typeof initWishlistPanel === 'function') initWishlistPanel();
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
      if (typeof initWishlistPanel === 'function') initWishlistPanel();
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
          // Reload cart and wishlist when auth state changes
          if (window.AuthManager && window.AuthManager.isAuthenticated()) {
            loadCart();
            loadWishlist();
          } else {
            cart = [];
            wishlist = [];
            renderCart();
            renderWishlist();
          }
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