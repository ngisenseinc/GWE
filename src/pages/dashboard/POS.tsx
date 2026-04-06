import { useState, useMemo } from 'react';
import { useStore, SalesOrder } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Search, Camera, User, X, Minus, Plus, ShoppingCart, Printer, MessageSquare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Helmet } from 'react-helmet-async';

export default function POS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [discount, setDiscount] = useState<number | ''>('');
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
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

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.compat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [products, searchQuery, selectedCategory]);

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
    
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        updateProductStock(product.id, Math.max(0, product.stock - item.qty));
      }
    });

    setIsReceiptOpen(true);
    setIsCartOpen(false);
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    clearCart();
    setDiscount('');
    setSelectedPayment('cash');
    setCompletedOrder(null);
  };

  const CartContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 px-5 border-b border-[#E2E6EF] bg-[#F7F8FA] shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[15px] font-bold text-[#0A0C14] flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Current Sale
          </h3>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-[11px] font-semibold text-[#E63946] hover:underline">Clear All</button>
            )}
            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-1 text-[#8A90A8] hover:text-[#0A0C14]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 bg-white border border-[#E2E6EF] rounded-lg px-3 py-2.5 text-[13px] text-[#8A90A8] hover:border-[#C9A84C] transition-colors">
          <User className="w-4 h-4" /> Add customer (optional)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-white">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#8A90A8] gap-3 opacity-50 py-12">
            <div className="w-16 h-16 rounded-full bg-[#F7F8FA] flex items-center justify-center mb-2">
              <ShoppingCart className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-[13px] text-center font-medium">Cart is empty.<br/>Click products to add them.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col gap-3 pb-4 border-b border-[#F0F2F7] last:border-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] flex items-center justify-center text-xl shrink-0 overflow-hidden border border-[#E2E6EF]">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-[#0A0C14] mb-0.5 line-clamp-2">{item.name}</div>
                    <div className="text-[11px] text-[#8A90A8] font-mono">{item.sku}</div>
                    <div className="text-[12px] font-bold text-[#C9A84C] mt-1">GHS {item.price.toLocaleString()}</div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-[#8A90A8] hover:text-[#E63946] p-1 transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between pl-16">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateCartQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-all active:scale-95">
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
                      className="w-10 text-center bg-transparent border-none outline-none text-[13px] font-bold text-[#0A0C14]"
                    />
                    <button onClick={() => updateCartQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-all active:scale-95">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[14px] font-black text-[#0A0C14]">
                    GHS {(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 bg-[#F7F8FA] border-t border-[#E2E6EF] shrink-0 safe-padding-bottom shadow-[0_-8px_24px_rgba(0,0,0,0.03)]">
        <div className="mb-5 space-y-2">
          <div className="flex justify-between text-[13px] font-medium text-[#4A5270]">
            <span>Subtotal</span><span>GHS {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[13px] font-medium text-[#4A5270]">
            <span>Discount</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#8A90A8] font-bold">GHS</span>
              <input 
                type="number" 
                value={discount} 
                onChange={e => setDiscount(e.target.value ? Number(e.target.value) : '')}
                className="w-24 text-right bg-white border border-[#E2E6EF] rounded-lg pl-10 pr-3 py-1.5 outline-none focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/5 text-[13px] font-bold"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-between text-lg font-black text-[#0A0C14] border-t border-[#E2E6EF] pt-4 mt-2">
            <span>Total</span><span className="text-[#C9A84C]">GHS {total.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {[
            { id: 'cash', icon: '💵', label: 'Cash' },
            { id: 'momo', icon: '📱', label: 'MoMo' },
            { id: 'card', icon: '💳', label: 'Card' },
            { id: 'vodafone', icon: '📞', label: 'Voda' },
            { id: 'credit', icon: '📝', label: 'Debt' },
          ].map(m => (
            <button 
              key={m.id}
              onClick={() => setSelectedPayment(m.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95",
                selectedPayment === m.id ? "bg-black text-white border-black shadow-lg" : "bg-white border-[#E2E6EF] text-[#8A90A8] hover:border-[#C9A84C]"
              )}
            >
              <div className="text-[13px] sm:text-lg mb-0.5">{m.icon}</div>
              <div className={cn("text-[8px] font-bold uppercase tracking-tight", selectedPayment === m.id ? "text-white/70" : "text-[#8A90A8]")}>{m.label}</div>
            </button>
          ))}
        </div>

        <button 
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="w-full bg-[#C9A84C] hover:bg-[#E8C76A] text-black py-4 rounded-2xl text-[15px] font-black flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(201,168,76,0.3)] hover:shadow-[0_12px_32px_rgba(201,168,76,0.5)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
        >
          ✓ Complete Sale — GHS {total.toLocaleString()}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#F7F8FA] min-h-0 relative">
      <Helmet>
        <title>Point of Sale | God's Way Enterprise</title>
      </Helmet>

      {/* Products Section */}
      <div className="flex-1 flex flex-col border-r border-[#E2E6EF] bg-[#F7F8FA] overflow-hidden">
        {/* Search & Categories */}
        <div className="p-4 sm:p-5 border-b border-[#E2E6EF] bg-white lg:bg-[#F7F8FA] shrink-0 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-3 bg-[#F0F2F7] lg:bg-white border border-transparent lg:border-[#E2E6EF] rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-[#C9A84C] focus-within:ring-4 focus-within:ring-[#C9A84C]/5 transition-all">
              <Search className="w-4 h-4 text-[#8A90A8]" />
              <input 
                type="text" 
                placeholder="Search products, SKUs, car models..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#0A0C14] font-medium placeholder:text-[#8A90A8]"
              />
            </div>
            <button className="w-12 h-12 rounded-2xl lg:bg-white bg-[#F0F2F7] border lg:border-[#E2E6EF] border-transparent flex items-center justify-center text-[#4A5270] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all active:scale-95 shrink-0">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="flex overflow-x-auto gap-2 -mx-4 px-4 pb-1 no-scrollbar">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={cn(
                  "whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-bold transition-all border",
                  selectedCategory === c 
                    ? "bg-black text-white border-black shadow-lg shadow-black/10" 
                    : "bg-white border-[#E2E6EF] text-[#4A5270] hover:border-[#C9A84C] shadow-sm"
                )}
              >
                {c === 'All' ? 'All Inventory' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map(p => {
              const cartItem = cart.find(item => item.id === p.id);
              return (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.status === 'out'}
                className={cn(
                  "group relative bg-white border border-[#E2E6EF] rounded-2xl p-4 text-left transition-all hover:border-[#C9A84C] hover:shadow-[0_12px_32px_rgba(201,168,76,0.12)] active:scale-95 flex flex-col gap-3 shadow-sm",
                  p.status === 'out' && "opacity-40 grayscale cursor-not-allowed hover:border-[#E2E6EF] hover:shadow-none"
                )}
              >
                {cartItem && (
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#C9A84C] text-black rounded-full flex items-center justify-center text-[12px] font-black shadow-lg z-10 border-2 border-white">
                    {cartItem.qty}
                  </motion.div>
                )}
                
                <div className="w-full aspect-square rounded-xl bg-[#F7F8FA] flex items-center justify-center text-4xl overflow-hidden border border-[#F0F2F7]">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : p.emoji}
                </div>

                <div className="flex-1">
                  <div className="text-[13px] font-bold text-[#0A0C14] leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">{p.name}</div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="font-mono text-[10px] text-[#C9A84C] bg-[#C9A84C]/5 px-1.5 py-0.5 rounded uppercase tracking-wider">{p.sku}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-black text-[#0A0C14]">GHS {p.price.toLocaleString()}</span>
                    <span className={cn("text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-tighter", 
                      p.status === 'in' ? "bg-[#2ECC71]/10 text-[#2ECC71]" : 
                      p.status === 'low' ? "bg-[#F39C12]/10 text-[#F39C12]" : "bg-[#E63946]/10 text-[#E63946]"
                    )}>
                      {p.stock} Avl
                    </span>
                  </div>
                </div>

                {/* Mobile Tap Feedback */}
                <div className="sm:hidden absolute inset-0 rounded-2xl bg-black/5 opacity-0 active:opacity-100 transition-opacity" />
              </button>
            )})}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center gap-3 opacity-30">
                <Search className="w-12 h-12" />
                <p className="font-bold">No products found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Cart Bar */}
        <div className="lg:hidden p-4 bg-white border-t border-[#E2E6EF] safe-padding-bottom">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full h-14 bg-black text-white rounded-2xl px-5 flex items-center justify-between shadow-xl shadow-black/10 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4.5 h-4.5 bg-[#C9A84C] text-[9px] font-black text-black rounded-full flex items-center justify-center border border-black">
                    {cart.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                )}
              </div>
              <span className="font-bold text-sm">View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-black">GHS {total.toLocaleString()}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
          </button>
        </div>
      </div>

      {/* Cart Drawer (Mobile) / Sidebar (Desktop) */}
      <div className="hidden lg:flex w-[380px] flex-col bg-white shrink-0 shadow-[-12px_0_40px_rgba(0,0,0,0.02)] z-20 overflow-hidden">
        {CartContent}
      </div>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-x-0 bottom-0 h-[92vh] bg-white rounded-t-[32px] z-[2001] shadow-[0_-12px_40px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col"
            >
              <div className="w-12 h-1.5 bg-[#E2E6EF] rounded-full mx-auto my-3 shrink-0" />
              {CartContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {isReceiptOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-[420px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 pb-4 border-b border-[#F0F2F7] flex items-center justify-between shrink-0">
                <h3 className="text-xl font-black text-[#0A0C14]">Sale Done! 🎉</h3>
                <button onClick={handleCloseReceipt} className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#8A90A8] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-[#F7F8FA] no-scrollbar">
                <div className="bg-white border border-[#E2E6EF] rounded-2xl p-8 font-mono text-sm mx-auto max-w-full shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C9A84C]" />
                  
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <span className="text-2xl font-serif font-black">GW</span>
                    </div>
                    <div className="text-lg font-black text-black mb-1 uppercase tracking-tighter">God's Way Enterprise</div>
                    <div className="text-[11px] text-[#8A90A8] font-bold uppercase tracking-widest flex flex-col gap-0.5">
                      <span>Abossey Okai, Accra</span>
                      <span>+233 24 755 9344</span>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-dashed border-[#E2E6EF] text-[11px] text-[#8A90A8] flex flex-col gap-1.5 text-left">
                      <div className="flex justify-between"><span>INVOICE</span> <span className="font-black text-black">{completedOrder?.id}</span></div>
                      <div className="flex justify-between"><span>DATE</span> <span>{completedOrder?.time}</span></div>
                      <div className="flex justify-between"><span>STAFF</span> <span className="uppercase">{user?.name || user?.displayName || 'Staff'}</span></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-[10px] font-black text-[#8A90A8] uppercase tracking-[0.2em] border-b-2 border-black pb-2 mb-3">
                      <span>Product Description</span>
                      <span>Amt</span>
                    </div>
                    {completedOrder?.items.map(i => (
                      <div key={i.id} className="flex justify-between text-[13px] py-2.5 text-black border-b border-dotted border-[#E2E6EF]">
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                          <span className="font-bold leading-tight uppercase">{i.name}</span>
                          <span className="text-[11px] text-[#8A90A8]">{i.qty} x GHS {i.price.toLocaleString()}</span>
                        </div>
                        <span className="font-black">GHS {(i.price * i.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t-2 border-black pt-4 mt-2 space-y-2">
                    <div className="flex justify-between text-[13px] font-bold text-[#8A90A8]"><span>SUBTOTAL</span><span>GHS {subtotal.toLocaleString()}</span></div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[13px] font-bold text-[#E63946]"><span>DISCOUNT</span><span>-GHS {discountAmount.toLocaleString()}</span></div>
                    )}
                    <div className="flex justify-between text-2xl font-black text-black mt-4 pt-4 border-t-2 border-black"><span>TOTAL</span><span>GHS {total.toLocaleString()}</span></div>
                    <div className="flex justify-between text-[11px] font-bold mt-2 text-[#8A90A8]"><span>PAYMENT</span><span className="uppercase font-black text-black">{selectedPayment}</span></div>
                  </div>
                  
                  <div className="text-center mt-10 pt-8 border-t border-dashed border-[#E2E6EF]">
                    <div className="flex justify-center mb-6">
                      <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-xl">
                        <QRCodeSVG 
                          id="qr-code-svg"
                          value={`${window.location.host}/order-status/${completedOrder?.id}`} 
                          size={130}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </div>
                    <div className="text-[12px] font-black text-black mb-1 uppercase">Track Order Status</div>
                    <div className="text-[10px] text-[#8A90A8] mb-6 font-bold">{window.location.host}/order/{completedOrder?.id}</div>
                    
                    <div className="bg-black text-white py-3 rounded-xl mb-4">
                      <div className="text-[11px] font-black uppercase tracking-widest">Thank You for Choosing Us!</div>
                    </div>
                    
                    <div className="text-[10px] text-[#8A90A8] font-medium leading-relaxed italic">
                      "With God, all things are possible."<br/>
                      Return Policy: 7 days with valid receipt.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-[#F0F2F7] flex flex-col gap-3 bg-white shrink-0">
                <button onClick={() => {
                  const msg = `Receipt: God's Way Enterprise\nOrder: ${completedOrder?.id}\nTrack: ${window.location.host}/order-status/${completedOrder?.id}\n\nTotal: GHS ${total.toLocaleString()}\nThank you! 🙏`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }} className="w-full h-14 bg-[#25D366] text-white rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98] transition-all">
                  <MessageSquare className="w-5 h-5" /> Share via WhatsApp
                </button>
                <div className="flex gap-3 w-full">
                  <button onClick={handleCloseReceipt} className="flex-1 h-12 bg-[#F7F8FA] border border-[#E2E6EF] text-[#4A5270] rounded-xl text-[14px] font-bold hover:bg-[#EEF0F5] transition-all">
                    Done
                  </button>
                  <button onClick={() => window.print()} className="flex-1 h-12 bg-black text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#1A1C24] active:scale-[0.98] transition-all">
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
