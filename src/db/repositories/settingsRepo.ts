import { db, type DeviceSettings } from '@/db/schema';

const DEVICE_SETTINGS_ID = 'device';

type DeviceSettingsPayload = Omit<DeviceSettings, 'id'>;

async function get() {
  return db.device_settings.get(DEVICE_SETTINGS_ID);
}

async function save(settings: DeviceSettingsPayload) {
  const payload: DeviceSettings = {
    id: DEVICE_SETTINGS_ID,
    ...settings,
  };

  await db.device_settings.put(payload);
}

async function clear() {
  await db.device_settings.delete(DEVICE_SETTINGS_ID);
}

export const settingsRepo = {
  get,
  save,
  clear,
};
