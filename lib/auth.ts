export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'ru2ya_admin_2024'
};

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}