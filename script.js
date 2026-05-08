// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyBje9SL2yJvkNayeCwQghB2ElskDnNYCLw",
    authDomain: "berestro-4db92.firebaseapp.com",
    projectId: "berestro-4db92",
    appId: "1:824573013152:web:f112c3cbc7fd84f60cedc5"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Firestore instance
const provider = new firebase.auth.GoogleAuthProvider();

let cart = [];
let currentUser = null;

// 2. GENERATE MENU FROM DATA
function generateMenu() {
    const configs = {
        biryani: { id: "section-biryani", title: "Aromatic Biryanis 🔥" },
        veg: { id: "section-veg", title: "Veggie Delights 🌿" },
        nonVeg: { id: "section-nonVeg", title: "Non-Veg Favorites 🍗" }
    };

    for (const key in menuData) {
        const container = document.getElementById(configs[key].id);
        if (!container) continue;

        container.innerHTML = `<h3 class="text-2xl font-black px-6 mb-4">${configs[key].title}</h3>`;
        const row = document.createElement('div');
        row.className = "flex overflow-x-auto gap-6 px-6 pb-4 no-scrollbar";
        
        menuData[key].forEach(item => {
            row.innerHTML += `
                <div class="food-card bg-white rounded-[2.5rem] p-4 shadow-sm border border-stone-100">
                    <img src="${item.img}" class="h-40 w-full object-cover rounded-[2rem] mb-4" loading="lazy">
                    <h4 class="font-bold text-sm">${item.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-orange-600 font-black">₹${item.price}</span>
                        <button onclick="addToCart('${item.name}', ${item.price})" 
                                class="bg-stone-900 text-white w-8 h-8 rounded-lg hover:bg-orange-600 transition shadow-md shadow-black/10">+</button>
                    </div>
                </div>`;
        });
        container.appendChild(row);
    }
}

// 3. AUTHENTICATION HANDLERS
auth.onAuthStateChanged(user => {
    currentUser = user;
    const modal = document.getElementById('auth-modal');
    const main = document.getElementById('main-content');
    
    if (user) {
        modal.classList.add('hidden');
        main.classList.remove('blur-bg');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-pic').src = user.photoURL;
    }
});

document.getElementById('googleBtn').onclick = () => {
    auth.signInWithPopup(provider).catch(err => console.error("Auth Error:", err));
};

function enterAsGuest() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('main-content').classList.remove('blur-bg');
    document.getElementById('user-profile').classList.remove('hidden');
    document.getElementById('user-pic').src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}

// 4. ORDERING SYSTEM
async function placeOrder() {
    if (cart.length === 0) return alert("Your cart is empty!");

    const orderBtn = document.getElementById('placeOrderBtn');
    orderBtn.disabled = true;
    orderBtn.innerText = "Processing...";

    const orderData = {
        customerName: currentUser ? currentUser.displayName : "Guest User",
        customerEmail: currentUser ? currentUser.email : "guest@example.com",
        items: cart,
        totalAmount: cart.reduce((sum, item) => sum + item.price, 0),
        status: "Confirmed",
        orderDate: new Date().toISOString(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // For database sorting
    };

    try {
        await db.collection("orders").add(orderData); // Save to Production DB
        
        alert("Order Placed Successfully! 🎉");
        cart = [];
        updateUI();
        toggleCart();
    } catch (error) {
        console.error("Production DB Error:", error);
        alert("Order failed. Please check your internet connection.");
    } finally {
        orderBtn.disabled = false;
        orderBtn.innerText = "Place Order";
    }
}

// 5. UTILITY FUNCTIONS
function addToCart(name, price) {
    cart.push({ name, price });
    updateUI();
}

function updateUI() {
    const total = cart.reduce((s, i) => s + i.price, 0);
    document.getElementById('mobile-count').innerText = cart.length;
    document.getElementById('mobile-total').innerText = `₹${total}`;
    document.getElementById('floating-cart').classList.toggle('active', cart.length > 0);
}

function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    cartModal.classList.toggle('hidden');
    
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.length ? '' : '<p class="text-center text-stone-400 py-10">Hungry? Add something!</p>';
    
    cart.forEach((item, idx) => {
        list.innerHTML += `
            <div class="flex justify-between items-center bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <span class="font-medium text-sm">${item.name}</span>
                <div class="flex items-center gap-3">
                    <b class="text-orange-600">₹${item.price}</b>
                    <button onclick="removeItem(${idx})" class="text-red-400 text-xs font-bold">✕</button>
                </div>
            </div>`;
    });
    
    document.getElementById('total-price').innerText = `₹${cart.reduce((s, i) => s + i.price, 0)}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateUI();
    renderCartList(); // Refresh modal view
}

function logout() { auth.signOut().then(() => location.reload()); }

window.onload = generateMenu;