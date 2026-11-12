import { createContext, useContext, useState } from 'react';
import { SEEDED_USERS } from '../data/users.js';

const AuthContext = createContext(null);

const SESSION_KEY = 'perfumezone_user';
const USERS_KEY = 'perfumezone_users_store';

const sanitizeUser = (u) => {
  if (!u) return null;
  const { password, ...safe } = u;
  return safe;
};

function loadUsersStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(USERS_KEY));
    if (Array.isArray(raw) && raw.length > 0) {
      // Ensure all seeded users remain available if missing by email
      const seen = new Set(raw.map((u) => (u.email || '').toLowerCase()));
      const merged = [...raw];
      for (const s of SEEDED_USERS) {
        if (!seen.has(s.email.toLowerCase())) merged.push(s);
      }
      return merged;
    }
  } catch {}
  return [...SEEDED_USERS];
}

function persistUsersStore(list) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  } catch {}
}

export function AuthProvider({ children }) {
  const [usersStore, setUsersStore] = useState(loadUsersStore);
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (saved && saved.email) {
        return saved;
      }
    } catch {}
    return null;
  });

  const persistSession = (safeUser) => {
    setUser(safeUser);
    try {
      if (safeUser) localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  const login = (emailInput, passwordInput) => {
    const cleanEmail = String(emailInput || '').trim().toLowerCase();
    const pass = String(passwordInput || '');

    if (!cleanEmail || !pass) {
      return { ok: false, error: 'Please enter both your email address and password.' };
    }

    const latestUsers = loadUsersStore();
    const found = latestUsers.find(
      (u) => (u.email || '').trim().toLowerCase() === cleanEmail && u.password === pass
    );

    if (!found) {
      return { ok: false, error: 'Invalid email address or password. Please check your credentials.' };
    }

    const safe = sanitizeUser(found);
    persistSession(safe);
    return { ok: true, user: safe };
  };

  const register = ({
    name,
    email,
    password,
    phone = '',
    address = '',
    apartment = '',
    city = '',
    postcode = '',
    country = 'United Kingdom'
  }) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    const pass = String(password || '');

    if (!cleanName) return { ok: false, error: 'Full name is required.' };
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return { ok: false, error: 'Please enter a valid email address.' };
    if (pass.length < 6) return { ok: false, error: 'Password must be at least 6 characters long.' };

    const latestUsers = loadUsersStore();
    if (latestUsers.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'An account with this email already exists. Please sign in instead.' };
    }

    const newUser = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: pass,
      role: 'customer',
      phone: phone.trim(),
      address: address.trim(),
      apartment: apartment.trim(),
      city: city.trim(),
      postcode: postcode.trim(),
      country: country || 'United Kingdom',
      joinedDate: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    };

    const next = [...latestUsers, newUser];
    setUsersStore(next);
    persistUsersStore(next);

    const safe = sanitizeUser(newUser);
    persistSession(safe);
    return { ok: true, user: safe };
  };

  const updateProfile = (updates) => {
    if (!user) return { ok: false, error: 'Not signed in' };
    const cleanEmail = user.email.toLowerCase();

    const latestUsers = loadUsersStore();
    const idx = latestUsers.findIndex((u) => (u.email || '').toLowerCase() === cleanEmail);
    let updatedSafe = { ...user, ...updates };

    if (idx >= 0) {
      const merged = {
        ...latestUsers[idx],
        ...updates,
        email: latestUsers[idx].email, // keep primary identifier stable
        role: latestUsers[idx].role // prevent self role escalation
      };
      latestUsers[idx] = merged;
      setUsersStore(latestUsers);
      persistUsersStore(latestUsers);
      updatedSafe = sanitizeUser(merged);
    }

    persistSession(updatedSafe);
    return { ok: true, user: updatedSafe };
  };

  const logout = () => {
    persistSession(null);
  };

  // Admin account CRUD helpers
  const saveUserAdmin = (payload) => {
    const cleanEmail = String(payload.email || '').trim().toLowerCase();
    if (!cleanEmail) return { ok: false, error: 'Email is required.' };

    const latestUsers = loadUsersStore();
    const idx = latestUsers.findIndex((u) => (u.email || '').toLowerCase() === cleanEmail);

    if (idx >= 0) {
      latestUsers[idx] = {
        ...latestUsers[idx],
        ...payload,
        email: cleanEmail,
        password: payload.password ? payload.password : latestUsers[idx].password
      };
    } else {
      latestUsers.push({
        id: Date.now(),
        name: payload.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: payload.password || 'Customer@123',
        role: payload.role === 'admin' ? 'admin' : 'customer',
        phone: payload.phone || '',
        address: payload.address || '',
        apartment: payload.apartment || '',
        city: payload.city || '',
        postcode: payload.postcode || '',
        country: payload.country || 'United Kingdom',
        joinedDate: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      });
    }

    setUsersStore(latestUsers);
    persistUsersStore(latestUsers);

    // Sync active session if editing current signed-in user
    if (user && user.email.toLowerCase() === cleanEmail) {
      persistSession(sanitizeUser(latestUsers.find((u) => u.email.toLowerCase() === cleanEmail)));
    }
    return { ok: true };
  };

  const deleteUserAdmin = (emailToDelete) => {
    const cleanEmail = String(emailToDelete || '').trim().toLowerCase();
    if (user && user.email.toLowerCase() === cleanEmail) {
      return { ok: false, error: 'You cannot delete your own active admin account.' };
    }
    const next = loadUsersStore().filter((u) => (u.email || '').toLowerCase() !== cleanEmail);
    setUsersStore(next);
    persistUsersStore(next);
    return { ok: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
        login,
        register,
        updateProfile,
        logout,
        allUsers: usersStore.map(sanitizeUser),
        saveUserAdmin,
        deleteUserAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

