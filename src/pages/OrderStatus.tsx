import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore, SalesOrder } from '../store/useStore';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function OrderStatus() {
  const { orderId } = useParams<{ orderId: string }>();
  const salesOrders = useStore(state => state.salesOrders);
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      // First check store
      const foundInStore = salesOrders.find(o => o.id === orderId);
      if (foundInStore) {
        setOrder(foundInStore);
        setLoading(false);
        return;
      }

      // If not in store, fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        if (data) {
          setOrder({
            ...data,
            items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items
          });
        }
      } catch (err) {
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, salesOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-4">
        <div className="animate-pulse text-[#8A90A8]">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-[#E2E6EF]">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-serif font-bold">GW</span>
          </div>
          <h2 className="text-xl font-bold text-[#0A0C14] mb-2">Order Not Found</h2>
          <p className="text-[#8A90A8] mb-6">We couldn't find an order with the ID: {orderId}</p>
          <Link to="/" className="inline-flex items-center justify-center bg-[#C9A84C] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#E8C76A] transition-colors w-full">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Map existing statuses to a display status
  let displayStatus = 'Processing';
  let statusStep = 1;
  
  if (order.status === 'shipped') {
    displayStatus = 'Shipped';
    statusStep = 2;
  } else if (order.status === 'delivered') {
    displayStatus = 'Delivered';
    statusStep = 3;
  } else if (order.status === 'paid' || order.status === 'processing') {
    displayStatus = 'Processing';
    statusStep = 1;
  } else {
    displayStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ');
    statusStep = 0; // Other statuses like pending, refund
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-serif font-bold">GW</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0C14]">God's Way Enterprise</h1>
          <p className="text-[#8A90A8]">Order Status Tracking</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#E2E6EF]">
          <div className="p-6 sm:p-8 border-b border-[#E2E6EF]">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-[#8A90A8] uppercase tracking-wider font-semibold mb-1">Order Number</p>
                <p className="text-lg font-bold text-[#0A0C14] font-mono">{order.id}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-[#8A90A8] uppercase tracking-wider font-semibold mb-1">Order Date</p>
                <p className="text-base font-medium text-[#0A0C14]">{order.time}</p>
              </div>
            </div>

            {/* Status Tracker */}
            <div className="mt-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#F7F8FA] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C9A84C] transition-all duration-500"
                  style={{ width: statusStep === 1 ? '15%' : statusStep === 2 ? '50%' : statusStep === 3 ? '100%' : '0%' }}
                />
              </div>
              
              <div className="relative flex justify-between">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${statusStep >= 1 ? 'bg-[#C9A84C] text-black' : 'bg-[#F7F8FA] border-2 border-[#E2E6EF] text-[#8A90A8]'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${statusStep >= 1 ? 'text-[#0A0C14]' : 'text-[#8A90A8]'}`}>Processing</span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${statusStep >= 2 ? 'bg-[#C9A84C] text-black' : 'bg-[#F7F8FA] border-2 border-[#E2E6EF] text-[#8A90A8]'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${statusStep >= 2 ? 'text-[#0A0C14]' : 'text-[#8A90A8]'}`}>Shipped</span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${statusStep >= 3 ? 'bg-[#C9A84C] text-black' : 'bg-[#F7F8FA] border-2 border-[#E2E6EF] text-[#8A90A8]'}`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${statusStep >= 3 ? 'text-[#0A0C14]' : 'text-[#8A90A8]'}`}>Delivered</span>
                </div>
              </div>
            </div>
            
            {statusStep === 0 && (
              <div className="mt-6 flex items-center justify-center gap-2 text-[#F39C12] bg-[#F39C12]/10 py-3 rounded-xl font-medium">
                <Clock className="w-5 h-5" />
                Current Status: {displayStatus}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 bg-[#F7F8FA]">
            <h3 className="text-sm font-bold text-[#0A0C14] uppercase tracking-wider mb-4">Order Details</h3>
            <div className="space-y-4 mb-6">
              {order.items.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E2E6EF]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F7F8FA] rounded-lg flex items-center justify-center text-2xl shrink-0">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : item.emoji}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0A0C14]">{item.name}</p>
                      <p className="text-sm text-[#8A90A8]">Qty: {item.qty} × GHS {item.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="font-bold text-[#0A0C14]">GHS {(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2E6EF]">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-[#8A90A8]">Payment Method</span>
                <span className="font-medium text-[#0A0C14] uppercase">{order.payment}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#E2E6EF]">
                <span className="font-bold text-[#0A0C14]">Total Amount</span>
                <span className="font-bold text-xl text-[#C9A84C]">GHS {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
