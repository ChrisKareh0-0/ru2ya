import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from './orders';

export function generateOrdersPDF(orders: Order[]): Buffer {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('Orders Report', 14, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    // Prepare table data
    const tableData = orders.map((order) => [
        order.id.substring(0, 8) + '...',
        new Date(order.createdAt).toLocaleDateString(),
        order.customerName,
        order.customerEmail,
        `$${order.totalAmount.toFixed(2)}`,
        order.status,
    ]);

    // Add table
    autoTable(doc, {
        head: [['Order ID', 'Date', 'Customer', 'Email', 'Total', 'Status']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [124, 128, 90] }, // #7C805A
    });

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
}

export function generateSingleOrderPDF(order: Order): Buffer {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('Order Details', 14, 20);

    // Order info
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 14, 35);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 42);
    doc.text(`Status: ${order.status}`, 14, 49);

    // Customer info
    doc.setFontSize(14);
    doc.text('Customer Information', 14, 62);
    doc.setFontSize(10);
    doc.text(`Name: ${order.customerName}`, 14, 70);
    doc.text(`Email: ${order.customerEmail}`, 14, 77);
    doc.text(`Phone: ${order.customerPhone}`, 14, 84);
    if (order.customerAddress) {
        doc.text(`Address: ${order.customerAddress}`, 14, 91);
    }

    // Order items table
    const itemsData = order.items.map((item) => [
        item.productName,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`,
    ]);

    autoTable(doc, {
        head: [['Product', 'Quantity', 'Price', 'Subtotal']],
        body: itemsData,
        startY: order.customerAddress ? 98 : 91,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [124, 128, 90] },
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.text(`Total: $${order.totalAmount.toFixed(2)}`, 14, finalY + 10);

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
}
