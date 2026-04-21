import * as settingService from '../services/setting.service.js';

export const getStoreStatusPublic = async (req, res, next) => {
  try {
    const status = await settingService.getStoreStatus();
    res.json({ setting_key: "is_store_open", setting_value: status });
  } catch (err) {
    res.status(500).json({ setting_key: "is_store_open", setting_value: "false" });
  }
};

export const getPlatformFeePublic = async (req, res, next) => {
  try {
    const fee = await settingService.getSetting('platform_fee', '0');
    res.json({ setting_key: "platform_fee", setting_value: fee });
  } catch (err) {
    res.status(500).json({ setting_key: "platform_fee", setting_value: "0" });
  }
};

export const getSurgeFeePublic = async (req, res, next) => {
  try {
    const fee = await settingService.getSetting('surge_fee', '0');
    res.json({ setting_key: "surge_fee", setting_value: fee });
  } catch (err) {
    res.status(500).json({ setting_key: "surge_fee", setting_value: "0" });
  }
};

export const getDeliveryModePublic = async (req, res, next) => {
  try {
    const mode = await settingService.getSetting('delivery_mode', 'manual');
    res.json({ setting_key: "delivery_mode", setting_value: mode });
  } catch (err) {
    res.status(500).json({ setting_key: "delivery_mode", setting_value: "manual" });
  }
};

export const updateStoreStatusAdmin = async (req, res, next) => {
  try {
    const { isOpen } = req.body;
    if (typeof isOpen !== 'boolean') return res.status(400).json({ error: 'Field "isOpen" must be a boolean.' });
    
    const result = await settingService.setStoreStatus(isOpen);
    res.json({ message: 'Store status updated successfully.', setting: result });
  } catch (err) {
    next(err);
  }
};

export const updatePlatformFeeAdmin = async (req, res, next) => {
  try {
    const { fee } = req.body;
    const feeValue = parseInt(fee, 10);
    if (isNaN(feeValue) || feeValue < 0) return res.status(400).json({ error: 'Platform fee must be a non-negative number.' });
    
    const result = await settingService.setSetting('platform_fee', feeValue.toString());
    res.json({ message: 'Platform fee updated successfully.', setting: result });
  } catch (err) {
    next(err);
  }
};

export const updateSurgeFeeAdmin = async (req, res, next) => {
  try {
    const { surge } = req.body;
    const surgeValue = parseInt(surge, 10);
    if (isNaN(surgeValue) || surgeValue < 0) return res.status(400).json({ error: 'Surge fee must be a non-negative number.' });
    
    const result = await settingService.setSetting('surge_fee', surgeValue.toString());
    res.json({ message: 'Surge fee updated successfully.', setting: result });
  } catch (err) {
    next(err);
  }
};

export const updateDeliveryModeAdmin = async (req, res, next) => {
  try {
    const { delivery_mode } = req.body;
    const allowed = ['manual', 'borzo_only', 'porter_only', 'automatic_cheapest'];
    if (!delivery_mode || !allowed.includes(delivery_mode)) {
      return res.status(400).json({ error: `delivery_mode required and must be one of: ${allowed.join(', ')}` });
    }
    
    const result = await settingService.setSetting('delivery_mode', delivery_mode);
    res.json({ message: 'Delivery mode updated', setting: result });
  } catch (err) {
    next(err);
  }
};
