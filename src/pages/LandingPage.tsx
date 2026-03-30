import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { motion, useInView } from 'motion/react';
import { Search, Mic, MessageSquare, MapPin, Phone, Clock, CreditCard, Menu, X, Star, ArrowRight, ChevronDown, Shield, Zap, Award, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import SEOMetadata from '../components/SEOMetadata';

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const CAR_BRANDS = ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mercedes', 'BMW', 'Mitsubishi', 'Ford', 'Volkswagen', 'Mazda', 'Suzuki', 'Isuzu', 'Lexus', 'Land Rover', 'Jeep'];

const TESTIMONIALS = [
  { name: 'Kwame Asante', role: 'Auto Mechanic', shop: 'Asante Motors, Kaneshie', text: "God's Way is my go-to for Toyota and Honda parts. Always in stock, always genuine. Their prices are the best in Abossey Okai — I've been coming here for 6 years.", rating: 5, avatar: 'KA' },
  { name: 'Abena Mensah', role: 'Car Owner', shop: 'Accra, Ghana', text: "Found my Hyundai headlight in under 5 minutes! The staff knew exactly what I needed. Ordered on WhatsApp and it was ready for pickup same day. Highly recommended!", rating: 5, avatar: 'AM' },
  { name: 'Ibrahim Seidu', role: 'Fleet Manager', shop: 'GhanaLink Transport', text: "We manage 30+ vehicles and God's Way is our sole parts supplier. Consistent quality, fair bulk pricing, and they always help us find the right fitment. Exceptional service.", rating: 5, avatar: 'IS' },
];

const HOW_STEPS = [
  { num: '01', icon: '🔍', title: 'Search or Call', desc: 'Search our catalog by part name, car model, or part number. Or simply WhatsApp us your car details.' },
  { num: '02', icon: '✅', title: 'Confirm & Reserve', desc: 'We verify the exact fitment for your vehicle and confirm availability. No surprises.' },
  { num: '03', icon: '🚗', title: 'Pick Up or Deliver', desc: 'Walk in to our Abossey Okai shop or arrange delivery within Accra. Fast, simple, done.' },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const products = useStore(state => state.products);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.compat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported in your browser.');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      setSearchQuery(e.results[0][0].transcript);
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const faqs = [
    { q: 'Do you sell genuine/original parts?', a: 'Yes. All our parts are sourced from certified manufacturers and authorized distributors. We do not sell counterfeit or substandard products.' },
    { q: 'Can I order via WhatsApp?', a: 'Absolutely! Just WhatsApp your car make, model, year, and part needed to +233 24 755 9344. We\'ll check availability and send you the price immediately.' },
    { q: 'Do you offer delivery in Accra?', a: 'Yes, we deliver within Greater Accra for a small fee. Same-day delivery is available for in-stock items ordered before 3pm.' },
    { q: 'What payment methods do you accept?', a: 'We accept Cash, MTN MoMo, Vodafone Cash, Telecel Cash, Visa/Mastercard. Payment on pickup or delivery is available.' },
    { q: 'Can I return a wrong part?', a: 'Yes. We offer a 7-day return/exchange policy with your original receipt for parts that were incorrectly supplied. No returns on used parts.' },
  ];

  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#C9A84C] selection:text-black">
      <SEOMetadata 
        title="God's Way Enterprise | Best Auto Parts in Abossey Okai, Accra"
        description="Ghana's premier auto parts store in Abossey Okai, Accra. Find genuine radiators, headlights, AC parts, body parts & more for all car brands. WhatsApp +233 24 755 9344 for the best prices in Ghana."
        keywords="auto parts Ghana, car parts Accra, Abossey Okai spare parts, radiators Ghana, headlights Accra, AC compressor Ghana, Toyota parts Ghana, Honda parts Accra, Ghana auto shop, Gods Way Enterprise"
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "God's Way Enterprise",
            "image": "https://godswayenterprise.com/logo.png",
            "@id": "https://godswayenterprise.com",
            "url": "https://godswayenterprise.com",
            "telephone": "+233247559344",
            "priceRange": "GH₵₵",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Behind UBA Bank, Abossey Okai",
              "addressLocality": "Accra",
              "addressRegion": "Greater Accra",
              "addressCountry": "GH"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 5.5593,
              "longitude": -0.2241
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "08:00",
                "closes": "19:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Sunday",
                "opens": "10:00",
                "closes": "16:00"
              }
            ],
            "sameAs": [
              "https://wa.me/233247559344"
            ]
          })}
        </script>
      </Helmet>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-[#080A0F]/96 backdrop-blur-xl border-white/8 py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-xl shadow-[0_4px_16px_rgba(201,168,76,0.2)]">🔧</div>
            <div className="flex flex-col">
              <strong className="font-serif text-[14px] leading-tight text-white">God's Way Enterprise</strong>
              <span className="text-[10px] text-[#C9A84C] font-mono tracking-widest uppercase">Auto Parts · Abossey Okai</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {['Parts', 'Catalog', 'About', 'Location'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-white/65 hover:text-white hover:bg-white/8 px-4 py-2 rounded-lg text-sm font-medium transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(37,211,102,0.4)]">
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </a>
            <a href="/login" className="hidden sm:block bg-white/8 hover:bg-white/15 text-white border border-white/12 px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Staff
            </a>
            <button className="md:hidden p-2 text-white/70 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-40 bg-[#080A0F] pt-24 px-6 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {['Parts', 'Catalog', 'About', 'Location'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white/80 hover:text-[#C9A84C] py-3 border-b border-white/8 transition-colors">{item}</a>
            ))}
            <a href="/login" className="text-xl font-medium text-[#C9A84C] mt-4 py-3">Staff Login →</a>
            <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="mt-4 bg-[#25D366] text-white py-4 rounded-2xl text-center text-lg font-bold flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      )}

      {/* Hero */}
      <section id="hero" className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(201,168,76,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.09)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080A0F]" />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#E8C76A] px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
            Open Now · Mon–Sat 8am–7pm
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-5xl md:text-6xl lg:text-[76px] font-black leading-[0.9] text-white mb-6">
                Ghana's #1<br />
                <span className="bg-gradient-to-br from-[#C9A84C] via-[#F0D060] to-[#C9A84C] text-transparent bg-clip-text">Auto Parts</span><br />
                Shop in Accra
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-white/55 mb-8 leading-relaxed max-w-lg">
                Genuine radiators, headlights, AC components, body parts & more — sourced globally, priced fairly. In Abossey Okai, Accra since 2010.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="flex flex-wrap gap-4 mb-10">
                <a href="#products" className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-7 py-4 rounded-full text-[15px] font-bold shadow-[0_8px_32px_rgba(201,168,76,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(201,168,76,0.45)] transition-all flex items-center gap-2">
                  <Search className="w-4 h-4" /> Browse Parts
                </a>
                <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366] hover:text-white px-7 py-4 rounded-full text-[15px] font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> WhatsApp Us
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="flex flex-wrap gap-8 sm:gap-12">
                {[
                  { end: 5000, suffix: '+', label: 'Parts In Stock' },
                  { end: 500, suffix: '+', label: 'Car Brands' },
                  { end: 15, suffix: '+', label: 'Years Experience' },
                  { end: 10000, suffix: '+', label: 'Happy Customers' },
                ].map(s => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <span className="font-serif text-3xl sm:text-4xl font-black text-[#C9A84C]">
                      <AnimatedCounter end={s.end} suffix={s.suffix} />
                    </span>
                    <span className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div initial={{ opacity: 0, scale: 0.95, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 0.15 }} className="hidden lg:block">
              <div className="relative">
                <div className="bg-[#0F1117] border border-white/10 rounded-3xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Live Inventory</div>
                    <div className="flex items-center gap-2 text-[#2ECC71]">
                      <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                      <span className="text-[11px] font-bold">Real-time</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { name: 'Toyota Corolla Radiator', sku: 'RAD-TC-2019', price: 'GHS 850', stock: 'In Stock', color: '#2ECC71' },
                      { name: 'Honda Civic AC Compressor', sku: 'AC-HC-2020', price: 'GHS 1,200', stock: 'In Stock', color: '#2ECC71' },
                      { name: 'Nissan Frontier Headlight', sku: 'LT-NF-2018', price: 'GHS 480', stock: 'Low Stock', color: '#F39C12' },
                      { name: 'Hyundai Elantra Bumper', sku: 'BP-HE-2022', price: 'GHS 650', stock: 'In Stock', color: '#2ECC71' },
                    ].map(item => (
                      <div key={item.sku} className="flex items-center justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 hover:border-[#C9A84C]/20 transition-all">
                        <div>
                          <div className="text-[13px] font-semibold text-white">{item.name}</div>
                          <div className="text-[11px] font-mono text-[#C9A84C]">{item.sku}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-[13px] font-bold text-white">{item.price}</div>
                          <div className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: item.color, background: `${item.color}18` }}>{item.stock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-white/8 text-center">
                    <div className="text-[11px] text-white/30 mb-1">Powered by</div>
                    <div className="text-[13px] font-serif font-bold text-white">God's Way Enterprise POS</div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-[#2ECC71] text-black px-4 py-2 rounded-2xl text-[12px] font-black shadow-[0_8px_24px_rgba(46,204,113,0.4)]">
                  ✓ 5,000+ Parts Ready
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar — Scrolling Brands */}
      <section className="bg-[#0D0F15] border-y border-white/8 py-5 overflow-hidden">
        <div className="flex">
          {[...CAR_BRANDS, ...CAR_BRANDS].map((brand, i) => (
            <div key={i} className="flex items-center gap-6 shrink-0 whitespace-nowrap pr-6" style={{ animation: 'marquee 30s linear infinite' }}>
              <div className="text-white/25 font-bold text-sm tracking-widest uppercase">{brand}</div>
              <div className="w-1 h-1 rounded-full bg-[#C9A84C]/30" />
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>

      {/* Features Strip */}
      <section className="bg-[#080A0F] py-16 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Shield, label: 'Genuine Parts', desc: 'Certified manufacturers only', color: '#C9A84C' },
            { icon: Zap, label: 'Same-Day Ready', desc: 'Most orders in-store', color: '#2ECC71' },
            { icon: Award, label: '15+ Years Trusted', desc: 'Serving Ghana since 2010', color: '#3498DB' },
            { icon: Users, label: '10,000+ Customers', desc: 'Mechanics & car owners', color: '#9B59B6' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="flex flex-col gap-3 p-5 rounded-2xl bg-[#0F1117] border border-white/6 hover:border-white/15 hover:-translate-y-1 transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-white">{label}</div>
                <div className="text-[12px] text-white/40 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search Section */}
      <section id="search" className="bg-[#0F1117] py-16 border-b border-white/8">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-6">
            <h2 className="font-serif text-3xl font-bold text-white mb-2">Search Car Parts in Ghana</h2>
            <p className="text-white/50 text-sm">Find genuine radiators, headlights, and AC parts in Accra</p>
          </div>
          <div className="flex items-center bg-[#161B26] border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#C9A84C] focus-within:ring-2 focus-within:ring-[#C9A84C]/15 transition-all">
            <Search className="w-5 h-5 text-white/30 ml-5 shrink-0" />
            <input
              type="text"
              placeholder="e.g. Radiator Toyota Corolla 2018, Headlight Honda Civic..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-[15px] text-white placeholder:text-white/25"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button onClick={handleVoiceSearch} className={cn("p-4 border-l border-white/10 transition-colors", isListening ? "text-[#E63946] animate-pulse" : "text-white/40 hover:text-[#E63946]")}>
              <Mic className="w-5 h-5" />
            </button>
            <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#C9A84C] hover:bg-[#E8C76A] text-black px-6 py-4 font-bold text-sm transition-colors">
              Search
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {['Radiator', 'Headlight', 'AC Compressor', 'Toyota Corolla', 'Honda Civic', 'Bumper', 'Cooling Fan'].map(chip => (
              <button key={chip} onClick={() => { setSearchQuery(chip); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-white/4 border border-white/8 text-white/50 hover:bg-[#C9A84C]/12 hover:border-[#C9A84C]/40 hover:text-[#E8C76A] px-4 py-1.5 rounded-full text-xs font-medium transition-all">
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="parts" className="py-24 bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-3">Shop by Category</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Quality Parts in Abossey Okai</h2>
            <p className="text-white/45 text-base max-w-xl mx-auto">Premium auto parts across all major categories, sourced globally for the Ghanaian market</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <motion.div
                key={cat.name}
                whileHover={{ y: -4 }}
                onClick={() => { setActiveCategory(cat.name); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="bg-[#161B26] border border-white/8 rounded-2xl p-5 text-center cursor-pointer hover:border-[#C9A84C]/35 hover:shadow-[0_8px_32px_rgba(201,168,76,0.18)] transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl mb-3 block">{cat.icon}</span>
                <div className="text-sm font-bold text-white mb-1">{cat.name}</div>
                <div className="text-[11px] text-[#C9A84C] font-mono">{cat.count}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="catalog" className="py-20 bg-[#0F1117]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6" id="products">
          <div className="mb-10">
            <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-3">Featured Inventory</span>
            <h2 className="font-serif text-4xl font-bold text-white">Popular Parts</h2>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {['All', 'Body Parts', 'AC Parts', 'Lighting', 'Radiators', 'Fans'].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-5 py-2 rounded-full text-[13px] font-semibold border transition-all", activeCategory === cat ? "bg-[#C9A84C] text-black border-[#C9A84C]" : "bg-[#1E2436] text-white/55 border-white/10 hover:bg-[#C9A84C]/10 hover:text-white hover:border-[#C9A84C]/40")}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="text-white/35 text-[13px] font-mono">Showing {filteredProducts.length} parts</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map(p => (
              <motion.div key={p.id} whileHover={{ y: -4 }} className="bg-[#161B26] border border-white/8 rounded-2xl overflow-hidden hover:border-[#C9A84C]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all group">
                <div className="aspect-[4/3] bg-[#1E2436] flex items-center justify-center text-6xl relative overflow-hidden">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : <span className="transform group-hover:scale-110 transition-transform">{p.emoji}</span>}
                  <span className={cn("absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border", p.status === 'in' ? "bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/30" : p.status === 'low' ? "bg-[#F39C12]/15 text-[#F39C12] border-[#F39C12]/30" : "bg-[#E63946]/15 text-[#E63946] border-[#E63946]/30")}>
                    {p.status === 'in' ? '✓ In Stock' : p.status === 'low' ? '⚡ Low Stock' : '✗ Out of Stock'}
                  </span>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[10px] text-[#C9A84C] tracking-wider mb-1">{p.sku}</div>
                  <div className="text-[15px] font-bold text-white mb-1 leading-snug">{p.name}</div>
                  <div className="text-xs text-white/35 mb-4">🚗 {p.compat}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black text-[#C9A84C]">GHS {p.price.toLocaleString()}</div>
                    <a href={`https://wa.me/233247559344?text=Hello! I need the ${encodeURIComponent(p.name)} (${p.sku}). Is it available?`} target="_blank" rel="noreferrer" className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 hover:shadow-[0_4px_12px_rgba(37,211,102,0.3)]">
                      <MessageSquare className="w-3.5 h-3.5" /> Order
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-white/30 text-lg font-medium mb-2">No parts found</div>
                <div className="text-white/20 text-sm">Try a different search or <a href="https://wa.me/233247559344" className="text-[#25D366] underline" target="_blank" rel="noreferrer">WhatsApp us</a></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-24 bg-[#080A0F] border-t border-white/8">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-3">Simple Process</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">How to Order</h2>
            <p className="text-white/45 text-base">3 simple steps to get the part you need</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-3xl bg-[#0F1117] border-2 border-[#C9A84C]/30 flex items-center justify-center text-4xl mb-5 shadow-[0_8px_24px_rgba(201,168,76,0.12)] relative">
                  {step.icon}
                  <span className="absolute -top-3 -right-3 w-7 h-7 bg-[#C9A84C] text-black rounded-full text-[11px] font-black flex items-center justify-center">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full text-[15px] font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-all">
              <MessageSquare className="w-5 h-5" /> Start Your Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0F1117] border-t border-white/8">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-3">Customer Reviews</span>
            <h2 className="font-serif text-4xl font-bold text-white mb-2">What Customers Say</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#C9A84C] text-[#C9A84C]" />)}
              <span className="text-white/50 text-sm ml-2">4.9/5 from 200+ reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#161B26] border border-white/8 rounded-2xl p-7 hover:border-[#C9A84C]/25 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />)}
                </div>
                <p className="text-white/65 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center font-black text-black text-sm">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-[11px] text-white/40">{t.role} · {t.shop}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us & Location */}
      <section id="about" className="py-24 bg-[#080A0F] border-t border-white/8">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-4">Why Choose Us</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">Abossey Okai's Most Trusted Auto Parts Dealer</h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">Over 15 years serving mechanics, workshops, and car owners across Greater Accra. Our reputation is built on quality, honesty, and unmatched product knowledge.</p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: '✅', title: 'Authentic Parts Only', desc: 'Sourced from certified manufacturers. Zero counterfeits, guaranteed.' },
                  { icon: '⚡', title: 'Same-Day Availability', desc: 'Over 5,000 parts in stock. Most orders ready immediately.' },
                  { icon: '💰', title: 'Best Prices in Abossey Okai', desc: 'Fair, transparent pricing. MoMo and card accepted.' },
                  { icon: '🤝', title: 'Expert Guidance', desc: 'Our staff help you find the exact part for your vehicle make, model, and year.' },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-4 bg-[#161B26] border border-white/8 rounded-xl p-5 hover:border-[#C9A84C]/25 transition-colors">
                    <div className="w-12 h-12 min-w-[48px] bg-[#C9A84C]/10 rounded-lg flex items-center justify-center text-xl">{f.icon}</div>
                    <div>
                      <div className="text-[15px] font-bold text-white mb-1">{f.title}</div>
                      <div className="text-[13px] text-white/45">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="location">
              <div className="bg-[#161B26] border border-white/8 rounded-3xl p-8 sticky top-24">
                <h3 className="font-serif text-2xl font-bold text-white mb-6">Find Us</h3>
                <div className="flex flex-col gap-5">
                  {[
                    { icon: MapPin, label: 'Address', main: 'Behind UBA Bank', sub: 'Abossey Okai, Accra, Ghana' },
                    { icon: Phone, label: 'Phone & WhatsApp', main: '+233 24 755 9344', sub: 'Available 8am – 7pm daily' },
                    { icon: Clock, label: 'Business Hours', main: 'Mon – Sat: 8:00am – 7:00pm', sub: 'Sunday: 10:00am – 4:00pm' },
                    { icon: CreditCard, label: 'Payment', main: 'Cash · MTN MoMo · Telecel', sub: 'Vodafone Cash · Visa/Mastercard' },
                  ].map(({ icon: Icon, label, main, sub }) => (
                    <div key={label} className="flex items-start gap-4 pb-5 border-b border-white/8 last:border-0 last:pb-0">
                      <div className="w-10 h-10 min-w-[40px] bg-[#C9A84C]/10 rounded-lg flex items-center justify-center text-[#C9A84C]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] text-[#C9A84C] font-mono uppercase tracking-wider mb-0.5">{label}</div>
                        <div className="text-sm text-white font-semibold">{main}</div>
                        <div className="text-xs text-white/35 mt-0.5">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="mt-6 w-full bg-[#25D366] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.35)] text-white py-4 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all">
                  <MessageSquare className="w-5 h-5" /> Message Us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#0F1117] border-t border-white/8">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block font-mono text-[11px] tracking-[3px] uppercase text-[#C9A84C] mb-3">Common Questions</span>
            <h2 className="font-serif text-3xl font-bold text-white">FAQ</h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#161B26] border border-white/8 rounded-2xl overflow-hidden hover:border-[#C9A84C]/20 transition-colors">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 sm:p-6 text-left">
                  <span className="text-[15px] font-semibold text-white pr-4">{faq.q}</span>
                  <ChevronDown className={cn("w-5 h-5 text-[#C9A84C] shrink-0 transition-transform", activeFaq === i && "rotate-180")} />
                </button>
                {activeFaq === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-white/50 leading-relaxed border-t border-white/8 pt-4">
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-[#080A0F] border-t border-white/8">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-[#C9A84C]/10 to-[#E8C76A]/5 border border-[#C9A84C]/20 rounded-3xl p-10 sm:p-16">
            <div className="text-5xl mb-5">🔧</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-white mb-4">Can't Find Your Part?</h2>
            <p className="text-white/50 text-base mb-8 max-w-xl mx-auto">Just WhatsApp us your car details. Our team will locate the exact part you need — fast.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://wa.me/233247559344?text=Hello! I'm looking for a specific auto part. Can you help?" target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-8 py-4 rounded-full text-[15px] font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-all flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> WhatsApp Us Now
              </a>
              <a href="tel:+233247559344" className="bg-white/8 border border-white/15 text-white px-8 py-4 rounded-full text-[15px] font-bold hover:bg-white/15 transition-all flex items-center gap-2">
                <Phone className="w-5 h-5" /> Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080A0F] border-t border-white/8 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-xl">🔧</div>
                <div className="font-serif text-lg font-bold text-white">God's Way Enterprise</div>
              </div>
              <p className="text-white/35 text-[13px] leading-relaxed max-w-sm mb-5">Premier automotive parts dealer in Abossey Okai, Accra. Serving mechanics and car owners since 2010. Genuine parts, fair prices.</p>
              <a href="https://wa.me/233247559344" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] px-4 py-2 rounded-full text-sm font-bold hover:bg-[#25D366] hover:text-white transition-all">
                <MessageSquare className="w-4 h-4" /> +233 24 755 9344
              </a>
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#C9A84C] font-mono uppercase tracking-widest mb-4">Products</h5>
              <ul className="space-y-2.5">
                {['Body Parts', 'AC Parts', 'Lighting', 'Radiators', 'Cooling Fans'].map(link => (
                  <li key={link}><a href="#catalog" className="text-[13px] text-white/40 hover:text-[#C9A84C] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#C9A84C] font-mono uppercase tracking-widest mb-4">Company</h5>
              <ul className="space-y-2.5">
                {[['About', '#about'], ['Location', '#location'], ['Contact', 'https://wa.me/233247559344'], ['How to Order', '#']].map(([l, href]) => (
                  <li key={l}><a href={href} className="text-[13px] text-white/40 hover:text-[#C9A84C] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#C9A84C] font-mono uppercase tracking-widest mb-4">Staff</h5>
              <ul className="space-y-2.5">
                {[['Staff Login', '/login'], ['Dashboard', '/dashboard'], ['POS Terminal', '/dashboard']].map(([l, href]) => (
                  <li key={l}><a href={href} className="text-[13px] text-white/40 hover:text-[#C9A84C] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© 2026 God's Way Enterprise. Behind UBA Bank, Abossey Okai, Accra, Ghana.</p>
            <p className="text-xs text-white/15">Built with ❤️ for Ghana's auto industry</p>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 md:hidden z-50 p-4 bg-gradient-to-t from-[#080A0F] to-transparent safe-padding-bottom">
        <a href="https://wa.me/233247559344?text=Hello! I'm looking for auto parts. Can you help?" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-2xl font-bold text-[15px] shadow-[0_8px_32px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.6)] transition-all active:scale-[0.98]">
          <MessageSquare className="w-5 h-5" /> Order via WhatsApp
        </a>
      </div>
    </div>
  );
}
