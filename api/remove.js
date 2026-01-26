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

  const { type, name } = req.body;

  if (!type || !name) {
    return res.status(400).json({ error: 'Type and name are required' });
  }

  if (!['providers', 'staff', 'offices'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be providers, staff, or offices' });
  }

  try {
    // Get current data
    const data = await getData();

    // Find and remove the entry
    const index = data[type].findIndex(item =>
      item.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({ error: `${name} not found in ${type}` });
    }

    const removed = data[type].splice(index, 1)[0];
    await saveData(data);

    return res.status(200).json({
      success: true,
      message: `Removed ${name} from ${type}`,
      removed
    });
  } catch (error) {
    console.error('Error removing entry:', error);
    return res.status(500).json({ error: 'Failed to remove entry' });
  }
}
