import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { api } from 'boot/axios';

const LS_AUTH_USERNAME = 'auth-username';
const LS_AUTH_PASSWORD = 'auth-password';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: (LocalStorage.getItem(LS_AUTH_USERNAME) as string) || '',
    password: (LocalStorage.getItem(LS_AUTH_PASSWORD) as string) || '',
    loading: false,
    error: null as string | null,
  }),
  getters: {
    loggedIn(state) {
      return state.username.length > 0 && state.password.length > 0;
    },
  },
  actions: {
    logout() {
      console.log('logout');
      this.username = '';
      this.password = '';
      LocalStorage.remove(LS_AUTH_USERNAME);
      LocalStorage.remove(LS_AUTH_PASSWORD);
    },
    async signIn(username: string, password: string) {
      try {
        this.loading = true;
        this.error = null;
        await api.get('/api/v1/catalogs/', {
          auth: {
            username,
            password,
          },
        });
        this.username = username;
        this.password = password;
        LocalStorage.set(LS_AUTH_USERNAME, username);
        LocalStorage.set(LS_AUTH_PASSWORD, password);
      } catch (e) {
        this.error = 'Auth error';
      } finally {
        this.loading = false;
      }
    },
  },
});
