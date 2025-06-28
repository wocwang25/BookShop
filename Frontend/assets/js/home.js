// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// Search functionality variables
let searchTimeout;
let searchResults = [];
let isSearching = false;

// Wait for DOM to be loaded before initializing search
document.addEventListener('DOMContentLoaded', function () {
  initializeSearchFunctionality();
});

function initializeSearchFunctionality() {
  // Search functionality
  const searchInput = document.querySelector('.search-input');
  const searchBtnHero = document.querySelector('.search-btn-hero');

  if (searchInput) {
    // Real-time search suggestions
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
          performLiveSearch(query);
        }, 300); // Debounce 300ms
      } else {
        hideSearchResults();
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.hero-search')) {
        hideSearchResults();
      }
    });

    // Add search input focus effects
    searchInput.addEventListener('focus', () => {
      const searchContainer = searchInput.parentElement;
      if (searchContainer) {
        searchContainer.classList.add('search-focused');
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        const searchContainer = searchInput.parentElement;
        if (searchContainer) {
          searchContainer.classList.remove('search-focused');
        }
      }, 200);
    });
  } else {
    // console.warn('Search input not found! Looking for element with class .search-input');
  }

  if (searchBtnHero) {
    searchBtnHero.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearch();
    });
  } else {
    // console.warn('Search button not found! Looking for element with class .search-btn-hero');
  }
}

// Live search for suggestions
async function performLiveSearch(query) {
  if (isSearching) return;
  isSearching = true;

  try {
    const response = await ApiService.searchBooks(query);

    if (response.success && response.books) {
      searchResults = response.books.slice(0, 5); // Limit to 5 suggestions
      showSearchResults(query);
    } else {
      searchResults = [];
      showSearchResults(query);
    }
  } catch (error) {
    searchResults = [];
    showSearchResults(query);
  } finally {
    isSearching = false;
  }
}

// Show search results dropdown
function showSearchResults(query) {
  const searchContainer = document.querySelector('.hero-search');
  if (!searchContainer) {
    // console.warn('Search container not found!');
    return;
  }

  // Remove existing dropdown
  const existingDropdown = document.querySelector('.search-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
  }

  if (searchResults.length === 0) {
    const dropdown = createSearchDropdown([]);
    dropdown.innerHTML = `
      <div class="search-no-results">
        <i class="ri-search-line text-gray-400 text-2xl mb-2"></i>
        <p class="text-gray-500">Không tìm thấy sách nào với từ khóa "${query}"</p>
        <button onclick="handleSearch()" class="text-primarynavy hover:underline mt-2">
          Tìm kiếm tất cả →
        </button>
      </div>
    `;
    searchContainer.appendChild(dropdown);
    return;
  }

  const dropdown = createSearchDropdown(searchResults);

  dropdown.innerHTML = `
    <div class="search-results-header">
      <span class="text-sm text-gray-600">Kết quả tìm kiếm cho "${query}"</span>
      <button onclick="handleSearch()" class="text-primarynavy hover:underline text-sm">
        Xem tất cả →
      </button>
    </div>
    <div class="search-results-list">
      ${searchResults.map(book => `
        <div class="search-result-item" onclick="viewBookDetail('${book._id}')">
          <div class="search-result-image">
            <img src="${getBookImage(book)}" alt="${escapeHtml(book.title)}" 
                 onerror="this.src='${getDefaultImage()}'">
          </div>
          <div class="search-result-info">
            <h4 class="search-result-title">${highlightSearchTerm(book.title, query)}</h4>
            <p class="search-result-author">${escapeHtml(book.author?.name || book.author || 'Unknown Author')}</p>
            <p class="search-result-price">${formatPrice(book.price)}</p>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="search-results-footer">
      <button onclick="handleSearch()" class="search-view-all-btn">
        <i class="ri-search-line mr-2"></i>
        Xem tất cả kết quả tìm kiếm
      </button>
    </div>
  `;

  searchContainer.appendChild(dropdown);
}

// Create search dropdown element
function createSearchDropdown(results) {
  const dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  return dropdown;
}

// Hide search results dropdown
function hideSearchResults() {
  const dropdown = document.querySelector('.search-dropdown');
  if (dropdown) {
    dropdown.remove();
  }
}

// Highlight search term in results
function highlightSearchTerm(text, term) {
  if (!term) return escapeHtml(text);

  const regex = new RegExp(`(${term})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
}

async function handleSearch() {
  const searchInput = document.querySelector('.search-input');
  const query = searchInput ? searchInput.value.trim() : '';

  if (!query) {
    // console.warn('No search query provided');
    return;
  }

  try {
    const searchBtnHero = document.querySelector('.search-btn-hero');

    // Show loading state
    if (searchBtnHero) {
      const originalContent = searchBtnHero.innerHTML;
      searchBtnHero.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Đang tìm...';
      searchBtnHero.disabled = true;

      // Reset after delay
      setTimeout(() => {
        searchBtnHero.innerHTML = originalContent;
        searchBtnHero.disabled = false;
      }, 2000);
    }

    // Hide current search dropdown
    hideSearchResults();

    // Redirect to books page with search query
    window.location.href = `/searchBooks?search=${encodeURIComponent(query)}`;
  } catch (error) {
    alert('Tìm kiếm thất bại. Vui lòng thử lại.');

    // Reset button state on error
    const searchBtnHero = document.querySelector('.search-btn-hero');
    if (searchBtnHero) {
      searchBtnHero.innerHTML = '<i class="ri-search-line mr-2"></i>Tìm kiếm';
      searchBtnHero.disabled = false;
    }
  }
}

// Load homepage data when page loads
document.addEventListener('DOMContentLoaded', async function () {
  try {
    await Promise.all([
      loadFeaturedBooks(),
      loadPopularBooks(),
      loadBookStats()
    ]);
  } catch (error) {
    // console.error('Failed to load homepage data:', error);
  }
});

// Load featured books for hero section
async function loadFeaturedBooks() {
  try {
    const response = await ApiService.getAllBooks(3, '-createdAt'); // Get 3 newest books
    if (response.success && response.books && response.books.length > 0) {
      renderFeaturedBooks(response.books);
    } else {
      renderFeaturedBooks([]);
    }
  } catch (error) {
    renderFeaturedBooks([]);
  }
}

// Load popular books section
async function loadPopularBooks() {
  try {
    const response = await ApiService.getAllBooks(4, '-createdAt'); // Get 4 books for popular section
    if (response.success && response.books && response.books.length > 0) {
      renderPopularBooks(response.books);
    } else {
      renderPopularBooks([]);
    }
  } catch (error) {
    renderPopularBooks([]);
  }
}

// Load book listing section
async function loadBookListing() {
  try {
    const response = await ApiService.getAllBooks(9); // Get 9 books for main listing
    if (response.success && response.books && response.books.length > 0) {
      renderBookListing(response.books);
    } else {
      renderBookListing([]);
    }
  } catch (error) {
    renderBookListing([]);
  }
}

// Load statistics for hero section
async function loadBookStats() {
  try {
    const response = await ApiService.getAllBooks(); // Get all books to calculate stats
    if (response.success && response.books) {
      updateStatsDisplay(response.books);
    }
  } catch (error) {
    // Keep default stats if API fails
  }
}

// Render featured books in hero section
function renderFeaturedBooks(books) {
  const featuredBooksContainer = document.querySelector('.featured-books');
  if (!featuredBooksContainer) {
    // console.warn('Featured books container not found');
    return;
  }

  if (books.length === 0) {
    featuredBooksContainer.innerHTML = `
      <div class="error-message">
        Không thể tải danh sách sách nổi bật
        <button class="retry-button" onclick="loadFeaturedBooks()">Thử lại</button>
      </div>
    `;
    return;
  }

  const booksHtml = books.slice(0, 3).map(book => {
    return `
      <div class="book-card fade-in" onclick="viewBookDetail('${book._id}')">
        <div class="book-cover">
          <img src="${getBookImage(book)}" alt="${escapeHtml(book.title)}" class="w-full h-full object-cover rounded-t-md" onerror="this.src='${getDefaultImage()}'" />
        </div>
        <div class="book-info">
          <div class="book-title">${escapeHtml(book.title)}</div>
          <div class="book-author">${escapeHtml(book.author?.name || 'Unknown Author')}</div>
          <div class="book-rating">
            <span class="stars">★★★★★</span>
            <span class="rating-text">4.8</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  featuredBooksContainer.innerHTML = booksHtml;
}

// Render popular books section
function renderPopularBooks(books) {
  const popularBooksContainer = document.querySelector('.py-20.bg-gray-50 .grid.grid-cols-1.md\\:grid-cols-4');
  if (!popularBooksContainer) {
    // console.warn('Popular books container not found');
    return;
  }

  if (books.length === 0) {
    popularBooksContainer.innerHTML = `
      <div class="col-span-4 text-center text-gray-500 py-8">
        Không có sách nào để hiển thị
      </div>
    `;
    return;
  }

  const booksHtml = books.slice(0, 4).map(book => {
    return `
      <div class="bg-white rounded shadow-sm overflow-hidden flex flex-col h-full">
        <div class="relative h-96 w-full flex-shrink-0">
          <img src="${getBookImage(book)}" alt="${escapeHtml(book.title)}" class="w-full h-full object-cover object-top" onerror="this.src='${getDefaultImage()}'">
          <div class="absolute top-2 right-2 bg-primary text-gray-800 px-2 py-1 text-sm rounded-full">Mới</div>
        </div>
        <div class="p-4 flex flex-col flex-1">
          <div class="text-sm text-gray-500 mb-2">${escapeHtml(book.category?.name || 'Sách')}</div>
          <h3 class="font-semibold text-gray-800 mb-2">${escapeHtml(book.title)}</h3>
          <p class="text-gray-600 mb-3">${escapeHtml(book.author?.name || 'Unknown Author')}</p>
          <div class="flex justify-between items-center mt-auto">
            <span class="font-semibold text-gray-800">${formatPrice(book.price)}</span>
            <button class="bg-primary text-gray-800 px-4 py-2 !rounded-button whitespace-nowrap" onclick="addToCart('${book._id}')">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  popularBooksContainer.innerHTML = booksHtml;
}

// Render book listing section
function renderBookListing(books) {
  const bookListingContainer = document.querySelector('main .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
  if (!bookListingContainer) {
    // console.warn('Book listing container not found');
    return;
  }

  if (books.length === 0) {
    bookListingContainer.innerHTML = `
      <div class="col-span-3 text-center text-gray-500 py-8">
        Không có sách nào để hiển thị
      </div>
    `;
    return;
  }

  const booksHtml = books.slice(0, 9).map(book => {
    return `
      <div class="bg-white rounded shadow-sm overflow-hidden flex flex-col h-full">
        <div class="relative h-96 w-full flex-shrink-0">
          <img src="${getBookImage(book)}" alt="${escapeHtml(book.title)}" class="w-full h-full object-cover object-top" onerror="this.src='${getDefaultImage()}'">
          <button class="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-primary rounded-full" onclick="toggleFavorite('${book._id}')">
            <i class="ri-star-line text-gray-800"></i>
          </button>
        </div>
        <div class="p-4 flex flex-col flex-1">
          <div class="text-sm text-gray-500 mb-2">${escapeHtml(book.category?.name || 'Sách')}</div>
          <h3 class="font-semibold text-gray-800 mb-2">${escapeHtml(book.title)}</h3>
          <p class="text-gray-600 mb-3">${escapeHtml(book.author?.name || 'Unknown Author')}</p>
          <div class="flex justify-between items-center mt-auto">
            <span class="font-semibold text-gray-800">${formatPrice(book.price)}</span>
            <button class="bg-gray-200 text-gray-800 px-4 py-2 !rounded-button whitespace-nowrap" onclick="addToCart('${book._id}')">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Add "View all books" button
  const viewAllButton = `
    <div class="col-span-1 md:col-span-3 flex justify-center mt-6">
      <a href="books" class="inline-block bg-white text-gray-800 px-8 py-3 font-medium !rounded-button whitespace-nowrap border border-gray-200">Xem tất cả sách</a>
    </div>
  `;

  bookListingContainer.innerHTML = booksHtml + viewAllButton;
}

// Update stats display in hero section
function updateStatsDisplay(books) {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length >= 3) {
    // Get unique authors and calculate stats
    const uniqueAuthors = new Set(books.map(book => book.author?._id).filter(Boolean));

    statNumbers[0].textContent = `${books.length}+`; // Total books
    statNumbers[1].textContent = `${uniqueAuthors.size}+`; // Total authors
    statNumbers[2].textContent = '5k+'; // Keep readers as default since we don't have this data
  }
}

// Helper functions
function getBookImage(book) {
  // Check if imageUrl exists and is not empty
  if (!book.imageUrl || book.imageUrl.trim() === '') {
    return getDefaultImage();
  }

  // Convert Google Drive link to direct image link if needed
  const directImageUrl = convertGoogleDriveLink(book.imageUrl);

  return directImageUrl;
}

function convertGoogleDriveLink(url) {
  if (!url) return getDefaultImage();

  // Check if it's already a direct link
  if (url.includes('drive.google.com/uc?')) {
    return url;
  }

  // Convert Google Drive sharing link to direct link
  // From: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // To: https://drive.google.com/uc?id=FILE_ID&export=view
  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }

  // If it's not a Google Drive link, return as is
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

function addToCart(bookId) {
  // TODO: Implement add to cart functionality with API

  // Show loading state
  const button = event.target;
  const originalText = button.textContent;
  button.classList.add('btn-loading');
  button.disabled = true;

  // Simulate API call (replace with actual cart API)
  setTimeout(() => {
    button.classList.remove('btn-loading');
    button.disabled = false;
    button.textContent = originalText;
    alert('Chức năng thêm vào giỏ hàng sẽ được triển khai sau.');
  }, 1000);
}

function toggleFavorite(bookId) {
  // TODO: Implement favorite functionality with API

  const button = event.target.closest('button');
  const icon = button.querySelector('i');

  // Toggle icon
  if (icon.classList.contains('ri-star-line')) {
    icon.classList.remove('ri-star-line');
    icon.classList.add('ri-star-fill');
    button.style.backgroundColor = '#fbbf24';
  } else {
    icon.classList.remove('ri-star-fill');
    icon.classList.add('ri-star-line');
    button.style.backgroundColor = '';
  }
}

function viewBookDetail(bookId) {
  // Navigate to book detail page
  window.location.href = `/bookDetail?id=${bookId}`;
}

// Load book listing when main content loads
setTimeout(() => {
  const mainContent = document.querySelector('main');
  if (mainContent) {
    // Load book listing for the main content section
    loadBookListing();
  }
}, 1000); // Delay to ensure other content loads first

// Make functions available globally for onclick handlers
window.handleSearch = handleSearch;
window.viewBookDetail = viewBookDetail;
window.addToCart = addToCart;
window.toggleFavorite = toggleFavorite;
window.loadFeaturedBooks = loadFeaturedBooks;