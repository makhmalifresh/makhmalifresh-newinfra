import { query } from '../config/db.js';

export const validateCoupon = async (coupon_code, subtotal) => {
  const couponResult = await query("SELECT * FROM coupons WHERE code = $1 AND is_active = true", [coupon_code.toUpperCase()]);
  const coupon = couponResult[0];
  if (!coupon) return null;

  let discount_amount = 0;
  if (coupon.discount_type === "percentage") discount_amount = Math.round(subtotal * (coupon.discount_value / 100));
  else if (coupon.discount_type === "fixed") discount_amount = coupon.discount_value;

  discount_amount = Math.min(discount_amount, subtotal);
  return { discount_amount, coupon_code: coupon.code };
};

export const getActiveOffers = async () => {
    return await query("SELECT name, description, coupon_code FROM offers WHERE is_active = true ORDER BY created_at DESC");
};

export const getAllOffersAdmin = async () => {
    return await query('SELECT * FROM offers ORDER BY created_at DESC');
}

export const getUnassignedCouponsAdmin = async () => {
    return await query(`
      SELECT code FROM coupons 
      WHERE is_active = true AND code NOT IN (SELECT coupon_code FROM offers)
      ORDER BY code ASC;
    `);
}

export const createOffer = async (name, description, coupon_code) => {
    const q = `INSERT INTO offers (name, description, coupon_code) VALUES ($1, $2, $3) RETURNING *`;
    const result = await query(q, [name, description, coupon_code]);
    return result[0];
}

export const deleteOffer = async (id) => {
    await query('DELETE FROM offers WHERE id = $1', [id]);
}

export const getAllCouponsAdmin = async () => {
    return await query('SELECT * FROM coupons ORDER BY created_at DESC');
}

export const createCoupon = async (code, discount_type, discount_value) => {
    const queryText = `INSERT INTO coupons (code, discount_type, discount_value) VALUES ($1, $2, $3) RETURNING *;`;
    const params = [code.toUpperCase(), discount_type, parseInt(discount_value, 10)];
    const newCoupon = await query(queryText, params);
    return newCoupon[0];
}

export const updateCoupon = async (id, code, discount_type, discount_value, is_active, expires_at) => {
    const queryText = `
      UPDATE coupons
      SET code = $1, discount_type = $2, discount_value = $3, is_active = $4, expires_at = $5
      WHERE id = $6
      RETURNING *;
    `;
    const result = await query(queryText, [code.toUpperCase(), discount_type, discount_value, is_active, expires_at, id]);
    return result[0];
}

export const deleteCoupon = async (id) => {
    const result = await query('DELETE FROM coupons WHERE id = $1 RETURNING *;', [id]);
    return result[0];
}
