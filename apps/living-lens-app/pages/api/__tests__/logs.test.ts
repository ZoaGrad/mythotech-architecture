import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../logs';
import prisma from '../../../packages/db/src/client';

// Mock the prisma client
jest.mock('../../../packages/db/src/client', () => ({
  __esModule: true,
  default: {
    governanceLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('GET /api/logs', () => {
  let mockRequest: Partial<NextApiRequest>;
  let mockResponse: Partial<NextApiResponse>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let endMock: jest.Mock;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock response methods
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnThis();
    endMock = jest.fn().mockReturnThis();
    setHeaderMock = jest.fn().mockReturnThis();

    mockResponse = {
      status: statusMock,
      json: jsonMock,
      end: endMock,
      setHeader: setHeaderMock,
    };

    mockRequest = {
      method: 'GET',
      query: {},
    };
  });

  describe('Happy Path - Successful Requests', () => {
    it('should return logs with default pagination (page=1, limit=10)', async () => {
      const mockLogs = [
        { id: 1, action: 'CREATE', timestamp: new Date('2025-01-01') },
        { id: 2, action: 'UPDATE', timestamp: new Date('2025-01-02') },
      ];
      const mockTotalLogs = 25;

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(mockTotalLogs);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(prisma.governanceLog.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: {
          timestamp: 'desc',
        },
      });
      expect(prisma.governanceLog.count).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        logs: mockLogs,
        pagination: {
          total: mockTotalLogs,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      });
    });

    it('should return logs with custom pagination parameters', async () => {
      mockRequest.query = { page: '2', limit: '20' };
      const mockLogs = [
        { id: 21, action: 'DELETE', timestamp: new Date('2025-01-21') },
      ];
      const mockTotalLogs = 50;

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(mockTotalLogs);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(prisma.governanceLog.findMany).toHaveBeenCalledWith({
        take: 20,
        skip: 20,
        orderBy: {
          timestamp: 'desc',
        },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        logs: mockLogs,
        pagination: {
          total: mockTotalLogs,
          page: 2,
          limit: 20,
          totalPages: 3,
        },
      });
    });

    it('should return empty logs array when no logs exist', async () => {
      const mockLogs: never[] = [];
      const mockTotalLogs = 0;

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(mockTotalLogs);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        logs: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it('should handle page 1 correctly (skip should be 0)', async () => {
      mockRequest.query = { page: '1', limit: '5' };
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(10);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(prisma.governanceLog.findMany).toHaveBeenCalledWith({
        take: 5,
        skip: 0,
        orderBy: {
          timestamp: 'desc',
        },
      });
    });

    it('should handle large page numbers correctly', async () => {
      mockRequest.query = { page: '100', limit: '10' };
      const mockLogs: never[] = [];

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(50);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(prisma.governanceLog.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 990,
        orderBy: {
          timestamp: 'desc',
        },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('Edge Cases - Pagination Calculations', () => {
    it('should calculate totalPages correctly when total is exactly divisible by limit', async () => {
      mockRequest.query = { page: '1', limit: '10' };
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];
      const mockTotalLogs = 100;

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(mockTotalLogs);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            totalPages: 10,
          }),
        })
      );
    });

    it('should calculate totalPages correctly when total is not divisible by limit', async () => {
      mockRequest.query = { page: '1', limit: '10' };
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];
      const mockTotalLogs = 95;

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(mockTotalLogs);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            totalPages: 10,
          }),
        })
      );
    });

    it('should handle limit of 1', async () => {
      mockRequest.query = { page: '1', limit: '1' };
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];
      const mockTotalLogs = 5;

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(mockTotalLogs);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(prisma.governanceLog.findMany).toHaveBeenCalledWith({
        take: 1,
        skip: 0,
        orderBy: {
          timestamp: 'desc',
        },
      });
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            totalPages: 5,
          }),
        })
      );
    });

    it('should handle very large limit values', async () => {
      mockRequest.query = { page: '1', limit: '1000' };
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];
      const mockTotalLogs = 50;

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(mockTotalLogs);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(prisma.governanceLog.findMany).toHaveBeenCalledWith({
        take: 1000,
        skip: 0,
        orderBy: {
          timestamp: 'desc',
        },
      });
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            totalPages: 1,
          }),
        })
      );
    });
  });

  describe('Error Cases - HTTP Method Validation', () => {
    it('should return 405 for POST method', async () => {
      mockRequest.method = 'POST';

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(setHeaderMock).toHaveBeenCalledWith('Allow', ['GET']);
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(endMock).toHaveBeenCalledWith('Method POST Not Allowed');
      expect(prisma.governanceLog.findMany).not.toHaveBeenCalled();
    });

    it('should return 405 for PUT method', async () => {
      mockRequest.method = 'PUT';

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(setHeaderMock).toHaveBeenCalledWith('Allow', ['GET']);
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(endMock).toHaveBeenCalledWith('Method PUT Not Allowed');
    });

    it('should return 405 for DELETE method', async () => {
      mockRequest.method = 'DELETE';

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(setHeaderMock).toHaveBeenCalledWith('Allow', ['GET']);
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(endMock).toHaveBeenCalledWith('Method DELETE Not Allowed');
    });

    it('should return 405 for PATCH method', async () => {
      mockRequest.method = 'PATCH';

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(setHeaderMock).toHaveBeenCalledWith('Allow', ['GET']);
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(endMock).toHaveBeenCalledWith('Method PATCH Not Allowed');
    });
  });

  describe('Error Cases - Database Errors', () => {
    it('should return 500 when prisma.governanceLog.findMany throws an error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Database connection failed');

      (prisma.governanceLog.findMany as jest.Mock).mockRejectedValue(mockError);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch governance logs:', mockError);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });

      consoleErrorSpy.mockRestore();
    });

    it('should return 500 when prisma.governanceLog.count throws an error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Count query failed');
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockRejectedValue(mockError);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch governance logs:', mockError);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Corner Cases - Invalid Input Handling', () => {
    it('should handle NaN page parameter (defaults to 1)', async () => {
      mockRequest.query = { page: 'invalid', limit: '10' };
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(10);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            page: NaN,
          }),
        })
      );
    });

    it('should handle negative page numbers', async () => {
      mockRequest.query = { page: '-1', limit: '10' };
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(10);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(prisma.governanceLog.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: -20,
        orderBy: {
          timestamp: 'desc',
        },
      });
    });

    it('should handle zero page number', async () => {
      mockRequest.query = { page: '0', limit: '10' };
      const mockLogs = [{ id: 1, action: 'CREATE', timestamp: new Date() }];

      (prisma.governanceLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.governanceLog.count as jest.Mock).mockResolvedValue(10);

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(prisma.governanceLog.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: -10,
        orderBy: {
          timestamp: 'desc',
        },
      });
    });
  });
});
