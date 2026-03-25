import React, { useState, useMemo } from 'react';
import { useStore, Product } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Search, Plus, Upload, Edit, BarChart2, Trash2, X, ArrowUpDown, Package, AlertTriangle, CheckCircle2, QrCode, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { uploadImageToStorage } from '../../services/storageService';

export default function Inventory() {
  const user = useStore(state => state.user);
  const isOwner = user?.role === 'owner';
  const products = useStore(state => state.products);
  const updateProductStock = useStore(state => state.updateProductStock);
  const updateProductImage = useStore(state => state.updateProductImage);
  const addProduct = useStore(state => state.addProduct);
  const deleteProduct = useStore(state => state.deleteProduct);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRangeFilter, setPriceRangeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [stockAdjustValue, setStockAdjustValue] = useState<string>('');
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<(string | number)[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: 'Body Parts',
    cost: 0,
    price: 0,
    stock: 0,
    compat: '',
    emoji: '📦',
    status: 'in'
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      
      let matchesPrice = true;
      if (priceRangeFilter === 'under-500') matchesPrice = p.price < 500;
      else if (priceRangeFilter === '500-1000') matchesPrice = p.price >= 500 && p.price <= 1000;
      else if (priceRangeFilter === '1000-5000') matchesPrice = p.price > 1000 && p.price <= 5000;
      else if (priceRangeFilter === 'over-5000') matchesPrice = p.price > 5000;

      return matchesSearch && matchesStatus && matchesCategory && matchesPrice;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'stock-asc': return a.stock - b.stock;
        case 'stock-desc': return b.stock - a.stock;
        default: return 0;
      }
    });

    return result;
  }, [products, searchQuery, statusFilter, categoryFilter, priceRangeFilter, sortBy]);

  const handleStockAdjust = () => {
    if (selectedProduct && stockAdjustValue !== '') {
      const newStock = parseInt(stockAdjustValue);
      if (!isNaN(newStock) && newStock >= 0) {
        updateProductStock(selectedProduct.id, newStock);
        setSelectedProduct({ ...selectedProduct, stock: newStock, status: newStock === 0 ? 'out' : newStock <= 5 ? 'low' : 'in' });
        setStockAdjustValue('');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId?: string | number) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImageToStorage(file, 'inventory');
        if (productId) {
          updateProductImage(productId, imageUrl);
          setSelectedProduct(prev => prev ? { ...prev, image: imageUrl } : null);
        } else {
          setNewProductImage(imageUrl);
        }
      } catch (error) {
        console.error('Upload failed', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sku) {
      alert('Please fill in required fields (Name, SKU)');
      return;
    }
    const productToAdd: Omit<Product, 'id'> = {
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category || 'Body Parts',
      cost: Number(newProduct.cost) || 0,
      price: Number(newProduct.price) || 0,
      stock: Number(newProduct.stock) || 0,
      compat: newProduct.compat || '',
      emoji: newProduct.emoji || '📦',
      status: Number(newProduct.stock) === 0 ? 'out' : Number(newProduct.stock) <= 5 ? 'low' : 'in',
      image: newProductImage || undefined
    };
    
    await addProduct(productToAdd);
    setIsAddModalOpen(false);
    setNewProductImage(null);
    setNewProduct({ name: '', sku: '', category: 'Body Parts', cost: 0, price: 0, stock: 0, compat: '', emoji: '📦', status: 'in' });
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
    }
  };

  const handlePrintQR = () => {
    if (!qrProduct) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgElement = document.getElementById('qr-code-svg');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${qrProduct.name}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .label {
              text-align: center;
              padding: 20px;
              border: 1px dashed #ccc;
              border-radius: 12px;
            }
            .name { font-size: 18px; font-weight: bold; margin-top: 16px; margin-bottom: 4px; }
            .sku { font-family: monospace; color: #666; margin-bottom: 8px; }
            .price { font-size: 20px; font-weight: bold; }
            @media print {
              body { height: auto; }
              .label { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            ${svgData}
            <div class="name">${qrProduct.name}</div>
            <div class="sku">${qrProduct.sku}</div>
            <div class="price">GHS ${qrProduct.price.toLocaleString()}</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2 bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 flex-1 max-w-[340px] focus-within:border-[#C9A84C] transition-colors">
            <Search className="w-4 h-4 text-[#8A90A8]" />
            <input 
              type="text" 
              placeholder="Search products by name, SKU, category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#0A0C14] placeholder:text-[#8A90A8]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all appearance-none min-w-[140px]"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all appearance-none min-w-[140px]"
          >
            <option value="All">All Stock Levels</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <select
            value={priceRangeFilter}
            onChange={(e) => setPriceRangeFilter(e.target.value)}
            className="bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all appearance-none min-w-[140px]"
          >
            <option value="All">All Prices</option>
            <option value="under-500">Under GHS 500</option>
            <option value="500-1000">GHS 500 - GHS 1,000</option>
            <option value="1000-5000">GHS 1,000 - GHS 5,000</option>
            <option value="over-5000">Over GHS 5,000</option>
          </select>
          <div className="flex items-center gap-2 bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 focus-within:border-[#C9A84C] transition-colors">
            <ArrowUpDown className="w-4 h-4 text-[#8A90A8]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-[#0A0C14] appearance-none pr-4"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedForCompare.length > 0 && (
            <button onClick={() => setIsCompareModalOpen(true)} className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E2E6EF] text-[#4A5270] px-4 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#E2E6EF] transition-colors">
              Compare ({selectedForCompare.length})
            </button>
          )}
          {isOwner && (
            <>
              <button className="flex items-center gap-2 bg-white border border-[#E2E6EF] text-[#4A5270] px-4 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#F7F8FA] transition-colors">
                <Upload className="w-4 h-4" /> Import CSV
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-2.5 rounded-xl text-[13px] font-bold hover:-translate-y-0.5 transition-transform">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden flex-1 flex flex-col">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F7F8FA] border-b border-[#E2E6EF] z-10">
              <tr>
                <th className="p-3 px-4 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[#E2E6EF] text-[#C9A84C] focus:ring-[#C9A84C]"
                    checked={filteredProducts.length > 0 && selectedForCompare.length === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForCompare(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedForCompare([]);
                      }
                    }}
                  />
                </th>
                <th className="p-3 px-4 w-12"></th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">SKU</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Product Name</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Category</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Cost</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Price</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Stock</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Status</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => (
                <tr 
                  key={p.id} 
                  className={cn(
                    "border-b border-[#E2E6EF] last:border-0 hover:bg-[#F7F8FA] transition-colors cursor-pointer",
                    p.status === 'low' && "bg-[#F39C12]/5 hover:bg-[#F39C12]/10",
                    p.status === 'out' && "bg-[#E63946]/5 hover:bg-[#E63946]/10"
                  )}
                  onClick={() => setSelectedProduct(p)}
                >
                  <td className="p-3.5 px-4" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[#E2E6EF] text-[#C9A84C] focus:ring-[#C9A84C]"
                      checked={selectedForCompare.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedForCompare(prev => [...prev, p.id]);
                        } else {
                          setSelectedForCompare(prev => prev.filter(id => id !== p.id));
                        }
                      }}
                    />
                  </td>
                  <td className="p-3.5 px-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E6EF] flex items-center justify-center text-xl shadow-sm overflow-hidden">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
                    </div>
                  </td>
                  <td className="p-3.5 px-4"><span className="font-mono text-[11px] text-[#C9A84C]">{p.sku}</span></td>
                  <td className="p-3.5 px-4 font-semibold text-[#0A0C14] max-w-[200px] truncate">{p.name}</td>
                  <td className="p-3.5 px-4">
                    <span className="bg-[#F7F8FA] border border-[#E2E6EF] px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#4A5270]">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-3.5 px-4 text-[13px] text-[#4A5270]">GHS {p.cost.toLocaleString()}</td>
                  <td className="p-3.5 px-4 font-semibold text-[#0A0C14]">GHS {p.price.toLocaleString()}</td>
                  <td className="p-3.5 px-4 font-bold text-[#0A0C14]">{p.stock}</td>
                  <td className="p-3.5 px-4">
                    <span className={cn(
                      "inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border",
                      p.status === 'in' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                      p.status === 'low' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                      "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                    )}>
                      {p.status === 'in' ? 'In Stock' : p.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-3.5 px-4">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setQrProduct(p)} className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors" title="Generate QR Code">
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      {isOwner && (
                        <>
                          <button className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                            <BarChart2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#F7F8FA]">
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              className={cn(
                "bg-white border border-[#E2E6EF] rounded-xl p-4 flex flex-col gap-3 shadow-sm cursor-pointer",
                p.status === 'low' && "border-[#F39C12]/30 bg-[#F39C12]/5",
                p.status === 'out' && "border-[#E63946]/30 bg-[#E63946]/5"
              )}
              onClick={() => setSelectedProduct(p)}
            >
              <div className="flex items-start gap-3">
                <div className="pt-1" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[#E2E6EF] text-[#C9A84C] focus:ring-[#C9A84C]"
                    checked={selectedForCompare.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForCompare(prev => [...prev, p.id]);
                      } else {
                        setSelectedForCompare(prev => prev.filter(id => id !== p.id));
                      }
                    }}
                  />
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#F7F8FA] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[#0A0C14] leading-snug mb-1">{p.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#C9A84C]">{p.sku}</span>
                    <span className="w-1 h-1 rounded-full bg-[#E2E6EF]" />
                    <span className="text-[11px] text-[#8A90A8]">{p.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Price</span>
                  <span className="text-[14px] font-bold text-[#0A0C14]">GHS {p.price.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider mb-0.5">Status</span>
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                    p.status === 'in' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                    p.status === 'low' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                    "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                  )}>
                    {p.status === 'in' ? 'In Stock' : p.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E6EF]">
                <div className="text-[12px] font-medium text-[#4A5270]">{p.stock} units left</div>
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setQrProduct(p)} className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors" title="Generate QR Code">
                    <QrCode className="w-4 h-4" />
                  </button>
                  {isOwner && (
                    <>
                      <button className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-[500px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
            >
              <div className="p-6 pb-5 border-b border-[#E2E6EF] flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-[#0A0C14] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#C9A84C]" /> Product Details
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQrProduct(selectedProduct)} className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E2E6EF] text-[#4A5270] px-3 py-1.5 rounded-lg text-[13px] font-medium hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                    <QrCode className="w-4 h-4" /> QR Code
                  </button>
                  <button onClick={() => { setSelectedProduct(null); setStockAdjustValue(''); }} className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#8A90A8] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-7 overflow-y-auto">
                <div className="flex items-start gap-5 mb-6">
                  <div className="relative w-20 h-20 rounded-2xl bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-4xl shadow-sm shrink-0 overflow-hidden group">
                    {selectedProduct.image ? (
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedProduct.emoji
                    )}
                    {isOwner && (
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-5 h-5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, selectedProduct.id)} />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-[#0A0C14] mb-1 leading-tight">{selectedProduct.name}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[12px] text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-md">{selectedProduct.sku}</span>
                      <span className="text-[12px] text-[#8A90A8] bg-[#F7F8FA] px-2 py-0.5 rounded-md border border-[#E2E6EF]">{selectedProduct.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selectedProduct.status === 'in' ? <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> : 
                       selectedProduct.status === 'low' ? <AlertTriangle className="w-4 h-4 text-[#F39C12]" /> : 
                       <AlertTriangle className="w-4 h-4 text-[#E63946]" />}
                      <span className={cn(
                        "text-[13px] font-bold",
                        selectedProduct.status === 'in' ? "text-[#2ECC71]" : 
                        selectedProduct.status === 'low' ? "text-[#F39C12]" : "text-[#E63946]"
                      )}>
                        {selectedProduct.status === 'in' ? 'In Stock' : selectedProduct.status === 'low' ? 'Low Stock' : 'Out of Stock'} ({selectedProduct.stock} units)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl p-4">
                    <div className="text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider mb-1">Cost Price</div>
                    <div className="text-lg font-bold text-[#4A5270]">GHS {selectedProduct.cost.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl p-4">
                    <div className="text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider mb-1">Selling Price</div>
                    <div className="text-lg font-bold text-[#0A0C14]">GHS {selectedProduct.price.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[12px] font-semibold text-[#0A0C14] mb-2">Compatibility</div>
                  <div className="text-[13px] text-[#4A5270] bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl p-3">
                    {selectedProduct.compat}
                  </div>
                </div>

                <div className="border-t border-[#E2E6EF] pt-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[#0A0C14] mb-3">Quick Stock Adjustment</div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="0"
                        placeholder="New Stock Qty" 
                        value={stockAdjustValue}
                        onChange={e => setStockAdjustValue(e.target.value)}
                        className="flex-1 bg-white border border-[#E2E6EF] rounded-xl px-4 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={handleStockAdjust}
                        disabled={stockAdjustValue === ''}
                        className="bg-[#0A0C14] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#C9A84C] transition-colors disabled:opacity-50 disabled:hover:bg-[#0A0C14]"
                      >
                        Update Stock
                      </button>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="ml-6 pl-6 border-l border-[#E2E6EF] flex flex-col items-center justify-center">
                      <div className="text-[13px] font-bold text-[#E63946] mb-3">Danger Zone</div>
                      <button 
                        onClick={() => handleDeleteProduct(selectedProduct.id)}
                        className="bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#E63946] hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-[560px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 pb-5 border-b border-[#E2E6EF] flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-[#0A0C14]">Add New Product</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#8A90A8] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-7 overflow-y-auto flex-1">
                <div className="mb-5 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-4xl shadow-sm shrink-0 overflow-hidden relative">
                    {newProductImage ? (
                      <img src={newProductImage} alt="New Product" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#8A90A8] text-sm font-medium">No Img</span>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Product Image</label>
                    <label className="inline-flex items-center gap-2 bg-white border border-[#E2E6EF] text-[#4A5270] px-4 py-2 rounded-xl text-[13px] font-medium hover:bg-[#F7F8FA] transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" /> Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Product Name *</label>
                    <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Toyota Corolla Radiator" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">SKU / Part No. *</label>
                    <input type="text" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="GWE-RAD-001" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Category *</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all appearance-none">
                      <option>Body Parts</option><option>AC Parts</option><option>Lighting</option>
                      <option>Radiators</option><option>Cooling Fans</option>
                      <option>Radiator Supports</option><option>Reinforcement Bars</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Emoji Icon</label>
                    <input type="text" value={newProduct.emoji} onChange={e => setNewProduct({...newProduct, emoji: e.target.value})} placeholder="📦" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Cost Price (GHS) *</label>
                    <input type="number" value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: Number(e.target.value)})} placeholder="0.00" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Selling Price (GHS) *</label>
                    <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} placeholder="0.00" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Initial Stock Qty</label>
                    <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} placeholder="0" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Reorder Point</label>
                    <input type="number" placeholder="5" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Compatible Cars</label>
                  <input type="text" value={newProduct.compat} onChange={e => setNewProduct({...newProduct, compat: e.target.value})} placeholder="Toyota Corolla 2010-2018, Toyota Camry 2012-2016..." className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Description</label>
                  <textarea rows={3} placeholder="Detailed product description..." className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all resize-none" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Warehouse Bin Location</label>
                  <input type="text" placeholder="e.g. A-3-12 (Aisle A, Shelf 3, Bin 12)" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
                </div>
              </div>
              
              <div className="p-5 px-7 border-t border-[#E2E6EF] flex justify-end gap-2.5 bg-[#F7F8FA] shrink-0">
                <button onClick={() => { setIsAddModalOpen(false); setNewProductImage(null); }} className="bg-white border border-[#E2E6EF] text-[#4A5270] px-5 py-2.5 rounded-xl text-[14px] font-medium hover:bg-[#F7F8FA] transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddProduct} className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-6 py-2.5 rounded-xl text-[14px] font-bold hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]">
                  💾 Save Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrProduct && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-[360px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
            >
              <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between shrink-0 no-print">
                <h3 className="text-lg font-bold text-[#0A0C14]">Product QR Code</h3>
                <button onClick={() => setQrProduct(null)} className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#8A90A8] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center bg-[#F7F8FA] print-receipt">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E6EF] mb-6">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={`Product: ${qrProduct.name}\nSKU: ${qrProduct.sku}\nPrice: GHS ${qrProduct.price.toLocaleString()}`} 
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center">
                  <div className="font-bold text-[#0A0C14] text-lg mb-1">{qrProduct.name}</div>
                  <div className="text-[#8A90A8] font-mono text-sm mb-2">{qrProduct.sku}</div>
                  <div className="text-[#C9A84C] font-bold text-xl">GHS {qrProduct.price.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="p-5 px-6 border-t border-[#E2E6EF] bg-white flex gap-3 no-print">
                <button onClick={handlePrintQR} className="flex-1 bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black py-2.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform">
                  <Printer className="w-4 h-4" /> Print Label
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {isCompareModalOpen && selectedForCompare.length > 0 && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-[900px] max-h-[90vh] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
            >
              <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-[#0A0C14]">Compare Products</h3>
                <button onClick={() => setIsCompareModalOpen(false)} className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#8A90A8] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-auto flex-1 bg-[#F7F8FA]">
                <div className="flex gap-6 min-w-max">
                  {products.filter(p => selectedForCompare.includes(p.id)).map(p => (
                    <div key={p.id} className="w-[280px] bg-white border border-[#E2E6EF] rounded-xl overflow-hidden shadow-sm flex flex-col">
                      <div className="aspect-square bg-[#F7F8FA] flex items-center justify-center text-6xl relative border-b border-[#E2E6EF]">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
                        <button 
                          onClick={() => {
                            setSelectedForCompare(prev => prev.filter(id => id !== p.id));
                            if (selectedForCompare.length === 1) setIsCompareModalOpen(false);
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center text-[#8A90A8] hover:text-[#E63946] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div>
                          <div className="font-mono text-[10px] text-[#C9A84C] tracking-wider mb-1">{p.sku}</div>
                          <div className="text-[14px] font-bold text-[#0A0C14] leading-snug">{p.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                          <div className="flex flex-col">
                            <span className="text-[#8A90A8] uppercase tracking-wider text-[9px]">Price</span>
                            <span className="font-bold text-[#0A0C14]">GHS {p.price.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#8A90A8] uppercase tracking-wider text-[9px]">Cost</span>
                            <span className="font-semibold text-[#4A5270]">GHS {p.cost.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#8A90A8] uppercase tracking-wider text-[9px]">Stock</span>
                            <span className="font-bold text-[#0A0C14]">{p.stock}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#8A90A8] uppercase tracking-wider text-[9px]">Status</span>
                            <span className={cn(
                              "inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono border w-max mt-0.5",
                              p.status === 'in' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                              p.status === 'low' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                              "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                            )}>
                              {p.status === 'in' ? 'In Stock' : p.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-[#E2E6EF]">
                          <span className="text-[#8A90A8] uppercase tracking-wider text-[9px] block mb-1">Compatibility</span>
                          <span className="text-[11px] text-[#4A5270]">{p.compat}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
