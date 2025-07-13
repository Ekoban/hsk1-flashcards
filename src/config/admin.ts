// Admin configuration - completely secure with no hardcoded emails
export const ADMIN_CONFIG = {
  // Admin email must be set via environment variable
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL
};

export const isAdminEmail = (email: string): boolean => {
  if (!ADMIN_CONFIG.adminEmail) {
    console.error('VITE_ADMIN_EMAIL environment variable is not set');
    return false;
  }
  return email === ADMIN_CONFIG.adminEmail;
};
