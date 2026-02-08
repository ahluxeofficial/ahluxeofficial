// ==========================================
// AH LUXE OFFICIAL - PART 1
// Core Functions & State Management
// ==========================================

// ============= CONFIGURATION =============
const CONFIG = {
    whatsappNumber: '923152480364',
    currency: '₨',
    deliveryFree: true,
    businessName: 'AH Luxe Official'
};

// ============= EMOJIS =============
const EMOJIS = {
    cart: '🛒', bag: '🛍️', check: '✅', cross: '❌',
    warning: '⚠️', info: 'ℹ️', fire: '🔥', star: '⭐',
    heart: '❤️', truck: '🚚', phone: '📱', email: '📧',
    user: '👤', home: '🏠', city: '🏙️', note: '📝',
    money: '💰', gift: '🎁', clock: '⏰', support: '🎧',
    medal: '🏅', refresh: '🔄', success: '🎉', error: '❌',
    loading: '⏳', search: '🔍', arrow: '→', whatsapp: '💬'
};

// ============= STATE =============
const state = {
    cart: [],
    currentOrder: null,
    isProcessing: false
};

// ============= DOM ELEMENTS =============
const elements = {
    cartSidebar: document.getElementById('cartSidebar'),
    cartOverlay: document.getElementById('cartOverlay'),
    cartItems: document.getElementById('cartItems'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    checkoutModal: document.getElementById('checkoutModal'),
    successModal: document.getElementById('successModal'),
    hamburger: document.getElementById('hamburger'),
    navLinks: document.getElementById('navLinks'),
    displayOrderNumber: document.getElementById('displayOrderNumber')
};

// ============= INIT =============
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    loadCart();
    loadSavedFormData();
    setupEventListeners();
    setupScrollEffects();
    updateCartUI();
    showWelcomeMessage();
    console.log('%c✨ AH Luxe Loaded ✨', 'color: #d4af37; font-size: 20px; font-weight: bold;');
}

// ============= CART FUNCTIONS =============
function loadCart() {
    try {
        const saved = localStorage.getItem('ahluxe_cart');
        state.cart = saved ? JSON.parse(saved) : [];
    } catch (e) {
        state.cart = [];
    }
}

function saveCart() {
    localStorage.setItem('ahluxe_cart', JSON.stringify(state.cart));
}

function openCart() {
    elements.cartSidebar.classList.add('active');
    elements.cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    elements.cartSidebar.classList.remove('active');
    elements.cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function addToCartFromBtn(button) {
    if (state.isProcessing) return;
    
    const card = button.closest('.product-card');
    const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: 2500,
        image: card.querySelector('img').src,
        quantity: 1
    };
    
    const existing = state.cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity++;
        showNotification(`${EMOJIS.check} ${product.name} updated!`, 'success');
    } else {
        state.cart.push(product);
        showNotification(`${EMOJIS.bag} ${product.name} added!`, 'success');
    }
    
    // Button animation
    button.innerHTML = `${EMOJIS.check} Added!`;
    button.style.background = '#25D366';
    button.style.color = 'white';
    
    setTimeout(() => {
        button.innerHTML = 'Add to Cart';
        button.style.background = '';
        button.style.color = '';
    }, 1500);
    
    saveCart();
    updateCartUI();
    
    if (state.cart.length === 1 && !existing) {
        setTimeout(openCart, 300);
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
}

function removeFromCart(productId) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;
    
    if (item.quantity > 1) {
        if (!confirm(`${EMOJIS.warning} Remove ${item.name}?`)) return;
    }
    
    state.cart = state.cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
    showNotification(`${EMOJIS.cross} Item removed`, 'info');
}

function clearCart() {
    if (state.cart.length === 0) return;
    if (!confirm(`${EMOJIS.warning} Clear entire cart?`)) return;
    
    state.cart = [];
    saveCart();
    updateCartUI();
    showNotification(`${EMOJIS.cross} Cart cleared`, 'info');
}

function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    elements.cartCount.textContent = totalItems;
    elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    if (totalItems > 0) {
        elements.cartCount.style.animation = 'pulse 0.5s ease';
        setTimeout(() => elements.cartCount.style.animation = '', 500);
    }
    
    if (state.cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--gray);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${EMOJIS.cart}</div>
                <p style="font-size: 1.1rem;">Your cart is empty</p>
                <button onclick="closeCart(); document.getElementById('products').scrollIntoView({behavior: 'smooth'});" 
                    style="margin-top: 1.5rem; padding: 0.8rem 1.5rem; background: var(--gold); color: var(--black); border: none; border-radius: 25px; cursor: pointer; font-weight: 600;">
                    ${EMOJIS.arrow} Browse Products
                </button>
            </div>
        `;
        elements.cartTotal.textContent = `${CONFIG.currency} 0`;
        return;
    }
    
    elements.cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item" style="display: flex; gap: 1rem; padding: 1rem; background: rgba(42,42,42,0.5); border-radius: 15px; margin-bottom: 1rem; border: 1px solid rgba(212,175,55,0.2);">
            <img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; border: 2px solid rgba(212,175,55,0.3);">
            <div style="flex: 1;">
                <h4 style="font-size: 0.95rem; margin-bottom: 0.3rem;">${item.name}</h4>
                <p style="color: var(--gold); font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">
                    ${CONFIG.currency} ${(item.price * item.quantity).toLocaleString()}
                </p>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="updateQuantity('${item.id}', -1)" style="width: 32px; height: 32px; border: 2px solid var(--gold); background: transparent; color: var(--gold); border-radius: 8px; cursor: pointer; font-weight: bold;">−</button>
                    <span style="font-weight: 700; min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" style="width: 32px; height: 32px; border: 2px solid var(--gold); background: transparent; color: var(--gold); border-radius: 8px; cursor: pointer; font-weight: bold;">+</button>
                </div>
            </div>
            <button onclick="removeFromCart('${item.id}')" style="background: rgba(231,76,60,0.2); color: var(--red); border: none; padding: 0.6rem; border-radius: 8px; cursor: pointer; height: fit-content;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    elements.cartItems.insertAdjacentHTML('beforeend', `
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid rgba(212,175,55,0.3);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span style="color: var(--gray);">Subtotal:</span>
                <span style="font-weight: 600;">${CONFIG.currency} ${totalPrice.toLocaleString()}</span>
            </div>
            <div style="text-align: center; padding: 0.5rem; background: rgba(37,211,102,0.1); border-radius: 8px; color: #25D366; font-size: 0.9rem; margin-bottom: 1rem;">
                ${EMOJIS.truck} Free Home Delivery
            </div>
            <button onclick="clearCart()" style="width: 100%; padding: 0.8rem; background: transparent; border: 1px solid rgba(231,76,60,0.5); color: var(--red); border-radius: 8px; cursor: pointer;">
                ${EMOJIS.cross} Clear Cart
            </button>
        </div>
    `);
    
    elements.cartTotal.textContent = `${CONFIG.currency} ${totalPrice.toLocaleString()}`;
}
// ==========================================
// AH LUXE OFFICIAL - PART 2
// Checkout, Forms & Utilities
// ==========================================

// ============= CHECKOUT FUNCTIONS =============
function openCheckoutModal() {
    if (state.cart.length === 0) {
        showNotification(`${EMOJIS.warning} Cart is empty!`, 'warning');
        return;
    }
    
    state.currentOrder = generateOrderNumber();
    elements.displayOrderNumber.textContent = state.currentOrder;
    
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('checkoutSummary').innerHTML = `
        <div style="background: rgba(0,0,0,0.3); padding: 1.2rem; border-radius: 15px; margin-bottom: 1.5rem; border: 1px solid rgba(212,175,55,0.2);">
            <h4 style="margin-bottom: 1rem; color: var(--gold);">${EMOJIS.bag} Order Summary</h4>
            ${state.cart.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 0.7rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span><strong>${item.name}</strong> (x${item.quantity})</span>
                    <span style="color: var(--gold); font-weight: 600;">${CONFIG.currency} ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; padding-top: 1rem; margin-top: 0.5rem; border-top: 2px solid rgba(212,175,55,0.3); font-size: 1.2rem; font-weight: 700;">
                <span>Total:</span>
                <span style="color: var(--gold);">${CONFIG.currency} ${total.toLocaleString()}</span>
            </div>
            <div style="text-align: center; margin-top: 0.8rem; padding: 0.5rem; background: rgba(37,211,102,0.1); border-radius: 8px; color: #25D366; font-size: 0.9rem;">
                ${EMOJIS.truck} Free Home Delivery All Over Pakistan
            </div>
        </div>
    `;
    
    elements.checkoutModal.style.display = 'flex';
    elements.checkoutModal.classList.add('active');
    closeCart();
}

function closeCheckoutModal() {
    elements.checkoutModal.style.display = 'none';
    elements.checkoutModal.classList.remove('active');
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
    btn.innerHTML = `${EMOJIS.loading} Processing...`;
    btn.disabled = true;
    
    const orderData = {
        number: state.currentOrder,
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        email: document.getElementById('customerEmail').value.trim() || 'N/A',
        address: document.getElementById('customerAddress').value.trim(),
        city: document.getElementById('customerCity').value.trim(),
        notes: document.getElementById('orderNotes').value.trim() || 'N/A',
        items: [...state.cart],
        total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toISOString()
    };
    
    // Save order
    let orders = JSON.parse(localStorage.getItem('ahluxe_orders')) || [];
    orders.push(orderData);
    localStorage.setItem('ahluxe_orders', JSON.stringify(orders));
    
    setTimeout(() => {
        // WhatsApp message
        let message = `*${EMOJIS.gift} NEW ORDER - ${orderData.number}*%0A%0A`;
        message += `*${EMOJIS.user} Customer:*%0A`;
        message += `Name: ${orderData.name}%0A`;
        message += `Phone: ${orderData.phone}%0A`;
        message += `Email: ${orderData.email}%0A`;
        message += `Address: ${orderData.address}, ${orderData.city}%0A`;
        if (orderData.notes !== 'N/A') message += `Notes: ${orderData.notes}%0A`;
        message += `%0A*${EMOJIS.bag} Items:*%0A`;
        
        orderData.items.forEach((item, idx) => {
            message += `${idx + 1}. ${item.name} x${item.quantity} = ${CONFIG.currency} ${(item.price * item.quantity).toLocaleString()}%0A`;
        });
        
        message += `%0A*${EMOJIS.money} TOTAL: ${CONFIG.currency} ${orderData.total.toLocaleString()}*%0A`;
        message += `${EMOJIS.truck} Free Delivery%0A`;
        message += `%0A${EMOJIS.heart} Thank you!`;
        
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${message}`, '_blank');
        
        // Success
        document.getElementById('successOrderNumber').textContent = orderData.number;
        elements.successModal.style.display = 'flex';
        elements.successModal.classList.add('active');
        createConfetti();
        
        // Clear cart
        state.cart = [];
        saveCart();
        updateCartUI();
        localStorage.removeItem('ahluxe_customer');
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        state.isProcessing = false;
        e.target.reset();
    }, 1500);
}

function closeSuccessModal() {
    elements.successModal.style.display = 'none';
    elements.successModal.classList.remove('active');
}

// ============= CANCEL ORDER =============
function submitCancelRequest(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `${EMOJIS.loading} Sending...`;
    btn.disabled = true;
    
    const data = {
        orderNumber: document.getElementById('cancelOrderNum').value.trim(),
        phone: document.getElementById('cancelPhone').value.trim(),
        reason: document.getElementById('cancelReason').value || 'Not specified',
        date: new Date().toISOString(),
        status: 'Pending'
    };
    
    let cancels = JSON.parse(localStorage.getItem('ahluxe_cancels')) || [];
    cancels.push(data);
    localStorage.setItem('ahluxe_cancels', JSON.stringify(cancels));
    
    setTimeout(() => {
        let message = `*${EMOJIS.warning} CANCEL REQUEST*%0A%0A`;
        message += `Order: ${data.orderNumber}%0A`;
        message += `Phone: ${data.phone}%0A`;
        message += `Reason: ${data.reason}%0A`;
        
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${message}`, '_blank');
        
        showNotification(`${EMOJIS.check} Request sent! We'll contact you.`, 'success');
        e.target.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1000);
}

// ============= CONTACT FORM =============
function sendContactMessage(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `${EMOJIS.loading} Sending...`;
    btn.disabled = true;
    
    const form = e.target;
    const data = {
        name: form.querySelector('input[type="text"]').value.trim(),
        email: form.querySelector('input[type="email"]').value.trim(),
        message: form.querySelector('textarea').value.trim(),
        date: new Date().toISOString()
    };
    
    let messages = JSON.parse(localStorage.getItem('ahluxe_contacts')) || [];
    messages.push(data);
    localStorage.setItem('ahluxe_contacts', JSON.stringify(messages));
    
    setTimeout(() => {
        let waMessage = `*${EMOJIS.email} CONTACT*%0A%0A`;
        waMessage += `From: ${data.name}%0A`;
        waMessage += `Email: ${data.email}%0A%0A`;
        waMessage += `Message:%0A${data.message}`;
        
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${waMessage}`, '_blank');
        
        showNotification(`${EMOJIS.check} Message sent! Thank you.`, 'success');
        form.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1000);
}

// ============= FORM AUTO-SAVE =============
function saveFormData() {
    const data = {
        name: document.getElementById('customerName')?.value || '',
        phone: document.getElementById('customerPhone')?.value || '',
        email: document.getElementById('customerEmail')?.value || '',
        address: document.getElementById('customerAddress')?.value || '',
        city: document.getElementById('customerCity')?.value || ''
    };
    localStorage.setItem('ahluxe_customer', JSON.stringify(data));
}

function loadSavedFormData() {
    const saved = localStorage.getItem('ahluxe_customer');
    if (!saved) return;
    
    try {
        const data = JSON.parse(saved);
        if (document.getElementById('customerName')) {
            document.getElementById('customerName').value = data.name || '';
            document.getElementById('customerPhone').value = data.phone || '';
            document.getElementById('customerEmail').value = data.email || '';
            document.getElementById('customerAddress').value = data.address || '';
            document.getElementById('customerCity').value = data.city || '';
        }
    } catch (e) {}
}

// ============= NOTIFICATIONS =============
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.lux-notification');
    if (existing) existing.remove();
    
    const colors = {
        success: '#25D366',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    const icons = {
        success: EMOJIS.check,
        error: EMOJIS.error,
        warning: EMOJIS.warning,
        info: EMOJIS.info
    };
    
    const notif = document.createElement('div');
    notif.innerHTML = `${icons[type]} ${message}`;
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 100000;
        font-weight: 500;
        animation: slideInRight 0.4s ease;
        max-width: 350px;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

function showWelcomeMessage() {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12) greeting = 'Good Afternoon';
    if (hour >= 17) greeting = 'Good Evening';
    
    setTimeout(() => {
        showNotification(`${EMOJIS.star} ${greeting}! Welcome to ${CONFIG.businessName}`, 'info');
    }, 1000);
}

// ============= VISUAL EFFECTS =============
function createConfetti() {
    const colors = ['#d4af37', '#25D366', '#ffffff', '#f4d03f'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            z-index: 10000;
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}

function setupScrollEffects() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 5px 30px rgba(0,0,0,0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ============= EVENT LISTENERS =============
function setupEventListeners() {
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', () => {
            elements.navLinks.classList.toggle('active');
            elements.hamburger.classList.toggle('active');
        });
    }
    
    const formInputs = ['customerName', 'customerPhone', 'customerEmail', 'customerAddress', 'customerCity'];
    formInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', debounce(saveFormData, 500));
        }
    });
    
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNotification(`${EMOJIS.search} Quick view coming soon!`, 'info');
        });
    });
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function closeMenu() {
    elements.navLinks.classList.remove('active');
    elements.hamburger.classList.remove('active');
}

// ============= CSS ANIMATIONS =============
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
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    @keyframes confettiFall {
        to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============= DEBUG =============
window.showOrders = function() {
    const orders = JSON.parse(localStorage.getItem('ahluxe_orders')) || [];
    console.table(orders);
    return `${orders.length} orders found!`;
};

console.log('%c🎉 Part 2 Loaded!', 'color: #25D366; font-size: 16px;');