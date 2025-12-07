const Stripe = require('stripe');
const { Property } = require('../models');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
});

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const propertyId = session.metadata?.propertyId;
    const transactionType = session.metadata?.transactionType;
    if (propertyId && transactionType) {
      try {
        const property = await Property.findById(propertyId);
        if (property) {
          property.status = transactionType === 'vente' ? 'vendu' : 'loue';
          await property.save();

          // Notify all admins if property status changed to 'loué' or 'vendu' (user action)
          try {
            const Notification = require('../models/Notification');
            const User = require('../models/User');
            const admins = await User.find({ role: 'admin', isActive: true });
            if (admins.length > 0) {
              const adminNotifications = admins.map(admin => ({
                user: admin._id,
                property: property._id,
                type: 'property_update',
                message: `Le bien "${property.title}" a été ${property.status}.`,
              }));
              await Notification.insertMany(adminNotifications);
            }
          } catch (notifErr) {
            console.error('[ERROR][Webhook] Failed to insert admin notifications:', notifErr);
          }
        }
      } catch (e) {
        // Log error but always return 200 to Stripe
      }
    }
  }
  res.status(200).json({ received: true });
};
