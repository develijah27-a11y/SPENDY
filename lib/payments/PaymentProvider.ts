export interface PaymentRequest {
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  categoryId: string;
  payerAccountId: string;
  payerPhone?: string;
  pin?: string;
  reference: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  receiptNumber: string;
  message: string;
  timestamp: string;
  merchantName: string;
  amount: number;
  currency: string;
  categoryName?: string;
  payerAccountName?: string;
}

export interface PaymentProvider {
  name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
}
