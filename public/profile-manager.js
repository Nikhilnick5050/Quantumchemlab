// profile-manager.js
const ProfileManager = {
    saveUser: function(userData) {
        try {
            localStorage.setItem("qc_user", JSON.stringify(userData));
            console.log("User saved:", userData.name);
            return true;
        } catch (error) {
            console.error("Error saving user:", error);
            return false;
        }
    },

    getCurrentUser: function() {
        try {
            const userData = localStorage.getItem("qc_user");
            if (!userData) return null;
            
            const user = JSON.parse(userData);
            return user.logged ? user : null;
        } catch (error) {
            console.error("Error getting user:", error);
            return null;
        }
    },

    logout: function() {
        localStorage.removeItem("qc_user");
        console.log("User logged out");
        window.location.href = "login.html";
        return true;
    },

    isLoggedIn: function() {
        return this.getCurrentUser() !== null;
    }
};