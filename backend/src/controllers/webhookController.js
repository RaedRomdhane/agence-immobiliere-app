const Stripe = require('stripe');
const { Property } = require('../models');

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

exports.handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    console.error('[WEBHOOK ERROR] Stripe not configured');
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  console.log('[WEBHOOK] Received webhook event');
  console.log('[WEBHOOK] Signature present:', !!sig);
  console.log('[WEBHOOK] Secret configured:', !!endpointSecret);
  
  let event;
  
  // En développement avec Stripe CLI, on peut skip la vérification de signature
  if (process.env.NODE_ENV === 'development') {
    console.log('[WEBHOOK] Development mode - parsing body directly');
    try {
      event = JSON.parse(req.body.toString());
      console.log('[WEBHOOK] ✓ Event parsed:', event.type);
    } catch (err) {
      console.error('[WEBHOOK ERROR] Failed to parse body:', err.message);
      return res.status(400).send('Invalid JSON body');
    }
  } else {
    // En production, on vérifie la signature
    if (!endpointSecret) {
      console.error('[WEBHOOK ERROR] STRIPE_WEBHOOK_SECRET not configured in .env');
      return res.status(400).send('Webhook secret not configured');
    }
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log('[WEBHOOK] ✓ Event verified:', event.type);
    } catch (err) {
      console.error('[WEBHOOK ERROR] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
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
