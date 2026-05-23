import localforage from 'localforage';
import { AppState } from '../types';

localforage.config({
  name: 'judy_space',
  storeName: 'app_data',
});

const defaultState: AppState = {
  anniversaryDate: null,
  todos: [],
  cycleRecords: {},
  photos: [],
};

const STATE_API_URL = '/api/state';
let cachedState: AppState | null = null;

function normalizeState(state: Partial<AppState> | null | undefined): AppState {
  return {
    ...defaultState,
    ...(state || {}),
    todos: Array.isArray(state?.todos) ? state.todos : defaultState.todos,
    cycleRecords: state?.cycleRecords || defaultState.cycleRecords,
    photos: Array.isArray(state?.photos) ? state.photos : defaultState.photos,
  };
}

function hasUserData(state: AppState): boolean {
  return Boolean(
    state.anniversaryDate ||
      state.todos.length > 0 ||
      Object.keys(state.cycleRecords).length > 0 ||
      state.photos.length > 0
  );
}

async function getLocalState(): Promise<AppState> {
  const state = await localforage.getItem<AppState>('state');
  return normalizeState(state);
}

export const store = {
  async getState(): Promise<AppState> {
    try {
      const response = await fetch(STATE_API_URL, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to load server state');
      const state = normalizeState(await response.json());
      cachedState = state;

      const localState = normalizeState(await localforage.getItem<AppState>('state'));
      if (!localStorage.getItem('judy_server_migrated')) {
        localStorage.setItem('judy_server_migrated', 'true');
        if (!hasUserData(state) && hasUserData(localState)) {
          await this.saveState(localState);
          cachedState = localState;
          return localState;
        }
      }

      await localforage.setItem('state', state);
      return state;
    } catch {
      const localState = await getLocalState();
      cachedState = localState;
      return localState;
    }
  },
  
  async saveState(state: AppState): Promise<void> {
    const normalizedState = normalizeState(state);
    cachedState = normalizedState;
    try {
      const response = await fetch(STATE_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedState),
      });
      if (!response.ok) throw new Error('Failed to save server state');
    } catch {
      // Keep the app usable during local development or temporary network failures.
    }
    await localforage.setItem('state', normalizedState);
  },

  async updateState(updates: Partial<AppState>, baseState?: AppState): Promise<AppState> {
    const currentState = baseState || cachedState || await this.getState();
    const newState = normalizeState({ ...currentState, ...updates });
    await this.saveState(newState);
    return newState;
  }
};
