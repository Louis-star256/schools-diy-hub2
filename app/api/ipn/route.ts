import { NextResponse } from 'next/server';

/**
 * PesaPal V3 IPN (Instant Payment Notification) Handler.
 * This endpoint confirms the Hub is "Found on the Net" for PesaPal validation.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Log the notification for technical auditing
    console.log("Pesapal IPN notification received:", body);

    // Acknowledge receipt to PesaPal
    return NextResponse.json({
      status: "received",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Pesapal IPN Processing Error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function GET() {
  /**
   * CRITICAL: Required for PesaPal validation bots to confirm the site is "Found on the net".
   * This response tells PesaPal that our server is ready to receive notifications.
   */
  return NextResponse.json({
    message: "IPN endpoint active"
  });
}
