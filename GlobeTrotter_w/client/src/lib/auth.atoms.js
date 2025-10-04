import { atom } from 'jotai';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_KEY = 'accessToken';
const USER_COOKIE_KEY = 'authUser';

const cookieOptions = {
  expires: 7, // 7 days
  secure: import.meta.env.PROD, // Only over HTTPS in production
  sameSite: 'strict', // CSRF protection
};

const readStoredToken = () => Cookies.get(TOKEN_COOKIE_KEY) || '';
const readStoredUser = () => {
  const raw = Cookies.get(USER_COOKIE_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const accessTokenAtom = atom(readStoredToken());
export const authUserAtom = atom(readStoredUser());

export const setAuthStateAtom = atom(null, (get, set, { token, user }) => {
  if (token) {
    Cookies.set(TOKEN_COOKIE_KEY, token, cookieOptions);
    set(accessTokenAtom, token);
  }
  if (user) {
    Cookies.set(USER_COOKIE_KEY, JSON.stringify(user), cookieOptions);
    set(authUserAtom, user);
  }
});

export const clearAuthStateAtom = atom(null, (get, set) => {
  Cookies.remove(TOKEN_COOKIE_KEY);
  Cookies.remove(USER_COOKIE_KEY);
  set(accessTokenAtom, '');
  set(authUserAtom, null);
});
