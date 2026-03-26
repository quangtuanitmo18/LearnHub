export interface InvoiceData {
  orderCode: string;
  username: string;
  email: string;
  orderType: 'COURSE' | 'MEMBERSHIP';
  membershipPlan?: string;
  items: Array<{
    title: string;
    price: number;
    thumbnail?: string;
  }>;
  subTotal: number;
  totalDiscount: number;
  totalAmount: number;
  paymentMethod: string;
  invoiceDate: Date;
  paidAt: Date;
}
