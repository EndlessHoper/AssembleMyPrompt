import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const modalUrl = new URL('/scrape', process.env.MODAL_API_URL);
    modalUrl.searchParams.set('url', url);

    const response = await fetch(modalUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.MODAL_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying request to Modal:', error);
    return res.status(500).json({ error: 'Failed to fetch from Modal API' });
  }
} 