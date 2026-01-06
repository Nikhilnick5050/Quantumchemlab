// profile-manager.js
const ProfileManager = (function() {
  // Private variables
  const STORAGE_KEY = 'quantumchem_user';
  const USERS_KEY = 'quantumchem_users';
  
  // Get profile picture based on name
  function getProfilePicture(name = '') {
    if (!name) name = 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=256`;
  }
  
  // Get current user from localStorage
  function getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEY);
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      
      // Update last login time if it doesn't exist
      if (!user.lastLogin) {
        user.lastLogin = new Date().toISOString();
        saveUser(user);
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  // Save user to localStorage
  function saveUser(user) {
    try {
      // Update last login time
      user.lastLogin = new Date().toISOString();
      
      // Save to current user storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      // Also save to users list if it doesn't exist
      const users = getAllUsers();
      const existingIndex = users.findIndex(u => u.email === user.email);
      
      if (existingIndex !== -1) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  }
  
  // Get all registered users
  function getAllUsers() {
    try {
      const usersStr = localStorage.getItem(USERS_KEY);
      return usersStr ? JSON.parse(usersStr) : [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
  
  // Find user by email
  function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(user => user.email === email);
  }
  
  // Create a new user
  function createUser(userData) {
    try {
      const user = {
        uid: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        provider: userData.provider || 'manual',
        photoURL: userData.photoURL || getProfilePicture(userData.name),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      };
      
      // Save the user
      const saved = saveUser(user);
      
      if (saved) {
        // Set as current user
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }
  
  // Login user
  function login(email, password) {
    try {
      const users = getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        user.isActive = true;
        
        // Save updated user
        saveUser(user);
        
        // Set as current user
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  }
  
  // Login with Google (simulated)
  function loginWithGoogle(googleUserData) {
    try {
      let user = findUserByEmail(googleUserData.email);
      
      if (!user) {
        // Create new user from Google data
        user = {
          uid: 'google_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: googleUserData.name,
          email: googleUserData.email,
          provider: 'google',
          photoURL: googleUserData.photoURL || getProfilePicture(googleUserData.name),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        };
      } else {
        // Update existing user
        user.lastLogin = new Date().toISOString();
        user.isActive = true;
        user.photoURL = googleUserData.photoURL || user.photoURL;
      }
      
      // Save user
      saveUser(user);
      
      // Set as current user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      return null;
    }
  }
  
  // Logout current user
  function logout() {
    try {
      const user = getCurrentUser();
      
      if (user) {
        // Update user as inactive
        user.isActive = false;
        saveUser(user);
      }
      
      // Remove current user from storage
      localStorage.removeItem(STORAGE_KEY);
      
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  }
  
  // Check if user is logged in
  function isLoggedIn() {
    return getCurrentUser() !== null;
  }
  
  // Update user profile
  function updateProfile(updates) {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error('No user is logged in');
      }
      
      // Merge updates with existing user data
      const updatedUser = { ...user, ...updates };
      
      // Save updated user
      saveUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }
  
  // Change user password
  function changePassword(currentPassword, newPassword) {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error('No user is logged in');
      }
      
      // Check if current password matches
      if (user.password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      user.password = newPassword;
      saveUser(user);
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
  
  // Public API
  return {
    getCurrentUser,
    saveUser,
    getAllUsers,
    findUserByEmail,
    createUser,
    login,
    loginWithGoogle,
    logout,
    isLoggedIn,
    updateProfile,
    changePassword,
    getProfilePicture
  };
})();