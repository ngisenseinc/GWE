import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, MessageSquare, X, Send, MapPin, Phone, Clock, CreditCard, Menu } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Helmet } from 'react-helmet-async';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "👋 Welcome to God's Way Enterprise! I can help you find auto parts, check compatibility, or answer any questions. What are you looking for?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const products = useStore(state => state.products);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.compat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const prompt = `You are an AI assistant for God's Way Enterprise, an auto parts dealer in Abossey Okai, Accra, Ghana.
      Here is our current inventory:
      ${JSON.stringify(products.map(p => ({name: p.name, price: p.price, stock: p.status, compat: p.compat})))}
      
      Shop Info:
      Hours: Mon-Sat 8am-7pm, Sun 10am-4pm
      Location: Behind UBA Bank, Abossey Okai, Accra
      Phone: +233 24 755 9344
      
      User query: ${userMsg}
      
      Provide a helpful, concise response. If they ask for a part, check the inventory and give the price and availability. If they want to buy, suggest they contact via WhatsApp or visit the shop.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setChatMessages(prev => [...prev, { role: 'bot', text: response.text || 'Sorry, I could not process that.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting right now. Please try again later or contact us on WhatsApp.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser.');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error', event.error);
      }
      setIsListening(false);
    };
    
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#C9A84C] selection:text-black">
      <Helmet>
        <title>God's Way Enterprise | Premium Auto Parts in Abossey Okai</title>
        <meta name="description" content="Find the best automotive parts and accessories at God's Way Enterprise in Abossey Okai, Accra. We offer high-quality radiators, headlights, AC parts, and more." />
        <meta name="keywords" content="auto parts, car accessories, Abossey Okai, Accra, radiators, headlights, car battery, auto shop Ghana" />
        <meta property="og:title" content="God's Way Enterprise | Premium Auto Parts" />
        <meta property="og:description" content="Find the best automotive parts and accessories at God's Way Enterprise in Abossey Okai, Accra." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.APP_URL || "https://godswayenterprise.com"} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1486262715623-67db8c8bc165?q=80&w=1200&auto=format&fit=crop" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="God's Way Enterprise | Premium Auto Parts" />
        <meta name="twitter:description" content="Find the best automotive parts and accessories at God's Way Enterprise in Abossey Okai, Accra." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1486262715623-67db8c8bc165?q=80&w=1200&auto=format&fit=crop" />
      </Helmet>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-[#080A0F]/95 backdrop-blur-xl border-white/10 py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-xl shadow-[0_8px_32px_rgba(201,168,76,0.2)]">
              🔧
            </div>
            <div className="flex flex-col">
              <strong className="font-serif text-[15px] leading-tight text-white">God's Way Enterprise</strong>
              <span className="text-[10px] text-[#C9A84C] font-mono tracking-widest uppercase">Auto Parts · Abossey Okai</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {['Parts', 'Catalog', 'About', 'Location'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(37,211,102,0.4)]">
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </a>
            <a href="/login" className="hidden sm:block bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Staff Login
            </a>
            <button className="md:hidden p-2 text-white/70 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#080A0F] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {['Parts', 'Catalog', 'About', 'Location'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-white/80 hover:text-white border-b border-white/10 pb-4">
                  {item}
                </a>
              ))}
              <a href="/login" className="text-xl font-medium text-[#C9A84C] mt-4">Staff Login →</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(201,168,76,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.1)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#E8C76A] px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
            Open Now · Behind UBA Bank, Abossey Okai, Accra
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-5xl md:text-7xl lg:text-[88px] font-black leading-[0.9] text-white mb-6">
            Ghana's Premier<br />
            <span className="bg-gradient-to-br from-[#C9A84C] via-[#E8C76A] to-[#C9A84C] text-transparent bg-clip-text">Auto Parts</span><br />
            Destination
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed">
            Quality body parts, AC components, lighting, radiators, fans, and more — sourced globally, priced fairly, delivered fast. Trusted by mechanics and car owners across Accra.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center gap-4 mb-16">
            <a href="#products" className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-8 py-4 rounded-full text-[15px] font-bold shadow-[0_8px_32px_rgba(201,168,76,0.2)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(201,168,76,0.4)] transition-all flex items-center gap-2">
              <Search className="w-5 h-5" /> Browse Parts
            </a>
            <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-8 py-4 rounded-full text-[15px] font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-all flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> WhatsApp Us
            </a>
            <button onClick={() => setIsChatOpen(true)} className="border border-white/20 text-white/70 hover:text-white hover:bg-white/5 px-6 py-4 rounded-full text-[15px] font-medium transition-all flex items-center gap-2">
              🤖 AI Assistant
            </button>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-10 md:gap-16">
            {[
              { num: '5,000+', label: 'Parts in Stock' },
              { num: '500+', label: 'Car Brands Covered' },
              { num: '15+', label: 'Years Experience' },
              { num: '10k+', label: 'Happy Customers' }
            ].map(stat => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-serif text-3xl md:text-4xl font-bold text-[#C9A84C]">{stat.num}</span>
                <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search" className="bg-[#0F1117] py-16 border-y border-white/10">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-center text-white/60 text-sm mb-4">🔍 Search 5,000+ parts by name, car model, or part number</p>
          <div className="flex items-center bg-[#161B26] border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#C9A84C] focus-within:ring-2 focus-within:ring-[#C9A84C]/20 transition-all">
            <input 
              type="text" 
              placeholder="e.g. Radiator Toyota Corolla 2015, Headlight Honda Civic..." 
              className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-[15px] text-white placeholder:text-white/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleVoiceSearch} className={cn("p-4 border-l border-white/10 transition-colors flex items-center justify-center", isListening ? "text-[#E63946] animate-pulse" : "text-white/50 hover:text-[#E63946]")}>
              <Mic className="w-5 h-5" />
            </button>
            <button onClick={() => document.getElementById('products')?.scrollIntoView({behavior: 'smooth'})} className="bg-[#C9A84C] hover:bg-[#E8C76A] text-black px-6 py-4 font-semibold text-sm transition-colors">
              Search
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Radiator', 'Headlight', 'AC Compressor', 'Toyota Corolla', 'Honda Civic', 'Bumper'].map(chip => (
              <button key={chip} onClick={() => { setSearchQuery(chip); document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}) }} className="bg-white/5 border border-white/10 text-white/60 hover:bg-[#C9A84C]/15 hover:border-[#C9A84C] hover:text-[#E8C76A] px-4 py-1.5 rounded-full text-xs transition-all">
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="parts" className="py-24 bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-3">Shop by Category</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Find What You Need</h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">Premium auto parts across all major categories, sourced from trusted manufacturers worldwide</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: '🚗', name: 'Body Parts', count: '420+ items' },
              { icon: '❄️', name: 'AC Parts', count: '280+ items' },
              { icon: '💡', name: 'Lighting', count: '350+ items' },
              { icon: '🌀', name: 'Fans & Cooling', count: '190+ items' },
              { icon: '🌡️', name: 'Radiators', count: '310+ items' },
              { icon: '🔩', name: 'Radiator Supports', count: '120+ items' },
              { icon: '🛡️', name: 'Reinforcement Bars', count: '95+ items' },
              { icon: '⚙️', name: 'Engine Parts', count: '540+ items' },
            ].map(cat => (
              <div key={cat.name} onClick={() => { setActiveCategory(cat.name); document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}) }} className="bg-[#161B26] border border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:-translate-y-1 hover:border-[#C9A84C]/40 hover:shadow-[0_8px_32px_rgba(201,168,76,0.2)] transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl mb-3 block">{cat.icon}</span>
                <div className="text-sm font-semibold text-white mb-1">{cat.name}</div>
                <div className="text-[11px] text-[#C9A84C] font-mono">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="catalog" className="py-24 bg-[#0F1117]">
        <div className="max-w-7xl mx-auto px-6" id="products">
          <div className="mb-12">
            <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-3">Featured Inventory</span>
            <h2 className="font-serif text-4xl font-bold text-white">Popular Parts</h2>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {['All', 'Body Parts', 'AC Parts', 'Lighting', 'Radiators', 'Fans'].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-5 py-2 rounded-full text-[13px] font-medium border transition-all", activeCategory === cat ? "bg-[#C9A84C] text-black border-[#C9A84C]" : "bg-[#1E2436] text-white/60 border-white/10 hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C]")}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="text-white/40 text-[13px] font-mono">Showing {filteredProducts.length} of 5,000+</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-[#161B26] border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[#C9A84C]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all group">
                <div className="aspect-[16/10] bg-[#1E2436] flex items-center justify-center text-6xl relative overflow-hidden">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
                  <span className={cn("absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border", 
                    p.status === 'in' ? "bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/30" : 
                    p.status === 'low' ? "bg-[#F39C12]/15 text-[#F39C12] border-[#F39C12]/30" : 
                    "bg-[#E63946]/15 text-[#E63946] border-[#E63946]/30"
                  )}>
                    {p.status === 'in' ? '✓ In Stock' : p.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[10px] text-[#C9A84C] tracking-wider mb-1.5">{p.sku}</div>
                  <div className="text-[15px] font-semibold text-white mb-1 leading-snug">{p.name}</div>
                  <div className="text-xs text-white/40 mb-4">🚗 {p.compat}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-[#C9A84C]">
                      GHS {p.price.toLocaleString()} <span className="text-xs font-normal text-white/40">/ unit</span>
                    </div>
                    <a href={`https://wa.me/233247559344?text=Hello, I need the ${p.name} (${p.sku}). Is it available?`} target="_blank" rel="noreferrer" className="bg-[#25D366] hover:scale-105 text-white px-3.5 py-2 rounded-full text-xs font-bold transition-transform flex items-center gap-1.5 shadow-[0_4px_12px_rgba(37,211,102,0.2)] hover:shadow-[0_4px_12px_rgba(37,211,102,0.4)]">
                      <MessageSquare className="w-3.5 h-3.5" /> WA
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us & Location Section */}
      <section id="about" className="py-24 bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-4">Why God's Way</span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-[44px] font-bold text-white mb-6 leading-tight">Abossey Okai's Most Trusted Auto Parts Dealer</h2>
              <p className="text-white/55 text-base leading-relaxed mb-8">
                With over 15 years serving mechanics, workshops, and car owners across Greater Accra, we've built our reputation on quality parts, fair pricing, and genuine expertise.
              </p>
              
              <div className="flex flex-col gap-4">
                {[
                  { icon: '✅', title: 'Authentic Parts Guaranteed', desc: 'All parts sourced from certified manufacturers. No counterfeit stock.' },
                  { icon: '⚡', title: 'Same-Day Availability', desc: 'Over 5,000 parts in stock. Most orders ready for pickup immediately.' },
                  { icon: '💰', title: 'Competitive Pricing', desc: 'Best prices in Abossey Okai. Mobile Money and card payments accepted.' },
                  { icon: '🤝', title: 'Expert Guidance', desc: 'Our team helps you find the right part for your exact car model and year.' }
                ].map(feature => (
                  <div key={feature.title} className="flex items-start gap-4 bg-[#161B26] border border-white/10 rounded-xl p-5 hover:border-[#C9A84C]/30 transition-colors">
                    <div className="w-11 h-11 min-w-[44px] bg-[#C9A84C]/10 rounded-lg flex items-center justify-center text-xl">{feature.icon}</div>
                    <div>
                      <div className="text-[15px] font-semibold text-white mb-1">{feature.title}</div>
                      <div className="text-[13px] text-white/50">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div id="location" className="bg-[#161B26] border border-white/10 rounded-3xl p-8 md:p-10">
              <h3 className="font-serif text-2xl font-bold text-white mb-8">Find Us In Abossey Okai</h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                  <div className="w-10 h-10 min-w-[40px] bg-[#C9A84C]/10 rounded-lg flex items-center justify-center text-[#C9A84C]"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <div className="text-[11px] text-[#C9A84C] font-mono uppercase tracking-wider mb-0.5">Address</div>
                    <div className="text-sm text-white font-medium mb-0.5">Behind UBA Bank</div>
                    <div className="text-xs text-white/40">Abossey Okai, Accra, Ghana</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                  <div className="w-10 h-10 min-w-[40px] bg-[#C9A84C]/10 rounded-lg flex items-center justify-center text-[#C9A84C]"><Phone className="w-5 h-5" /></div>
                  <div>
                    <div className="text-[11px] text-[#C9A84C] font-mono uppercase tracking-wider mb-0.5">Phone & WhatsApp</div>
                    <div className="text-sm text-white font-medium mb-0.5">+233 24 755 9344</div>
                    <div className="text-xs text-white/40">Available 8am – 7pm daily</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                  <div className="w-10 h-10 min-w-[40px] bg-[#C9A84C]/10 rounded-lg flex items-center justify-center text-[#C9A84C]"><Clock className="w-5 h-5" /></div>
                  <div>
                    <div className="text-[11px] text-[#C9A84C] font-mono uppercase tracking-wider mb-0.5">Business Hours</div>
                    <div className="text-sm text-white font-medium mb-0.5">Mon – Sat: 8:00am – 7:00pm</div>
                    <div className="text-xs text-white/40">Sunday: 10:00am – 4:00pm</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 min-w-[40px] bg-[#C9A84C]/10 rounded-lg flex items-center justify-center text-[#C9A84C]"><CreditCard className="w-5 h-5" /></div>
                  <div>
                    <div className="text-[11px] text-[#C9A84C] font-mono uppercase tracking-wider mb-0.5">Payment Methods</div>
                    <div className="text-sm text-white font-medium mb-0.5">Cash · MTN MoMo · Vodafone Cash</div>
                    <div className="text-xs text-white/40">Visa / Mastercard accepted</div>
                  </div>
                </div>
              </div>
              
              <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="mt-8 w-full bg-[#25D366] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.4)] text-white py-4 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all">
                <MessageSquare className="w-5 h-5" /> Message Us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080A0F] border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="font-serif text-xl font-bold text-white mb-3">🔧 God's Way Enterprise</div>
              <p className="text-white/40 text-[13px] leading-relaxed max-w-sm">Premier automotive parts and accessories dealer in Abossey Okai, Accra, Ghana. Serving mechanics and car owners since 2010.</p>
            </div>
            
            <div>
              <h5 className="text-xs font-semibold text-[#C9A84C] font-mono uppercase tracking-widest mb-4">Products</h5>
              <ul className="space-y-2.5">
                {['Body Parts', 'AC Parts', 'Lighting', 'Radiators', 'Cooling Fans'].map(link => (
                  <li key={link}><a href="#" className="text-[13px] text-white/50 hover:text-[#C9A84C] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-xs font-semibold text-[#C9A84C] font-mono uppercase tracking-widest mb-4">Company</h5>
              <ul className="space-y-2.5">
                {['About Us', 'Our Location', 'Contact', 'Careers'].map(link => (
                  <li key={link}><a href="#" className="text-[13px] text-white/50 hover:text-[#C9A84C] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-xs font-semibold text-[#C9A84C] font-mono uppercase tracking-widest mb-4">Staff</h5>
              <ul className="space-y-2.5">
                <li><a href="/login" className="text-[13px] text-white/50 hover:text-[#C9A84C] transition-colors">Staff Login</a></li>
                <li><a href="/dashboard" className="text-[13px] text-white/50 hover:text-[#C9A84C] transition-colors">Dashboard</a></li>
                <li><a href="/dashboard/pos" className="text-[13px] text-white/50 hover:text-[#C9A84C] transition-colors">POS Terminal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">© 2026 God's Way Enterprise. Behind UBA Bank, Abossey Okai, Accra, Ghana.</p>
            <p className="text-xs text-white/20">Built with ❤️ for Ghana's auto industry</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-[360px] h-[520px] bg-[#12151C] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-lg">🤖</div>
                  <div>
                    <h4 className="text-sm font-bold text-black">God's Way AI Assistant</h4>
                    <p className="text-[11px] text-black/60">Ask me about any auto part</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-7 h-7 rounded-full bg-black/15 hover:bg-black/30 text-black flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed", 
                    msg.role === 'bot' ? "bg-[#1C2030] text-white/90 self-start rounded-bl-sm" : "bg-[#C9A84C] text-black font-medium self-end rounded-br-sm"
                  )}>
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-[#1C2030] self-start rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              {chatMessages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 px-5 pb-3">
                  {['Radiator for Toyota', 'AC Parts availability', 'Opening hours', 'How to find you'].map(reply => (
                    <button key={reply} onClick={() => {setChatInput(reply); handleChatSubmit({preventDefault: () => {}} as any)}} className="bg-[#1C2030] border border-white/10 hover:border-[#C9A84C] text-white/70 hover:text-[#C9A84C] px-3 py-1.5 rounded-full text-xs transition-colors">
                      {reply}
                    </button>
                  ))}
                </div>
              )}
              
              <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/10 flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about any auto part..." 
                  className="flex-1 bg-[#1C2030] border border-white/10 focus:border-[#C9A84C] text-white px-4 py-2.5 rounded-full text-[13px] outline-none transition-colors placeholder:text-white/30"
                />
                <button type="submit" disabled={!chatInput.trim() || isTyping} className="w-9 h-9 rounded-full bg-[#C9A84C] text-black flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black text-2xl shadow-[0_8px_24px_rgba(201,168,76,0.4)] flex items-center justify-center hover:scale-110 hover:shadow-[0_12px_32px_rgba(201,168,76,0.5)] transition-all relative">
          🤖
          {!isChatOpen && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E63946] border-2 border-[#080A0F]" />}
        </button>
      </div>
    </div>
  );
}
