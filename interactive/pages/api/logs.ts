import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../packages/db/src/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const logs = await prisma.governanceLog.findMany({
      take: limitNum,
      skip: skip,
      orderBy: {
        timestamp: 'desc',
      },
    });

    const totalLogs = await prisma.governanceLog.count();

    res.status(200).json({
      logs,
      pagination: {
        total: totalLogs,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalLogs / limitNum),
      },
    });
  } catch (error) {
    console.error('Failed to fetch governance logs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
