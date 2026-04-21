import axios from 'axios';
import { normalizePhoneNumber } from '../utils/helpers.js';

const borzo = axios.create({
  baseURL: process.env.BORZO_BASE_URL ||
    "https://robotapitest-in.borzodelivery.com/api/business/1.6",
  headers: {
    "X-DV-Auth-Token": process.env.BORZO_API_KEY,
    "Content-Type": "application/json",
  },
});

export async function borzoQuote(address, items) {
  try {
    const matter = items.map((i) => `${i.qty}x ${i.name}${i.weight ? ` (${i.weight}g)` : ""}`).join(", ");
    const totalWeightGrams = items.reduce((s, i) => s + (Number(i.weight || 0) * Number(i.qty || 0)), 0);
    const total_weight_kg = totalWeightGrams / 1000;

    const payload = {
      type: 'standard',
      matter,
      total_weight_kg,
      vehicle_type_id: 8,
      is_contact_person_notification_enabled: true,
      is_client_notification_enabled: true,
      points: [
        {
          address: process.env.STORE_ADDRESS || 'Makhmali The Fresh Meat Store, Thane',
          contact_person: { phone: process.env.STORE_CONTACT_PHONE || '919867777860', name: process.env.STORE_CONTACT_NAME || 'Shoaib Q' }
        },
        {
          address: `${address.line1 || ''} ${address.area || ''} ${address.city || ''} ${address.pincode || ''}`.trim(),
          contact_person: { phone: normalizePhoneNumber(address.phone), name: address.name },
          note: address.note || null
        }
      ],
      payment_method: 'balance'
    };

    const res = await borzo.post('/calculate-order', payload);

    if (!res.data?.order?.payment_amount) {
      throw new Error('Invalid response from Borzo API');
    }

    const fee = parseFloat(res.data.order.payment_amount);
    return { fee, raw: res.data };

  } catch (err) {
    const error = new Error(`Borzo unavailable: ${err.message}`);
    throw error;
  }
}

export async function borzoCreateOrder(address, items, clientOrderId) {
  const matter = items.map((i) => `${i.qty}x ${i.name}${i.weight ? ` (${i.weight}g)` : ""}`).join(", ");
  const totalWeightGrams = items.reduce((s, i) => s + (Number(i.weight || 0) * Number(i.qty || 0)), 0);
  const total_weight_kg = totalWeightGrams / 1000;

  const payload = {
    type: 'standard',
    matter,
    total_weight_kg,
    vehicle_type_id: 8,
    is_contact_person_notification_enabled: true,
    is_client_notification_enabled: true,
    points: [
      {
        address: process.env.STORE_ADDRESS || 'Makhmali The Fresh Meat Store, Thane',
        contact_person: { phone: process.env.STORE_CONTACT_PHONE || '919867777860', name: process.env.STORE_CONTACT_NAME || 'Shoaib Q' }
      },
      {
        address: `${address.line1 || ''} ${address.area || ''} ${address.city || ''} ${address.pincode || ''}`,
        contact_person: { phone: normalizePhoneNumber(address.phone), name: address.name },
        client_order_id: String(clientOrderId),
        note: address.note || null
      }
    ],
    payment_method: 'balance'
  };

  try {
    const res = await borzo.post('/create-order', payload);
    const orderId = res.data?.order?.order_id ?? res.data?.data?.id ?? res.data?.order_id ?? null;
    const status = res.data?.order?.status ?? res.data?.status ?? 'created';
    const tracking_url = res.data?.order?.points?.[1]?.tracking_url ?? null;
    return { order_id: orderId, status, tracking_url, raw: res.data };
  } catch (err) {
    const body = err?.response?.data ?? err.message ?? err;
    const e = new Error(`Borzo booking error: ${JSON.stringify(body)}`);
    e.raw = err?.response?.data ?? null;
    throw e;
  }
}
