import {createPinia} from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export const store = createPinia();
store.use(piniaPluginPersistedstate);

export * from './modules/user-store';
export * from './modules/cache-store';
export * from './modules/system-config';
