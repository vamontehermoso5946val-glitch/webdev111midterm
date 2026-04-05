// --- 1. GLOBAL INITIALIZATION ---
window.onload = function() {
    updateClock();
    setInterval(updateClock, 1000);
    updateLentDisplay();

    // Identify which page we are on
    const booksGrid = document.getElementById('booksGrid');
    const membersGrid = document.getElementById('membersGrid');
    const currentLoansGrid = document.getElementById('currentLoansGrid');
    const historyTableBody = document.getElementById('historyTableBody');

    if (booksGrid) attachLoanListeners();
    if (membersGrid) renderNewMembers();
    if (currentLoansGrid) renderActiveLoans();
    if (historyTableBody) renderLoanHistory();
};

// --- 2. REAL-TIME CLOCK ---
function updateClock() {
    const clockElement = document.getElementById('clockDisplay');
    if (!clockElement) return;
    const now = new Date();
    clockElement.innerText = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    });
}

// --- 3. LOAN LOGIC (HOME PAGE) ---
function attachLoanListeners() {
    const activeLoans = JSON.parse(localStorage.getItem('activeLoans')) || [];
    
    document.querySelectorAll('.loan-action-btn').forEach(btn => {
        const card = btn.closest('.card');
        if (!card) return;
        
        const title = card.getAttribute('data-title');

        // Check if already borrowed
        if (activeLoans.some(loan => loan.title === title)) {
            setButtonToBorrowed(btn);
        }

        // Apply click listener if it's a "Loan" button
        if (btn.innerText.toUpperCase() === "LOAN") {
            btn.onclick = () => handleLoan(btn, title, card);
        }
    });
}

function handleLoan(button, title, card) {
    let activeLoans = JSON.parse(localStorage.getItem('activeLoans')) || [];
    
    // Capture book cover image if it exists
    const img = card.querySelector('.book-cover');
    const imgSrc = img ? img.src : '';
    
    // Capture color for placeholder fallback
    const placeholder = card.querySelector('.cover-placeholder');
    const colorClass = placeholder ? placeholder.classList[1] : 'gold';

    const borrowDate = new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });

    activeLoans.push({
        title: title,
        color: colorClass,
        image: imgSrc,
        borrowedDate: borrowDate
    });

    localStorage.setItem('activeLoans', JSON.stringify(activeLoans));
    setButtonToBorrowed(button);
    updateLentDisplay();
    
    // Optional: Visual confirmation
    console.log(`Borrowed: ${title}`);
}

function setButtonToBorrowed(button) {
    button.innerText = "BORROWED";
    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.cursor = "default";
    button.style.background = "#444";
}

// --- 4. DISPLAY SYNCING (SIDEBAR STATS) ---
function updateLentDisplay() {
    const activeLoans = JSON.parse(localStorage.getItem('activeLoans')) || [];
    const count = activeLoans.length;
    
    const lentStat = document.getElementById('booksLentStat');
    if (lentStat) {
        lentStat.innerText = count === 0 ? "None" : (count === 1 ? "1 Book" : `${count} Books`);
    }

    const activeCount = document.getElementById('activeLoansCount');
    if (activeCount) {
        activeCount.innerText = count;
    }
}

// --- 5. LOANS PAGE & HISTORY LOGIC ---
function renderActiveLoans() {
    const grid = document.getElementById('currentLoansGrid');
    if (!grid) return;

    const activeLoans = JSON.parse(localStorage.getItem('activeLoans')) || [];
    grid.innerHTML = ""; 

    if (activeLoans.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; opacity: 0.5; padding: 20px;'>No active loans.</p>";
        return;
    }

    activeLoans.forEach(loan => {
        const coverHTML = loan.image 
            ? `<img src="${loan.image}" class="book-cover">` 
            : `<div class="cover-placeholder ${loan.color}"></div>`;

        const loanHTML = `
            <div class="card">
                ${coverHTML}
                <div class="card-content">
                    <h4>${loan.title}</h4>
                    <span class="tag">Due in: 7 Days</span>
                    <button class="loan-action-btn" onclick="returnBook('${loan.title}')" style="background: #e63946; margin-top: 10px;">RETURN BOOK</button>
                </div>
            </div>`;
        grid.insertAdjacentHTML('beforeend', loanHTML);
    });
}

function returnBook(title) {
    let activeLoans = JSON.parse(localStorage.getItem('activeLoans')) || [];
    let history = JSON.parse(localStorage.getItem('loanHistory')) || [];

    // Find the loan item to move to history
    const returnedItem = activeLoans.find(loan => loan.title === title);

    if (returnedItem) {
        // Add to history array
        history.push({
            title: returnedItem.title,
            date: returnedItem.borrowedDate,
            status: "Returned"
        });
        localStorage.setItem('loanHistory', JSON.stringify(history));

        // Remove from active loans
        activeLoans = activeLoans.filter(loan => loan.title !== title);
        localStorage.setItem('activeLoans', JSON.stringify(activeLoans));
    }
    
    // Refresh UI
    renderActiveLoans();
    renderLoanHistory();
    updateLentDisplay();
}

function renderLoanHistory() {
    const historyBody = document.getElementById('historyTableBody');
    if (!historyBody) return;

    const history = JSON.parse(localStorage.getItem('loanHistory')) || [];
    
    if (history.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:0.5; padding: 20px;">No loan history yet.</td></tr>`;
        return;
    }

    // Sort to show the newest returns at the top
    const sortedHistory = [...history].reverse();

    historyBody.innerHTML = sortedHistory.map(item => `
        <tr>
            <td>${item.title}</td>
            <td>${item.date}</td>
            <td style="color: #4ade80; font-weight: bold; text-transform: uppercase; font-size: 0.8rem;">${item.status}</td>
        </tr>
    `).join('');
}

// --- 6. MEMBERS LOGIC ---
function saveMember() {
    const input = document.getElementById('memberNameInput');
    if (!input || !input.value.trim()) return;

    let members = JSON.parse(localStorage.getItem('savedLibraryMembers')) || [];
    members.push(input.value.trim());
    localStorage.setItem('savedLibraryMembers', JSON.stringify(members));

    input.value = "";
    renderNewMembers();
}

function renderNewMembers() {
    const grid = document.getElementById('membersGrid');
    if (!grid) return;

    // Remove existing "new" member cards to prevent duplicates
    grid.querySelectorAll('.new-member-card').forEach(card => card.remove());

    const members = JSON.parse(localStorage.getItem('savedLibraryMembers')) || [];
    members.forEach(m => {
        const memberHTML = `
            <div class="card new-member-card">
                <div class="profile-circle" style="background: #d4a373; width: 60px; height: 60px; border-radius: 50%; margin: 20px auto 10px;"></div>
                <div class="card-content" style="text-align: center; padding-left: 12px;">
                    <h4 style="font-family: sans-serif;">${m}</h4>
                    <span class="tag">New Member</span>
                    <button class="loan-action-btn" onclick="deleteMember('${m}')" style="background: #444; margin-top: 10px;">REMOVE</button>
                </div>
            </div>`;
        grid.insertAdjacentHTML('beforeend', memberHTML);
    });
}

function deleteMember(name) {
    let members = JSON.parse(localStorage.getItem('savedLibraryMembers')) || [];
    members = members.filter(m => m !== name);
    localStorage.setItem('savedLibraryMembers', JSON.stringify(members));
    renderNewMembers();
}

// --- 7. SEARCH FILTER ---
function filterBooks() {
    const query = document.getElementById('bookSearch').value.toLowerCase();
    const cards = document.querySelectorAll('#booksGrid .card');
    let foundCount = 0;

    cards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        if (title.includes(query)) {
            card.style.display = "";
            foundCount++;
        } else {
            card.style.display = "none";
        }
    });

    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = foundCount === 0 ? "block" : "none";
    }
}