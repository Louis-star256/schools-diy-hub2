import { NextResponse } from 'next/server';

/**
 * PesaPal V3 Payment API Handler for School's DIY Hub.
 * This node processes real-world transactions for student innovations.
 * It requires PESALPAL_CONSUMER_KEY, PESALPAL_CONSUMER_SECRET, and PESAPAL_IPN_ID.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, projectId, senderId, receiverId, email, firstName, lastName } = body;

    if (!amount || !projectId || !senderId) {
      return NextResponse.json({ error: 'Missing required venture parameters' }, { status: 400 });
    }

    // Pull keys from Vercel environment variables (handling both casings)
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY || process.env.PesaPal_Consumer_Key;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || process.env.PesaPal_Consumer_Secret;
    const ipnId = process.env.PESAPAL_IPN_ID || process.env.PesaPal_IPN_ID;

    // DIAGNOSTIC: Check if IPN ID looks like a URL (which is wrong)
    if (ipnId && ipnId.startsWith('http')) {
        throw new Error('Invalid IPN ID detected. You provided the URL instead of the ID string. Go to PesaPal Dashboard > Account Settings > API Settings and look for the long alphanumeric code next to your URL.');
    }

    if (!ipnId) {
        throw new Error('Missing IPN ID. To fix this: Go to PesaPal Dashboard > Account Settings > API Settings, register your URL, and copy the resulting ID code to your Vercel variables.');
    }

    if (!consumerKey || !consumerSecret) {
        // Fallback for development simulation if keys are missing
        if (process.env.NODE_ENV !== 'production') {
            return NextResponse.json({
            status: 'simulated',
            data: {
                txRef: `SIM-NODE-${Date.now()}`,
                redirectUrl: `https://pay.pesapal.com/v3/checkout?simulated=true&amount=${amount}`
            }
            });
        }
        throw new Error('Fintech Keys missing in Vercel environment variables.');
    }

    // 1. AUTHENTICATE WITH PESAPAL
    const authRes = await fetch('https://pay.pesapal.com/v3/api/Auth/RequestToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      })
    });

    const authData = await authRes.json();
    const token = authData.token;

    if (!token) {
      throw new Error(`Fintech Auth failed: ${authData.error?.message || 'Unknown error. Check your PesaPal Keys.'}`);
    }

    // 2. SUBMIT SECURE ORDER
    const orderId = `HUB-VENTURE-${Date.now()}`;
    const orderPayload = {
      id: orderId,
      currency: currency || 'USD',
      amount: amount,
      description: `Innovation Venture Support: ${projectId}`,
      callback_url: `${new URL(request.url).origin}/projects/${projectId}`,
      notification_id: ipnId, 
      billing_address: {
        email_address: email || "innovator@schoolsdiyhub.com",
        first_name: firstName || "Innovation",
        last_name: lastName || "Partner"
      }
    };

    const orderRes = await fetch('https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await orderRes.json();

    if (!orderData.redirect_url) {
        const pError = orderData.error?.message || 'No redirect URL returned.';
        throw new Error(`SubmitOrder failed: ${pError}. Ensure PESAPAL_IPN_ID is the ID string from the PesaPal dashboard, NOT the URL.`);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Venture Node Initialized',
      data: {
        txRef: orderData.order_tracking_id || orderId,
        redirectUrl: orderData.redirect_url
      }
    });

  } catch (error: any) {
    console.error('[FINTECH NODE ERROR]', error);
    return NextResponse.json({ error: 'Fintech transaction failed: ' + error.message }, { status: 500 });
  }
}
