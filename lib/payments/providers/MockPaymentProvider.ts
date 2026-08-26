import { PaymentProvider, PaymentRequest, PaymentResponse } from '../PaymentProvider';
import { generateReceiptNumber, generateUUID } from '@/lib/utils';

export class MockPaymentProvider implements PaymentProvider {
  name = 'Spendy Test Payment Gateway';

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate real-world network roundtrip (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic mock PIN check (accept any 4-digit PIN or demo default 1234)
    if (request.pin && request.pin.length !== 4) {
      return {
        success: false,
        transactionId: '',
        receiptNumber: '',
        message: 'Invalid Mobile Money / Wallet PIN. PIN must be 4 digits.',
        timestamp: new Date().toISOString(),
        merchantName: request.merchantName,
        amount: request.amount,
        currency: request.currency || 'UGX',
      };
    }

    if (request.amount <= 0) {
      return {
        success: false,
        transactionId: '',
        receiptNumber: '',
        message: 'Payment amount must be greater than 0 UGX.',
        timestamp: new Date().toISOString(),
        merchantName: request.merchantName,
        amount: request.amount,
        currency: request.currency || 'UGX',
      };
    }

    const receiptNumber = generateReceiptNumber();
    const transactionId = generateUUID();

    return {
      success: true,
      transactionId,
      receiptNumber,
      message: `Payment of ${request.currency || 'UGX'} ${request.amount.toLocaleString()} to ${request.merchantName} successful.`,
      timestamp: new Date().toISOString(),
      merchantName: request.merchantName,
      amount: request.amount,
      currency: request.currency || 'UGX',
    };
  }
}

export const defaultPaymentProvider = new MockPaymentProvider();
