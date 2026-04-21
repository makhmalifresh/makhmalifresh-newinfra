import { query } from '../config/db.js';

export const getAvailableProducts = async () => {
  return await query("SELECT * FROM products WHERE is_available = true ORDER BY id ASC");
};

export const getAllProductsAdmin = async () => {
  return await query('SELECT * FROM products ORDER BY id DESC');
};

export const createProduct = async (productData) => {
  const { name, cut, img, tags, variants } = productData;
  const mainPrice = variants[0].price;
  const mainWeight = variants[0].weight;

  const sql = `
    INSERT INTO products (name, cut, weight, price, img, tags, variants) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *;
  `;
  const params = [name, cut, parseInt(mainWeight) || 0, mainPrice, img, tags, JSON.stringify(variants)];

  const newProduct = await query(sql, params);
  return newProduct[0];
};

export const updateProduct = async (id, productData) => {
  const { name, cut, img, tags, variants } = productData;
  const mainPrice = variants[0].price;
  const mainWeight = variants[0].weight;

  const sql = `
    UPDATE products
    SET name = $1, cut = $2, weight = $3, price = $4, img = $5, tags = $6, variants = $7
    WHERE id = $8
    RETURNING *;
  `;
  const params = [name, cut, parseInt(mainWeight) || 0, mainPrice, img, tags, JSON.stringify(variants), id];

  const result = await query(sql, params);
  return result[0];
};

export const toggleProductAvailability = async (id, is_available) => {
  const queryText = `UPDATE products SET is_available = $1 WHERE id = $2 RETURNING id, name, is_available;`;
  const updatedProduct = await query(queryText, [is_available, id]);
  return updatedProduct[0];
};
