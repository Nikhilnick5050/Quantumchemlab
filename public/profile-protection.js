/**
 * QuantumChem Profile Page Protection
 * Redirects non-logged-in users to login page
 */

(function() {
    'use strict';

    /**
     * Protect profile page on load
     */
    function protectProfilePage() {
        // Check if we're on the profile page
        const isProfilePage = window.location.pathname.includes('profile.html');
        
        if (isProfilePage) {
            const isLoggedIn = AuthUtils.isUserLoggedIn();
            
            if (!isLoggedIn) {
                // Store the intended destination
                sessionStorage.setItem('redirect_after_login', 'profile.html');
                
                // Show toast and redirect
                AuthUtils.showToast('Please login to access your profile', 'warning');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
                
                return false;
            }
            
            // User is logged in - populate profile page
            populateProfilePage();
        }
        
        return true;
    }

    /**
     * Populate profile page with user data
     */
    function populateProfilePage() {
        const userData = AuthUtils.getUserData();
        
        if (!userData) return;

        // Update profile header
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileAvatar = document.getElementById('profileAvatar');

        if (profileName) {
            profileName.textContent = userData.name || 'User';
        }

        if (profileEmail) {
            profileEmail.textContent = userData.email || 'quantumchem25@gmail.com';
        }

        if (profileAvatar) {
            profileAvatar.src = userData.photoURL || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=3B82F6&color=fff&bold=true`;
        }

        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthUtils.logout();
            });
        }
    }

    /**
     * Handle redirect after login
     */
    function handleLoginRedirect() {
        const redirect = sessionStorage.getItem('redirect_after_login');
        
        if (redirect && AuthUtils.isUserLoggedIn()) {
            sessionStorage.removeItem('redirect_after_login');
            
            // Small delay for better UX
            setTimeout(() => {
                window.location.href = redirect;
            }, 500);
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            protectProfilePage();
            handleLoginRedirect();
        });
    } else {
        protectProfilePage();
        handleLoginRedirect();
    }
})();
