export const ADMIN_EMAIL = 'admin2026@gmail.com';

export function isAdminUser(user) {
  return Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}
