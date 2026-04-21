// src/constants.js
import { Package, Rocket, Upload, Bike, PartyPopper } from "lucide-react";

export const MOCK_PRODUCTS = [
  { id: 1, name: "DEMO PRODUCT [DB IS DOWN]", cut: "Breast", weight: 500, price: 349, img: "https://images.unsplash.com/photo-1627907222043-9c2b5d7f27c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", tags: ["Chicken", "Organic"] },
  { id: 2, name: "DEMO PRODUCT [DB IS DOWN]", cut: "Breast", weight: 500, price: 349, img: "https://images.unsplash.com/photo-1627907222043-9c2b5d7f27c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", tags: ["Mutton", "Organic"] },
  { id: 3, name: "DEMO PRODUCT [DB IS DOWN]", cut: "Breast", weight: 500, price: 349, img: "https://images.unsplash.com/photo-1627907222043-9c2b5d7f27c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", tags: ["Lamb", "Organic"] },
  { id: 4, name: "DEMO PRODUCT [DB IS DOWN]", cut: "Breast", weight: 500, price: 349, img: "https://images.unsplash.com/photo-1627907222043-9c2b5d7f27c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", tags: ["Chicken", "Organic"] },

];

export const TRACKING_STEPS = [
  { key: "CREATED", label: "Order Placed", icon: Package },
  { key: "PICKUP_ASSIGNED", label: "Rider Assigned", icon: Rocket },
  { key: "PICKED_UP", label: "Picked Up", icon: Upload },
  { key: "OUT_FOR_DELIVERY", label: "On its way", icon: Bike },
  { key: "DELIVERED", label: "Delivered", icon: PartyPopper },
];

export const BORZO_TO_UI_STATUS = {
  planned: "CREATED",
  courier_assigned: "PICKUP_ASSIGNED",
  courier_departed: "PICKUP_ASSIGNED",
  courier_at_pickup: "PICKED_UP",
  parcel_picked_up: "PICKED_UP",
  active: "OUT_FOR_DELIVERY",
  courier_arrived: "DELIVERED",
  delivered: "DELIVERED",
};