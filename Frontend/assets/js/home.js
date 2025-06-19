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

// Search functionality
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
}

const searchBtnHero = document.querySelector('.search-btn-hero');
if (searchBtnHero) {
  searchBtnHero.addEventListener('click', handleSearch);
}

async function handleSearch() {
  const query = searchInput ? searchInput.value.trim() : '';
  if (!query) return;
  
  try {
    const response = await ApiService.searchBooks(query);
    if (response.success) {
      // Redirect to books page with search results or update current page
      window.location.href = `/books?search=${encodeURIComponent(query)}`;
    }
  } catch (error) {
    console.error('Search failed:', error);
    alert('Tìm kiếm thất bại. Vui lòng thử lại.');
  }
}

// Load homepage data when page loads
document.addEventListener('DOMContentLoaded', async function() {
  try {
    await Promise.all([
      loadFeaturedBooks(),
      loadPopularBooks(),
      loadBookStats()
    ]);
  } catch (error) {
    console.error('Failed to load homepage data:', error);
  }
});

// Load featured books for hero section
async function loadFeaturedBooks() {
  try {
    const response = await ApiService.getAllBooks(3, '-createdAt'); // Get 3 newest books
    if (response.success && response.books && response.books.length > 0) {
      renderFeaturedBooks(response.books);
    }
  } catch (error) {
    console.error('Failed to load featured books:', error);
  }
}

// Load popular books section
async function loadPopularBooks() {
  try {
    const response = await ApiService.getAllBooks(4, '-createdAt'); // Get 4 books for popular section
    if (response.success && response.books && response.books.length > 0) {
      renderPopularBooks(response.books);
    }
  } catch (error) {
    console.error('Failed to load popular books:', error);
  }
}

// Load book listing section
async function loadBookListing() {
  try {
    const response = await ApiService.getAllBooks(9); // Get 9 books for main listing
    if (response.success && response.books && response.books.length > 0) {
      renderBookListing(response.books);
    }
  } catch (error) {
    console.error('Failed to load book listing:', error);
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
    console.error('Failed to load book stats:', error);
    // Keep default stats if API fails
  }
}

// Render featured books in hero section
function renderFeaturedBooks(books) {
  const featuredBooksContainer = document.querySelector('.featured-books');
  if (!featuredBooksContainer) return;

  if (books.length === 0) {
    featuredBooksContainer.innerHTML = `
      <div class="error-message">
        Không thể tải danh sách sách nổi bật
        <button class="retry-button" onclick="loadFeaturedBooks()">Thử lại</button>
      </div>
    `;
    return;
  }

  const booksHtml = books.slice(0, 3).map(book => `
    <div class="book-card fade-in" onclick="viewBookDetail('${book._id}')">
      <div class="book-cover">
        <img src="${getBookImage(book)}" alt="${book.title}" class="w-full h-full object-cover rounded-t-md" onerror="this.src='${getDefaultImage()}'" />
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
  `).join('');

  featuredBooksContainer.innerHTML = booksHtml;
}

// Render popular books section
function renderPopularBooks(books) {
  const popularBooksContainer = document.querySelector('.py-20.bg-gray-50 .grid.grid-cols-1.md\\:grid-cols-4');
  if (!popularBooksContainer || books.length === 0) return;

  const booksHtml = books.slice(0, 4).map(book => `
    <div class="bg-white rounded shadow-sm overflow-hidden flex flex-col h-full">
      <div class="relative h-96 w-full flex-shrink-0">
        <img src="${getBookImage(book)}" alt="${book.title}" class="w-full h-full object-cover object-top">
        <div class="absolute top-2 right-2 bg-primary text-gray-800 px-2 py-1 text-sm rounded-full">Mới</div>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <div class="text-sm text-gray-500 mb-2">${book.category?.name || 'Sách'}</div>
        <h3 class="font-semibold text-gray-800 mb-2">${book.title}</h3>
        <p class="text-gray-600 mb-3">${book.author?.name || 'Unknown Author'}</p>
        <div class="flex justify-between items-center mt-auto">
          <span class="font-semibold text-gray-800">${formatPrice(book.price)}</span>
          <button class="bg-primary text-gray-800 px-4 py-2 !rounded-button whitespace-nowrap" onclick="addToCart('${book._id}')">Thêm vào giỏ</button>
        </div>
      </div>
    </div>
  `).join('');

  popularBooksContainer.innerHTML = booksHtml;
}

// Render book listing section
function renderBookListing(books) {
  const bookListingContainer = document.querySelector('main .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
  if (!bookListingContainer || books.length === 0) return;

  const booksHtml = books.slice(0, 9).map(book => `
    <div class="bg-white rounded shadow-sm overflow-hidden flex flex-col h-full">
      <div class="relative h-96 w-full flex-shrink-0">
        <img src="${getBookImage(book)}" alt="${book.title}" class="w-full h-full object-cover object-top">
        <button class="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-primary rounded-full" onclick="toggleFavorite('${book._id}')">
          <i class="ri-star-line text-gray-800"></i>
        </button>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <div class="text-sm text-gray-500 mb-2">${book.category?.name || 'Sách'}</div>
        <h3 class="font-semibold text-gray-800 mb-2">${book.title}</h3>
        <p class="text-gray-600 mb-3">${book.author?.name || 'Unknown Author'}</p>
        <div class="flex justify-between items-center mt-auto">
          <span class="font-semibold text-gray-800">${formatPrice(book.price)}</span>
          <button class="bg-gray-200 text-gray-800 px-4 py-2 !rounded-button whitespace-nowrap" onclick="addToCart('${book._id}')">Thêm vào giỏ</button>
        </div>
      </div>
    </div>
  `).join('');

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
  // Return a default image or use book cover if available
  return book.coverImage || getDefaultImage();
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
  console.log('Add to cart:', bookId);
  
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
  console.log('Toggle favorite:', bookId);
  
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
  window.location.href = `/books/${bookId}`;
}

// Load book listing when main content loads
const mainContent = document.querySelector('main');
if (mainContent) {
  // Load book listing for the main content section
  setTimeout(loadBookListing, 1000); // Delay to ensure other content loads first
}

