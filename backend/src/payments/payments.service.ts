import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Mock payment service for demo purposes
  async purchaseProject(projectId: string, userInfo: any) {
    console.log('Mock payment - purchase project:', projectId, userInfo);
    
    const reference = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      data: {
        authorizationUrl: '#',
        accessCode: 'mock_access',
        reference: reference
      },
      message: 'Mock payment initialized successfully'
    };
  }

  async verifyPayment(reference: string) {
    console.log('Mock payment - verify payment:', reference);
    
    return {
      success: true,
      payment_verified: true,
      data: {
        purchase: {
          id: 'mock_purchase_id',
          projectId: 'mock_project_id',
          customerEmail: 'mock@example.com',
          amount: 50,
          currency: 'GHS',
          status: 'COMPLETED'
        },
        accessGranted: true
      },
      message: 'Mock payment verified successfully'
    };
  }

  async getUserPurchases(email: string) {
    console.log('Mock payment - get user purchases:', email);
    
    return {
      success: true,
      data: {
        purchases: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 1,
          hasMore: false
        }
      }
    };
  }

  async checkProjectAccess(projectId: string, email: string) {
    console.log('Mock payment - check project access:', projectId, email);
    
    return {
      hasAccess: true,
      reason: 'Mock access granted'
    };
  }
}
