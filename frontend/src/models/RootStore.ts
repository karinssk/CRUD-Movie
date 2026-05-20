import { types, Instance } from 'mobx-state-tree';
import AuthStore from './AuthStore';
import MovieStore from './MovieStore';

const RootStore = types.model('RootStore', {
  auth:   types.optional(AuthStore,   { token: null, id: null, username: null, role: null }),
  movies: types.optional(MovieStore,  { movies: [], status: 'idle', error: null }),
});

export type RootStoreType = Instance<typeof RootStore>;

let _store: RootStoreType | null = null;

export function createRootStore(): RootStoreType {
  _store = RootStore.create();
  _store.auth.hydrateFromStorage();
  return _store;
}

export function getRootStore(): RootStoreType {
  if (!_store) throw new Error('RootStore not yet created');
  return _store;
}
