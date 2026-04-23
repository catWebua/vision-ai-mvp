import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image_url, prompt, language } = body;

    const modalApiUrl = process.env.MODAL_API_URL || 'https://catwebua--vision-mvp-v2-vision-server.modal.run/analyze';
    const finalUrl = modalApiUrl.endsWith('/analyze') ? modalApiUrl : `${modalApiUrl}/analyze`;

    console.error(`MODAL_URL_P1:${finalUrl.substring(0, 40)}`);
    console.error(`MODAL_URL_P2:${finalUrl.substring(40)}`);
    console.log(`Proxying request to Modal: ${finalUrl}`);

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
