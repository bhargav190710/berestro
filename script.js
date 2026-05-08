const firebaseConfig = {
    apiKey: "AIzaSyBje9SL2yJvkNayeCwQghB2ElskDnNYCLw",
    authDomain: "berestro-4db92.firebaseapp.com",
    projectId: "berestro-4db92",
    appId: "1:824573013152:web:f112c3cbc7fd84f60cedc5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

let cart = [];
let currentUser = null;

// Auth Listener
auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('main-content').classList.remove('blur-bg');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-pic').src = user.photoURL;
    }
});

// Ordering Logic
async function placeOrder() {
    if (!cart.length) return alert("Cart is empty!");

    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.innerText = "Sending...";

    const orderData = {
        customerName: currentUser ? currentUser.displayName : "Guest User",
        customerEmail: currentUser ? currentUser.email : "guest@example.com",
        items: cart,
        totalAmount: cart.reduce((s, i) => s + i.price, 0),
        status: "Confirmed",
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // CRITICAL for Admin
    };

    try {
        await db.collection("orders").add(orderData); // Matches Admin collection
        alert("Order Placed! Check Admin Dashboard.");
        cart = []; updateUI(); toggleCart();
    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Place Order";
    }
}

// UI Functions
function generateMenu() {
    const cfgs = {
        biryani: { id: "section-biryani", title: "Aromatic Biryanis 🔥" },
        veg: { id: "section-veg", title: "Veggie Delights 🌿" },
        nonVeg: { id: "section-nonVeg", title: "Non-Veg Favorites 🍗" }
    };
    for (const k in menuData) {
        const con = document.getElementById(cfgs[k].id);
        con.innerHTML = `<h3 class="text-2xl font-black px-6 mb-4">${cfgs[k].title}</h3>`;
        const row = document.createElement('div');
        row.className = "flex overflow-x-auto gap-6 px-6 pb-4 no-scrollbar";
        menuData[k].forEach(i => {
            row.innerHTML += `
                <div class="food-card bg-white rounded-[2.5rem] p-4 border border-stone-100 shadow-sm">
                    <img src="${i.img}" class="h-40 w-full object-cover rounded-[2rem] mb-4">
                    <h4 class="font-bold text-sm">${i.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-orange-600 font-black">₹${i.price}</span>
                        <button onclick="addToCart('${i.name}', ${i.price})" class="bg-stone-900 text-white w-8 h-8 rounded-lg">+</button>
                    </div>
                </div>`;
        });
        con.appendChild(row);
    }
}

function addToCart(n, p) { cart.push({name:n, price:p}); updateUI(); }
function updateUI() {
    const total = cart.reduce((s, i) => s + i.price, 0);
    document.getElementById('mobile-count').innerText = cart.length;
    document.getElementById('mobile-total').innerText = `₹${total}`;
    document.getElementById('floating-cart').classList.toggle('active', cart.length > 0);
}
function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('hidden');
    const list = document.getElementById('cart-items-list');
    list.innerHTML = "";
    cart.forEach(i => list.innerHTML += `<div class="flex justify-between bg-stone-50 p-3 rounded-xl"><span>${i.name}</span><b>₹${i.price}</b></div>`);
    document.getElementById('total-price').innerText = `₹${cart.reduce((s, i) => s + i.price, 0)}`;
}
function logout() { auth.signOut().then(() => location.reload()); }
function enterAsGuest() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('main-content').classList.remove('blur-bg');
}
document.getElementById('googleBtn').onclick = () => auth.signInWithPopup(provider);
window.onload = generateMenu;