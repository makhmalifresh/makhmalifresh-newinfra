import { getSetting } from '../services/setting.service.js';
import { borzoQuote } from '../services/borzo.service.js';

export const calculateFee = async (req, res, next) => {
  try {
    const { address, items } = req.body;

    if (!address || !address.line1 || !address.city || !address.pincode) {
      return res.status(400).json({ error: "A complete address is required." });
    }

    const deliveryModeStr = await getSetting('delivery_mode', 'manual');
    const deliveryMode = deliveryModeStr.toLowerCase();

    let deliveryFee = 0;
    let chosenPartner;
    let errorMessages = [];

    switch (deliveryMode) {
      case 'manual':
        try {
          const result = await borzoQuote(address, items);
          deliveryFee = parseFloat(result.fee);
        } catch (err) {
          deliveryFee = 200; // default
          errorMessages.push(`Manual calculation failed: ${err.message}`);
        }
        break;

      case 'borzo_only':
      case 'automatic_cheapest': // Porter removed, so only Borzo exists
        try {
          const result = await borzoQuote(address, items);
          deliveryFee = parseFloat(result.fee);
          chosenPartner = "borzo";
        } catch (err) {
          return res.status(400).json({
            error: "Borzo delivery unavailable for this address",
            details: err.message
          });
        }
        break;

      case 'porter_only':
       return res.status(400).json({ error: "Porter delivery is disabled." });

      default:
        return res.status(400).json({ error: "Invalid delivery mode configuration" });
    }

    if (isNaN(deliveryFee) || deliveryFee < 0) {
      deliveryFee = 0; 
    }

    const response = { delivery_fee: Math.round(deliveryFee), chosen_partner: chosenPartner || 'manual' };

    if (errorMessages.length > 0) {
      response.warnings = errorMessages;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};
