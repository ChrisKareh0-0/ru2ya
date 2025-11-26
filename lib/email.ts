import nodemailer from 'nodemailer';
import { Order } from './orders';

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Ruya.vision@hotmail.com';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export async function sendOrderNotification(order: Order): Promise<boolean> {
    try {
        // Format order items for email
        const itemsList = order.items
            .map(
                (item) =>
                    `- ${item.productName} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
            )
            .join('\n');

        const mailOptions = {
            from: EMAIL_FROM,
            to: ADMIN_EMAIL,
            subject: `New Order Received - Order #${order.id}`,
            text: `
New Order Notification
======================

Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}

Customer Information:
- Name: ${order.customerName}
- Email: ${order.customerEmail}
- Phone: ${order.customerPhone}
${order.customerAddress ? `- Address: ${order.customerAddress}` : ''}

Order Items:
${itemsList}

Total Amount: $${order.totalAmount.toFixed(2)}
Status: ${order.status}

---
This is an automated notification from Ru2ya E-commerce System.
      `.trim(),
            html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #7C805A; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; }
    .order-info { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .items { margin: 15px 0; }
    .item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 1.2em; font-weight: bold; color: #7C805A; margin-top: 15px; }
    .footer { text-align: center; color: #666; font-size: 0.9em; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Order Received</h1>
    </div>
    <div class="content">
      <div class="order-info">
        <h2>Order #${order.id}</h2>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
      
      <div class="order-info">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
        ${order.customerAddress ? `<p><strong>Address:</strong> ${order.customerAddress}</p>` : ''}
      </div>
      
      <div class="order-info">
        <h3>Order Items</h3>
        <div class="items">
          ${order.items
                    .map(
                        (item) => `
            <div class="item">
              ${item.productName} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
            </div>
          `
                    )
                    .join('')}
        </div>
        <div class="total">
          Total: $${order.totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from Ru2ya E-commerce System.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Order notification email sent to ${ADMIN_EMAIL}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send order notification email:', error);
        return false;
    }
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
    try {
        await transporter.verify();
        console.log('✅ Email server connection verified');
        return true;
    } catch (error) {
        console.error('❌ Email server connection failed:', error);
        return false;
    }
}
