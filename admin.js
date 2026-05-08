// 1. FIREBASE CONFIG (Must match your main site)
const firebaseConfig = {
    apiKey: "AIzaSyBje9SL2yJvkNayeCwQghB2ElskDnNYCLw",
    authDomain: "berestro-4db92.firebaseapp.com",
    projectId: "berestro-4db92",
    appId: "1:824573013152:web:f112c3cbc7fd84f60cedc5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. LIVE ORDER LISTENER
function listenToOrders() {
    // Orders sorted by newest first
    db.collection("orders").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        const orderFeed = document.getElementById('order-feed');
        orderFeed.innerHTML = ""; // Clear current view
        
        let revenue = 0;
        let pending = 0;
        let completed = 0;

        if (snapshot.empty) {
            orderFeed.innerHTML = '<div class="col-span-full py-10 text-center text-slate-400">No orders found.</div>';
        }

        snapshot.forEach((doc) => {
            const order = doc.data();
            const orderId = doc.id;
            
            // Calculate stats
            revenue += order.totalAmount || 0;
            if (order.status === "Pending" || order.status === "Confirmed") pending++;
            if (order.status === "Completed") completed++;

            // Create Order Card
            const card = document.createElement('div');
            card.className = "order-card bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between";
            
            // Format Items List
            const itemsHtml = order.items.map(item => 
                `<li class="flex justify-between text-sm py-1 border-b border-slate-50">
                    <span class="font-medium">${item.name}</span>
                    <span class="text-slate-500 italic">₹${item.price}</span>
                </li>`
            ).join('');

            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID: ${orderId.substring(0,8)}</span>
                            <h4 class="text-xl font-bold text-slate-800">${order.customerName}</h4>
                            <p class="text-xs text-slate-500">${order.customerEmail}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}">
                            ${order.status}
                        </span>
                    </div>
                    <ul class="mb-6">${itemsHtml}</ul>
                </div>
                <div class="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span class="text-2xl font-black text-slate-900">₹${order.totalAmount}</span>
                    <div class="flex gap-2">
                        ${order.status !== 'Completed' ? 
                            `<button onclick="updateStatus('${orderId}', 'Completed')" class="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition">Complete</button>` 
                            : ''}
                        <button onclick="deleteOrder('${orderId}')" class="bg-slate-100 text-slate-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition">Delete</button>
                    </div>
                </div>
            `;
            orderFeed.appendChild(card);
        });

        // Update Dashboard Stats
        document.getElementById('total-revenue').innerText = `₹${revenue}`;
        document.getElementById('pending-count').innerText = pending;
        document.getElementById('completed-count').innerText = completed;
    });
}

// 3. ADMIN ACTIONS
async function updateStatus(id, newStatus) {
    try {
        await db.collection("orders").doc(id).update({ status: newStatus });
    } catch (error) {
        alert("Action failed. Check Production Rules: Updates must be allowed for admins.");
    }
}

async function deleteOrder(id) {
    if (confirm("Permanently delete this order record?")) {
        try {
            await db.collection("orders").doc(id).delete();
        } catch (error) {
            alert("Delete failed. Check Production Rules.");
        }
    }
}

window.onload = listenToOrders;