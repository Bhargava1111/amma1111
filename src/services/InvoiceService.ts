// Import jsPDF for PDF generation
import { jsPDF } from 'jspdf';

const INVOICES_TABLE_ID = '10415'; // New table for invoices

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  user_id: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  tax_amount: number;
  subtotal: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customer_info: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export class InvoiceService {
  // Generate a unique invoice number
  private static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  }

  // Create invoice from order
  static async createInvoiceFromOrder(orderData: any, orderItems: any[], customerInfo: any): Promise<Invoice> {
    try {
      const invoiceNumber = this.generateInvoiceNumber();
      const invoiceDate = new Date().toISOString();
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
      
      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
      const taxRate = 0.08; // 8% tax rate
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      // Convert order items to invoice items
      const invoiceItems: InvoiceItem[] = orderItems.map(item => ({
        id: `${invoiceNumber}_${item.product_id}`,
        product_id: item.product_id,
        product_name: item.product_name,
        description: `Premium ${item.product_name}`,
        quantity: item.quantity,
        unit_price: item.product_price,
        total_price: item.product_price * item.quantity
      }));

      const invoice: Invoice = {
        id: `INV_${Date.now()}`,
        invoice_number: invoiceNumber,
        order_id: orderData.id,
        user_id: orderData.user_id,
        invoice_date: invoiceDate,
        due_date: dueDate,
        total_amount: totalAmount,
        tax_amount: taxAmount,
        subtotal: subtotal,
        status: 'sent',
        customer_info: {
          name: customerInfo.name || `Customer ${orderData.user_id}`,
          email: customerInfo.email || `customer${orderData.user_id}@example.com`,
          phone: customerInfo.phone || '',
          address: typeof orderData.shipping_address === 'string' 
            ? JSON.parse(orderData.shipping_address) 
            : orderData.shipping_address
        },
        items: invoiceItems,
        created_at: invoiceDate,
        updated_at: invoiceDate
      };

      // Save invoice to database
      await this.saveInvoice(invoice);

      return invoice;
    } catch (error) {
      console.error('Error creating invoice from order:', error);
      throw error;
    }
  }

  // Save invoice to database
  static async saveInvoice(invoice: Invoice): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await window.ezsite.apis.tableCreate(INVOICES_TABLE_ID, {
        ...invoice,
        customer_info: JSON.stringify(invoice.customer_info),
        items: JSON.stringify(invoice.items)
      });

      if (error) {
        throw new Error(error);
      }

      console.log('Invoice saved successfully:', invoice.invoice_number);
      return { success: true };
    } catch (error) {
      console.error('Error saving invoice:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Generate PDF invoice
  static async generateInvoicePDF(invoice: Invoice): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      try {
        // Use imported jsPDF directly
        this.createPDF(invoice, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create PDF document
  private static createPDF(invoice: Invoice, resolve: (buffer: Uint8Array) => void, reject: (error: Error) => void): void {
    try {
      console.log('Creating PDF for invoice:', invoice.invoice_number);
      
      // Use imported jsPDF directly
      const doc = new jsPDF();
      console.log('PDF document created successfully');

      // Company header
      doc.setFontSize(24);
      doc.setTextColor(37, 99, 235); // Blue color
      doc.text('MANAfoods', 20, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Premium Pickle Specialists', 20, 38);
      doc.text('123 Pickle Street, Flavor City, FC 12345', 20, 45);
      doc.text('Phone: (555) 123-4567 | Email: info@manafoods.com', 20, 52);

      // Invoice title and details
      doc.setFontSize(18);
      doc.text('INVOICE', 150, 30);
      
      doc.setFontSize(10);
      doc.text(`Invoice #: ${invoice.invoice_number}`, 150, 40);
      doc.text(`Order #: ${invoice.order_id}`, 150, 47);
      doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 150, 54);
      doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 150, 61);

      // Customer information
      doc.setFontSize(12);
      doc.text('Bill To:', 20, 75);
      doc.setFontSize(10);
      doc.text(invoice.customer_info.name, 20, 83);
      doc.text(invoice.customer_info.email, 20, 90);
      
      if (invoice.customer_info.address) {
        const address = typeof invoice.customer_info.address === 'string' 
          ? JSON.parse(invoice.customer_info.address) 
          : invoice.customer_info.address;
        doc.text(`${address.street || ''}`, 20, 97);
        doc.text(`${address.city || ''}, ${address.state || ''} ${address.zip || ''}`, 20, 104);
      }

      // Items table header
      const tableStartY = 125;
      doc.setFillColor(37, 99, 235);
      doc.rect(20, tableStartY, 170, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Description', 25, tableStartY + 5);
      doc.text('Qty', 120, tableStartY + 5);
      doc.text('Unit Price', 140, tableStartY + 5);
      doc.text('Total', 170, tableStartY + 5);

      // Items
      doc.setTextColor(0, 0, 0);
      let currentY = tableStartY + 15;
      
      invoice.items.forEach((item, index) => {
        if (currentY > 250) { // New page if needed
          doc.addPage();
          currentY = 30;
        }

        doc.text(item.product_name, 25, currentY);
        doc.text(item.quantity.toString(), 125, currentY);
        doc.text(`$${item.unit_price.toFixed(2)}`, 145, currentY);
        doc.text(`$${item.total_price.toFixed(2)}`, 175, currentY);

        // Add description if available
        if (item.description) {
          currentY += 7;
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(item.description, 25, currentY);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
        }

        currentY += 10;
      });

      // Totals
      currentY += 10;
      doc.line(120, currentY, 190, currentY); // Horizontal line
      
      currentY += 10;
      doc.text('Subtotal:', 140, currentY);
      doc.text(`$${invoice.subtotal.toFixed(2)}`, 175, currentY);
      
      currentY += 8;
      doc.text('Tax (8%):', 140, currentY);
      doc.text(`$${invoice.tax_amount.toFixed(2)}`, 175, currentY);
      
      currentY += 8;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Total:', 140, currentY);
      doc.text(`$${invoice.total_amount.toFixed(2)}`, 175, currentY);

      // Footer
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for your business!', 20, 270);
      doc.text('Payment terms: Net 30 days', 20, 277);
      doc.text('For questions about this invoice, contact: billing@manafoods.com', 20, 284);

      // Convert to Uint8Array
      const pdfBlob = doc.output('blob');
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      };
      reader.onerror = () => reject(new Error('Failed to convert PDF to Uint8Array'));
      reader.readAsArrayBuffer(pdfBlob);

    } catch (error) {
      console.error('PDF generation error:', error);
      reject(error instanceof Error ? error : new Error('PDF generation failed'));
    }
  }

  // Get invoice by ID
  static async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(INVOICES_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'id', op: 'Equal', value: invoiceId }
        ]
      });

      if (error || !data?.List?.[0]) {
        return null;
      }

      const invoiceData = data.List[0];
      return {
        ...invoiceData,
        customer_info: JSON.parse(invoiceData.customer_info),
        items: JSON.parse(invoiceData.items)
      };
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }

  // Get invoices for a user
  static async getUserInvoices(userId: string, params: { pageNo?: number; pageSize?: number } = {}) {
    try {
      const { pageNo = 1, pageSize = 20 } = params;
      
      const { data, error } = await window.ezsite.apis.tablePage(INVOICES_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userId }
        ]
      });

      if (error) {
        throw new Error(error);
      }

      const invoices = (data?.List || []).map((invoice: any) => ({
        ...invoice,
        customer_info: JSON.parse(invoice.customer_info),
        items: JSON.parse(invoice.items)
      }));

      return {
        invoices,
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching user invoices:', error);
      throw error;
    }
  }

  // Get all invoices (admin)
  static async getAllInvoices(params: { pageNo?: number; pageSize?: number; status?: string } = {}) {
    try {
      const { pageNo = 1, pageSize = 20, status } = params;
      
      const filters: any[] = [];
      if (status && status !== 'all') {
        filters.push({
          name: 'status',
          op: 'Equal',
          value: status
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(INVOICES_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: filters
      });

      if (error) {
        throw new Error(error);
      }

      const invoices = (data?.List || []).map((invoice: any) => ({
        ...invoice,
        customer_info: JSON.parse(invoice.customer_info),
        items: JSON.parse(invoice.items)
      }));

      return {
        invoices,
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching all invoices:', error);
      throw error;
    }
  }

  // Update invoice status
  static async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(INVOICES_TABLE_ID, {
        id: invoiceId,
        status: status,
        updated_at: new Date().toISOString()
      });

      if (error) {
        throw new Error(error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Download invoice PDF
  static async downloadInvoicePDF(invoice: Invoice): Promise<void> {
    try {
      const pdfData = await this.generateInvoicePDF(invoice);
      
      // Create blob and download
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      link.click();
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      throw error;
    }
  }
} 