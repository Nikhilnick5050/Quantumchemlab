// auth-check.js - NOTIFICATION VERSION
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const userData = localStorage.getItem("qc_user");
        
        if(!userData) {
            window.location.href = "index.html";
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            
            if(!user.logged) {
                window.location.href = "index.html";
                return;
            }
            
            // Show temporary welcome notification (disappears after 3 seconds)
            showWelcomeNotification(user);
            
        } catch(e) {
            window.location.href = "index.html";
        }
    });
    
    function showWelcomeNotification(user) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: 'Segoe UI', sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>👋 Welcome , ${user.name}!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
})();