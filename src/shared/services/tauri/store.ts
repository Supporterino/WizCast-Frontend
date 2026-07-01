import { LazyStore } from '@tauri-apps/plugin-store';
import type { StoredGame } from '@/types/game.ts';

let store: LazyStore | null = null;

function getStore(): LazyStore {
  if (!store) {
    store = new LazyStore('games.json', { defaults: {}, createNew: false, autoSave: false });
  }
  return store;
}

export async function loadGames(): Promise<Array<StoredGame>> {
  try {
    const stored = await getStore().get<{ value: Array<StoredGame> }>('completedGames');
    if (stored && Array.isArray(stored.value)) {
      return stored.value;
    }
  } catch (e) {
    console.error('TauriStoreService: failed to load store', e);
  }
  return [];
}

export async function saveGames(games: Array<StoredGame>): Promise<void> {
  try {
    await getStore().set('completedGames', { value: games });
    await getStore().save();
  } catch (e) {
    console.error('TauriStoreService: failed to save store', e);
  }
}
