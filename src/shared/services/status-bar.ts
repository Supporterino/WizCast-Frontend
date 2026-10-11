export type StatusBarScheme = 'auto' | 'light' | 'dark';

export async function setStatusBarStyle(scheme: StatusBarScheme): Promise<void> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_status_bar_style', { scheme });
  } catch {
    // inert outside Tauri or on non-iOS platforms
  }
}
