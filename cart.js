<!-- Product Card -->
<div class="product-card">
    <img src="images/IMG-20250404-WA0042.jpg" alt="Designer Dress">
    <h2>Designer African Print Dress</h2>
    <p>KSh 12,500</p>
    <div class="color-select">
        <h3>Color:</h3>
        <button class="color-btn" data-color="red">Red</button>
        <button class="color-btn" data-color="blue">Blue</button>
        <button class="color-btn" data-color="green">Green</button>
    </div>
    <div class="size-select">
        <h3>Size:</h3>
        <button class="size-btn" data-size="small">Small</button>
        <button class="size-btn" data-size="medium">Medium</button>
        <button class="size-btn" data-size="large">Large</button>
    </div>
    <button class="add-to-cart-btn" disabled>Add to Cart</button>
</div>

// Get the color and size buttons
const colorButtons = document.querySelectorAll('.color-btn');
const sizeButtons = document.querySelectorAll('.size-btn');
const addToCartButton = document.querySelector('.add-to-cart-btn');

// Initialize variables to store the selected color and size
let selectedColor = null;
let selectedSize = null;

// Add event listeners to the color and size buttons
colorButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update the selected color
        selectedColor = button.dataset.color;
        // Enable the add to cart button if both color and size are selected
        if (selectedColor && selectedSize) {
            addToCartButton.disabled = false;
        }
    });
});

sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update the selected size
        selectedSize = button.dataset.size;
        // Enable the add to cart button if both color and size are selected
        if (selectedColor && selectedSize) {
            addToCartButton.disabled = false;
        }
    });
});

// Add event listener to the add to cart button
addToCartButton.addEventListener('click', () => {
    // Get the product details
    const product = {
        name: 'Designer African Print Dress',
        price: 12500,
        color: selectedColor,
        size: selectedSize,
        quantity: 1
    };

    // Add the product to the cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update the order summary
    const orderSummary = document.querySelector('.order-summary');
    const subtotal = document.querySelector('#subtotal');
    const shipping = document.querySelector('#shipping');
    const tax = document.querySelector('#tax');
    const total = document.querySelector('#total');

    // Calculate the subtotal, shipping, tax, and total
    const subtotalAmount = cart.reduce((acc, product) => acc + product.price * product.quantity, 0);
    const shippingAmount = 500; // Assume a flat shipping rate of KSh 500
    const taxAmount = subtotalAmount * 0.16; // Assume a tax rate of 16%
    const totalAmount = subtotalAmount + shippingAmount + taxAmount;

    // Update the order summary
    subtotal.textContent = `KSh ${subtotalAmount.toFixed(2)}`;
    shipping.textContent = `KSh ${shippingAmount.toFixed(2)}`;
    tax.textContent = `KSh ${taxAmount.toFixed(2)}`;
    total.textContent = `KSh ${totalAmount.toFixed(2)}`;
});

// Shopping cart functionality for LunaLuxe
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartIcon = document.querySelector('.header-icons a:last-child');
        this.cartDropdown = document.getElementById('cartDropdown');
        this.cartTotal = document.getElementById('cartTotal');
        this.closeCart = document.getElementById('closeCart');
        this.init();
    }

    init() {
        // Event listeners with debouncing for better performance
        let debounceTimeout;
        this.cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => this.toggleCart(), 100);
        });

        this.closeCart.addEventListener('click', () => this.hideCart());
        
        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.cartDropdown.contains(e.target) && !this.cartIcon.contains(e.target)) {
                this.hideCart();
            }
        });

        // Handle quantity updates
        this.cartDropdown.addEventListener('click', (e) => {
            if (e.target.matches('.quantity-btn')) {
                const productId = e.target.closest('.cart-item').dataset.id;
                const increment = e.target.classList.contains('increase') ? 1 : -1;
                this.updateQuantity(productId, increment);
            }
        });

        // Initialize state
        this.updateCartCount();
        this.renderCartItems();
    }

    toggleCart() {
        this.cartDropdown.classList.toggle('active');
        if (this.cartDropdown.classList.contains('active')) {
            this.renderCartItems(); // Refresh cart contents
        }
    }

    hideCart() {
        this.cartDropdown.classList.remove('active');
    }

    addItem(product) {
        try {
            const existingItem = this.cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({
                    ...product,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                });
            }
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
            window.showProductNotification('Product added to cart successfully');
        } catch (error) {
            console.error('Error adding item to cart:', error);
            window.showProductNotification('Failed to add product to cart', 'error');
        }
    }

    removeItem(productId) {
        try {
            this.cart = this.cart.filter(item => item.id !== productId);
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
            window.showProductNotification('Product removed from cart');
        } catch (error) {
            console.error('Error removing item from cart:', error);
            window.showProductNotification('Failed to remove product', 'error');
        }
    }

    updateQuantity(productId, increment) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, item.quantity + increment);
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const countElement = document.querySelector('.cart-count');
        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'block' : 'none';
        }
    }

    calculateTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0).toFixed(2);
    }

    renderCartItems() {
        if (!this.cartDropdown) return;

        const cartContent = document.createElement('div');
        cartContent.className = 'cart-content';

        if (this.cart.length === 0) {
            cartContent.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartContent.innerHTML = this.cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="product-options">
                        ${item.color !== 'N/A' ? `<span class="option">Color: ${item.color}</span>` : ''}
                        ${item.size !== 'One Size' ? `<span class="option">Size: ${item.size}</span>` : ''}
                    </div>
                    <div class="price">$${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn increase">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="cart.removeItem('${item.id}')">×</button>
                </div>
            `).join('');

            cartContent.innerHTML += `
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span>$${this.calculateTotal()}</span>
                    </div>
                    <button class="checkout-btn" onclick="window.location.href='checkout.html'">
                        Proceed to Checkout
                    </button>
                </div>
            `;
        }

        // Replace existing content
        const existingContent = this.cartDropdown.querySelector('.cart-content');
        if (existingContent) {
            this.cartDropdown.replaceChild(cartContent, existingContent);
        } else {
            this.cartDropdown.appendChild(cartContent);
        }
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});

// Cart functionality
class CartManager {
    constructor() {
        this.cartItems = document.getElementById('cartItems');
        this.subtotalEl = document.getElementById('subtotal');
        this.shippingEl = document.getElementById('shipping');
        this.totalEl = document.getElementById('total');
        this.emptyState = document.querySelector('.cart-empty');
        
        this.setupEventListeners();
        this.loadCart();
    }

    setupEventListeners() {
        document.querySelector('.clear-cart').addEventListener('click', () => this.clearCart());
        
        this.cartItems.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.classList.contains('remove-item')) {
                const itemId = target.closest('.cart-item').dataset.id;
                this.removeItem(itemId);
            }
            
            if (target.classList.contains('quantity-btn')) {
                const itemId = target.closest('.cart-item').dataset.id;
                const increment = target.classList.contains('increase') ? 1 : -1;
                this.updateQuantity(itemId, increment);
            }
        });
    }

    loadCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        this.renderCartItems(cart);
        this.updateCartTotals();
    }

    renderCartItems(items) {
        this.cartItems.innerHTML = items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3 class="item-title">${item.name}</h3>
                    <div class="item-price">$${item.price}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase">+</button>
                    </div>
                </div>
                <button class="remove-item">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updateCartTotals() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 10 : 0;
        const total = subtotal + shipping;

        this.subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        this.shippingEl.textContent = `$${shipping.toFixed(2)}`;
        this.totalEl.textContent = `$${total.toFixed(2)}`;
    }

    updateQuantity(itemId, increment) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity = Math.max(1, cart[itemIndex].quantity + increment);
            localStorage.setItem('cart', JSON.stringify(cart));
            this.loadCart();
        }
    }

    removeItem(itemId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.loadCart();
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            localStorage.setItem('cart', '[]');
            this.loadCart();
        }
    }

    showEmptyState() {
        this.cartItems.style.display = 'none';
        document.querySelector('.cart-summary').style.display = 'none';
        this.emptyState.classList.remove('hidden');
    }

    hideEmptyState() {
        this.cartItems.style.display = 'block';
        document.querySelector('.cart-summary').style.display = 'block';
        this.emptyState.classList.add('hidden');
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    new CartManager();
});
