// Checkout functionality for LunaLuxe
class CheckoutManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentStep = 1;
        this.steps = ['shipping', 'payment', 'review'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSteps();
        this.updateOrderSummary();
    }

    setupEventListeners() {
        // Shipping form submission
        document.getElementById('customerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleShippingSubmit(new FormData(e.target));
        });

        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method;
                this.handlePaymentMethodChange(method);
            });
        });

        // Payment form submissions
        document.getElementById('mpesaForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment('mpesa', new FormData(e.target));
        });

        document.getElementById('visaForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment('visa', new FormData(e.target));
        });

        // Step navigation
        document.querySelectorAll('.step-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const step = parseInt(btn.dataset.step);
                if (this.validateStepTransition(step)) {
                    this.navigateToStep(step);
                }
            });
        });
    }

    async handleShippingSubmit(formData) {
        try {
            window.loadingManager.showLoading('shippingForm');

            const shippingData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode')
            };

            const isValid = await this.validateAddress(shippingData);
            if (!isValid) {
                throw new Error('Invalid address. Please check and try again.');
            }

            if (formData.get('saveInfo')) {
                localStorage.setItem('shippingInfo', JSON.stringify(shippingData));
            }

            this.navigateToStep(2);
        } catch (error) {
            window.loadingManager.showNotification(error.message, 'error');
        } finally {
            window.loadingManager.hideLoading('shippingForm');
        }
    }

    async validateAddress(address) {
        try {
            const response = await fetch('/api/validate-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address)
            });
            return response.ok;
        } catch (error) {
            console.error('Address validation error:', error);
            return false;
        }
    }

    handlePaymentMethodChange(method) {
        // Highlight selected payment method
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.method === method);
        });

        // Show corresponding form
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = form.id === `${method}Form` ? 'block' : 'none';
        });
        
        this.updateOrderSummary();
    }

    async applyCoupon(code) {
        try {
            window.loadingManager.showLoading('couponForm');
            const response = await fetch('/api/apply-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, total: this.calculateTotal() })
            });

            if (!response.ok) throw new Error('Invalid coupon code');

            const { discount } = await response.json();
            this.appliedDiscount = discount;
            this.updateOrderSummary();
            window.loadingManager.showNotification('Coupon applied successfully!', 'success');
        } catch (error) {
            window.loadingManager.showNotification(error.message, 'error');
        } finally {
            window.loadingManager.hideLoading('couponForm');
        }
    }

    calculateTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = this.calculateShipping();
        const discount = this.appliedDiscount || 0;
        const tax = (subtotal - discount) * 0.16; // 16% VAT
        return { subtotal, shipping, discount, tax, total: subtotal + shipping - discount + tax };
    }

    calculateShipping() {
        // Implement shipping calculation based on location and weight
        return 0; // Free shipping for now
    }

    updateOrderSummary() {
        const summary = document.getElementById('orderSummary');
        if (!summary) return;

        const totals = this.calculateTotal();
        summary.innerHTML = `
            <div class="summary-item">
                <span>Subtotal</span>
                <span>$${totals.subtotal.toFixed(2)}</span>
            </div>
            ${totals.shipping ? `
                <div class="summary-item">
                    <span>Shipping</span>
                    <span>$${totals.shipping.toFixed(2)}</span>
                </div>
            ` : ''}
            ${totals.discount ? `
                <div class="summary-item discount">
                    <span>Discount</span>
                    <span>-$${totals.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="summary-item">
                <span>Tax (16%)</span>
                <span>$${totals.tax.toFixed(2)}</span>
            </div>
            <div class="summary-item total">
                <span>Total</span>
                <span>$${totals.total.toFixed(2)}</span>
            </div>
        `;
    }

    validateStepTransition(step) {
        const currentStep = document.getElementById(`${this.steps[this.currentStep - 1]}Step`);
        if (!currentStep) return true;

        const requiredFields = currentStep.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            window.loadingManager.showNotification('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    navigateToStep(step) {
        this.steps.forEach((stepName, index) => {
            const stepElement = document.getElementById(`${stepName}Step`);
            if (stepElement) {
                stepElement.style.display = index === step - 1 ? 'block' : 'none';
            }
        });

        this.updateProgressIndicator(step);
        this.currentStep = step;
    }

    updateProgressIndicator(step) {
        document.querySelectorAll('.progress-step').forEach((indicator, index) => {
            indicator.classList.toggle('completed', index + 1 < step);
            indicator.classList.toggle('active', index + 1 === step);
        });
    }

    async processPayment(method, formData) {
        try {
            window.loadingManager.showLoading('payment-form', { 
                text: `Processing ${method} payment...` 
            });

            const totals = this.calculateTotal();
            const orderRef = `ORD-${Date.now()}`;
            
            let paymentResult;
            if (method === 'mpesa') {
                paymentResult = await window.mpesa.initializePayment(
                    totals.total,
                    formData.get('mpesaPhone'),
                    orderRef
                );
            } else if (method === 'visa') {
                paymentResult = await window.visa.processPayment(
                    totals.total,
                    'KES',
                    orderRef
                );
            }

            // Save order data
            const orderData = {
                id: orderRef,
                items: this.cart,
                shipping: JSON.parse(localStorage.getItem('shippingInfo')),
                payment: {
                    method,
                    details: paymentResult
                },
                totals,
                status: 'paid',
                date: new Date().toISOString()
            };

            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            localStorage.removeItem('cart');
            
            this.navigateToStep(3); // Go to confirmation
            this.updateConfirmationDetails(orderData);

        } catch (error) {
            window.loadingManager.showNotification(
                `Payment failed: ${error.message}`,
                'error'
            );
            console.error('Payment error:', error);
        } finally {
            window.loadingManager.hideLoading('payment-form');
        }
    }

    updateConfirmationDetails(orderData) {
        document.getElementById('orderNumber').textContent = orderData.id;
        document.getElementById('paymentStatus').textContent = 'Paid';
        document.getElementById('deliveryAddress').textContent = 
            `${orderData.shipping.address}, ${orderData.shipping.city}`;
    }
}

// Initialize checkout manager
document.addEventListener('DOMContentLoaded', () => {
    window.checkout = new CheckoutManager();
});
