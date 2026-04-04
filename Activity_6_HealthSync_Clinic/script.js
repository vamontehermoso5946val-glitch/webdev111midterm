/**
 * HealthSync Core Logic
 * Handles Authentication, Personalization, and UI Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Personalization
    displayUserName();

    // 2. Session Guard (Optional: Uncomment to restrict access)
    // checkAuthStatus();

    // 3. Initialize Stat Box Interactions
    setupStatBoxHover();
});

/**
 * Grabs the user's name from storage or defaults to "Vince"
 */
function displayUserName() {
    const nameElement = document.getElementById('userNameDisplay');
    if (nameElement) {
        // Pulls from localStorage (set during login)
        const savedName = localStorage.getItem('userDisplayName') || "Dr. ";
        nameElement.innerText = savedName;
    }
}

/**
 * Handles Login Transition
 * Call this function from your Login Page button
 */
function handleLogin(inputName = "Dr. ") {
    // Store session data
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userDisplayName', inputName);
    
    // Redirect to Portal
    window.location.href = 'staff_portal.html';
}

/**
 * Logout Logic
 */
function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userDisplayName');
    window.location.href = 'login.html';
}

/**
 * Simple Session Guard
 * Redirects to login if the user isn't authenticated
 */
function checkAuthStatus() {
    const currentPage = window.location.pathname;
    if (!currentPage.includes('login.html') && localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

/**
 * Adds a "Pulse" effect to the primary action button
 */
function setupStatBoxHover() {
    const boxes = document.querySelectorAll('.stat-box');
    boxes.forEach(box => {
        box.addEventListener('click', () => {
            console.log("Navigating to detailed metrics...");
            // Add custom navigation logic here if needed
        });
    });
}

/**
 * Booking Flow: Next Step Logic
 */
function validateAndNext() {
    const firstName = document.querySelector('input[placeholder="First Name"]')?.value;
    const lastName = document.querySelector('input[placeholder="Last Name"]')?.value;

    if (firstName && lastName) {
        localStorage.setItem('appointmentPatient', `${firstName} ${lastName}`);
        window.location.href = 'specialty.html';
    } else {
        alert("Please complete your personal information to proceed.");
    }
}