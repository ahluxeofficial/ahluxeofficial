// ==================== CONFIGURATION ====================
const WHATSAPP_NUMBER = "923152480364"; // Apna number dalen

// ==================== ORDER NUMBER SYSTEM ====================
let currentOrderNumber = parseInt(localStorage.getItem('ahluxe_order_num')) || 1;

function generateOrderNumber() {
    const orderNum = `AHL-${String(currentOrderNumber).padStart(5, '0')}`;
    currentOrderNumber++;
    localStorage.setItem('ahluxe_order_num', currentOrderNumber);
    return orderNum;
}

function updateTotalOrders() {
    document.getElementById('totalOrders').textContent = (currentOrderNumber - 1).toLocaleString();
}

// ==================== MOBILE MENU ====================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

function closeMenu() {
    navLinks.classList.remove('active');
}

// ==================== SHOPPING CART ====================
let cart = [];

function openCart() {
    document.getElementById('cartSidebar').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cartCount');
    countEl.textContent = total;
    countEl.style.display = total > 0 ? 'flex' : 'none';
}

function addToCartFromBtn(btn) {
    const card = btn.closest('.product-card');
    const item = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: 2500,
        image: card.querySelector('img').src,
        quantity: 1
    };
    
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push(item);
    }
    
    updateCart();
    updateCartCount();
    showNotification('Added to cart!');
}

function updateCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalEl.textContent = '₨ 0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        html += `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: var(--black); border-radius: 10px;">
                <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 0.9rem; margin-bottom: 0.3rem;">${item.name}</h4>
                    <p style="color: var(--gold);">₨ ${item.price}</p>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.3rem;">
                        <button onclick="changeQty(${index}, -1)" style="width: 25px; height: 25px; border-radius: 50%; border: 1px solid var(--gold); background: transparent; color: var(--gold); cursor: pointer;">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" style="width: 25px; height: 25px; border-radius: 50%; border: 1px solid var(--gold); background: transparent; color: var(--gold); cursor: pointer;">+</button>
                    </div>
                </div>
                <button onclick="removeItem(${index})" style="background: none; border: none; color: var(--red); cursor: pointer;"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalEl.textContent = `₨ ${total.toLocaleString()}`;
}

function changeQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCart();
    updateCartCount();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
    updateCartCount();
}

// ==================== CHECKOUT ====================
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Cart is empty!');
        return;
    }
    
    const orderNum = generateOrderNumber();
    document.getElementById('displayOrderNumber').textContent = orderNum;
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        html += `<p>${item.name} x${item.quantity} - ₨ ${(item.price * item.quantity).toLocaleString()}</p>`;
    });
    
    document.getElementById('checkoutSummary').innerHTML = html;
    
    document.getElementById('checkoutModal').classList.add('active');
    closeCart();
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function processOrder(e) {
    e.preventDefault();
    
    const orderNum = document.getElementById('displayOrderNumber').textContent;
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const email = document.getElementById('customerEmail').value;
    const address = document.getElementById('customerAddress').value;
    const city = document.getElementById('customerCity').value;
    const notes = document.getElementById('orderNotes').value;
    
    let items = '';
    let total = 0;
    
    cart.forEach((item, i) => {
        total += item.price * item.quantity;
        items += `${i+1}. ${item.name} (${item.id}) x${item.quantity} = ₨ ${item.price * item.quantity}\n`;
    });
    
    const message = `🛍️ NEW ORDER - AH LUXE OFFICIAL

📋 Order: ${orderNum}

👤 ${name}
📞 ${phone}
📧 ${email || 'N/A'}

📍 ${address}, ${city}

📦 ORDER:
${items}

💰 TOTAL: ₨ ${total}

📝 ${notes || 'No notes'}

🚚 FREE DELIVERY`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    
    document.getElementById('successOrderNumber').textContent = orderNum;
    document.getElementById('successModal').classList.add('active');
    
    cart = [];
    updateCart();
    updateCartCount();
    updateTotalOrders();
    e.target.reset();
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
    closeCheckoutModal();
}

// ==================== CANCEL ORDER ====================
function submitCancelRequest(e) {
    e.preventDefault();
    
    const orderNum = document.getElementById('cancelOrderNum').value;
    const phone = document.getElementById('cancelPhone').value;
    const reason = document.getElementById('cancelReason').value;
    
    const message = `❌ CANCELLATION REQUEST - AH LUXE

Order: ${orderNum}
Phone: ${phone}
Reason: ${reason || 'Not specified'}`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    showNotification('Cancellation request sent!');
    e.target.reset();
}

// ==================== CONTACT ====================
function sendContactMessage(e) {
    e.preventDefault();
    showNotification('Message sent!');
    e.target.reset();
}

// ==================== NOTIFICATION ====================
function showNotification(msg) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = 'notification';
    div.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--gold);
        color: var(--black);
        padding: 1rem 2rem;
        border-radius: 50px;
        z-index: 5000;
        font-weight: 600;
        animation: fadeIn 0.3s;
    `;
    div.textContent = msg;
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 3000);
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    updateTotalOrders();
    updateCartCount();
});