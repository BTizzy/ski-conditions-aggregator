export async function GET() {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`RainViewer API failed: ${response.status}`);
    }

    const data = await response.json();

    // Return in expected format
    return Response.json({
      radar: {
        past: data.radar.past,  // Array of timestamps
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300',  // 5min cache
      },
    });
  } catch (error) {
    console.error('Frames API error:', error);
    return Response.json({ error: 'Failed to fetch frames' }, { status: 500 });
  }
}