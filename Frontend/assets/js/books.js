// Books page JavaScript functionality
let allBooks = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 12;
let currentSearchQuery = '';
let currentCategory = 'all';

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

    // Load and display books
    await loadBooks();

    // Setup event listeners
    setupEventListeners();
});

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
    return `
        <div class="bg-white rounded shadow-sm overflow-hidden flex flex-col h-full transition group cursor-pointer book-card-item" 
             data-id="${book._id || book.id}" onclick="viewBookDetail('${book._id || book.id}')">
            <div class="relative h-96 w-full flex-shrink-0">
                <img src="${getBookImage(book)}" alt="${escapeHtml(book.title)}" 
                     class="w-full h-full object-cover object-top" 
                     onerror="this.src='${getDefaultImage()}'">
                <button class="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-primary rounded-full" 
                        onclick="toggleFavorite(event, '${book._id || book.id}')" title="Yêu thích">
                    <i class="ri-star-line text-gray-800"></i>
                </button>
                ${book.isNew ? '<div class="absolute top-2 left-2 bg-primary text-gray-800 px-2 py-1 text-sm rounded-full">Mới</div>' : ''}
            </div>
            <div class="p-4 flex flex-col flex-1">
                <div class="text-sm text-gray-500 mb-2">${escapeHtml(book.category?.name || book.category || 'Sách')}</div>
                <h3 class="font-semibold text-gray-800 mb-2">${escapeHtml(book.title)}</h3>
                <p class="text-gray-600 mb-3">${escapeHtml(book.author?.name || book.author || 'Unknown Author')}</p>
                <div class="flex justify-between items-center mt-auto">
                    <span class="font-semibold text-gray-800">${formatPrice(book.price)}</span>
                    <button class="bg-gray-200 text-gray-800 px-4 py-2 !rounded-button whitespace-nowrap" 
                            onclick="addToCart(event, '${book._id || book.id}')">
                        Thêm vào giỏ
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
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const originalText = this.textContent;
            this.textContent = '✓ Đã thêm';
            this.classList.add('bg-green-500', 'text-white');

            setTimeout(() => {
                this.textContent = originalText;
                this.classList.remove('bg-green-500', 'text-white');
            }, 1200);
        });
    });

    // Favorite buttons
    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('faved');
            const icon = this.querySelector('i');
            if (this.classList.contains('faved')) {
                icon.classList.remove('ri-star-line');
                icon.classList.add('ri-star-fill');
            } else {
                icon.classList.remove('ri-star-fill');
                icon.classList.add('ri-star-line');
            }
        });
    });
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
    console.log('Add to cart:', bookId);
    // TODO: Implement actual cart functionality
    console.log("dữ liệu từ books.js", bookId)
    const response = await ApiService.addToCart(bookId);
}

async function toggleFavorite(event, bookId) {
    event.stopPropagation();
    console.log('Toggle favorite:', bookId);
    // TODO: Implement actual favorite functionality
    const response = await ApiService.addToFavourites({
        bookId: bookId
    });
}

function viewBookDetail(bookId) {
    // Navigate to book detail page
    window.location.href = `/bookDetail?id=${bookId}`;
}

// Export functions for use in HTML
window.changePage = changePage;
window.clearSearch = clearSearch;
window.addToCart = addToCart;
window.toggleFavorite = toggleFavorite;
window.viewBookDetail = viewBookDetail;
