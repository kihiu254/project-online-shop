document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeSwitch = document.getElementById('theme-switch');
    
    // Check if theme preference exists in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Toggle theme on button click
    themeSwitch.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Mobile menu toggle for new header
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '☰';
    document.querySelector('.header').prepend(mobileMenuToggle);

    const navLinks = document.querySelector('.nav__list');
    if (navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    } else {
        console.error('Navigation links element not found.');
    }

    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter__form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            console.log(`Thank you for subscribing with ${email}!`);
            this.reset();
        });
    } else {
        console.error('Newsletter form not found.');
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Product hover effects
    const productCards = document.querySelectorAll('.product__card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = 'var(--neon-shadow)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px var(--shadow-color)';
        });
    });
});

class WishlistManager {
    constructor() {
        this.wishlistGrid = document.getElementById('wishlistGrid');
        this.emptyState = document.querySelector('.wishlist-empty-state');
        this.clearAllBtn = document.querySelector('.clear-all');
        this.shareBtn = document.querySelector('.share-wishlist');
        
        this.setupEventListeners();
        this.loadWishlist();
    }

    setupEventListeners() {
        this.clearAllBtn.addEventListener('click', () => this.clearWishlist());
        this.shareBtn.addEventListener('click', () => this.shareWishlist());
        
        // Delegate event listener for wishlist items
        this.wishlistGrid.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.classList.contains('remove-item')) {
                const itemId = target.closest('.wishlist-item').dataset.id;
                this.removeItem(itemId);
            }
            
            if (target.classList.contains('add-to-cart')) {
                const itemId = target.closest('.wishlist-item').dataset.id;
                this.addToCart(itemId);
            }
        });
    }

    loadWishlist() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        if (wishlist.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        this.renderWishlistItems(wishlist);
    }

    renderWishlistItems(items) {
        this.wishlistGrid.innerHTML = items.map(item => `
            <div class="wishlist-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="wishlist-item-info">
                    <h3 class="wishlist-item-title">${item.name}</h3>
                    <div class="wishlist-item-price">$${item.price}</div>
                    <div class="wishlist-item-actions">
                        <button class="add-to-cart">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="remove-item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    removeItem(itemId) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlist = wishlist.filter(item => item.id !== itemId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        this.showNotification('Item removed from wishlist');
        this.loadWishlist();
    }

    clearWishlist() {
        if (confirm('Are you sure you want to clear your wishlist?')) {
            localStorage.setItem('wishlist', '[]');
            this.showNotification('Wishlist cleared');
            this.loadWishlist();
        }
    }

    addToCart(itemId) {
        // Implement cart functionality
        this.showNotification('Item added to cart');
    }

    shareWishlist() {
        // Implement share functionality
        if (navigator.share) {
            navigator.share({
                title: 'My Wishlist',
                text: 'Check out my wishlist!',
                url: window.location.href
            });
        } else {
            this.showNotification('Share feature not supported');
        }
    }

    showEmptyState() {
        this.wishlistGrid.style.display = 'none';
        this.emptyState.classList.remove('hidden');
    }

    hideEmptyState() {
        this.wishlistGrid.style.display = 'grid';
        this.emptyState.classList.add('hidden');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize wishlist
document.addEventListener('DOMContentLoaded', () => {
    new WishlistManager();
});