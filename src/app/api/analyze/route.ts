import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image_url, prompt, language } = body;

    // Using hardcoded URL because MODAL_API_URL on Vercel is pointing to an old deployment
    const finalUrl = 'https://catwebua--vision-mvp-v2-vision-server.modal.run/analyze';

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url, prompt, language }),
      // Increase timeout for server-to-server call
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Modal API error [${response.status}]:`, errorText);
      
      let errorMessage = response.statusText || `Status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.detail || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
