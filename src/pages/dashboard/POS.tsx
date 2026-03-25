import { useState } from 'react';
import { useStore, SalesOrder } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Search, Camera, User, X, Minus, Plus, ShoppingCart, Printer, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

export default function POS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [discount, setDiscount] = useState<number | ''>('');
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<SalesOrder | null>(null);
  
  const user = useStore(state => state.user);
  const products = useStore(state => state.products);
  const cart = useStore(state => state.cart);
  const addToCart = useStore(state => state.addToCart);
  const updateCartQty = useStore(state => state.updateCartQty);
  const removeFromCart = useStore(state => state.removeFromCart);
  const clearCart = useStore(state => state.clearCart);

  const addSalesOrder = useStore(state => state.addSalesOrder);
  const updateProductStock = useStore(state => state.updateProductStock);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.compat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newOrder: SalesOrder = {
      id: `GWE-2026-${Math.floor(Math.random()*9000)+1000}`,
      customer: 'Walk-In Customer',
      items: [...cart],
      total,
      payment: selectedPayment,
      status: selectedPayment === 'credit' ? 'pending' : 'paid',
      time: new Date().toLocaleString('en-GH', {dateStyle: 'medium', timeStyle: 'short'})
    };
    
    addSalesOrder(newOrder);
    setCompletedOrder(newOrder);
    
    // Update stock
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        updateProductStock(product.id, Math.max(0, product.stock - item.qty));
      }
    });

    setIsReceiptOpen(true);
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    clearCart();
    setDiscount('');
    setSelectedPayment('cash');
    setCompletedOrder(null);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#F7F8FA] min-h-0">
      {/* Products Section */}
      <div className="flex-1 flex flex-col border-r border-[#E2E6EF] bg-[#F7F8FA] overflow-hidden">
        <div className="p-5 border-b border-[#E2E6EF] flex gap-2 shrink-0 flex-wrap">
          <div className="flex-1 flex items-center gap-2 bg-white border border-[#E2E6EF] rounded-xl px-4 py-2.5 focus-within:border-[#C9A84C] transition-colors min-w-[200px]">
            <Search className="w-4 h-4 text-[#8A90A8]" />
            <input 
              type="text" 
              placeholder="Search products by name, SKU, or car..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#0A0C14] placeholder:text-[#8A90A8]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-[#E2E6EF] rounded-xl px-4 py-2.5 text-[14px] text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all appearance-none min-w-[140px]"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <button className="w-11 h-11 rounded-xl bg-white border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#EEF0F5] transition-colors shrink-0">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(p => {
              const cartItem = cart.find(item => item.id === p.id);
              return (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.status === 'out'}
                className={cn(
                  "group relative bg-white border border-[#E2E6EF] rounded-xl p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#C9A84C] hover:shadow-[0_4px_12px_rgba(201,168,76,0.15)] active:scale-95 flex flex-col overflow-hidden",
                  p.status === 'out' && "opacity-50 cursor-not-allowed hover:transform-none hover:border-[#E2E6EF] hover:shadow-none"
                )}
              >
                {cartItem && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#C9A84C] text-black rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm z-10">
                    {cartItem.qty}
                  </div>
                )}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F7F8FA] flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#0A0C14] leading-snug line-clamp-2">{p.name}</div>
                    <div className="text-[10px] text-[#8A90A8] mt-0.5 truncate">{p.sku}</div>
                  </div>
                </div>
                
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <div className="text-[14px] font-bold text-[#C9A84C]">GHS {p.price.toLocaleString()}</div>
                    <div className={cn("text-[10px] font-mono mt-0.5", 
                      p.status === 'in' ? "text-[#2ECC71]" : 
                      p.status === 'low' ? "text-[#F39C12]" : "text-[#E63946]"
                    )}>
                      {p.stock} in stock
                    </div>
                  </div>
                </div>

                {/* Quick Add Overlay */}
                {p.status !== 'out' && (
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white text-[#0A0C14] border border-[#E2E6EF] shadow-sm px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Plus className="w-3.5 h-3.5" /> Quick Add
                    </div>
                  </div>
                )}
              </button>
            )})}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-[380px] flex flex-col bg-white shrink-0 border-t lg:border-t-0 border-[#E2E6EF] max-h-[50vh] lg:max-h-none">
        <div className="p-4 px-5 border-b border-[#E2E6EF] bg-[#F7F8FA] shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[15px] font-bold text-[#0A0C14] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Current Sale
            </h3>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-[11px] font-semibold text-[#E63946] hover:underline">Clear All</button>
            )}
          </div>
          <button className="w-full flex items-center gap-2 bg-white border border-[#E2E6EF] rounded-lg px-3 py-2 text-[13px] text-[#8A90A8] hover:border-[#C9A84C] transition-colors">
            <User className="w-4 h-4" /> Add customer (optional)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {cart.length === 0 ? (
            <div className="min-h-[150px] h-full flex flex-col items-center justify-center text-[#8A90A8] gap-3 opacity-50 py-8">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-[13px] text-center">Cart is empty.<br/>Click a product to add it.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-[#E2E6EF] last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#F7F8FA] flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#0A0C14] truncate">{item.name}</div>
                      <div className="text-[12px] text-[#8A90A8]">GHS {item.price.toLocaleString()} each</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-1.5 shrink-0 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => updateCartQty(item.id, -1)} className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="number" 
                        value={item.qty}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value);
                          if (!isNaN(newQty)) {
                            updateCartQty(item.id, newQty - item.qty);
                          }
                        }}
                        className="w-10 text-center bg-transparent border-none outline-none text-[13px] font-semibold text-[#0A0C14] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button onClick={() => updateCartQty(item.id, 1)} className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[13px] font-bold text-[#0A0C14] w-16 text-right shrink-0">
                        GHS {(item.price * item.qty).toLocaleString()}
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-[#8A90A8] hover:text-[#E63946] p-1 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 px-5 bg-[#F7F8FA] border-t border-[#E2E6EF] shrink-0">
          <div className="mb-4">
            <div className="flex justify-between text-[13px] text-[#4A5270] mb-2">
              <span>Subtotal</span><span>GHS {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] text-[#4A5270] mb-2">
              <span>Discount (GHS)</span>
              <input 
                type="number" 
                value={discount} 
                onChange={e => setDiscount(e.target.value ? Number(e.target.value) : '')}
                className="w-24 text-right bg-white border border-[#E2E6EF] rounded-md px-2 py-1 outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/20 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between text-lg font-bold text-[#0A0C14] border-t border-[#E2E6EF] pt-3 mt-1">
              <span>Total</span><span className="text-[#C9A84C]">GHS {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              { id: 'cash', icon: '💵', label: 'Cash' },
              { id: 'momo', icon: '📱', label: 'MTN MoMo' },
              { id: 'vodafone', icon: '📱', label: 'Vodafone' },
              { id: 'card', icon: '💳', label: 'Card' },
              { id: 'credit', icon: '📝', label: 'Credit' },
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => setSelectedPayment(m.id)}
                className={cn(
                  "flex-1 min-w-[55px] p-2 rounded-lg border text-center transition-colors",
                  selectedPayment === m.id ? "bg-[#C9A84C]/15 border-[#C9A84C]" : "bg-white border-[#E2E6EF] hover:border-[#C9A84C]/50"
                )}
              >
                <div className="text-lg mb-0.5">{m.icon}</div>
                <div className={cn("text-[9px] font-semibold", selectedPayment === m.id ? "text-[#C9A84C]" : "text-[#8A90A8]")}>{m.label}</div>
              </button>
            ))}
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black py-3.5 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            ✓ Complete Sale — GHS {total.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {isReceiptOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-[400px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-[#0A0C14]">Sale Complete 🎉</h3>
                <button onClick={handleCloseReceipt} className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#8A90A8] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-[#F7F8FA]">
                <div className="bg-white border border-[#E2E6EF] rounded-xl p-8 font-mono text-sm mx-auto max-w-[340px] shadow-sm print-receipt">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-serif font-bold">GW</span>
                    </div>
                    <div className="text-xl font-bold text-black mb-1 uppercase tracking-wider">God's Way Enterprise</div>
                    <div className="text-[12px] text-[#666] leading-relaxed">
                      Behind UBA Bank, Abossey Okai<br/>
                      Accra, Ghana<br/>
                      Tel: +233 24 755 9344<br/>
                      www.godsway.com
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-[#ccc] text-[12px] text-[#666] flex flex-col gap-1 text-left">
                      <div className="flex justify-between"><span>Receipt #:</span> <span className="font-bold text-black">{completedOrder?.id}</span></div>
                      <div className="flex justify-between"><span>Date:</span> <span>{completedOrder?.time}</span></div>
                      <div className="flex justify-between"><span>Cashier:</span> <span>{user?.name || user?.displayName || 'Staff Member'}</span></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-[11px] font-bold text-[#666] uppercase tracking-wider border-b border-black pb-2 mb-2">
                      <span>Item</span>
                      <span>Total</span>
                    </div>
                    {cart.map(i => (
                      <div key={i.id} className="flex justify-between text-[13px] py-2 text-black border-b border-dotted border-[#eee]">
                        <div className="flex flex-col">
                          <span className="font-semibold">{i.name}</span>
                          <span className="text-[11px] text-[#666]">{i.qty} x GHS {i.price.toLocaleString()}</span>
                        </div>
                        <span className="font-bold">GHS {(i.price * i.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t-2 border-black pt-3 mt-2">
                    <div className="flex justify-between text-[13px] mb-1.5 text-[#666]"><span>Subtotal</span><span>GHS {subtotal.toLocaleString()}</span></div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[13px] mb-1.5 text-[#2ECC71]"><span>Discount</span><span>- GHS {discountAmount.toLocaleString()}</span></div>
                    )}
                    <div className="flex justify-between text-[18px] font-bold text-black mt-3 pt-3 border-t border-dashed border-[#ccc]"><span>TOTAL</span><span>GHS {total.toLocaleString()}</span></div>
                    <div className="flex justify-between text-[13px] mt-2 text-[#666]"><span>Payment Method</span><span className="uppercase font-bold text-black">{selectedPayment}</span></div>
                  </div>
                  
                  <div className="text-center mt-8 pt-6 border-t border-dashed border-[#ccc]">
                    <div className="flex justify-center mb-5">
                      <div className="p-2 bg-white border border-[#eee] rounded-xl shadow-sm">
                        <QRCodeSVG 
                          value={`${window.location.origin}/order-status/${completedOrder?.id}`} 
                          size={120}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                    </div>
                    <div className="text-[12px] font-bold text-black mb-1">Scan to track your order</div>
                    <div className="text-[11px] text-[#666] mb-4">Or visit: {window.location.origin}/order-status</div>
                    <div className="text-[12px] font-bold text-black mb-1">Thank you for your business!</div>
                    <div className="text-[11px] text-[#666]">Items can be returned within 7 days with this receipt.</div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 px-6 border-t border-[#E2E6EF] flex flex-col gap-2 bg-[#F7F8FA] shrink-0">
                <button onClick={() => {
                  const msg = `Receipt from God's Way Enterprise\n\nOrder #: ${completedOrder?.id}\nTrack your order here: ${window.location.origin}/order-status/${completedOrder?.id}\n\n${cart.map(i=>`${i.name} x${i.qty}: GHS ${(i.price*i.qty).toLocaleString()}`).join('\n')}\n\nTotal: GHS ${total.toLocaleString()}\nPayment: ${selectedPayment.toUpperCase()}\n\nThank you! 🙏`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }} className="w-full bg-[#25D366] text-white py-3 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform">
                  <MessageSquare className="w-4 h-4" /> Send Receipt via WhatsApp
                </button>
                <div className="flex gap-2 w-full">
                  <button onClick={handleCloseReceipt} className="flex-1 bg-white border border-[#E2E6EF] text-[#4A5270] py-2.5 rounded-xl text-[14px] font-medium hover:bg-[#F7F8FA] transition-colors">
                    New Sale
                  </button>
                  <button onClick={() => window.print()} className="flex-1 bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black py-2.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
