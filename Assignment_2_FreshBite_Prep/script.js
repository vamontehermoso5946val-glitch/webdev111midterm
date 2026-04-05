// --- 1. DRAWER & NAVIGATION LOGIC ---

/**
 * Toggles the side drawer and dark overlay.
 * Uses the 'open' class from your style.css.
 */
function toggleDrawer() {
    const drawer = document.getElementById('side-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    if (drawer && overlay) {
        drawer.classList.toggle('open');
        // If drawer has 'open' class, show overlay; otherwise hide it
        overlay.style.display = drawer.classList.contains('open') ? 'block' : 'none';
    }
}

/**
 * Smooth scrolls to the Nutrients section.
 * Perfect for your wide-scroll layout.
 */
function scrollToNutrients() {
    const nutrientSection = document.getElementById('quick-nutrients');
    if (nutrientSection) {
        nutrientSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- 2. AUTHENTICATION LOGIC (LOCAL STORAGE) ---

/**
 * REGISTER: Saves user to a local "database" list.
 */
function handleRegister(event) {
    event.preventDefault();
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    // Fetch existing users or start an empty list
    let users = JSON.parse(localStorage.getItem('usersList')) || [];

    // Check for duplicate usernames
    if (users.find(u => u.username.toLowerCase() === user.toLowerCase())) {
        alert("This username is already taken. Try another one!");
        return;
    }

    // Push new user object
    users.push({ username: user, password: pass });
    localStorage.setItem('usersList', JSON.stringify(users));
    
    alert("Registration Successful! Now you can sign in.");
    window.location.href = "index.html"; 
}

/**
 * LOGIN: Validates credentials and updates UI.
 */
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    
    let users = JSON.parse(localStorage.getItem('usersList')) || [];
    const foundUser = users.find(u => u.username === user && u.password === pass);

    if (foundUser) {
        // Store current session
        localStorage.setItem('currentUser', user);
        
        // Close UI components before redirecting
        const drawer = document.getElementById('side-drawer');
        const overlay = document.getElementById('drawer-overlay');
        
        if (drawer) drawer.classList.remove('open');
        if (overlay) overlay.style.display = 'none';
        
        // Redirect to homepage to refresh the Nav bar state
        window.location.href = "index.html"; 
    } else {
        alert("Invalid credentials. Please check your username and password.");
    }
}

/**
 * LOGOUT: Clears session and resets UI state.
 */
function handleLogout() {
    localStorage.removeItem('currentUser');
    
    // Reset Drawer/Overlay visibility
    const drawer = document.getElementById('side-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.style.display = 'none';

    window.location.href = "index.html";
}

// --- 3. UI SYNC LOGIC (ON PAGE LOAD) ---

/**
 * Runs every time any page loads to ensure the 
 * Ube theme displays the correct account status.
 */
window.onload = function() {
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.getElementById('login-link');
    const loginUI = document.getElementById('login-ui-content');
    const logoutUI = document.getElementById('logout-ui-content');
    const drawer = document.getElementById('side-drawer');
    const overlay = document.getElementById('drawer-overlay');

    // 1. Check Login State
    if (currentUser) {
        // Update nav text to show "Account: Vince" (or current username)
        if (loginLink) {
            loginLink.innerText = "Account: " + currentUser;
            loginLink.style.color = "var(--accent-gold)"; // Highlight when logged in
        }
        
        // Switch Drawer content
        if (loginUI) loginUI.style.display = "none";
        if (logoutUI) logoutUI.style.display = "block";
    } else {
        // Default guest state
        if (loginLink) loginLink.innerText = "Login";
        if (loginUI) loginUI.style.display = "block";
        if (logoutUI) logoutUI.style.display = "none";
    }

    // 2. Prevent Drawer "Pop-in"
    // Forces the drawer and overlay to stay hidden until the user clicks login
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
}