import { checkPermissions, getCurrentPosition, requestPermissions } from '@tauri-apps/plugin-geolocation';

export interface GeoCoords {
  lat: number;
  lng: number;
}

export async function getGeoLocation(): Promise<GeoCoords | null> {
  let permissions = await checkPermissions();
  if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
    permissions = await requestPermissions(['location']);
  }
  if (permissions.location === 'granted') {
    const pos = await getCurrentPosition();
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  }
  return null;
}
