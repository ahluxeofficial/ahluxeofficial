// ==========================================
// AH LUXE OFFICIAL - JAVASCRIPT
// Complete Fixed Version with Data Persistence
// ==========================================

const CONFIG = {
    whatsappNumber: '923152480364',
    currency: 'Rs.',
    businessName: 'AH Luxe Official',
    theme: {
        gold: '#d4af37',
        black: '#0a0a0a',
        green: '#25D366',
        red: '#e74c3c'
    }
};

// Application State
const state = {
    cart: [],
    currentOrder: null,
    isProcessing: false,
    wishlist: [],
    reviews: [],
    orders: []
};

// DOM Elements Cache
const elements = {
    cartSidebar: null,
    cartOverlay: null,
    cartItems: null,
    cartCount: null,
    cartTotal: null,
    cartSubtotal: null,
    checkoutModal: null,
    successModal: null,
    quickViewModal: null,
    hamburger: null,
    navLinks: null,
    displayOrderNumber: null,
    toastContainer: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initApp();
});

function initElements() {
    elements.cartSidebar = document.getElementById('cartSidebar');
    elements.cartOverlay = document.getElementById('cartOverlay');
    elements.cartItems = document.getElementById('cartItems');
    elements.cartCount = document.getElementById('cartCount');
    elements.cartTotal = document.getElementById('cartTotal');
    elements.cartSubtotal = document.getElementById('cartSubtotal');
    elements.checkoutModal = document.getElementById('checkoutModal');
    elements.successModal = document.getElementById('successModal');
    elements.quickViewModal = document.getElementById('quickViewModal');
    elements.hamburger = document.getElementById('hamburger');
    elements.navLinks = document.getElementById('navLinks');
    elements.displayOrderNumber = document.getElementById('displayOrderNumber');
    elements.toastContainer = document.getElementById('toastContainer') || createToastContainer();
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        pointer-events: none;
    `;
    document.body.appendChild(container);
    return container;
}

function initApp() {
    // Load all data from localStorage
    loadCart();
    loadWishlist();
    loadReviews();
    loadOrders();
    
    // Setup event listeners
    setupEventListeners();
    setupScrollEffects();
    setupAnimations();
    
    // Update UI
    updateCartUI();
    renderFavorites();
    renderOrders();
    
    // Show welcome message
    showWelcomeMessage();
    
    console.log('%c AH Luxe Official Loaded ', 'color: #d4af37; font-size: 20px; font-weight: bold; background: #0a0a0a; padding: 10px;');
}

// ==========================================
// CART FUNCTIONS - FIXED WITH LOCALSTORAGE
// ==========================================

function loadCart() {
    try {
        const savedCart = localStorage.getItem('ahluxe_cart');
        if (savedCart) {
            state.cart = JSON.parse(savedCart);
            console.log('Cart loaded:', state.cart);
        } else {
            state.cart = [];
        }
    } catch (e) {
        console.error('Error loading cart:', e);
        state.cart = [];
    }
}

function saveCart() {
    try {
        localStorage.setItem('ahluxe_cart', JSON.stringify(state.cart));
        console.log('Cart saved:', state.cart);
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

function openCart() {
    if (elements.cartSidebar) {
        elements.cartSidebar.classList.add('active');
        elements.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        showNotification('Shopping Cart Opened', 'info');
    }
}

function closeCart() {
    if (elements.cartSidebar) {
        elements.cartSidebar.classList.remove('active');
        elements.cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function addToCartFromBtn(button) {
    if (state.isProcessing) return;
    
    const card = button.closest('.product-card');
    if (!card) return;
    
    const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseInt(card.dataset.price) || 2500,
        image: card.dataset.image || card.querySelector('img').src,
        quantity: 1
    };
    
    addToCart(product);
    
    // Button animation
    button.innerHTML = '<i class="fas fa-check"></i> Added';
    button.classList.add('added');
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-shopping-bag"></i> Add to Cart';
        button.classList.remove('added');
    }, 2000);
}

function addToCart(product) {
    const existing = state.cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity++;
        showNotification('Item Updated', 'success', `${product.name} - Qty: ${existing.quantity}`);
    } else {
        state.cart.push(product);
        showNotification('Added to Cart', 'success', product.name);
    }
    
    saveCart();
    updateCartUI();
    
    // Auto open cart on first item
    if (state.cart.length === 1 && !existing) {
        setTimeout(openCart, 500);
    }
}

function updateQuantity(productId, change) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    updateCartUI();
    showNotification('Quantity Updated', 'info', `${item.name}: ${item.quantity}`);
}

function removeFromCart(productId) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;
    
    state.cart = state.cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
    showNotification('Item Removed', 'error', item.name);
}

function clearCart() {
    if (state.cart.length === 0) return;
    
    if (!confirm('Clear your entire cart?')) return;
    
    state.cart = [];
    saveCart();
    updateCartUI();
    showNotification('Cart Cleared', 'error');
}

function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart count badge
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update cart items display
    if (elements.cartItems) {
        if (state.cart.length === 0) {
            renderEmptyCart();
        } else {
            renderCartItems(totalPrice);
        }
    }
    
    // Update totals
    if (elements.cartSubtotal) {
        elements.cartSubtotal.textContent = `${CONFIG.currency} ${totalPrice.toLocaleString()}`;
    }
    if (elements.cartTotal) {
        elements.cartTotal.textContent = `${CONFIG.currency} ${totalPrice.toLocaleString()}`;
    }
}

function renderEmptyCart() {
    elements.cartItems.innerHTML = `
        <div class="empty-cart">
            <div class="empty-cart-icon"><i class="fas fa-crown"></i></div>
            <h3>Your Cart is Empty</h3>
            <p>Discover our premium salwar kameez collection</p>
            <button onclick="closeCart(); document.getElementById('products').scrollIntoView({behavior: 'smooth'});" 
                class="cta-button" style="margin-top: 1rem;">
                <i class="fas fa-sparkles"></i> Explore Collection
            </button>
        </div>
    `;
}

function renderCartItems(totalPrice) {
    elements.cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${CONFIG.currency} ${(item.price * item.quantity).toLocaleString()}</p>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)"><i class="fas fa-minus"></i></button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Add clear cart button
    elements.cartItems.insertAdjacentHTML('beforeend', `
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid rgba(212,175,55,0.2);">
            <button onclick="clearCart()" class="clear-cart-btn">
                <i class="fas fa-times"></i> Clear Cart
            </button>
        </div>
    `);
}

// ==========================================
// WISHLIST / FAVORITES FUNCTIONS
// ==========================================

function loadWishlist() {
    try {
        const saved = localStorage.getItem('ahluxe_wishlist');
        if (saved) {
            state.wishlist = JSON.parse(saved);
            // Update UI for wishlisted items
            state.wishlist.forEach(id => {
                const btn = document.querySelector(`[data-id="${id}"] .wishlist-btn`);
                if (btn) {
                    btn.classList.add('active');
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        icon.style.color = '#e74c3c';
                    }
                }
            });
        }
    } catch (e) {
        console.error('Error loading wishlist:', e);
        state.wishlist = [];
    }
}

function saveWishlist() {
    try {
        localStorage.setItem('ahluxe_wishlist', JSON.stringify(state.wishlist));
    } catch (e) {
        console.error('Error saving wishlist:', e);
    }
}

function toggleWishlist(btn, productId) {
    const card = document.querySelector(`[data-id="${productId}"]`);
    if (!card) return;
    
    const product = {
        id: productId,
        name: card.dataset.name,
        price: parseInt(card.dataset.price) || 2500,
        image: card.dataset.image || card.querySelector('img').src
    };
    
    const icon = btn.querySelector('i');
    
    if (state.wishlist.includes(productId)) {
        // Remove from wishlist
        state.wishlist = state.wishlist.filter(id => id !== productId);
        btn.classList.remove('active');
        if (icon) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '#fff';
        }
        showNotification('Removed from Favorites', 'info');
    } else {
        // Add to wishlist
        state.wishlist.push(productId);
        btn.classList.add('active');
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#e74c3c';
        }
        showNotification('Added to Favorites', 'success');
    }
    
    saveWishlist();
    renderFavorites();
}

function removeFromFavorites(productId) {
    state.wishlist = state.wishlist.filter(id => id !== productId);
    saveWishlist();
    
    // Update product card button
    const btn = document.querySelector(`[data-id="${productId}"] .wishlist-btn`);
    if (btn) {
        btn.classList.remove('active');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '#fff';
        }
    }
    
    renderFavorites();
    showNotification('Removed from Favorites', 'info');
}

function renderFavorites() {
    const container = document.getElementById('favoritesContainer');
    const emptyState = document.getElementById('emptyFavorites');
    const grid = document.getElementById('favoritesGrid');
    
    if (!container || !emptyState || !grid) return;
    
    if (state.wishlist.length === 0) {
        emptyState.style.display = 'block';
        grid.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    grid.style.display = 'grid';
    
    const productData = {
        brown: { name: 'Elegant Brown Salwar Kameez', image: 'Brown Salwar Kameez.jpeg' },
        navy: { name: 'Navy Blue Salwar Kameez', image: 'Navy Blue Salwar Kameez.jpeg' },
        white: { name: 'Crisp White Salwar Kameez', image: 'White Salwar Kameez.jpeg' },
        black: { name: 'Timeless Black Salwar Kameez', image: 'Black Salwar Kameez.jpeg' },
        blue: { name: 'Modern Blue Salwar Kameez', image: 'blue.jpeg' }
    };
    
    grid.innerHTML = state.wishlist.map(id => {
        const product = productData[id];
        if (!product) return '';
        return `
            <div class="favorite-card">
                <div class="favorite-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='icon.jpeg'">
                    <button class="remove-favorite" onclick="removeFromFavorites('${id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="favorite-info">
                    <h3>${product.name}</h3>
                    <p class="price">${CONFIG.currency} 2,500</p>
                    <div class="favorite-actions">
                        <button class="btn-add-cart" onclick="addToCart({id: '${id}', name: '${product.name}', price: 2500, image: '${product.image}', quantity: 1}); closeCart();">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                        <button class="btn-view" onclick="quickView('${id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// ORDERS FUNCTIONS
// ==========================================

function loadOrders() {
    try {
        const saved = localStorage.getItem('ahluxe_orders');
        if (saved) {
            state.orders = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading orders:', e);
        state.orders = [];
    }
}

function saveOrders() {
    try {
        localStorage.setItem('ahluxe_orders', JSON.stringify(state.orders));
    } catch (e) {
        console.error('Error saving orders:', e);
    }
}

function renderOrders() {
    const container = document.getElementById('ordersContainer');
    const emptyState = document.getElementById('emptyOrders');
    const list = document.getElementById('ordersList');
    
    if (!container || !emptyState || !list) return;
    
    if (state.orders.length === 0) {
        emptyState.style.display = 'block';
        list.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    list.style.display = 'flex';
    
    list.innerHTML = state.orders.slice().reverse().map(order => {
        const statusClass = order.status || 'pending';
        const statusText = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending';
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-number">
                            <i class="fas fa-shopping-bag"></i> ${order.number}
                        </div>
                        <div class="order-date">${order.date}</div>
                    </div>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-body">
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>${item.name} x${item.quantity}</span>
                                <span>${CONFIG.currency} ${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        <span>Total</span>
                        <span>${CONFIG.currency} ${order.total.toLocaleString()}</span>
                    </div>
                </div>
                <div class="order-footer">
                    <button class="btn-track" onclick="trackOrder('${order.number}')">
                        <i class="fas fa-map-marker-alt"></i> Track Order
                    </button>
                    <button class="btn-cancel-order" onclick="cancelOrder('${order.number}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function trackOrder(orderNumber) {
    showNotification('Order Tracking', 'info', `${orderNumber} - Contact our support for real-time updates`);
}

function cancelOrder(orderNumber) {
    document.getElementById('cancel').scrollIntoView({ behavior: 'smooth' });
    const orderInput = document.getElementById('cancelOrderNum');
    if (orderInput) {
        orderInput.value = orderNumber;
    }
    showNotification('Cancel Order', 'info', 'Please fill the cancellation form');
}

// ==========================================
// CHECKOUT & WHATSAPP INTEGRATION
// ==========================================

function openCheckoutModal() {
    if (state.cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    state.currentOrder = generateOrderNumber();
    if (elements.displayOrderNumber) {
        elements.displayOrderNumber.textContent = state.currentOrder;
    }
    
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const checkoutSummary = document.getElementById('checkoutSummary');
    if (checkoutSummary) {
        checkoutSummary.innerHTML = `
            <div style="background: linear-gradient(145deg, #0a0a0a, #1a1a1a); padding: 1.5rem; border-radius: 15px; margin-bottom: 1.5rem; border: 1px solid rgba(212,175,55,0.3);">
                <h4 style="margin-bottom: 1.2rem; color: #d4af37; font-family: 'Playfair Display', serif; font-size: 1.3rem;">
                    <i class="fas fa-shopping-bag"></i> Order Summary
                </h4>
                ${state.cart.map((item, idx) => `
                    <div style="display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: ${idx < state.cart.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none'};">
                        <span style="color: #ccc;">
                            <strong style="color: #fff;">${item.name}</strong> 
                            <span style="color: #d4af37; font-size: 0.9rem;">x${item.quantity}</span>
                        </span>
                        <span style="color: #d4af37; font-weight: 600;">
                            ${CONFIG.currency} ${(item.price * item.quantity).toLocaleString()}
                        </span>
                    </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; padding-top: 1.2rem; margin-top: 0.5rem; border-top: 2px solid rgba(212,175,55,0.4); font-size: 1.3rem; font-weight: 700;">
                    <span style="color: #fff;">Total Amount</span>
                    <span style="color: #d4af37;">${CONFIG.currency} ${total.toLocaleString()}</span>
                </div>
                <div style="text-align: center; margin-top: 1rem; padding: 0.8rem; background: rgba(37,211,102,0.1); border-radius: 10px; color: #25D366; font-size: 0.9rem; border: 1px solid rgba(37,211,102,0.2);">
                    <i class="fas fa-truck"></i> Complimentary Home Delivery Across Pakistan
                </div>
            </div>
        `;
    }
    
    if (elements.checkoutModal) {
        elements.checkoutModal.style.display = 'flex';
        elements.checkoutModal.classList.add('active');
    }
    closeCart();
}

function closeCheckoutModal() {
    if (elements.checkoutModal) {
        elements.checkoutModal.style.display = 'none';
        elements.checkoutModal.classList.remove('active');
    }
}

function generateOrderNumber() {
    const last = parseInt(localStorage.getItem('ahluxe_lastOrder')) || 0;
    const next = last + 1;
    localStorage.setItem('ahluxe_lastOrder', next);
    return `AHL-${String(next).padStart(5, '0')}`;
}

function processOrder(e) {
    e.preventDefault();
    if (state.isProcessing) return;
    state.isProcessing = true;
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    
    const orderData = {
        number: state.currentOrder,
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        email: document.getElementById('customerEmail').value.trim() || 'Not provided',
        address: document.getElementById('customerAddress').value.trim(),
        city: document.getElementById('customerCity').value.trim(),
        postal: document.getElementById('customerPostal')?.value.trim() || 'Not provided',
        notes: document.getElementById('orderNotes').value.trim() || 'None',
        items: [...state.cart],
        total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toLocaleString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        }),
        status: 'pending'
    };
    
    // Save order
    state.orders.push(orderData);
    saveOrders();
    renderOrders();
    
    setTimeout(() => {
        // Build WhatsApp message with Font Awesome style icons (text-based)
        let message = `================================\n`;
        message += `    *AH LUXE OFFICIAL*\n`;
        message += `      Premium Fashion House\n`;
        message += `================================\n\n`;
        
        message += `*ORDER CONFIRMATION*\n`;
        message += `Order Reference: *${orderData.number}*\n`;
        message += `Date: ${orderData.date}\n\n`;
        
        message += `-------------------------------\n`;
        message += `*CUSTOMER DETAILS*\n`;
        message += `-------------------------------\n`;
        message += `Name: *${orderData.name}*\n`;
        message += `Contact: ${orderData.phone}\n`;
        message += `Email: ${orderData.email}\n\n`;
        
        message += `-------------------------------\n`;
        message += `*DELIVERY ADDRESS*\n`;
        message += `-------------------------------\n`;
        message += `${orderData.address}\n`;
        message += `City: *${orderData.city}*\n`;
        if (orderData.postal !== 'Not provided') message += `Postal Code: ${orderData.postal}\n`;
        message += `Pakistan\n\n`;
        
        message += `-------------------------------\n`;
        message += `*ORDERED ITEMS*\n`;
        message += `-------------------------------\n`;
        
        orderData.items.forEach((item, idx) => {
            const itemTotal = (item.price * item.quantity).toLocaleString();
            message += `${idx + 1}. ${item.name}\n`;
            message += `   Qty: ${item.quantity}  |  Price: ${CONFIG.currency} ${itemTotal}\n`;
            if (idx < orderData.items.length - 1) message += `\n`;
        });
        
        message += `\n-------------------------------\n`;
        message += `*PAYMENT SUMMARY*\n`;
        message += `-------------------------------\n`;
        message += `Subtotal: ${CONFIG.currency} ${orderData.total.toLocaleString()}\n`;
        message += `Delivery: *FREE*\n`;
        message += `===============================\n`;
        message += `*TOTAL: ${CONFIG.currency} ${orderData.total.toLocaleString()}*\n`;
        message += `===============================\n\n`;
        
        if (orderData.notes !== 'None') {
            message += `-------------------------------\n`;
            message += `*SPECIAL NOTES*\n`;
            message += `-------------------------------\n`;
            message += `${orderData.notes}\n\n`;
        }
        
        message += `================================\n`;
        message += `  Thank You for Choosing AH Luxe\n`;
        message += `     *Elegance Redefined*\n`;
        message += `================================\n\n`;
        message += `_This is an automated order confirmation. Our team will contact you shortly for verification._`;

        // Open WhatsApp with formatted message
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`, '_blank');
        
        // Show success modal
        const successOrderNumber = document.getElementById('successOrderNumber');
        if (successOrderNumber) {
            successOrderNumber.textContent = orderData.number;
        }
        if (elements.successModal) {
            elements.successModal.style.display = 'flex';
            elements.successModal.classList.add('active');
        }
        
        // Clear cart
        state.cart = [];
        saveCart();
        updateCartUI();
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        state.isProcessing = false;
        e.target.reset();
        
        showNotification('Order Placed Successfully!', 'success', `Ref: ${orderData.number}`);
    }, 2000);
}

function closeSuccessModal() {
    if (elements.successModal) {
        elements.successModal.style.display = 'none';
        elements.successModal.classList.remove('active');
    }
}

// ==========================================
// CANCEL ORDER
// ==========================================

function submitCancelRequest(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    
    const data = {
        orderNumber: document.getElementById('cancelOrderNum').value.trim(),
        phone: document.getElementById('cancelPhone').value.trim(),
        reason: document.getElementById('cancelReason').value || 'Not specified',
        comments: document.getElementById('cancelComments')?.value.trim() || 'None',
        date: new Date().toLocaleString(),
        status: 'Pending'
    };
    
    let cancels = JSON.parse(localStorage.getItem('ahluxe_cancels')) || [];
    cancels.push(data);
    localStorage.setItem('ahluxe_cancels', JSON.stringify(cancels));
    
    setTimeout(() => {
        let message = `================================\n`;
        message += `    *AH LUXE OFFICIAL*\n`;
        message += `================================\n\n`;
        message += `*CANCELLATION REQUEST*\n\n`;
        message += `Order Reference: *${data.orderNumber}*\n`;
        message += `Contact: ${data.phone}\n`;
        message += `Reason: ${data.reason}\n`;
        if (data.comments !== 'None') message += `Comments: ${data.comments}\n`;
        message += `\n-------------------------------\n`;
        message += `_Our team will process this request within 24 hours._`;

        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        
        showNotification('Request Submitted', 'success', 'We will contact you shortly');
        e.target.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1500);
}

// ==========================================
// REVIEWS SYSTEM
// ==========================================

function loadReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;
    
    const defaultReviews = [
        { 
            name: 'Ahmed Khan', 
            rating: 5, 
            product: 'black', 
            text: 'Exceptional quality! The fabric feels luxurious and the stitching is impeccable. Truly a premium experience worth every penny.', 
            date: '2026-01-15',
            verified: true
        },
        { 
            name: 'Muhammad Ali', 
            rating: 5, 
            product: 'navy', 
            text: 'Outstanding craftsmanship! The fit is perfect and the attention to detail is remarkable. Highly recommended for those who appreciate elegance.', 
            date: '2026-01-10',
            verified: true
        },
        { 
            name: 'Hassan Raza', 
            rating: 5, 
            product: 'brown', 
            text: 'Absolutely delighted with my purchase. The color is rich and exactly as displayed. The complimentary delivery was the cherry on top!', 
            date: '2026-01-08',
            verified: true
        }
    ];
    
    let reviews = JSON.parse(localStorage.getItem('ahluxe_reviews')) || defaultReviews;
    renderReviews(reviews);
    setupStarRating();
}

function renderReviews(reviews) {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;
    
    const productNames = {
        brown: 'Elegant Brown',
        navy: 'Navy Blue',
        white: 'Crisp White',
        black: 'Timeless Black',
        blue: 'Modern Blue'
    };
    
    reviewsGrid.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #d4af37, #f4d03f); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #0a0a0a; font-size: 1.2rem;">
                        ${review.name.charAt(0)}
                    </div>
                    <div>
                        <h4 style="font-size: 1.1rem; margin-bottom: 0.2rem; color: #fff;">${review.name}</h4>
                        <span style="color: #888; font-size: 0.85rem;">${formatDate(review.date)}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.2rem;">
                    ${Array(5).fill(0).map((_, i) => 
                        `<i class="${i < review.rating ? 'fas' : 'far'} fa-star" style="color: #d4af37; font-size: 0.9rem;"></i>`
                    ).join('')}
                </div>
            </div>
            <span style="display: inline-block; background: rgba(212,175,55,0.1); color: #d4af37; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; margin-bottom: 1rem; border: 1px solid rgba(212,175,55,0.2);">
                ${productNames[review.product] || 'AH Luxe Product'}
            </span>
            <p style="color: #ddd; line-height: 1.7; font-size: 0.95rem; font-style: italic;">
                "${review.text}"
            </p>
            ${review.verified ? `<div style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; color: #25D366; font-size: 0.85rem;"><i class="fas fa-check-circle"></i> Verified Purchase</div>` : ''}
        </div>
    `).join('');
}

function setupStarRating() {
    const starContainer = document.getElementById('starRating');
    const ratingInput = document.getElementById('reviewRating');
    if (!starContainer) return;
    
    const stars = starContainer.querySelectorAll('i');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            ratingInput.value = rating;
            
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                    s.style.color = '#d4af37';
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                    s.style.color = '#333';
                }
            });
        });
        
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) s.style.color = '#d4af37';
                else s.style.color = '#333';
            });
        });
    });
    
    starContainer.addEventListener('mouseleave', () => {
        const currentRating = parseInt(ratingInput.value) || 0;
        stars.forEach((s, i) => {
            s.style.color = i < currentRating ? '#d4af37' : '#333';
        });
    });
}

function submitReview(e) {
    e.preventDefault();
    
    const rating = parseInt(document.getElementById('reviewRating').value);
    if (rating === 0) {
        showNotification('Please Select Rating', 'warning', 'Click on stars to rate');
        return;
    }
    
    const review = {
        name: document.getElementById('reviewerName').value.trim(),
        rating: rating,
        product: document.getElementById('reviewProduct').value || 'general',
        text: document.getElementById('reviewText').value.trim(),
        date: new Date().toISOString(),
        verified: false
    };
    
    let reviews = JSON.parse(localStorage.getItem('ahluxe_reviews')) || [];
    reviews.unshift(review);
    localStorage.setItem('ahluxe_reviews', JSON.stringify(reviews));
    
    renderReviews(reviews);
    showNotification('Review Submitted', 'success', 'Thank you for your feedback!');
    e.target.reset();
    
    // Reset stars
    const stars = document.getElementById('starRating').querySelectorAll('i');
    stars.forEach(s => {
        s.classList.remove('fas', 'active');
        s.classList.add('far');
        s.style.color = '#333';
    });
    document.getElementById('reviewRating').value = 0;
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function showNotification(title, type = 'info', subtitle = '') {
    const colors = {
        success: { bg: 'rgba(37, 211, 102, 0.95)', border: '#25D366', icon: 'fa-check-circle' },
        error: { bg: 'rgba(231, 76, 60, 0.95)', border: '#e74c3c', icon: 'fa-times-circle' },
        warning: { bg: 'rgba(243, 156, 18, 0.95)', border: '#f39c12', icon: 'fa-exclamation-triangle' },
        info: { bg: 'rgba(212, 175, 55, 0.95)', border: '#d4af37', icon: 'fa-info-circle' }
    };
    
    const theme = colors[type];
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        background: linear-gradient(135deg, ${theme.bg}, rgba(26, 26, 26, 0.98));
        color: #fff;
        padding: 1.2rem 1.5rem;
        border-radius: 12px;
        border-left: 4px solid ${theme.border};
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        min-width: 320px;
        max-width: 400px;
        animation: slideInRight 0.5s ease;
        backdrop-filter: blur(10px);
        pointer-events: all;
        position: relative;
        overflow: hidden;
    `;
    
    toast.innerHTML = `
        <div style="font-size: 1.5rem; color: ${theme.border};">
            <i class="fas ${theme.icon}"></i>
        </div>
        <div style="flex: 1; z-index: 1;">
            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.2rem; color: #fff;">${title}</div>
            ${subtitle ? `<div style="font-size: 0.9rem; color: #ccc;">${subtitle}</div>` : ''}
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #888; cursor: pointer; font-size: 1.2rem; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">&times;</button>
    `;
    
    if (elements.toastContainer) {
        elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.4s ease forwards';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }
}

function showWelcomeMessage() {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    
    if (hour >= 12) greeting = 'Good Afternoon';
    if (hour >= 17) greeting = 'Good Evening';
    if (hour >= 20 || hour < 5) greeting = 'Welcome';
    
    setTimeout(() => {
        showNotification(greeting, 'info', 'Welcome to AH Luxe Official - Premium Fashion');
    }, 1500);
}

// ==========================================
// QUICK VIEW
// ==========================================

function quickView(productId) {
    const productData = {
        brown: { name: 'Elegant Brown Salwar Kameez', image: 'Brown Salwar Kameez.jpeg' },
        navy: { name: 'Navy Blue Salwar Kameez', image: 'Navy Blue Salwar Kameez.jpeg' },
        white: { name: 'Crisp White Salwar Kameez', image: 'White Salwar Kameez.jpeg' },
        black: { name: 'Timeless Black Salwar Kameez', image: 'Black Salwar Kameez.jpeg' },
        blue: { name: 'Modern Blue Salwar Kameez', image: 'blue.jpeg' }
    };
    
    const product = productData[productId];
    if (!product) return;
    
    const modal = document.getElementById('quickViewModal');
    const body = document.getElementById('quickViewBody');
    
    if (!modal || !body) return;
    
    body.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem;">
            <div style="position: relative;">
                <img src="${product.image}" style="width: 100%; border-radius: 15px; border: 2px solid rgba(212,175,55,0.3); box-shadow: 0 10px 40px rgba(0,0,0,0.4);" onerror="this.src='icon.jpeg'">
                <div style="position: absolute; top: 1rem; left: 1rem; background: linear-gradient(135deg, #d4af37, #f4d03f); color: #0a0a0a; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                    <i class="fas fa-crown"></i> Premium
                </div>
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center;">
                <h2 style="font-size: 2rem; margin-bottom: 0.5rem; color: #fff; font-family: 'Playfair Display', serif;">${product.name}</h2>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                    ${Array(5).fill('<i class="fas fa-star" style="color: #d4af37;"></i>').join('')}
                    <span style="color: #888; font-size: 0.9rem;">(5.0)</span>
                </div>
                <div style="color: #d4af37; font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; font-family: 'Playfair Display', serif;">
                    ${CONFIG.currency} 2,500
                    <span style="font-size: 1rem; color: #888; text-decoration: line-through; margin-left: 0.5rem;">${CONFIG.currency} 3,500</span>
                </div>
                <p style="color: #aaa; margin-bottom: 1.5rem; line-height: 1.8;">
                    Experience luxury with our premium salwar kameez. Crafted with the finest fabrics and expert stitching for the perfect fit.
                </p>
                <ul style="color: #ccc; margin-bottom: 1.5rem; padding-left: 1.2rem; line-height: 2;">
                    <li><i class="fas fa-check" style="color: #d4af37;"></i> Premium quality fabric</li>
                    <li><i class="fas fa-check" style="color: #d4af37;"></i> Expert tailoring included</li>
                    <li><i class="fas fa-check" style="color: #d4af37;"></i> Perfect fit guarantee</li>
                    <li><i class="fas fa-check" style="color: #d4af37;"></i> Complimentary delivery</li>
                </ul>
                <button onclick="closeQuickView(); addToCart({id: '${productId}', name: '${product.name}', price: 2500, image: '${product.image}', quantity: 1});" 
                    style="padding: 1rem 2rem; background: linear-gradient(135deg, #d4af37, #f4d03f); color: #0a0a0a; border: none; border-radius: 30px; font-weight: 600; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s; box-shadow: 0 5px 20px rgba(212,175,55,0.3);">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==========================================
// CONTACT FORM
// ==========================================

function sendContactMessage(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    
    const form = e.target;
    const data = {
        name: form.querySelector('input[type="text"]').value.trim(),
        email: form.querySelector('input[type="email"]').value.trim(),
        subject: form.querySelectorAll('input[type="text"]')[1]?.value.trim() || 'General Inquiry',
        message: form.querySelector('textarea').value.trim(),
        date: new Date().toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    };
    
    setTimeout(() => {
        let message = `================================\n`;
        message += `    *AH LUXE OFFICIAL*\n`;
        message += `      Premium Fashion House\n`;
        message += `================================\n\n`;
        
        message += `*NEW CUSTOMER MESSAGE*\n`;
        message += `Date: ${data.date}\n\n`;
        
        message += `-------------------------------\n`;
        message += `*SENDER INFORMATION*\n`;
        message += `-------------------------------\n`;
        message += `Name: *${data.name}*\n`;
        message += `Email: ${data.email}\n`;
        message += `Subject: ${data.subject}\n\n`;
        
        message += `-------------------------------\n`;
        message += `*MESSAGE*\n`;
        message += `-------------------------------\n`;
        message += `${data.message}\n\n`;
        
        message += `================================\n`;
        message += `  Thank You for Contacting Us\n`;
        message += `================================\n\n`;
        message += `_This message was sent via AH Luxe Official website_`;

        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        
        showNotification('Message Sent Successfully', 'success', 'We will respond within 24 hours');
        form.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1500);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function closeMenu() {
    if (elements.navLinks) {
        elements.navLinks.classList.remove('active');
    }
    if (elements.hamburger) {
        elements.hamburger.classList.remove('active');
    }
}

function subscribeNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    showNotification('Welcome to AH Luxe', 'success', `Subscribed: ${email}`);
    e.target.reset();
}

function showReturnPolicy() {
    showNotification('Return Policy', 'info', '7-day easy returns | Unworn items only | Original packaging required');
}

function showFAQ() {
    showNotification('Frequently Asked Questions', 'info', 'Delivery: 3-5 business days | Stitching: Included | Sizes: All standard available');
}

function showPrivacyPolicy() {
    showNotification('Privacy Policy', 'info', 'Your data is secure and never shared with third parties');
}

function showTerms() {
    showNotification('Terms of Service', 'info', 'By using our services, you agree to our terms and conditions');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ==========================================
// EVENT LISTENERS & ANIMATIONS
// ==========================================

function setupEventListeners() {
    // Hamburger menu
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', () => {
            elements.navLinks.classList.toggle('active');
            elements.hamburger.classList.toggle('active');
        });
    }
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeCheckoutModal();
            closeQuickView();
            closeSuccessModal();
        }
    });
}

function setupScrollEffects() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;
        
        if (navbar) {
            if (currentScroll > 100) {
                navbar.style.boxShadow = '0 5px 30px rgba(0,0,0,0.5)';
                navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            } else {
                navbar.style.boxShadow = 'none';
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            }
        }
        
        lastScroll = currentScroll;
    });
}

function setupAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes luxuryFall {
            to { 
                transform: translateY(100vh) rotate(720deg); 
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// DEBUG CONSOLE COMMANDS
// ==========================================

window.showOrders = () => {
    console.log('%c AH LUXE OFFICIAL - ORDERS ', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.table(state.orders);
    return `${state.orders.length} orders found`;
};

window.showCart = () => {
    console.log('%c AH LUXE OFFICIAL - CART ', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.table(state.cart);
    return `${state.cart.length} items in cart`;
};

window.showFavorites = () => {
    console.log('%c AH LUXE OFFICIAL - FAVORITES ', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.table(state.wishlist);
    return `${state.wishlist.length} favorites`;
};

window.clearAllData = () => {
    if (confirm('Clear all AH Luxe data? This cannot be undone.')) {
        localStorage.removeItem('ahluxe_cart');
        localStorage.removeItem('ahluxe_wishlist');
        localStorage.removeItem('ahluxe_orders');
        localStorage.removeItem('ahluxe_reviews');
        localStorage.removeItem('ahluxe_lastOrder');
        localStorage.removeItem('ahluxe_cancels');
        
        state.cart = [];
        state.wishlist = [];
        state.orders = [];
        
        updateCartUI();
        renderFavorites();
        renderOrders();
        
        showNotification('All Data Cleared', 'success', 'Page will refresh');
        setTimeout(() => location.reload(), 1500);
    }
};

console.log('%c AH LUXE OFFICIAL ', 'color: #d4af37; font-size: 18px; font-weight: bold; border: 2px solid #d4af37; padding: 10px;');
console.log('%c All systems operational ', 'color: #25D366;');
