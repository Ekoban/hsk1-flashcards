// Admin configuration - completely secure with no hardcoded emails
export const ADMIN_CONFIG = {
  // Admin email must be set via environment variable
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL
};

// Debug logging (remove in production)
console.log('=== ENVIRONMENT DEBUG ===');
console.log('Current domain:', window.location.hostname);
console.log('Environment check:', {
  VITE_ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL,
  allEnvKeys: Object.keys(import.meta.env),
  allEnvValues: import.meta.env
});
console.log('========================');

export const isAdminEmail = (email: string): boolean => {
  console.log('🔍 isAdminEmail called with:', { 
    email, 
    configEmail: ADMIN_CONFIG.adminEmail,
    envVar: import.meta.env.VITE_ADMIN_EMAIL,
    isProduction: window.location.hostname !== 'localhost'
  });
  
  if (!ADMIN_CONFIG.adminEmail) {
    console.error('❌ VITE_ADMIN_EMAIL environment variable is not set');
    console.log('Available env vars:', Object.keys(import.meta.env));
    return false;
  }
  
  const result = email === ADMIN_CONFIG.adminEmail;
  console.log('✅ Admin email check result:', { provided: email, expected: ADMIN_CONFIG.adminEmail, match: result });
  return result;
};
