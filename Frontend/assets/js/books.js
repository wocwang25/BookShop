// Books page JavaScript functionality
let allBooks = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 12;
let currentSearchQuery = '';
let currentCategory = 'all';

// User cart and favorites state (similar to books.html)
let userCartBookIds = [];
let userFavouriteBookIds = [];

// Get URL parameters
function getURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        search: urlParams.get('search') || '',
        category: urlParams.get('category') || 'all',
        page: parseInt(urlParams.get('page')) || 1
    };
}

// Update URL without reload
function updateURL(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.replaceState({}, '', url);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function () {
    const params = getURLParams();
    currentSearchQuery = params.search;
    currentCategory = params.category;
    currentPage = params.page;

    // Set search input value if there's a search query
    const searchInput = document.querySelector('#searchInput');
    if (searchInput && currentSearchQuery) {
        searchInput.value = currentSearchQuery;
    }

    // Set category filter if exists
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        if (radio.value === currentCategory) {
            radio.checked = true;
        }
    });

    // Load user cart and favorites first
    await fetchUserCartAndWishlist();

    // Load and display books
    await loadBooks();

    // Setup event listeners
    setupEventListeners();
});

// Fetch user cart and wishlist data
async function fetchUserCartAndWishlist() {
    try {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!isLoggedIn) {
            userCartBookIds = [];
            userFavouriteBookIds = [];
            return;
        }


        // Fetch cart
        try {
            const cartRes = await ApiService.getCart();
            let cartItems = [];
            if (cartRes.items) {
                cartItems = cartRes.items;
            } else if (cartRes.cart && cartRes.cart.items) {
                cartItems = cartRes.cart.items;
            } else if (Array.isArray(cartRes)) {
                cartItems = cartRes;
            }

            userCartBookIds = cartItems.map(item =>
                item.bookId || item.book?._id || item.book || item._id || item.id
            ).filter(id => id);

        } catch (cartError) {
            console.error('❌ [books.js] Error fetching cart:', cartError);
            userCartBookIds = [];
        }

        // Fetch favourites
        try {
            const favRes = await ApiService.getFavourites();

            let favourites = [];
            if (favRes.favourites) {
                favourites = favRes.favourites;
            } else if (Array.isArray(favRes)) {
                favourites = favRes;
            } else if (favRes.success && favRes.data) {
                favourites = favRes.data;
            } else if (favRes.data) {
                favourites = favRes.data;
            }

            userFavouriteBookIds = favourites.map(fav => {
                if (fav.book && fav.book._id) return fav.book._id;
                if (fav.book) return fav.book;
                if (fav.bookId) return fav.bookId;
                if (fav._id) return fav._id;
                if (fav.id) return fav.id;
                return null;
            }).filter(id => id);

        } catch (favError) {
            console.error('❌ [books.js] Error fetching favourites:', favError);
            userFavouriteBookIds = [];
        }

    } catch (error) {
        console.error('❌ [books.js] General error fetching user data:', error);
        userCartBookIds = [];
        userFavouriteBookIds = [];
    }
}

// Load books from API
async function loadBooks() {
    try {
        showLoading();

        let response;
        if (currentSearchQuery) {
            // Use search API
            response = await ApiService.searchBooks(currentSearchQuery);
        } else {
            // Get all books
            response = await ApiService.getAllBooks();
        }

        if (response.success && response.books) {
            allBooks = response.books;
            filterAndDisplayBooks();
        } else {
            showError('Không thể tải danh sách sách');
        }
    } catch (error) {
        console.error('Error loading books:', error);
        showError('Có lỗi xảy ra khi tải sách');
    }
}

// Filter books by category and search
function filterAndDisplayBooks() {
    filteredBooks = allBooks;

    // Filter by category
    if (currentCategory && currentCategory !== 'all') {
        filteredBooks = filteredBooks.filter(book =>
            book.category?.name === currentCategory || book.category === currentCategory
        );
    }

    // Additional search filter if needed
    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        filteredBooks = filteredBooks.filter(book =>
            book.title.toLowerCase().includes(query) ||
            (book.author?.name || book.author || '').toLowerCase().includes(query) ||
            (book.category?.name || book.category || '').toLowerCase().includes(query)
        );
    }

    displayBooks();
    displayPagination();
    updateResultsCount();
}

// Display books on current page
function displayBooks() {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);

    if (booksToShow.length === 0) {
        booksGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-500 text-lg mb-4">
                    ${currentSearchQuery ? 'Không tìm thấy sách nào phù hợp' : 'Không có sách nào trong danh mục này'}
                </div>
                ${currentSearchQuery ? `
                    <button onclick="clearSearch()" class="bg-primarynavy text-white px-6 py-2 rounded-button">
                        Xóa bộ lọc
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }

    const booksHtml = booksToShow.map(book => createBookCard(book)).join('');
    booksGrid.innerHTML = booksHtml;

    // Add event listeners to book cards
    addBookCardEventListeners();
}

// Create book card HTML
function createBookCard(book) {
    const bookId = book._id || book.id;

    // Get stock quantity from various possible fields
    const stockQuantity = book.quantity || book.availableStock || book.stock || 0;

    // Check if book is in cart or favourites
    const isInCart = userCartBookIds.some(cartId =>
        cartId === bookId || cartId === String(bookId)
    );
    const isFaved = userFavouriteBookIds.some(favId =>
        favId === bookId || favId === String(favId)
    );

    // Determine stock status
    let stockBadge = '';
    let buttonText = 'Thêm vào giỏ';
    let buttonClass = 'bg-gray-200 text-gray-800';
    let buttonDisabled = false;

    if (isInCart) {
        buttonText = '✔ Đã thêm';
        buttonClass = 'bg-green-500 text-white';
        buttonDisabled = true;
    } else if (stockQuantity <= 0) {
        buttonText = 'Hết hàng';
        buttonClass = 'bg-gray-400 text-gray-600 cursor-not-allowed';
        buttonDisabled = true;
        stockBadge = `<span class="absolute bottom-2 left-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Hết hàng</span>`;
    } else if (stockQuantity <= 5) {
        stockBadge = `<span class="absolute bottom-2 left-2 bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">Còn ${stockQuantity}</span>`;
    }

    return `
        <div class="bg-white rounded shadow-sm overflow-hidden flex flex-col h-full transition group cursor-pointer book-card-item" 
             data-id="${bookId}" data-stock="${stockQuantity}" onclick="viewBookDetail('${bookId}')">
            <div class="relative h-96 w-full flex-shrink-0">
                <img src="${getBookImage(book)}" alt="${escapeHtml(book.title)}" 
                     class="w-full h-full object-cover object-top" 
                     onerror="this.src='${getDefaultImage()}'">
                <button class="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-[#eaeaea]/90 rounded-full transition shadow-sm" 
                        onclick="toggleFavorite(event, '${bookId}')" title="Yêu thích">
                    <i class="${isFaved ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-800'}"></i>
                </button>
                ${book.rating ? `
                    <span class="absolute top-2 left-2 bg-[#eaeaea]/90 text-[#f7931e] shadow-sm text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm" title="Đánh giá">
                        <i class="ri-star-s-fill text-[#f7931e] text-base"></i> ${book.rating.toFixed(1)}
                    </span>
                ` : ''}
                ${stockBadge}
            </div>
            <div class="p-4 flex flex-col flex-1">
                <div class="text-sm text-gray-500 mb-2">${escapeHtml(book.category?.name || book.category || 'Sách')}</div>
                <h3 class="font-semibold text-gray-800 mb-2">${escapeHtml(book.title)}</h3>
                <p class="text-gray-600 mb-3">${escapeHtml(book.author?.name || book.author || 'Unknown Author')}</p>
                <div class="flex justify-between items-center mt-auto">
                    <span class="font-semibold text-primarynavy">${formatPrice(book.price)}</span>
                    <button class="${buttonClass} px-4 py-2 !rounded-button whitespace-nowrap transition" 
                            onclick="addToCart(event, '${bookId}')" ${buttonDisabled ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Display pagination
function displayPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHtml = '';

    // Previous button
    paginationHtml += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="ri-arrow-left-s-line"></i>
        </button>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHtml += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHtml += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHtml += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    paginationHtml += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="ri-arrow-right-s-line"></i>
        </button>
    `;

    pagination.innerHTML = paginationHtml;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    if (page < 1 || page > totalPages || page === currentPage) return;

    currentPage = page;
    updateURL({ search: currentSearchQuery, category: currentCategory, page: currentPage });
    displayBooks();
    displayPagination();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update results count
function updateResultsCount() {
    const resultCount = document.querySelector('.result-count');
    if (resultCount) {
        const total = filteredBooks.length;
        const start = (currentPage - 1) * booksPerPage + 1;
        const end = Math.min(currentPage * booksPerPage, total);

        if (total > 0) {
            resultCount.textContent = `Hiển thị ${start}-${end} trong ${total} kết quả`;
        } else {
            resultCount.textContent = 'Không có kết quả nào';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('#searchInput');
    const searchButton = document.querySelector('#searchButton');

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    // Category filter
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            currentPage = 1;
            updateURL({ search: currentSearchQuery, category: currentCategory, page: 1 });
            filterAndDisplayBooks();
        });
    });
}

// Perform search
function performSearch() {
    const searchInput = document.querySelector('#searchInput');
    if (!searchInput) return;

    currentSearchQuery = searchInput.value.trim();
    currentPage = 1;

    updateURL({ search: currentSearchQuery, category: currentCategory, page: 1 });
    loadBooks();
}

// Clear search
function clearSearch() {
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    currentSearchQuery = '';
    currentCategory = 'all';
    currentPage = 1;

    // Reset category radio
    const allCategoryRadio = document.querySelector('input[name="category"][value="all"]');
    if (allCategoryRadio) {
        allCategoryRadio.checked = true;
    }

    updateURL({ search: '', category: 'all', page: 1 });
    loadBooks();
}

// Add event listeners to book cards
function addBookCardEventListeners() {
    console.log('📘 [books.js] Book card event listeners handled inline');
}

// Utility functions
function getBookImage(book) {
    if (!book.imageUrl || book.imageUrl.trim() === '') {
        return getDefaultImage();
    }

    // Convert Google Drive link if needed
    return convertGoogleDriveLink(book.imageUrl);
}

function convertGoogleDriveLink(url) {
    if (!url) return getDefaultImage();

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

function getDefaultImage() {
    return '/assets/images/default_image.jpg';
}

function formatPrice(price) {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    const booksGrid = document.getElementById('booksGrid');
    if (booksGrid) {
        booksGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primarynavy"></div>
                <p class="mt-4 text-gray-500">Đang tải sách...</p>
            </div>
        `;
    }
}

function showError(message) {
    const booksGrid = document.getElementById('booksGrid');
    if (booksGrid) {
        booksGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-red-500 text-lg mb-4">${message}</div>
                <button onclick="loadBooks()" class="bg-primarynavy text-white px-6 py-2 rounded-button">
                    Thử lại
                </button>
            </div>
        `;
    }
}

async function addToCart(event, bookId) {
    event.stopPropagation();

    const button = event.target;
    const originalText = button.textContent;
    const originalClasses = button.className;

    // Check if already in cart or if button is processing
    if (button.disabled) return;

    // Get stock from book card data
    const bookCard = button.closest('.book-card-item');
    const stockQuantity = parseInt(bookCard?.dataset?.stock || '0');

    // Validate stock before proceeding
    if (stockQuantity <= 0) {
        alert('Sách này hiện đã hết hàng!');
        return;
    }

    // Check if already in cart by ID
    const isInCart = userCartBookIds.some(cartId =>
        cartId === bookId || cartId === String(bookId)
    );

    if (isInCart) {
        return;
    }

    try {
        button.textContent = 'Đang thêm...';
        button.disabled = true;

        // Use the global addToCartFromExternal function
        if (window.addToCartFromExternal) {
            const success = await window.addToCartFromExternal(bookId, 1, 'buy');
            if (success) {
                // Update local state
                if (!userCartBookIds.some(cartId => cartId === bookId || cartId === String(bookId))) {
                    userCartBookIds.push(bookId);
                }

                button.textContent = '✔ Đã thêm';
                button.className = 'bg-green-500 text-white px-4 py-2 !rounded-button whitespace-nowrap transition';
            } else {
                throw new Error('Failed to add to cart');
            }
        } else {
            // Fallback to direct API call
            await ApiService.addToCart(bookId, 1, 'buy');

            // Update local state
            if (!userCartBookIds.some(cartId => cartId === bookId || cartId === String(bookId))) {
                userCartBookIds.push(bookId);
            }

            button.textContent = '✔ Đã thêm';
            button.className = 'bg-green-500 text-white px-4 py-2 !rounded-button whitespace-nowrap transition';
        }
    } catch (error) {
        console.error('❌ [books.js] Error adding to cart:', error);

        // Check if error is related to stock
        if (error.message.includes('stock') || error.message.includes('hết hàng') || error.message.includes('insufficient')) {
            button.textContent = 'Hết hàng';
            button.className = 'bg-gray-400 text-gray-600 cursor-not-allowed px-4 py-2 !rounded-button whitespace-nowrap transition';
            button.disabled = true;
            alert('Sách này hiện đã hết hàng!');
        } else {
            button.textContent = 'Lỗi!';
            button.className = 'bg-red-500 text-white px-4 py-2 !rounded-button whitespace-nowrap transition';

            setTimeout(() => {
                button.textContent = originalText;
                button.className = originalClasses;
                button.disabled = false;
            }, 2000);
        }
    }
}

async function toggleFavorite(event, bookId) {
    event.stopPropagation();

    const button = event.target.closest('button');
    const icon = button.querySelector('i');
    const isFaved = icon.classList.contains('ri-star-fill');

    // Prevent multiple clicks
    if (button.disabled) return;

    try {
        button.disabled = true;
        button.style.opacity = '0.5';

        if (isFaved) {
            await ApiService.removeFromFavourites(bookId);

            // Update local state
            userFavouriteBookIds = userFavouriteBookIds.filter(id =>
                id !== bookId && id !== String(bookId)
            );

            icon.classList.remove('ri-star-fill', 'text-yellow-400');
            icon.classList.add('ri-star-line', 'text-gray-800');
        } else {
            await ApiService.addToFavourites(bookId);

            // Update local state
            if (!userFavouriteBookIds.some(favId => favId === bookId || favId === String(bookId))) {
                userFavouriteBookIds.push(bookId);
            }

            icon.classList.remove('ri-star-line', 'text-gray-800');
            icon.classList.add('ri-star-fill', 'text-yellow-400');
        }
    } catch (error) {
        console.error('❌ [books.js] Error toggling favourite:', error);

        // Revert on error
        if (isFaved) {
            icon.classList.add('ri-star-fill', 'text-yellow-400');
            icon.classList.remove('ri-star-line', 'text-gray-800');
        } else {
            icon.classList.add('ri-star-line', 'text-gray-800');
            icon.classList.remove('ri-star-fill', 'text-yellow-400');
        }
    } finally {
        button.disabled = false;
        button.style.opacity = '1';
    }
}

function viewBookDetail(bookId) {
    // Navigate to book detail page
    window.location.href = `/bookDetail?id=${bookId}`;
}

// Export functions for use in HTML (only for /books page, not books.html)
if (window.location.pathname === '/books' || window.location.pathname.endsWith('/books')) {
    window.changePage = changePage;
    window.clearSearch = clearSearch;
    window.addToCart = addToCart;
    window.toggleFavorite = toggleFavorite;
    window.viewBookDetail = viewBookDetail;
} else {
    console.log('📘 [books.js] Skipping function export - not on /books page');
}
