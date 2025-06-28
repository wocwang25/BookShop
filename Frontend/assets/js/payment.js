let cartData = [];
let isProcessingPayment = false;

function formatCurrency(num) {
  return Number(num).toLocaleString("vi-VN") + " VNĐ";
}

// Helper function to get book image
function getBookImage(book) {
  console.log('🖼️ [Payment] Processing book image:', {
    imageUrl: book.imageUrl,
    image: book.image,
    coverImage: book.coverImage
  });

  // Check various image fields
  let imageUrl = book.imageUrl || book.image || book.coverImage;

  if (!imageUrl || imageUrl.trim() === '') {
    console.log('🖼️ [Payment] No image found, using default');
    return '../assets/images/default_image.jpg';
  }

  // Convert Google Drive links if needed
  if (imageUrl.includes('drive.google.com/file/d/')) {
    const match = imageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      imageUrl = `https://drive.google.com/uc?id=${match[1]}&export=view`;
      console.log('🖼️ [Payment] Converted Google Drive URL:', imageUrl);
    }
  }

  return imageUrl;
}

// Helper function to get author name
function getAuthorName(book) {
  console.log('👤 [Payment] Processing author:', {
    author: book.author,
    authorType: typeof book.author,
    authorName: book.author?.name
  });

  if (!book.author) {
    return 'Tác giả không rõ';
  }

  // Author could be string or object
  if (typeof book.author === 'string') {
    return book.author;
  }

  if (typeof book.author === 'object' && book.author.name) {
    return book.author.name;
  }

  return 'Tác giả không rõ';
}

// Helper function to format address
function formatAddress(address) {
  if (!address) return 'Chưa cập nhật địa chỉ';

  if (typeof address === 'string') {
    return address.trim() || 'Chưa cập nhật địa chỉ';
  }

  if (typeof address === 'object') {
    const parts = [];

    // Add street/detail
    if (address.detail || address.street || address.line1) {
      parts.push(address.detail || address.street || address.line1);
    }

    // Add ward
    if (address.ward || address.commune) {
      parts.push(address.ward || address.commune);
    }

    // Add district
    if (address.district) {
      parts.push(address.district);
    }

    // Add province/city
    if (address.province || address.city || address.state) {
      parts.push(address.province || address.city || address.state);
    }

    // Add country if available and not Vietnam
    if (address.country && address.country.toLowerCase() !== 'vietnam' && address.country.toLowerCase() !== 'vn') {
      parts.push(address.country);
    }

    const formatted = parts.filter(part => part && part.trim()).join(', ');
    return formatted || 'Chưa cập nhật địa chỉ';
  }

  return 'Chưa cập nhật địa chỉ';
}

// Load cart data from API
async function loadCartData() {
  try {
    console.log('🛒 [Payment] Loading cart data...');

    // Check if services are available
    if (!window.AuthManager) {
      console.error('❌ AuthManager not available');
      showError('Lỗi hệ thống: AuthManager không khả dụng');
      return;
    }

    if (!window.ApiService) {
      console.error('❌ ApiService not available');
      showError('Lỗi hệ thống: ApiService không khả dụng');
      return;
    }

    // Check if user is authenticated
    if (!window.AuthManager.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }

    // Load cart items from API
    const response = await window.ApiService.getCart();
    console.log('📦 [Payment] Cart response:', response);
    console.log('📦 [Payment] Response type:', typeof response);
    console.log('📦 [Payment] Is array:', Array.isArray(response));

    let cartItems = [];

    // Handle different response formats
    if (Array.isArray(response)) {
      cartItems = response;
    } else if (response && response.items && Array.isArray(response.items)) {
      cartItems = response.items;
    } else if (response && response.cart && Array.isArray(response.cart.items)) {
      cartItems = response.cart.items;
    } else {
      console.log('⚠️ [Payment] Unexpected response format:', response);
      showEmptyCart();
      return;
    }

    console.log('📦 [Payment] Processed cart items:', cartItems);

    if (cartItems.length > 0) {
      // Filter buy items for payment (treat items without type as 'buy')
      cartData = cartItems.filter(item => !item.type || item.type === 'buy');
      console.log('✅ [Payment] Filtered cart data:', cartData);

      // Debug each cart item
      cartData.forEach((item, index) => {
        console.log(`📦 [Payment] Cart item ${index}:`, {
          hasBook: !!item.book,
          bookTitle: item.book?.title,
          bookAuthor: item.book?.author,
          bookImage: item.book?.imageUrl || item.book?.image,
          quantity: item.quantity,
          price: item.price,
          type: item.type
        });
      });

      renderCartItems();
      updateTotals();
    } else {
      console.log('⚠️ [Payment] No cart items found');
      showEmptyCart();
    }
  } catch (error) {
    console.error('❌ [Payment] Error loading cart:', error);
    showError('Không thể tải giỏ hàng. Vui lòng thử lại.');
  }
}

// Render cart items in the payment page
function renderCartItems() {
  const productList = document.getElementById('product-list');

  if (!cartData || cartData.length === 0) {
    showEmptyCart();
    return;
  }

  productList.innerHTML = '';

  cartData.forEach((item, index) => {
    const book = item.book;

    // Debug cart item structure
    console.log('🛒 [Payment] Cart item:', item);
    console.log('📖 [Payment] Book data:', book);
    console.log('📖 [Payment] Book fields:', Object.keys(book));
    console.log('📖 [Payment] Author data:', {
      author: book.author,
      authorName: book.author?.name,
      authorType: typeof book.author
    });
    console.log('📖 [Payment] Image data:', {
      image: book.image,
      imageUrl: book.imageUrl,
      coverImage: book.coverImage
    });

    const productItem = document.createElement('div');
    productItem.className = 'product-item flex items-start gap-3 pb-3 border-b border-gray-200';
    productItem.dataset.price = item.price;
    productItem.dataset.index = index;

    // Get book image with proper fallback
    const bookImage = getBookImage(book);

    // Get author name with proper fallback
    const authorName = getAuthorName(book);

    productItem.innerHTML = `
      <div class="w-16 h-20 bg-gray-100 flex-shrink-0">
        <img
          src="${bookImage}"
          alt="${book.title || 'Sách'}"
          class="w-full h-full object-cover"
          onerror="this.src='../assets/images/default_image.jpg'"
        >
      </div>
      <div class="flex-grow">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium">${book.title || 'Tên sách không rõ'}</h3>
            <p class="text-sm text-gray-500">By ${authorName}</p>
          </div>
          <button class="remove-item text-gray-400 hover:text-red-500" data-index="${index}">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center border rounded-md">
            <button
              class="decrease w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-md"
              data-index="${index}">-</button>
            <input type="number" value="${item.quantity}" class="quantity-input w-10 h-8 text-center border-x" min="1" data-index="${index}">
            <button
              class="increase w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-md"
              data-index="${index}">+</button>
          </div>
          <span class="item-total font-medium">${formatCurrency(item.price * item.quantity)}</span>
        </div>
      </div>
    `;

    productList.appendChild(productItem);
  });

  // Add event listeners for quantity controls
  addQuantityEventListeners();
}

// Add event listeners for quantity controls
function addQuantityEventListeners() {
  // Increase quantity
  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      cartData[index].quantity += 1;
      updateItemDisplay(index);
      updateTotals();
    });
  });

  // Decrease quantity
  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      if (cartData[index].quantity > 1) {
        cartData[index].quantity -= 1;
        updateItemDisplay(index);
        updateTotals();
      }
    });
  });

  // Manual quantity input
  document.querySelectorAll(".quantity-input").forEach(input => {
    input.addEventListener("input", () => {
      const index = parseInt(input.dataset.index);
      const newQuantity = parseInt(input.value);
      if (newQuantity > 0) {
        cartData[index].quantity = newQuantity;
        updateItemDisplay(index);
        updateTotals();
      } else {
        input.value = cartData[index].quantity;
      }
    });
  });

  // Remove item
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      removeCartItem(index);
    });
  });
}

// Update individual item display
function updateItemDisplay(index) {
  const item = cartData[index];
  const productItem = document.querySelector(`[data-index="${index}"]`);
  if (productItem) {
    const quantityInput = productItem.querySelector('.quantity-input');
    const itemTotal = productItem.querySelector('.item-total');

    quantityInput.value = item.quantity;
    itemTotal.textContent = formatCurrency(item.price * item.quantity);
  }
}

// Remove item from cart
async function removeCartItem(index) {
  try {
    const item = cartData[index];
    console.log('🗑️ [Payment] Removing item:', item);

    if (!item.book) {
      throw new Error('Invalid book data for removal');
    }

    // Get book ID (try different fields)
    const bookId = item.book._id || item.book.id;
    if (!bookId) {
      throw new Error('Book ID not found');
    }

    console.log('🗑️ [Payment] Using book ID for removal:', bookId);

    // Remove from backend
    await window.ApiService.removeCartItem(bookId);

    // Remove from local data
    cartData.splice(index, 1);

    // Re-render cart
    renderCartItems();
    updateTotals();

    console.log('✅ [Payment] Item removed successfully');
  } catch (error) {
    console.error('❌ [Payment] Error removing item:', error);
    showError('Không thể xóa sản phẩm. Vui lòng thử lại.');
  }
}

function updateTotals() {
  let subtotal = 0;

  cartData.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  // const tax = Math.round(subtotal * 0.135);
  const tax = 0;
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("tax").textContent = formatCurrency(tax);
  document.getElementById("total").textContent = formatCurrency(total);

  // Update QR code total
  const qrTotal = document.querySelector('.text-2xl.font-bold.text-primary');
  if (qrTotal) {
    qrTotal.textContent = formatCurrency(total);
  }
}

function showEmptyCart() {
  const productList = document.getElementById('product-list');
  productList.innerHTML = `
    <div class="text-center py-8">
      <i class="ri-shopping-cart-line text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-500">Giỏ hàng trống</p>
      <a href="/books" class="text-blue-500 hover:underline mt-2 inline-block">
        Tiếp tục mua sắm
      </a>
    </div>
  `;

  document.getElementById("subtotal").textContent = "0 VNĐ";
  document.getElementById("tax").textContent = "0 VNĐ";
  document.getElementById("total").textContent = "0 VNĐ";
}

function showError(message) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = `
    <div class="text-center py-8">
      <i class="ri-error-warning-line text-4xl text-red-400 mb-4"></i>
      <p class="text-red-500">${message}</p>
      <button onclick="loadCartData()" class="text-blue-500 hover:underline mt-2 inline-block">
        Thử lại
      </button>
    </div>
  `;
}

// Handle payment process
async function processPayment() {
  if (isProcessingPayment) {
    console.log('⏳ [Payment] Payment already in progress');
    return;
  }

  if (!cartData || cartData.length === 0) {
    showError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
    return;
  }

  // Check if services are available
  if (!window.AuthManager) {
    showError('Lỗi hệ thống: AuthManager không khả dụng');
    return;
  }

  if (!window.ApiService) {
    showError('Lỗi hệ thống: ApiService không khả dụng');
    return;
  }

  try {
    isProcessingPayment = true;
    console.log('💳 [Payment] Processing payment...');

    // Get user info
    const userProfile = window.AuthManager.getUser();
    const customerName = userProfile?.name || 'Guest Customer';

    // Prepare invoice items
    const invoiceItems = cartData.map(item => {
      console.log('📋 [Payment] Processing cart item for invoice:', item);

      if (!item.book) {
        console.error('❌ [Payment] Missing book data:', item);
        throw new Error(`Missing book data for item: ${JSON.stringify(item)}`);
      }

      const bookTitle = item.book.title || 'Sách không rõ tên';
      const quantity = item.quantity || 1;

      console.log('📋 [Payment] Mapped item:', { title: bookTitle, quantity: quantity });

      return {
        title: bookTitle,
        quantity: quantity
      };
    });

    console.log('📄 [Payment] Creating invoice with items:', invoiceItems);
    console.log('👤 [Payment] Customer name:', customerName);

    // Create sales invoice
    const response = await window.ApiService.createSalesInvoice(customerName, invoiceItems);

    if (response && (response.message || response.data)) {
      console.log('✅ [Payment] Invoice created successfully:', response);

      // Clear cart from backend (remove all items)
      for (const item of cartData) {
        try {
          await window.ApiService.removeCartItem(item.book._id);
        } catch (error) {
          console.warn('⚠️ [Payment] Error clearing cart item:', error);
        }
      }

      // Show success popup
      showSuccessPopup(response.data?.salesInvoice?._id || 'Unknown');

    } else {
      throw new Error('Invalid response from server');
    }

  } catch (error) {
    console.error('❌ [Payment] Payment failed:', error);
    showError(`Thanh toán thất bại: ${error.message}`);
  } finally {
    isProcessingPayment = false;
  }
}

function showSuccessPopup(invoiceId) {
  const popup = document.getElementById("success-popup");
  const orderIdElement = popup.querySelector('.text-blue-600, .text-\\[\\#1e40af\\]');

  if (orderIdElement) {
    orderIdElement.textContent = `#INV${invoiceId}`;
  }

  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("show"), 10);
}

// Load shipping info on page load (using settingA.js logic)
async function loadShippingInfo() {
  try {
    console.log('📦 [Payment] Loading shipping info...');

    // Check if user is authenticated (same as settingA.js)
    if (typeof window.AuthManager === 'undefined' || !window.AuthManager.isAuthenticated()) {
      console.log('⚠️ [Payment] User not authenticated');
      showShippingError('Vui lòng đăng nhập để xem thông tin giao hàng');
      return;
    }

    // Get profile data from API (same as settingA.js)
    console.log('📡 [Payment] Getting user profile from API...');
    const response = await window.ApiService.getProfile();
    console.log('📡 [Payment] API Response:', response);

    if (response.status === 'success' && response.user) {
      populateShippingData(response.user);
    } else {
      throw new Error('Failed to load profile');
    }

  } catch (error) {
    console.error('❌ [Payment] Error loading shipping info:', error);
    showShippingError('Không thể tải thông tin giao hàng. Vui lòng thử lại.');
  }
}

// Populate shipping data (using settingA.js logic)
function populateShippingData(user) {
  console.log('👤 [Payment] Populating shipping data for user:', user);

  // Use customerProfile as primary source (same as settingA.js)
  const customerProfile = user.customerProfile || {};
  console.log('👤 [Payment] Customer profile:', customerProfile);

  // Hide loading and show content
  const loadingElement = document.getElementById("shipping-loading");
  const contentElement = document.getElementById("shipping-content");

  if (loadingElement) loadingElement.classList.add('hidden');
  if (contentElement) contentElement.classList.remove('hidden');

  // Define field mapping (same as settingA.js)
  const fields = {
    'display-name': customerProfile.name || user.name || 'Chưa cập nhật',
    'display-email': customerProfile.email || user.email || 'Chưa cập nhật',
    'display-phone': customerProfile.phone || 'Chưa cập nhật',
    'display-address': customerProfile.address || 'Chưa cập nhật địa chỉ'
  };

  console.log('📋 [Payment] Field mapping:', fields);

  // Populate each field
  Object.entries(fields).forEach(([fieldId, value]) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.textContent = value;
      console.log(`✅ [Payment] ${fieldId}:`, value);
    }
  });

  // Handle address fallback to localStorage if needed
  const displayAddress = document.getElementById("display-address");
  if (displayAddress && displayAddress.textContent === 'Chưa cập nhật địa chỉ') {
    console.log('📍 [Payment] No API address, trying localStorage...');
    const localUserInfo = JSON.parse(localStorage.getItem("shippingInfo") || "{}");
    const addressList = JSON.parse(localStorage.getItem("deliveryAddresses") || "[]");

    console.log('📍 [Payment] LocalStorage data:', {
      userInfo: localUserInfo,
      addresses: addressList
    });

    if (localUserInfo && localUserInfo.addressIndex !== undefined) {
      const index = parseInt(localUserInfo.addressIndex, 10);
      if (!isNaN(index) && addressList[index]) {
        const addr = addressList[index];
        const addressText = formatAddress(addr);
        if (addressText !== 'Chưa cập nhật địa chỉ') {
          displayAddress.textContent = addressText;
          console.log('📍 [Payment] Using localStorage address:', addressText);
        }
      }
    }
  }

  console.log('✅ [Payment] Shipping info loaded successfully');
}

// Show shipping info error
function showShippingError(message) {
  // Hide loading
  const loadingElement = document.getElementById("shipping-loading");
  const contentElement = document.getElementById("shipping-content");

  if (loadingElement) loadingElement.classList.add('hidden');
  if (contentElement) contentElement.classList.add('hidden');

  const shippingInfo = document.getElementById('shipping-info');
  if (shippingInfo) {
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-center py-6';
    errorDiv.innerHTML = `
      <i class="ri-error-warning-line text-3xl text-red-400 mb-3"></i>
      <p class="text-red-500 text-sm mb-3">${message}</p>
      <a href="/settings" class="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
        <i class="ri-settings-line"></i>
        Cập nhật thông tin
      </a>
    `;

    // Replace content
    shippingInfo.innerHTML = '';
    shippingInfo.appendChild(errorDiv);
  }
}

// Wait for services to be available
async function waitForServices() {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    if (window.AuthManager && window.ApiService) {
      console.log('✅ [Payment] Services available');
      return true;
    }

    console.log(`⏳ [Payment] Waiting for services... (${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 200));
    attempts++;
  }

  console.error('❌ [Payment] Services not available after waiting');
  return false;
}

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  console.log('🚀 [Payment] Initializing payment page...');

  // Wait for services to be available
  const servicesReady = await waitForServices();
  if (!servicesReady) {
    showError('Lỗi tải trang. Vui lòng refresh trang.');
    return;
  }

  // Load shipping info
  await loadShippingInfo();

  // Load cart data
  await loadCartData();

  // Add payment button event listener
  const confirmPaymentBtn = document.getElementById("confirm-payment-btn");
  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener("click", processPayment);
  }

  // Add paid button event listener (simulate payment confirmation)
  const paidButtons = document.querySelectorAll('button');
  paidButtons.forEach(btn => {
    if (btn.textContent.includes('Đã thanh toán')) {
      btn.addEventListener("click", () => {
        console.log('📱 [Payment] Payment confirmed via QR code');
        // You could add additional logic here for QR code payment confirmation
      });
    }
  });

  console.log('✅ [Payment] Payment page initialized');
});

// Test function for debugging
async function testSalesInvoiceAPI() {
  console.log('🧪 [Test] Testing sales invoice API...');

  try {
    const testData = {
      customer_name: 'Test Customer',
      items: [
        {
          title: 'Test Book',
          quantity: 1
        }
      ]
    };

    console.log('🧪 [Test] Sending test data:', testData);

    const response = await window.ApiService.createSalesInvoice(
      testData.customer_name,
      testData.items
    );

    console.log('✅ [Test] API test successful:', response);
    return response;
  } catch (error) {
    console.error('❌ [Test] API test failed:', error);
    throw error;
  }
}

// Test with real cart data
async function testWithCartData() {
  console.log('🧪 [Test] Testing with current cart data...');

  if (!cartData || cartData.length === 0) {
    console.log('⚠️ [Test] No cart data available');
    return;
  }

  try {
    const userProfile = window.AuthManager.getUser();
    const customerName = userProfile?.name || 'Test Customer';

    // Prepare invoice items (same as in processPayment)
    const invoiceItems = cartData.map(item => {
      console.log('📋 [Test] Cart item:', item);

      return {
        title: item.book.title,
        quantity: item.quantity || 1
      };
    });

    console.log('📄 [Test] Invoice items to send:', invoiceItems);
    console.log('👤 [Test] Customer name:', customerName);

    const response = await window.ApiService.createSalesInvoice(customerName, invoiceItems);

    console.log('✅ [Test] Cart data test successful:', response);
    return response;
  } catch (error) {
    console.error('❌ [Test] Cart data test failed:', error);
    throw error;
  }
}

// Make functions available globally
window.loadCartData = loadCartData;
window.processPayment = processPayment;
window.testSalesInvoiceAPI = testSalesInvoiceAPI;
window.testWithCartData = testWithCartData;
