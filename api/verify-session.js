/**
 * Vercel serverless function: verify a Stripe Checkout session and return whether it was paid.
 * GET /api/verify-session?session_id=cs_xxx
 * Returns: { "paid": true } or { "paid": false }
 */
const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const sessionId = req.query && req.query.session_id;
  if (!sessionId) {
    return res.status(400).json({ paid: false });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    console.warn('STRIPE_SECRET_KEY not set');
    return res.status(200).json({ paid: false });
  }

  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === 'paid';
    return res.status(200).json({ paid });
  } catch (err) {
    console.error('verify-session error', err.message);
    return res.status(200).json({ paid: false });
  }
};
