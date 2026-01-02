// profile-manager.js
let dropdownOpen = false;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDropdown();
    checkAndUpdateUser();
});

function initializeDropdown() {
    // Add click handler to user button
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', toggleUserDropdown);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const userDropdown = document.getElementById('userDropdown');
        if (dropdownOpen && userDropdown && !userDropdown.contains(e.target)) {
            closeDropdown();
        }
    });
}

function checkAndUpdateUser() {
    // Check if user is logged in
    const userData = localStorage.getItem("qc_user");
    
    if (!userData) {
        // User not logged in - show Guest
        console.log("No user data found, showing Guest");
        setupGuestMode();
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log("User found in localStorage:", user);
        
        if (!user.logged) {
            console.log("User not logged in, showing Guest");
            setupGuestMode();
            return;
        }
        
        // User is logged in - update UI
        console.log("Updating UI for user:", user.name);
        updateUserInterface(user);
        setupLogout();
        
    } catch(e) {
        console.error("Error parsing user data:", e);
        setupGuestMode();
    }
}

function updateUserInterface(user) {
    console.log("updateUserInterface called with:", user);
    
    // Update avatar
    const avatarImg = document.getElementById('userAvatar');
    if (avatarImg) {
        if (user.photoURL) {
            // Google user - use their profile picture
            console.log("Setting Google photo:", user.photoURL);
            avatarImg.src = user.photoURL;
            avatarImg.onerror = function() {
                // If image fails to load, use fallback
                const nameForAvatar = encodeURIComponent(user.name);
                avatarImg.src = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=667eea&color=fff&bold=true`;
            };
        } else {
            // Manual/Guest user - generate avatar
            const nameForAvatar = encodeURIComponent(user.name);
            console.log("Setting generated avatar for:", user.name);
            avatarImg.src = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=667eea&color=fff&bold=true`;
        }
        avatarImg.alt = user.name;
    } else {
        console.error("avatarImg element not found!");
    }
    
    // Update username
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) {
        // Show only first name
        const firstName = user.name.split(' ')[0];
        console.log("Setting username to:", firstName);
        userNameSpan.textContent = firstName;
    } else {
        console.error("userNameSpan element not found!");
    }
    
    // Update login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.style.display = 'none';
    }
    
    // Update profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.innerHTML = '<i class="fas fa-user-circle"></i> My Profile';
        profileBtn.href = "profile.html";
        profileBtn.onclick = function(e) {
            closeDropdown();
        };
    }
    
    // Update logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.href = "#";
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem("qc_user");
                window.location.href = "index.html";
            } else {
                closeDropdown();
            }
        };
    }
}

function setupGuestMode() {
    console.log("Setting up Guest mode");
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileBtn = document.getElementById('profileBtn');
    
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        loginBtn.href = "index.html";
        loginBtn.style.display = 'block';
        loginBtn.onclick = function(e) {
            closeDropdown();
        };
    }
    
    if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Switch User';
        logoutBtn.href = "index.html";
        logoutBtn.onclick = function(e) {
            closeDropdown();
        };
    }
    
    if (profileBtn) {
        profileBtn.innerHTML = '<i class="fas fa-user-circle"></i> Profile';
        profileBtn.href = "#";
        profileBtn.onclick = function(e) {
            e.preventDefault();
            alert('Please sign in first to view your profile.');
            closeDropdown();
        };
    }
    
    // Make sure Guest avatar and name are set
    const avatarImg = document.getElementById('userAvatar');
    const userNameSpan = document.getElementById('userName');
    
    if (avatarImg) {
        avatarImg.src = "https://ui-avatars.com/api/?name=Guest&background=6366f1&color=fff";
        avatarImg.alt = "Guest";
    }
    
    if (userNameSpan) {
        userNameSpan.textContent = "Guest";
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.href = "#";
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem("qc_user");
                window.location.href = "index.html";
            } else {
                closeDropdown();
            }
        };
    }
}

// Dropdown functions
function toggleUserDropdown(e) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    
    const dropdownMenu = document.getElementById('userDropdownMenu');
    const userBtn = document.getElementById('userBtn');
    
    if (!dropdownMenu || !userBtn) return;
    
    if (dropdownOpen) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

function openDropdown() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    const userBtn = document.getElementById('userBtn');
    
    if (!dropdownMenu || !userBtn) return;
    
    dropdownMenu.classList.add('show');
    userBtn.classList.add('active');
    dropdownOpen = true;
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'dropdown-backdrop';
    backdrop.id = 'dropdownBackdrop';
    backdrop.onclick = closeDropdown;
    document.body.appendChild(backdrop);
    
    setTimeout(() => {
        backdrop.classList.add('active');
    }, 10);
}

function closeDropdown() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    const userBtn = document.getElementById('userBtn');
    const backdrop = document.getElementById('dropdownBackdrop');
    
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    if (userBtn) userBtn.classList.remove('active');
    if (backdrop) backdrop.remove();
    
    dropdownOpen = false;
}

// Make functions available globally
window.toggleUserDropdown = toggleUserDropdown;
window.closeDropdown = closeDropdown;

// DEBUG: Log localStorage on page load
console.log("Page loaded. localStorage 'qc_user':", localStorage.getItem("qc_user"));