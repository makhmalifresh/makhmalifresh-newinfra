import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import * as orderService from '../services/order.service.js';
import * as productService from '../services/product.service.js';
import * as couponService from '../services/coupon.service.js';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-default-super-secret-key';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    const result = await query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const admin = result[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ adminId: admin.id, isAdmin: true }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrdersAdmin();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getPendingOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getPendingOrdersAdmin();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const manualBookOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { partner_name, tracking_url } = req.body;

    if (!partner_name) {
      return res.status(400).json({ error: 'Partner name is required' });
    }

    await orderService.manualBookOrder(orderId, partner_name, tracking_url);
    res.json({ message: 'Order manually resolved and updated.' });
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProductsAdmin();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const result = await productService.createProduct(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const result = await productService.updateProduct(req.params.id, req.body);
    res.json({ message: 'Product updated successfully.', product: result });
  } catch (err) {
    next(err);
  }
};

export const toggleProductAvailability = async (req, res, next) => {
  try {
    const { is_available } = req.body;
    if (typeof is_available !== 'boolean') return res.status(400).json({ error: 'Field "is_available" must be a boolean.' });
    
    const result = await productService.toggleProductAvailability(req.params.id, is_available);
    res.json({ message: 'Product availability updated successfully.', product: result });
  } catch (err) {
    next(err);
  }
};

export const getOffers = async (req, res, next) => {
  try {
    const offers = await couponService.getAllOffersAdmin();
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

export const createOffer = async (req, res, next) => {
  try {
    const { name, description, coupon_code } = req.body;
    if (!name || !description || !coupon_code) return res.status(400).json({ error: 'All fields are required.' });
    
    const result = await couponService.createOffer(name, description, coupon_code);
    res.status(201).json(result);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'This coupon is already used in another offer.' });
    next(err);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    await couponService.deleteOffer(req.params.id);
    res.status(200).json({ message: 'Offer deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getAllCouponsAdmin();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
};

export const getUnassignedCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getUnassignedCouponsAdmin();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const { code, discount_type, discount_value } = req.body;
    if (!code || !discount_type || !discount_value) return res.status(400).json({ error: 'All fields are required.' });
    
    const result = await couponService.createCoupon(code, discount_type, discount_value);
    res.status(201).json(result);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A coupon with this code already exists.' });
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { code, discount_type, discount_value, is_active, expires_at } = req.body;
    const result = await couponService.updateCoupon(req.params.id, code, discount_type, discount_value, is_active, expires_at);
    if (!result) return res.status(404).json({ error: 'Coupon not found.' });
    res.json(result);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Another coupon with this code already exists.' });
    next(err);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const result = await couponService.deleteCoupon(req.params.id);
    if (!result) return res.status(404).json({ error: 'Coupon not found.' });
    res.status(200).json({ message: 'Coupon deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
