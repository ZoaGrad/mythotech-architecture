import type { NextApiRequest, NextApiResponse } from 'next';
import { connect, StringCodec } from 'nats';

// In a real app, getSecret would fetch from Vault. Here we simulate it.
async function getSecret(key: string): Promise<string> {
  return process.env[key] || 'nats://localhost:4222';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { subject, payload } = req.body;

  if (!subject || !payload) {
    return res.status(400).json({ message: 'Missing subject or payload' });
  }

  try {
    const natsUrl = await getSecret('NATS_URL');
    const nc = await connect({ servers: natsUrl });

    const sc = StringCodec();
    nc.publish(subject, sc.encode(JSON.stringify(payload)));

    await nc.drain();

    res.status(202).json({ message: 'Task submitted successfully' });
  } catch (error) {
    console.error('Failed to publish task to NATS:', error);
    res.status(500).json({ message: 'Failed to trigger task' });
  }
}
