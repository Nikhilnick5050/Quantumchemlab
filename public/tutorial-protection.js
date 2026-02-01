/**
 * QuantumChem Tutorial Protection System
 * Implements gated access with premium UX for tutorial cards
 */

const TutorialProtection = (() => {
    const FREE_PREVIEW_COUNT = 6; // First 6 tutorials visible without lock overlay

    /**
     * Initialize tutorial protection
     */
    function init() {
        applyTutorialProtection();
        setupTutorialClickHandlers();
        
        // Listen for login state changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'qc_user' || e.key === 'jwt_token') {
                applyTutorialProtection();
            }
        });
    }

    /**
     * Apply visual protection to tutorials
     */
    function applyTutorialProtection() {
        const tutorialCards = document.querySelectorAll('.tutorial-card');
        const isLoggedIn = AuthUtils.isUserLoggedIn();

        tutorialCards.forEach((card, index) => {
            // Remove any existing overlays
            const existingOverlay = card.querySelector('.tutorial-lock-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }

            // If user is logged in, unlock all tutorials
            if (isLoggedIn) {
                card.classList.remove('locked', 'locked-visible');
                card.style.pointerEvents = 'auto';
                return;
            }

            // User not logged in - apply protection
            if (index >= FREE_PREVIEW_COUNT) {
                // Tutorials after first 6 get visual lock
                card.classList.add('locked');
                addLockOverlay(card);
            } else {
                // First 6 look normal but are still protected
                card.classList.add('locked-visible');
            }
        });
    }

    /**
     * Add lock overlay to tutorial card
     * @param {HTMLElement} card 
     */
    function addLockOverlay(card) {
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-lock-overlay';
        
        overlay.innerHTML = `
            <div class="lock-icon-container">
                <div class="lock-icon-bg"></div>
                <i class="fas fa-lock"></i>
            </div>
            <p class="lock-message">Login to Access</p>
        `;
        
        card.appendChild(overlay);
    }

    /**
     * Setup click handlers for tutorial cards
     */
    function setupTutorialClickHandlers() {
        const tutorialCards = document.querySelectorAll('.tutorial-card');

        tutorialCards.forEach((card) => {
            // Prevent default link clicks
            const links = card.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (!AuthUtils.isUserLoggedIn()) {
                        e.preventDefault();
                        handleLockedTutorialClick();
                    }
                });
            });

            // Card click handler
            card.addEventListener('click', (e) => {
                const isLoggedIn = AuthUtils.isUserLoggedIn();
                
                if (!isLoggedIn && (card.classList.contains('locked') || card.classList.contains('locked-visible'))) {
                    // Only prevent if clicking the card itself, not links (already handled above)
                    if (e.target.tagName !== 'A' && !e.target.closest('a')) {
                        handleLockedTutorialClick();
                    }
                }
            });
        });
    }

    /**
     * Handle clicks on locked tutorials
     */
    function handleLockedTutorialClick() {
        AuthUtils.showLoginModal('Login to access this tutorial and unlock all premium content');
        
        // Add shake animation
        const cards = document.querySelectorAll('.tutorial-card.locked, .tutorial-card.locked-visible');
        cards.forEach(card => {
            card.classList.add('shake');
            setTimeout(() => {
                card.classList.remove('shake');
            }, 500);
        });
    }

    /**
     * Unlock all tutorials (called after successful login)
     */
    function unlockAllTutorials() {
        applyTutorialProtection();
        
        // Show success animation
        const cards = document.querySelectorAll('.tutorial-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('unlock-animation');
                setTimeout(() => {
                    card.classList.remove('unlock-animation');
                }, 600);
            }, index * 50);
        });
        
        AuthUtils.showToast('All tutorials unlocked! 🎉', 'success');
    }

    // Public API
    return {
        init,
        unlockAllTutorials
    };
})();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', TutorialProtection.init);
} else {
    TutorialProtection.init();
}

// Make available globally
window.TutorialProtection = TutorialProtection;
