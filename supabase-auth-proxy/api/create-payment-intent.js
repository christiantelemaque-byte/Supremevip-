import Stripe from 'stripe';

// Initialize Stripe with your secret key (set in Vercel environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Set CORS headers to allow your frontend domain
  res.setHeader('Access-Control-Allow-Origin', 'https://supremevip.mooo.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency = 'usd', bookingData } = req.body;

  // Validate required fields
  if (!amount || !bookingData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      // Add metadata to track the booking in your Stripe dashboard
      metadata: {
        tourId: bookingData.tourId?.toString() || '',
        userId: bookingData.userId || '',
        guests: bookingData.guests?.toString() || '',
        date: bookingData.date || '',
        // You can also fetch the tour name from your database if you want
        // tourName: tourName,
      },
    });

    // Send the client secret back to the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
