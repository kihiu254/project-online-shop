class ProductInteractions {
    constructor() {
        this.initializeObservers();
        this.initializeProductCards();
        this.setupEventListeners();
    }

    initializeObservers() {
        // Intersection Observer for fade-in animations
        this.fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    this.fadeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observe all product cards
        document.querySelectorAll('.product-card').forEach(card => {
            this.fadeObserver.observe(card);
        });
    }

    initializeProductCards() {
        document.querySelectorAll('.product-card').forEach((card, index) => {
            // Add staggered animation delay
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Initialize color options
            this.initializeColorOptions(card);
            
            // Initialize size options
            this.initializeSizeOptions(card);
            
            // Setup hover effects
            this.setupHoverEffects(card);
        });
    }

    initializeColorOptions(card) {
        const colorOptions = card.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                option.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    initializeSizeOptions(card) {
        const sizeOptions = card.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Add scale animation
                option.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    option.style.transform = 'scale(1)';
                }, 200);
            });
        });
    }

    setupHoverEffects(card) {
        const img = card.querySelector('.product-image img');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale3d(1.02, 1.02, 1.02)
            `;
            
            // Add parallax effect to image
            img.style.transform = `
                scale(1.1) 
                translateX(${(x - centerX) / 20}px) 
                translateY(${(y - centerY) / 20}px)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            img.style.transform = '';
        });
    }

    setupEventListeners() {
        // Quick view functionality
        document.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                this.showQuickView(card);
            });
        });

        // Add to wishlist functionality
        document.querySelectorAll('.add-to-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.add-to-wishlist');
                this.toggleWishlist(button);
            });
        });

        // Add to cart functionality
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAddToCart(e.target);
            });
        });
    }

    showQuickView(card) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <div class="product-preview">
                    <img src="${card.querySelector('img').src}" alt="${card.querySelector('.product-title').textContent}">
                </div>
                <div class="product-details">
                    <h2>${card.querySelector('.product-title').textContent}</h2>
                    <p class="price">${card.querySelector('.product-price').textContent}</p>
                    <div class="color-options">
                        ${card.querySelector('.color-options').innerHTML}
                    </div>
                    <div class="size-options">
                        ${card.querySelector('.size-options').innerHTML}
                    </div>
                    <button class="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add fade-in animation
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
        });

        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });

        // Initialize options in modal
        this.initializeColorOptions(modal);
        this.initializeSizeOptions(modal);
    }

    toggleWishlist(button) {
        button.classList.toggle('active');
        const icon = button.querySelector('i');
        icon.className = button.classList.contains('active') ? 'fas fa-heart' : 'far fa-heart';
        
        // Add heart animation
        const heart = document.createElement('span');
        heart.className = 'heart-animation';
        button.appendChild(heart);
        setTimeout(() => heart.remove(), 1000);
    }

    handleAddToCart(button) {
        const card = button.closest('.product-card');
        const selectedColor = card.querySelector('.color-option.selected');
        const selectedSize = card.querySelector('.size-option.selected');

        if (!selectedColor || !selectedSize) {
            this.showNotification('Please select color and size', 'error');
            return;
        }

        // Add to cart animation
        button.classList.add('adding');
        button.textContent = 'Adding...';

        setTimeout(() => {
            button.classList.remove('adding');
            button.classList.add('added');
            button.textContent = 'Added to Cart';

            // Show success notification
            this.showNotification('Added to cart successfully', 'success');

            setTimeout(() => {
                button.classList.remove('added');
                button.textContent = 'Add to Cart';
            }, 2000);
        }, 800);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productInteractions = new ProductInteractions();
});