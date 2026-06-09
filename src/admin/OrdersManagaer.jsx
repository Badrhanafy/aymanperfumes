// src/components/OrdersManager.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const printRef = useRef();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/orders', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchOrders();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order? Stock will be restored if not cancelled.')) return;
    setDeleting(orderId);
    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Deletion failed');
      await fetchOrders();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `http://localhost:8000/storage/${imagePath}`;
  };

  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice.');
      return;
    }

    const itemsHtml = order.order_items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="padding: 20px; text-align: center;">No items</td></tr>';

    const customerName = order.guest_name || order.user?.name || 'N/A';
    const customerEmail = order.guest_email || order.user?.email || 'N/A';
    const customerPhone = order.guest_phone || order.user?.phone || 'N/A';
    const shippingAddress = order.shipping_address || 'Not provided';
    const trackingCode = order.tracking_code || 'N/A';

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${order.id}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 40px;
            color: #1a1a1a;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 30px;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 2px;
          }
          .header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 12px;
          }
          .order-info {
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
          }
          .order-info div {
            width: 45%;
            margin-bottom: 15px;
          }
          .order-info strong {
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 5px;
          }
          .order-info span {
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #ddd;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .totals {
            margin-top: 20px;
            text-align: right;
            font-size: 16px;
          }
          .totals div {
            margin: 5px 0;
          }
          .totals .grand-total {
            font-size: 20px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 8px;
            margin-top: 8px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .invoice-container {
              border: none;
              padding: 20px;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>L'ESSENCE</h1>
            <p>Fine Fragrances & Perfumes</p>
            <p>Order Invoice</p>
          </div>

          <div class="order-info">
            <div>
              <strong>Order ID</strong>
              <span>#${order.id}</span>
            </div>
            <div>
              <strong>Date</strong>
              <span>${new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div>
              <strong>Status</strong>
              <span>${order.status.toUpperCase()}</span>
            </div>
            <div>
              <strong>Tracking Code</strong>
              <span>${trackingCode}</span>
            </div>
          </div>

          <div class="order-info">
            <div>
              <strong>Customer Name</strong>
              <span>${customerName}</span>
            </div>
            <div>
              <strong>Email</strong>
              <span>${customerEmail}</span>
            </div>
            <div>
              <strong>Phone</strong>
              <span>${customerPhone}</span>
            </div>
          </div>

          <div>
            <strong>Shipping Address</strong>
            <p style="margin-top: 5px;">${shippingAddress}</p>
          </div>

          <h3 style="margin: 30px 0 10px 0;">Ordered Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div>Subtotal: $${parseFloat(order.total_price).toFixed(2)}</div>
            <div>Shipping: $0.00</div>
            <div class="grand-total">Total: $${parseFloat(order.total_price).toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with L'Essence. For any inquiries, contact us at support@lessence.com</p>
            <p>This is a system generated invoice, no signature required.</p>
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500 text-xs uppercase tracking-widest">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl text-red-600 text-center">
        <p>Error: {error}</p>
        <button onClick={fetchOrders} className="mt-3 text-sm underline">Try again</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-neutral-50 rounded-2xl">
        <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-neutral-500 text-sm">No orders found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif text-black">Orders Management</h2>
        <button
          onClick={fetchOrders}
          className="text-xs uppercase tracking-wider flex items-center gap-2 text-neutral-500 hover:text-black"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-neutral-200 shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-600">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {(order.guest_name || order.user?.name) ? (
                    <>
                      <div className="font-medium text-black">{order.guest_name || order.user?.name}</div>
                      <div className="text-neutral-400 text-xs">{order.guest_email || order.user?.email}</div>
                    </>
                  ) : (
                    <span className="text-neutral-400">Guest</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">${parseFloat(order.total_price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {order.order_items?.length || 0} product(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-neutral-500 hover:text-black transition"
                      title="View items"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="text-xs border border-neutral-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => deleteOrder(order.id)}
                      disabled={deleting === order.id}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Delete order"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for order items with full details and print button */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-serif">Order #{selectedOrder.id}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                {/* Print Invoice Button */}
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 rounded-md flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Invoice
                </button>
                <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-black">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Enhanced Order Summary with more details */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-neutral-50 p-4 rounded-xl">
                <div>
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">Customer Name</span>
                  <p className="font-medium text-black">
                    {selectedOrder.guest_name || selectedOrder.user?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">Email</span>
                  <p className="text-black break-all">
                    {selectedOrder.guest_email || selectedOrder.user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">Phone</span>
                  <p className="text-black">
                    {selectedOrder.guest_phone || selectedOrder.user?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">Tracking Code</span>
                  <p className="font-mono text-xs">{selectedOrder.tracking_code || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">Shipping Address</span>
                  <p className="text-black whitespace-pre-wrap">{selectedOrder.shipping_address || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">Total</span>
                  <p className="font-medium text-lg">${parseFloat(selectedOrder.total_price).toFixed(2)}</p>
                </div>
              </div>

              {/* Items table with images */}
              <h4 className="font-serif text-base mb-3">Ordered Products</h4>
              <div className="space-y-3">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-black">{item.name}</p>
                          <div className="flex gap-3 text-xs text-neutral-500 mt-0.5">
                            {item.size_ml && <span>{item.size_ml} ml</span>}
                            {item.perfume?.brand?.name && (
                              <span>{item.perfume.brand.name}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Subtotal: ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}