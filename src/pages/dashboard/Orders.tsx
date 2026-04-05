import { useState } from 'react';
import { Plus, Eye, MessageSquare, Check, Printer, ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore, SalesOrder } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';


export default function Orders() {
  const [activeTab, setActiveTab] = useState<'purchase' | 'sales'>('sales');
  const purchaseOrders = useStore(state => state.purchaseOrders);
  const salesOrders = useStore(state => state.salesOrders);
  const updateSalesOrderStatus = useStore(state => state.updateSalesOrderStatus);
  const updateSalesOrderReturns = useStore(state => state.updateSalesOrderReturns);
  const updateProductStock = useStore(state => state.updateProductStock);
  const products = useStore(state => state.products);
  const setSalesOrders = useStore(state => state.setSalesOrders);
  const setPurchaseOrders = useStore(state => state.setPurchaseOrders);

  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [returnMode, setReturnMode] = useState(false);
  const [returnItems, setReturnItems] = useState<Record<number, number>>({});

  const handleReturnItem = (id: string | number, maxQty: number, delta: number) => {
    setReturnItems(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const processReturn = () => {
    if (!selectedOrder) return;
    
    let hasReturns = false;
    let newReturnedItemsCount = 0;
    const totalOrderItems = selectedOrder.items.reduce((sum, item) => sum + item.qty, 0);
    const previouslyReturnedItemsCount = Object.values(selectedOrder.returnedItems || {}).reduce<number>((sum, qty) => sum + (qty as number), 0);

    Object.entries(returnItems).forEach(([idStr, qty]: [string, number]) => {
      if (qty > 0) {
        hasReturns = true;
        newReturnedItemsCount += qty;
        const id = parseInt(idStr);
        const product = products.find(p => p.id === id);
        if (product) {
          updateProductStock(id, product.stock + qty);
        }
      }
    });

    if (hasReturns) {
      const totalReturnedNow = previouslyReturnedItemsCount + newReturnedItemsCount;
      const newStatus = totalReturnedNow >= totalOrderItems ? 'refund' : 'partial_refund';
      updateSalesOrderReturns(selectedOrder.id, returnItems, newStatus);
    }

    setReturnMode(false);
    setSelectedOrder(null);
    setReturnItems({});
  };

  // (Legacy) Orders data remains from store subscriptions; optional API migration can be done later

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex bg-[#EEF0F5] p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('purchase')}
            className={cn("px-4 py-2 rounded-lg text-[13px] font-bold transition-colors", activeTab === 'purchase' ? "bg-white text-black shadow-sm" : "text-[#8A90A8] hover:text-black")}
          >
            Purchase Orders
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={cn("px-4 py-2 rounded-lg text-[13px] font-bold transition-colors", activeTab === 'sales' ? "bg-white text-black shadow-sm" : "text-[#8A90A8] hover:text-black")}
          >
            Sales & Returns
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-white border border-[#E2E6EF] text-[#4A5270] px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8FA] transition-colors shadow-sm">
            <Printer className="w-4 h-4" /> Print History
          </button>
          {activeTab === 'purchase' && (
            <button className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]">
              <Plus className="w-4 h-4" /> New PO
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden flex-1 flex flex-col">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F7F8FA] border-b border-[#E2E6EF] z-10">
              <tr>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">{activeTab === 'purchase' ? 'PO Number' : 'Order ID'}</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">{activeTab === 'purchase' ? 'Supplier' : 'Customer'}</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Items</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Total</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Status</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Date/Time</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'purchase' ? purchaseOrders.map((o, i) => (
                <tr key={i} className="border-b border-[#E2E6EF] last:border-0 hover:bg-[#F7F8FA] transition-colors">
                  <td className="p-3.5 px-4"><span className="font-mono text-[11px] text-[#C9A84C]">{o.id}</span></td>
                  <td className="p-3.5 px-4 font-semibold text-[#0A0C14]">{o.supplier}</td>
                  <td className="p-3.5 px-4 text-[13px] text-[#4A5270]">{o.items} items</td>
                  <td className="p-3.5 px-4 font-bold text-[#0A0C14]">{o.total}</td>
                  <td className="p-3.5 px-4">
                    <span className={cn(
                      "inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border",
                      o.status === 'received' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                      o.status === 'confirmed' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                      "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                    )}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3.5 px-4 text-[12px] text-[#8A90A8]">{o.date}</td>
                  <td className="p-3.5 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      {o.status !== 'received' && (
                        <button className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#2ECC71] hover:text-white hover:border-[#2ECC71] transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : salesOrders.map((o) => (
                <tr key={o.id} className="border-b border-[#E2E6EF] last:border-0 hover:bg-[#F7F8FA] transition-colors">
                  <td className="p-3.5 px-4"><span className="font-mono text-[11px] text-[#C9A84C]">{o.id}</span></td>
                  <td className="p-3.5 px-4 font-semibold text-[#0A0C14]">{o.customer}</td>
                  <td className="p-3.5 px-4 text-[13px] text-[#4A5270]">{o.items.reduce((sum, item) => sum + item.qty, 0)} items</td>
                  <td className="p-3.5 px-4 font-bold text-[#0A0C14]">GHS {o.total.toLocaleString()}</td>
                  <td className="p-3.5 px-4">
                    <span className={cn(
                      "inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border",
                      o.status === 'paid' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                      o.status === 'pending' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                      "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                    )}>
                      {o.status === 'partial_refund' ? 'partial refund' : o.status}
                    </span>
                  </td>
                  <td className="p-3.5 px-4 text-[12px] text-[#8A90A8]">{o.time}</td>
                  <td className="p-3.5 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setSelectedOrder(o)} className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#F7F8FA]">
          {activeTab === 'purchase' ? purchaseOrders.map((o, i) => (
            <div key={i} className="bg-white border border-[#E2E6EF] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[11px] text-[#C9A84C] mb-1">{o.id}</div>
                  <div className="text-[14px] font-semibold text-[#0A0C14] leading-snug">{o.supplier}</div>
                </div>
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                  o.status === 'received' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                  o.status === 'confirmed' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                  "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                )}>
                  {o.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Total</span>
                  <span className="text-[14px] font-bold text-[#0A0C14]">{o.total}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Date</span>
                  <span className="text-[12px] text-[#4A5270]">{o.date}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E6EF]">
                <div className="text-[12px] font-medium text-[#4A5270]">{o.items} items</div>
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  {o.status !== 'received' && (
                    <button className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#2ECC71] hover:text-white hover:border-[#2ECC71] transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : salesOrders.map((o) => (
            <div key={o.id} className="bg-white border border-[#E2E6EF] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[11px] text-[#C9A84C] mb-1">{o.id}</div>
                  <div className="text-[14px] font-semibold text-[#0A0C14] leading-snug">{o.customer}</div>
                </div>
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                  o.status === 'paid' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                  o.status === 'pending' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                  "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                )}>
                  {o.status === 'partial_refund' ? 'partial refund' : o.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Total</span>
                  <span className="text-[14px] font-bold text-[#0A0C14]">GHS {o.total.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Time</span>
                  <span className="text-[12px] text-[#4A5270]">{o.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E6EF]">
                <div className="text-[12px] font-medium text-[#4A5270]">{o.items.reduce((sum, item) => sum + item.qty, 0)} items</div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setSelectedOrder(o)} className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-[500px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between bg-[#F7F8FA]">
                <div className="flex items-center gap-3">
                  {returnMode && (
                    <button onClick={() => { setReturnMode(false); setReturnItems({}); }} className="w-8 h-8 rounded-lg bg-white border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#EEF0F5] transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-[#0A0C14]">{returnMode ? 'Process Return' : 'Order Details'}</h3>
                    <div className="text-[12px] text-[#8A90A8] font-mono">{selectedOrder.id}</div>
                  </div>
                </div>
                <button onClick={() => { setSelectedOrder(null); setReturnMode(false); setReturnItems({}); }} className="text-[#8A90A8] hover:text-[#E63946] transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-[11px] text-[#8A90A8] uppercase tracking-wider mb-1">Customer</div>
                    <div className="font-semibold text-[#0A0C14]">{selectedOrder.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#8A90A8] uppercase tracking-wider mb-1">Status</div>
                    <span className={cn(
                      "inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border",
                      selectedOrder.status === 'paid' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                      selectedOrder.status === 'pending' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                      "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                    )}>
                      {selectedOrder.status === 'partial_refund' ? 'partial refund' : selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[11px] text-[#8A90A8] uppercase tracking-wider mb-3">Items</div>
                  <div className="flex flex-col gap-3">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E6EF] bg-[#F7F8FA]">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : item.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-[#0A0C14] truncate">{item.name}</div>
                          <div className="text-[12px] text-[#8A90A8]">GHS {item.price.toLocaleString()} × {item.qty}</div>
                        </div>
                        
                        {returnMode ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-[11px] text-[#8A90A8] mr-2">Return:</div>
                            <div className="flex items-center gap-1 bg-white border border-[#E2E6EF] rounded-lg p-1">
                              <button 
                                onClick={() => handleReturnItem(item.id, item.qty - (selectedOrder.returnedItems?.[item.id] || 0), -1)}
                                disabled={(selectedOrder.returnedItems?.[item.id] || 0) >= item.qty}
                                className="w-6 h-6 rounded flex items-center justify-center text-[#4A5270] hover:bg-[#EEF0F5] disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-[13px] font-bold">{returnItems[item.id] || 0}</span>
                              <button 
                                onClick={() => handleReturnItem(item.id, item.qty - (selectedOrder.returnedItems?.[item.id] || 0), 1)}
                                disabled={(selectedOrder.returnedItems?.[item.id] || 0) >= item.qty}
                                className="w-6 h-6 rounded flex items-center justify-center text-[#4A5270] hover:bg-[#EEF0F5] disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end shrink-0">
                            <div className="text-[13px] font-bold text-[#0A0C14]">
                              GHS {(item.price * item.qty).toLocaleString()}
                            </div>
                            {selectedOrder.returnedItems?.[item.id] ? (
                              <div className="text-[11px] text-[#E63946] font-medium mt-0.5">
                                {selectedOrder.returnedItems[item.id]} returned
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {!returnMode && (
                  <div className="border-t border-[#E2E6EF] pt-4 flex justify-between items-center">
                    <div>
                      <div className="text-[11px] text-[#8A90A8] uppercase tracking-wider mb-1">Payment Method</div>
                      <div className="text-[13px] font-medium text-[#4A5270]">{selectedOrder.payment}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#8A90A8] uppercase tracking-wider mb-1">Total</div>
                      <div className="text-lg font-bold text-[#0A0C14]">GHS {selectedOrder.total.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5 px-6 border-t border-[#E2E6EF] bg-[#F7F8FA]">
                {returnMode ? (
                  <button 
                    onClick={processReturn}
                    disabled={Object.values(returnItems).every(q => q === 0)}
                    className="w-full bg-[#E63946] text-white py-3 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:transform-none"
                  >
                    Confirm Return & Update Stock
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => window.print()} className="flex-1 bg-white border border-[#E2E6EF] text-[#4A5270] py-2.5 rounded-xl text-[14px] font-medium hover:bg-[#F7F8FA] transition-colors flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4" /> Print Receipt
                    </button>
                    {(selectedOrder.status === 'paid' || selectedOrder.status === 'pending' || selectedOrder.status === 'partial_refund') && (
                      <button 
                        onClick={() => setReturnMode(true)}
                        className="flex-1 bg-white border border-[#E63946] text-[#E63946] py-2.5 rounded-xl text-[14px] font-bold hover:bg-[#E63946]/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Process Return
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
