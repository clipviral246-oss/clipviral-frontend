import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      referenceUrl,
      brief,
      script,
      logoUrl,
      editorChoice = 'fastest',
      clips = [],
      tokenCost = 10,
      totalDuration = 30,
    } = body;

    // Generate unique order reference ID
    const orderId = `CV-DFY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Forward to backend order queue if backend is reachable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://clipviral-backend-live.onrender.com';
    try {
      await fetch(`${backendUrl}/api/video/done-for-you`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          referenceUrl,
          brief,
          script,
          logoUrl,
          editorChoice,
          clips,
          tokenCost,
          totalDuration,
          createdAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Backend optional queue fallback
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: 'assigned',
      editorAssigned: editorChoice === 'my_editor' ? 'Dedicated Creator Editor' : 'Senior Pro Editor #4',
      tokenCost,
      estimatedDelivery: '12-24 hours',
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error submitting Done-For-You brief:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to submit order' },
      { status: 500 }
    );
  }
}

