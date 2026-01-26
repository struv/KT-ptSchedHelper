import { list, put } from '@vercel/blob';

async function getData() {
  const { blobs } = await list({ prefix: 'data.json' });

  if (blobs.length === 0) {
    return { providers: [], staff: [], offices: [] };
  }

  const response = await fetch(blobs[0].url);
  return await response.json();
}

async function saveData(data) {
  await put('data.json', JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json'
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin password
  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = req.headers['x-admin-password'];

  if (!adminPassword || providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { type, name, address, lat, lng } = req.body;

  if (!type || !name) {
    return res.status(400).json({ error: 'Type and name are required' });
  }

  if (!['providers', 'staff', 'offices'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be providers, staff, or offices' });
  }

  // For offices, address is required
  if (type === 'offices' && !address) {
    return res.status(400).json({ error: 'Address is required for offices' });
  }

  // Coordinates must be provided (geocoding happens client-side)
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Coordinates (lat, lng) are required' });
  }

  try {
    // Get current data
    const data = await getData();

    // Check for duplicates
    const exists = data[type].some(item =>
      item.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ error: `${name} already exists in ${type}` });
    }

    // Create new entry with rounded coordinates for privacy (~100m precision)
    const newEntry = {
      name,
      lat: Math.round(lat * 1000) / 1000,
      lng: Math.round(lng * 1000) / 1000
    };

    // Add address for offices
    if (type === 'offices' && address) {
      newEntry.address = address;
    }

    // Add to list and save
    data[type].push(newEntry);
    await saveData(data);

    return res.status(200).json({
      success: true,
      message: `Added ${name} to ${type}`,
      entry: newEntry
    });
  } catch (error) {
    console.error('Error adding entry:', error);
    return res.status(500).json({ error: 'Failed to add entry' });
  }
}
