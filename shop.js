document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const productCards = document.querySelectorAll('.product-card');
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryOptions = document.querySelectorAll('.category-option');
    const cartCount = document.querySelector('.cart-count');
    const colorSchemeToggle = document.querySelector('.color-scheme-toggle');

    // Initialize product cards with staggered animations
    productCards.forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // Add animation delay
        setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100); // 100ms delay between each card
    });

    // Category functionality
    categoryItems.forEach(item => {
        const header = item.querySelector('.category-header');
        const dropdown = item.querySelector('.category-dropdown');
        const icon = header.querySelector('.toggle-icon');

        header.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = dropdown.classList.toggle('active');
            icon.classList.toggle('rotate');

            // Close other dropdowns
            categoryItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherDropdown = otherItem.querySelector('.category-dropdown');
                    const otherIcon = otherItem.querySelector('.toggle-icon');
                    otherDropdown.classList.remove('active');
                    otherIcon.classList.remove('rotate');
                }
            });
        });
    });

    // Filter products by category
    categoryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedCategory = option.getAttribute('data-category');
            
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                // Reset animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                if (!selectedCategory || cardCategory === selectedCategory) {
                    card.style.display = 'flex';
                    // Animate in with delay
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });

            // Update active state
            categoryOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // Initialize product interactions
    initializeProductInteractions();

    // Color scheme toggle
    colorSchemeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .category-header,
        .category-option {
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        .category-header:hover,
        .category-option:hover {
            background-color: rgba(108, 99, 255, 0.1);
        }
        
        .category-dropdown {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }
        
        .category-dropdown.active {
            max-height: 300px;
        }

        .product-card {
            transition: opacity 0.3s ease-out;
        }

        .product-card.fade-in {
            animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .color-option.active {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px #6C63FF;
        }

        .size-option.active {
            background: #6C63FF;
            color: white;
            border-color: #6C63FF;
        }
    `;
    document.head.appendChild(style);

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.category-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        document.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.classList.remove('rotate');
        });
    });

    // Initialize
    console.log('Initializing shop page...'); // Debug log
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

function initializeProductInteractions() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const quickViewButtons = document.querySelectorAll('.quick-view');
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');

    // Add to cart functionality
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            const selectedColor = card.querySelector('.color-option.selected');
            const selectedSize = card.querySelector('.size-option.selected');

            if (!selectedColor || !selectedSize) {
                showNotification('Please select color and size', 'error');
                return;
            }

            button.classList.add('adding');
            button.textContent = 'Adding...';

            setTimeout(() => {
                button.classList.remove('adding');
                button.classList.add('added');
                button.textContent = 'Added to Cart';
                showNotification('Added to cart successfully', 'success');

                setTimeout(() => {
                    button.classList.remove('added');
                    button.textContent = 'Add to Cart';
                }, 2000);
            }, 800);
        });
    });

    // Initialize color and size options
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            const options = option.closest('.color-options').querySelectorAll('.color-option');
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', () => {
            const options = option.closest('.size-options').querySelectorAll('.size-option');
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

function showNotification(message, type = 'success') {
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
