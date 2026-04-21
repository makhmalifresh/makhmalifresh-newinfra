import * as productService from '../services/product.service.js';
import * as couponService from '../services/coupon.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAvailableProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getActiveOffers = async (req, res, next) => {
  try {
    const offers = await couponService.getActiveOffers();
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { coupon_code, subtotal } = req.body;
    if (!coupon_code || typeof subtotal !== "number") {
      return res.status(400).json({ error: "Coupon code and subtotal are required." });
    }

    const result = await couponService.validateCoupon(coupon_code, subtotal);
    if (!result) return res.status(404).json({ error: "Invalid or expired coupon code." });

    res.json({ message: "Coupon applied successfully!", ...result });
  } catch (err) {
    next(err);
  }
};
