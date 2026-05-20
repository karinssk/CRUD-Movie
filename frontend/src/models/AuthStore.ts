import { types, flow } from 'mobx-state-tree';
import client from '../api/client';
import { User, Role } from '../types';

const AuthStore = types
  .model('AuthStore', {
    token:    types.maybeNull(types.string),
    id:       types.maybeNull(types.number),
    username: types.maybeNull(types.string),
    role:     types.maybeNull(types.enumeration<Role>('Role', ['MANAGER', 'TEAMLEADER', 'FLOORSTAFF'])),
  })
  .views((self) => ({
    get isAuthenticated() {
      return self.token !== null;
    },
    get isManager() {
      return self.role === 'MANAGER';
    },
    get currentUser(): User | null {
      if (!self.id || !self.username || !self.role) return null;
      return { id: self.id, username: self.username, role: self.role };
    },
  }))
  .actions((self) => ({
    login: flow(function* (username: string, password: string) {
      console.log('[AuthStore] POST /auth/login →', { username });
      const res = yield client.post<{ token: string; user: User }>('/auth/login', {
        username,
        password,
      });
      console.log('[AuthStore] response status:', res.status, 'user:', res.data?.user);
      const { token, user } = res.data;
      self.token    = token;
      self.id       = user.id;
      self.username = user.username;
      self.role     = user.role;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }),

    logout() {
      self.token    = null;
      self.id       = null;
      self.username = null;
      self.role     = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    hydrateFromStorage() {
      const token = localStorage.getItem('token');
      const raw   = localStorage.getItem('user');
      if (token && raw) {
        const user: User = JSON.parse(raw);
        self.token    = token;
        self.id       = user.id;
        self.username = user.username;
        self.role     = user.role;
      }
    },
  }));

export type AuthStoreType = typeof AuthStore.Type;
export default AuthStore;
