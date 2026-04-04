/* ==========================================
   1. GLOBAL & PARTY MODE LOGIC
   ========================================== */

// --- Party Mode Toggle ---
function togglePartyMode() {
    const body = document.body;
    const btn = document.getElementById('partyBtn');
    
    // Toggle the class on the body
    const isParty = body.classList.toggle('party-active');
    
    // Save preference to localStorage so it stays active across pages
    localStorage.setItem('nexusPartyMode', isParty ? 'enabled' : 'disabled');
    
    updatePartyUI();
}

// Helper to keep UI consistent
function updatePartyUI() {
    const body = document.body;
    const btn = document.getElementById('partyBtn');
    if (!btn) return;

    if (body.classList.contains('party-active')) {
        btn.innerText = "Party Mode: ON";
        btn.style.backgroundColor = "#a855f7"; // Purple glow
        btn.style.color = "white";
    } else {
        btn.innerText = "Party Mode: OFF";
        btn.style.backgroundColor = "";
        btn.style.color = "";
    }
}

// Load preferences and URL params on every page load
window.addEventListener('DOMContentLoaded', () => {
    // Check localStorage for Party Mode
    if (localStorage.getItem('nexusPartyMode') === 'enabled') {
        document.body.classList.add('party-active');
    }
    updatePartyUI();

    // AUTO-SELECT EVENT FROM URL (e.g., tickets.html?event=Pixel Parade)
    const urlParams = new URLSearchParams(window.location.search);
    const eventParam = urlParams.get('event');
    const eventSelect = document.getElementById('eventSelect');

    if (eventParam && eventSelect) {
        for (let i = 0; i < eventSelect.options.length; i++) {
            if (eventSelect.options[i].value === eventParam) {
                eventSelect.selectedIndex = i;
                break;
            }
        }
    }

    // Load Admin Stats if on admin page
    if (document.getElementById('txBody')) {
        loadAdminStats();
    }

    // Load Saved User for Account Access display
    const savedUser = localStorage.getItem('nexusUser');
    if (savedUser) {
        displaySavedUser(JSON.parse(savedUser));
    }
});


/* ==========================================
   2. FORM & TRANSACTION LOGIC
   ========================================== */

// --- CONTACT FORM SUBMISSION ---
const contactForm = document.getElementById('contactForm');
if(contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const topic = document.getElementById('contactTopic') ? document.getElementById('contactTopic').value : "General Inquiry";
        
        const submitBtn = contactForm.querySelector('button');
        const originalText = submitBtn.innerText;
        
        submitBtn.innerText = "Sending...";
        submitBtn.style.background = "var(--accent-green)";

        setTimeout(() => {
            alert(`Thanks ${name}! Your inquiry regarding "${topic}" has been received. We'll reply to ${email} soon.`);
            contactForm.reset();
            submitBtn.innerText = originalText;
            submitBtn.style.background = ""; 
        }, 1200);
    });
}

// --- TICKET PURCHASE LOGIC ---
const purchaseForm = document.getElementById('purchaseForm');
if(purchaseForm) {
    purchaseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('ticketName').value;
        const eventDropdown = document.getElementById('eventSelect');
        const ticketType = document.getElementById('ticketType').value;
        
        const basePrice = parseFloat(eventDropdown.options[eventDropdown.selectedIndex].getAttribute('data-price'));
        const multiplier = ticketType === "2" ? 2 : 1; // VIP doubles the price
        const qty = parseInt(document.getElementById('ticketQty').value);
        
        const total = basePrice * multiplier * qty;

        const orderInfo = {
            name: name,
            event: eventDropdown.value + (multiplier === 2 ? " (VIP)" : ""),
            qty: qty,
            total: total,
            status: "PAID",
            date: new Date().toLocaleDateString()
        };

        let allTransactions = JSON.parse(localStorage.getItem('nexusTransactions')) || [];
        allTransactions.unshift(orderInfo);
        localStorage.setItem('nexusTransactions', JSON.stringify(allTransactions));
        
        sessionStorage.setItem('lastOrder', JSON.stringify(orderInfo));
        
        window.location.href = 'receipt.html';
    });
}


/* ==========================================
   3. ACCOUNT ACCESS LOGIC (RESTORATION)
   ========================================== */

// --- Registration ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fullName = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const password = document.getElementById('regPass').value;

        const userData = {
            name: fullName,
            email: email,
            password: password 
        };

        localStorage.setItem('nexusUser', JSON.stringify(userData));
        displaySavedUser(userData);
        
        this.reset();
        alert('Account created! You can now log in.');
    });
}

// --- Login Verification ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const loginEmail = document.getElementById('loginEmail').value.trim().toLowerCase();
        const loginPass = document.getElementById('loginPass').value;
        const savedAccount = JSON.parse(localStorage.getItem('nexusUser'));

        if (savedAccount) {
            if (savedAccount.email === loginEmail && savedAccount.password === loginPass) {
                alert(`Welcome back, ${savedAccount.name}! Login successful.`);
            } else {
                alert('Invalid email or password. Please try again.');
            }
        } else {
            alert('No account found. Please register first.');
        }
    });
}

// --- Display Saved User Block ---
function displaySavedUser(user) {
    const displayArea = document.getElementById('user-display');
    if (!displayArea) return;

    displayArea.innerHTML = `
        <div class="blocky green" style="padding: 30px; border: 3px solid black; margin-top: 20px;">
            <h3 style="margin-bottom: 10px;">Registered Account Found</h3>
            <div style="font-weight: 700; font-size: 1.1rem;">
                <p>User: <span style="color: white; -webkit-text-stroke: 1px black;">${user.name}</span></p>
                <p>Email: <span>${user.email}</span></p>
            </div>
            <p style="margin-top: 15px; font-size: 0.85rem; font-style: italic;">Nexus ID active. Use the credentials above to log in.</p>
        </div>
    `;
}


/* ==========================================
   4. ADMIN DASHBOARD LOGIC
   ========================================== */

function loadAdminStats() {
    const txs = JSON.parse(localStorage.getItem('nexusTransactions')) || [];
    const txBody = document.getElementById('txBody');
    const statRev = document.getElementById('statRev');
    const statSold = document.getElementById('statSold');
    
    let totalRevenue = 0;
    let totalTickets = 0;
    let html = '';

    txs.forEach(t => {
        totalRevenue += t.total;
        totalTickets += t.qty;
        html += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding:12px; font-weight:600;">${t.name}</td>
                <td>${t.event}</td>
                <td>$${t.total}.00</td>
                <td style="color:green; font-weight:800;">${t.status}</td>
            </tr>`;
    });

    if(statRev) statRev.innerText = `$${totalRevenue.toLocaleString()}`;
    if(statSold) statSold.innerText = totalTickets;
    if(txBody) txBody.innerHTML = html || '<tr><td colspan="4">No sales recorded.</td></tr>';
}
/* ==========================================
   5. PASSWORD RECOVERY LOGIC
   ========================================== */

const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailInput = document.getElementById('forgotEmail').value.trim().toLowerCase();
        const newPassword = document.getElementById('newPass').value;

        // 1. Get the current user from storage
        const savedAccount = JSON.parse(localStorage.getItem('nexusUser'));

        // 2. Check if the account exists and email matches
        if (savedAccount && savedAccount.email === emailInput) {
            // 3. Update the password in the object
            savedAccount.password = newPassword;

            // 4. Save the updated object back to localStorage
            localStorage.setItem('nexusUser', JSON.stringify(savedAccount));

            alert('Password updated successfully! You can now log in with your new password.');
            window.location.href = 'index.html'; // Redirect back to home/login
        } else {
            // Error if email doesn't match or no account exists
            alert('Error: No registered account found with that email address.');
        }
    });
}
