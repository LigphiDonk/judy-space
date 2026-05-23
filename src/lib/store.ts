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

export const store = {
  async getState(): Promise<AppState> {
    const state = await localforage.getItem<AppState>('state');
    return state || defaultState;
  },
  
  async saveState(state: AppState): Promise<void> {
    await localforage.setItem('state', state);
  },

  async updateState(updates: Partial<AppState>): Promise<AppState> {
    const currentState = await this.getState();
    const newState = { ...currentState, ...updates };
    await this.saveState(newState);
    return newState;
  }
};
