// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyBje9SL2yJvkNayeCwQghB2ElskDnNYCLw",
    authDomain: "berestro-4db92.firebaseapp.com",
    projectId: "berestro-4db92",
    appId: "1:824573013152:web:f112c3cbc7fd84f60cedc5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Initialize Firestore
const provider = new firebase.auth.GoogleAuthProvider();

let cart = [];
let currentUser = null;

// 2. GENERATE MENU UI
function generateMenu() {
    const configs = {
        biryani: { id: "section-biryani", title: "Aromatic Biryanis 🔥" },
        veg: { id: "section-veg", title: "Veggie Delights 🌿" },
        nonVeg: { id: "section-nonVeg", title: "Non-Veg Favorites 🍗" }
    };

    for (const key in menuData) {
        const container = document.getElementById(configs[key].id);
        container.innerHTML = `<h3 class="text-2xl font-black px-6 mb-4">${configs[key].title}</h3>`;
        const row = document.createElement('div');
        row.className = "flex overflow-x-auto gap-6 px-6 pb-4 no-scrollbar";
        
        menuData[key].forEach(item => {
            row.innerHTML += `
                <div class="food-card bg-white rounded-[2.5rem] p-4 shadow-sm border border-stone-100">
                    <img src="${item.img}" class="h-40 w-full object-cover rounded-[2rem] mb-4">
                    <h4 class="font-bold">${item.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-orange-600 font-black">₹${item.price}</span>
                        <button onclick="addToCart('${item.name}', ${item.price})" class="bg-stone-900 text-white w-10 h-10 rounded-xl hover:bg-orange-600 transition">+</button>
                    </div>
                </div>`;
        });
        container.appendChild(row);
    }
}

// 3. AUTH LOGIC
auth.onAuthStateChanged(user => {
    currentUser = user; // Set current user for order tracking
    if (user) {
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('main-content').classList.remove('blur-bg');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-pic').src = user.photoURL;
    }
});

function enterAsGuest() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('main-content').classList.remove('blur-bg');
    document.getElementById('user-profile').classList.remove('hidden');
    document.getElementById('user-pic').src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
}

// 4. ORDER & CART LOGIC
async function placeOrder() {
    if (!cart.length) return alert("Your cart is empty!");

    const orderData = {
        customerName: currentUser ? currentUser.displayName : "Guest User",
        customerEmail: currentUser ? currentUser.email : "guest@example.com",
        items: cart,
        totalAmount: cart.reduce((sum, item) => sum + item.price, 0),
        status: "Pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Real-time timestamp
    };

    try {
        await db.collection("orders").add(orderData); // Store in Firestore
        alert("Order Placed Successfully! 🎉 It is saved in our database.");
        cart = []; updateUI(); toggleCart();
    } catch (error) {
        console.error("Error storing order: ", error);
        alert("Failed to store order in Firebase.");
    }
}

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
    document.getElementById('cart-modal').classList.toggle('hidden');
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.length ? '' : '<p class="text-center text-stone-400">Cart empty</p>';
    cart.forEach((item) => {
        list.innerHTML += `<div class="flex justify-between bg-stone-50 p-3 rounded-xl"><span>${item.name}</span><b>₹${item.price}</b></div>`;
    });
    document.getElementById('total-price').innerText = document.getElementById('mobile-total').innerText;
}

document.getElementById('googleBtn').onclick = () => auth.signInWithPopup(provider);
function logout() { auth.signOut().then(() => location.reload()); }
window.onload = generateMenu;