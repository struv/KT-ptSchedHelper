import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Find the data.json blob
    const { blobs } = await list({ prefix: 'data.json' });

    if (blobs.length === 0) {
      // No data yet, return empty arrays
      return res.status(200).json({
        providers: [],
        staff: [],
        offices: []
      });
    }

    // Fetch the blob content
    const response = await fetch(blobs[0].url);
    const data = await response.json();

    return res.status(200).json({
      providers: data.providers || [],
      staff: data.staff || [],
      offices: data.offices || []
    });
  } catch (error) {
    console.error('Error fetching data from Blob:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
