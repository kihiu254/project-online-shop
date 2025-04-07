// Existing functionality...

class WishlistHandler {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.setupEventListeners();
        this.updateWishlistCount();
    }

    setupEventListeners() {
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.closest('.product-item').dataset.id;
                this.toggleWishlistItem(btn, productId);
            });
        });
    }

    toggleWishlistItem(btn, productId) {
        const isInWishlist = this.wishlist.includes(productId);
        
        if (isInWishlist) {
            this.wishlist = this.wishlist.filter(id => id !== productId);
            btn.classList.remove('active');
            this.showNotification('Removed from wishlist');
        } else {
            this.wishlist.push(productId);
            btn.classList.add('active');
            this.showNotification('Added to wishlist');
        }

        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        this.updateWishlistCount();
    }

    updateWishlistCount() {
        const count = document.querySelector('.wishlist-count');
        if (count) {
            count.textContent = this.wishlist.length;
        }
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

// Initialize wishlist functionality
document.addEventListener('DOMContentLoaded', () => {
    new WishlistHandler();
});

// Existing functionality...