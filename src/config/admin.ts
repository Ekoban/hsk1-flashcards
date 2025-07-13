// Admin configuration
// This file should not be committed to git if it contains sensitive data
export const ADMIN_CONFIG = {
  // Admin email - this should be set via environment variable in production
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || 'robinet.alexandre@gmail.com',
  
  // Fallback admin emails for production (if env var not available)
  fallbackAdminEmails: [
    'robinet.alexandre@gmail.com'
  ]
};

export const isAdminEmail = (email: string): boolean => {
  return email === ADMIN_CONFIG.adminEmail || 
         ADMIN_CONFIG.fallbackAdminEmails.includes(email);
};
