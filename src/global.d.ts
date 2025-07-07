interface RazorpayOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

interface Razorpay {
  new (options: RazorpayOptions): Razorpay;
  open(): void;
  on(eventName: string, callback: (response: any) => void): void;
}

interface Window {
  Razorpay: Razorpay;
  ezsite: any; // Assuming ezsite is globally available
}

