import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

const BLUR_PLATE_URL = process.env.BLUR_PLATE_URL;

// Colocated with this function so Vercel's build tracing includes it in the deployment bundle.
const logoBuffer = readFileSync(join(__dirname, 'plate-hide-logo.png'));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.BLUR_PLATE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ message: 'Plate hiding is not configured on the server' });
    return;
  }

  const { imageUrl } = req.body || {};
  if (!imageUrl || typeof imageUrl !== 'string') {
    res.status(400).json({ message: 'imageUrl is required' });
    return;
  }

  try {
    const sourceRes = await fetch(imageUrl);
    if (!sourceRes.ok) {
      res.status(502).json({ message: 'Failed to fetch source image' });
      return;
    }
    const sourceBuffer = Buffer.from(await sourceRes.arrayBuffer());

    const formData = new FormData();
    formData.append('image', new Blob([sourceBuffer]), 'car-image.jpg');
    formData.append('logo', new Blob([logoBuffer]), 'plate-hide-logo.png');

    const blurRes = await fetch(BLUR_PLATE_URL, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
      body: formData,
    });

    if (!blurRes.ok) {
      const detail = await blurRes.text().catch(() => '');
      res.status(502).json({ message: 'Blur-plate API request failed', detail });
      return;
    }

    const resultBuffer = Buffer.from(await blurRes.arrayBuffer());
    res.setHeader('Content-Type', blurRes.headers.get('content-type') || 'image/jpeg');
    res.status(200).send(resultBuffer);
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to hide plate' });
  }
}
