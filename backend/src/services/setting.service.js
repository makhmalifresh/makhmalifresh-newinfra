import { query } from '../config/db.js';

export const getStoreStatus = async () => {
    let result = await query("SELECT setting_value FROM store_settings WHERE setting_key = 'is_store_open'");
    if (result.length === 0) {
      await query("INSERT INTO store_settings (setting_key, setting_value) VALUES ('is_store_open', 'true')");
      return 'true';
    }
    return result[0].setting_value;
}

export const setStoreStatus = async (isOpen) => {
    const queryText = `
      UPDATE store_settings
      SET setting_value = $1
      WHERE setting_key = 'is_store_open'
      RETURNING setting_key, setting_value;
    `;
    const result = await query(queryText, [isOpen.toString()]);
    return result[0];
}

export const getSetting = async (key, defaultValue) => {
    const result = await query("SELECT setting_value FROM store_settings WHERE setting_key = $1", [key]);
    if (result.length === 0) {
      return defaultValue;
    }
    return result[0].setting_value;
}

export const setSetting = async (key, value) => {
    const queryText = `
      INSERT INTO store_settings (setting_key, setting_value)
      VALUES ($1, $2)
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value
      RETURNING setting_key, setting_value;
    `;
    const result = await query(queryText, [key, value]);
    return result[0];
}
