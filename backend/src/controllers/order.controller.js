import * as orderService from '../services/order.service.js';
import { normalizePhoneNumber } from '../utils/helpers.js';

export const getMyOrders = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const orders = await orderService.getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getMyAddresses = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const addresses = await orderService.getUserAddresses(userId);
    res.json(addresses);
  } catch (err) {
    next(err);
  }
};

export const saveAddress = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { customer_name, phone, address_line1, area, city, pincode } = req.body;

    if (!customer_name || !phone || !address_line1 || !city || !pincode) {
      return res.status(400).json({ error: "All address fields are required." });
    }

    const normalized = normalizePhoneNumber(phone);
    const newAddress = await orderService.saveUserAddress(userId, req.body, normalized);
    
    res.status(201).json(newAddress);
  } catch (err) {
    next(err);
  }
};
