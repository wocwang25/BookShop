// My Orders Management
let orders = [];
let currentOrderModal = null;

// Format currency to Vietnamese format
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format date to Vietnamese format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Get delivery date (5 days after order date)
function getDeliveryDate(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 5);
    return formatDate(date);
}

// Determine order status based on creation date
function determineOrderStatus(createdAt) {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 5) {
        return 'Đã giao';
    } else if (daysDiff >= 1) {
        return 'Đang giao';
    } else {
        return 'Đang xử lí';
    }
}

// Convert invoice data to order format for UI
function convertInvoiceToOrder(invoice) {
    // Prepare items array
    const items = (invoice.items || []).map(item => {
        // Handle different possible data structures
        const book = item.book || {};
        const title = book.title || item.title || 'Sách không xác định';
        const price = item.unitPrice || book.salePrice || book.price || 0;
        const quantity = item.quantity || 1;

        // Default image if not available
        const image = book.imageUrl || book.image || book.thumbnail || '../assets/images/default_image.jpg';

        return {
            title,
            price,
            quantity,
            image,
            subtotal: price * quantity
        };
    });

    // Calculate total
    const total = invoice.totalAmount || items.reduce((sum, item) => sum + item.subtotal, 0);

    // Generate order ID from invoice ID
    const orderId = invoice._id ? invoice._id.slice(-8).toUpperCase() : 'N/A';

    return {
        id: orderId,
        originalId: invoice._id,
        date: formatDate(invoice.createdAt),
        // status: determineOrderStatus(invoice.createdAt),
        status: 'Đang xử lí',
        total,
        items,
        type: 'sale'
    };
}

// Load orders from API
async function loadOrders() {
    try {
        // Check authentication
        if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Show loading state
        const tbody = document.querySelector('.order-table tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="flex items-center justify-center gap-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span class="text-gray-500">Đang tải đơn hàng...</span>
                    </div>
                </td>
            </tr>
        `;

        // Get invoices from API
        const response = await window.ApiService.getMyInvoices();

        if (!response.success) {
            throw new Error(response.error || 'Failed to load invoices');
        }

        // Convert sales invoices to orders (only sales, not rental)
        const salesInvoices = response.salesInvoices || [];
        orders = salesInvoices.map(invoice => convertInvoiceToOrder(invoice));

        // Display orders
        displayOrders();

    } catch (error) {
        // Show error state
        const tbody = document.querySelector('.order-table tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-red-500">
                        <i class="ri-error-warning-line text-xl mb-2"></i>
                        <div>Không thể tải danh sách đơn hàng</div>
                        <div class="text-sm text-gray-500 mt-1">${error.message}</div>
                        <button onclick="loadOrders()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Thử lại
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Display orders in table
function displayOrders() {
    const tbody = document.querySelector('.order-table tbody');

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <div class="text-gray-500">
                        <i class="ri-shopping-bag-line text-4xl mb-4 opacity-50"></i>
                        <div class="text-lg mb-2">Chưa có đơn hàng nào</div>
                        <div class="text-sm">Hãy mua sắm để tạo đơn hàng đầu tiên!</div>
                        <a href="books.html" class="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Khám phá sách
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';

    orders.forEach((order, index) => {
        // Create books HTML
        const booksHTML = order.items.map(item => `
            <div class="flex gap-2 mb-2">
                                 <img src="${item.image}" 
                     alt="${item.title}" 
                     class="w-10 h-14 object-cover rounded"
                     onerror="this.src='../assets/images/default_image.jpg'" />
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm truncate" title="${item.title}">${item.title}</div>
                    <div class="text-xs text-gray-500">
                        ${formatCurrency(item.price)} × ${item.quantity}
                    </div>
                </div>
            </div>
        `).join('');

        // Create table row
        const tr = document.createElement('tr');
        tr.setAttribute('data-index', index);
        tr.className = 'hover:bg-gray-50';
        tr.innerHTML = `
            <td class="w-8">
                <input type="checkbox" class="rounded" />
            </td>
            <td class="font-mono text-sm">${order.id}</td>
            <td class="max-w-xs">
                <div class="flex flex-col gap-1">${booksHTML}</div>
            </td>
            <td class="text-sm text-gray-600">${order.date}</td>
            <td>
                <button class="status-link text-[#2d5aa0] hover:underline text-sm font-medium">
                    ${order.status}
                </button>
            </td>
            <td class="text-right font-semibold">${formatCurrency(order.total)}</td>
        `;

        tbody.appendChild(tr);
    });

    // Attach event listeners to status links
    attachStatusLinkEvents();
}

// Attach event listeners to status links
function attachStatusLinkEvents() {
    document.querySelectorAll('.status-link').forEach(link => {
        link.addEventListener('click', function () {
            const tr = this.closest('tr');
            const index = parseInt(tr.getAttribute('data-index'));
            const order = orders[index];
            if (order) {
                openModal(order);
            }
        });
    });
}

// Open order details modal
async function openModal(order) {
    currentOrderModal = order;
    const modal = document.getElementById('orderModal');

    if (!modal) {
        return;
    }

    // Update modal content
    const modalTitle = modal.querySelector('.modal-header h1');
    const modalDate = modal.querySelector('.modal-meta strong');
    const modalStatus = modal.querySelector('.status-text');
    const modalStatusCircle = modal.querySelector('.modal-status .circle');
    const productsContainer = modal.querySelector('.products');
    const summaryRows = modal.querySelectorAll('.summary .row');

    if (modalTitle) {
        modalTitle.textContent = `Mã: ${order.id}`;
    }
    if (modalDate) {
        modalDate.textContent = order.date;
    }

    // Update status display
    if (modalStatus) {
        // Display current status and expected delivery
        modalStatus.innerHTML = `
            <div class="font-medium text-sm mb-1">Trạng thái: <span class="text-blue-600">${order.status}</span></div>
            `;
        // <div class="text-xs text-gray-500">Dự kiến nhận hàng: ${getDeliveryDate(order.date)}</div>
    }

    // Update status circle color based on status
    if (modalStatusCircle) {
        modalStatusCircle.className = 'circle';
        if (order.status === 'Đã giao') {
            modalStatusCircle.classList.add('success');
        } else if (order.status === 'Đang giao') {
            modalStatusCircle.classList.add('processing');
        } else if (order.status === 'Đang xử lí') {
            modalStatusCircle.classList.add('pending');
        } else {
            modalStatusCircle.classList.add('pending');
        }
    }

    // Clear and populate products
    if (productsContainer) {
        productsContainer.innerHTML = '';
        order.items.forEach(item => {
            const productEl = document.createElement('div');
            productEl.className = 'product flex gap-4 p-4 border rounded-lg bg-gray-50';
            productEl.innerHTML = `
                <div class="thumb flex-shrink-0">
                    <img src="${item.image}" 
                         alt="${item.title}" 
                         class="w-16 h-20 object-cover rounded"
                         onerror="this.src='../assets/images/default_image.jpg'" />
                </div>
                <div class="details flex-1">
                    <h3 class="font-medium text-gray-900 mb-1">${item.title}</h3>
                    <div class="text-sm text-gray-500">Số lượng: ${item.quantity}</div>
                </div>
                <div class="price text-right">
                    <div class="font-semibold text-lg text-gray-900">${formatCurrency(item.price)}</div>
                    <div class="text-sm text-gray-500">đơn giá</div>
                </div>
            `;
            productsContainer.appendChild(productEl);
        });
    }

    // Update delivery address
    const deliveryElement = modal.querySelector('.delivery p');
    if (deliveryElement) {
        // Try to get address from user profile with proper null checking
        const profile = await window.ApiService?.getProfile();
        let address = 'Địa chỉ chưa được cập nhật';

        const userProfile = profile?.user;

        // Check user profile address
        if (userProfile?.customerProfile?.address) {
            address = userProfile.customerProfile.address;
        }

        deliveryElement.textContent = `Địa chỉ: ${address}`;
    }

    // Update summary
    if (summaryRows.length >= 4) {
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = 0; // No discount for now
        const shipping = 0; // Free shipping
        const total = order.total;

        summaryRows[0].querySelector('span:last-child').textContent = formatCurrency(subtotal);
        summaryRows[1].querySelector('span:last-child').textContent = formatCurrency(discount);
        summaryRows[2].querySelector('span:last-child').textContent = formatCurrency(shipping);
        summaryRows[3].querySelector('span:last-child').textContent = formatCurrency(total);
    }

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close modal
function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }
    currentOrderModal = null;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Load orders from API
    loadOrders();

    // Add keyboard shortcut to close modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && currentOrderModal) {
            closeModal();
        }
    });
});

// Export functions for global access
window.openModal = openModal;
window.closeModal = closeModal;
window.loadOrders = loadOrders;