import React, { useState } from 'react';

export default function PerfumeList({ perfumes, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmId, setShowConfirmId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter products by search term
  const filtered = perfumes.filter(p => {
    const brandName = p.brand?.name || '';
    const name = p.name || '';
    const desc = p.description || '';
    const slug = p.slug || '';
    const term = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(term) ||
           brandName.toLowerCase().includes(term) ||
           desc.toLowerCase().includes(term) ||
           slug.toLowerCase().includes(term);
  });

  const handleDeleteClick = (id) => {
    setShowConfirmId(id);
  };

  const handleConfirmDelete = async (id) => {
    setIsDeletingId(id);
    await onDelete(id);
    setIsDeletingId(null);
    setShowConfirmId(null);
  };

  const getImageUrl = (product) => {
    return product.img || (product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:8000/storage/${product.image}`) : '/lemale.jpg');
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') return `$${price.toFixed(2)}`;
    if (typeof price === 'string' && !price.startsWith('$')) return `$${parseFloat(price || 0).toFixed(2)}`;
    return price;
  };

  // Glassmorphism input style
  const inputBase = `w-full bg-white/[0.03] border border-white/[0.08] 
    rounded-xl px-4 py-3 outline-none text-white text-sm font-normal 
    transition-all duration-300 placeholder:text-white/20
    backdrop-blur-md
    hover:bg-white/[0.05] hover:border-white/20
    focus:bg-white/[0.07] focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_1px_2px_rgba(255,255,255,0.05)]`;

  return (
    <>
      {/* ==================== MAIN CONTENT ==================== */}
      <div className="space-y-6 animate-fadeIn bg-black min-h-screen p-6 md:p-10">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-light text-white tracking-tight">Perfumes</h1>
            <p className="text-white/30 text-xs mt-2 font-light uppercase tracking-[0.2em]">Catalog Inventory & Management</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-4 flex items-center text-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text"
              placeholder="Search name, brand, slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputBase} pl-11 pr-4`}
            />
          </div>
        </div>

        {/* Catalog Table Container */}
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-2xl">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.02]" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />
          
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="overflow-x-auto relative z-10">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold backdrop-blur-md">
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium">Perfume Details</th>
                  <th className="px-6 py-4 font-medium">Brand</th>
                  <th className="px-6 py-4 font-medium">Size</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((product) => {
                  const imgUrl = getImageUrl(product);
                  const brandName = product.brand?.name || 'N/A';
                  
                  return (
                    <tr 
                      key={product.id} 
                      onClick={() => setSelectedProduct(product)}
                      className="hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/[0.05] border border-white/[0.08] flex-shrink-0 group-hover:border-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300">
                          <img 
                            src={imgUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/lemale.jpg'; }}
                          />
                        </div>
                      </td>
                      
                      {/* Details */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium text-base tracking-wide group-hover:text-emerald-300 transition-colors duration-300">{product.name}</p>
                          <p className="text-white/20 text-xs font-mono mt-1 tracking-wider">{product.slug}</p>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 bg-white/[0.05] text-white/50 text-[10px] uppercase tracking-[0.15em] rounded-full font-medium border border-white/[0.08] backdrop-blur-sm">
                          {brandName}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="px-6 py-4 whitespace-nowrap text-white/30 font-light text-sm">
                        {product.size_ml} <span className="text-white/20 text-xs">ml</span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap text-white/80 font-medium text-sm tracking-wide">
                        {formatPrice(product.price)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(product);
                            }}
                            className="px-4 py-2 border border-white/[0.08] text-white/40 hover:border-white/30 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-300 font-medium text-[10px] uppercase tracking-wider backdrop-blur-sm"
                          >
                            Edit
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(product.id);
                            }}
                            className="px-4 py-2 border border-red-500/20 text-red-400/60 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40 rounded-lg transition-all duration-300 font-medium text-[10px] uppercase tracking-wider backdrop-blur-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center text-white/10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-white/20 text-sm font-light tracking-wide">No matching perfumes found in catalog.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== PRODUCT DETAIL MODAL (PORTAL) ==================== */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="w-full max-w-3xl relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient glow effects */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
            
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 backdrop-blur-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-5">
              {/* Left: Image */}
              <div className="md:col-span-2 relative bg-black/40">
                <div className="aspect-[3/4] md:aspect-auto md:h-full relative overflow-hidden">
                  <img 
                    src={getImageUrl(selectedProduct)} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/lemale.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r" />
                  
                  {/* Stock Badge */}
                  <div className="absolute top-5 left-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold border backdrop-blur-md
                      ${selectedProduct.stock > 10 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : selectedProduct.stock > 0 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }
                    `}>
                      {selectedProduct.stock > 10 ? 'In Stock' : selectedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Details */}
              <div className="md:col-span-3 p-8 md:p-10 flex flex-col">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-white/[0.05] text-white/40 text-[10px] uppercase tracking-[0.2em] rounded-full border border-white/[0.08]">
                      {selectedProduct.brand?.name || 'Unknown Brand'}
                    </span>
                    <span className="text-white/15 text-[10px] uppercase tracking-[0.2em]">
                      {selectedProduct.size_ml} ml
                    </span>
                  </div>
                  <h2 className="text-3xl font-light text-white tracking-wide leading-tight">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-white/20 text-xs font-mono mt-2 tracking-wider">{selectedProduct.slug}</p>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div className="mb-8">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-3">Description</h3>
                    <p className="text-white/50 text-sm leading-relaxed font-light">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.15em] mb-1">Price</p>
                    <p className="text-white font-semibold text-lg tracking-wide">{formatPrice(selectedProduct.price)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.15em] mb-1">Stock</p>
                    <p className={`font-semibold text-lg tracking-wide ${selectedProduct.stock > 0 ? 'text-white' : 'text-red-400'}`}>
                      {selectedProduct.stock} <span className="text-white/30 text-xs font-normal">units</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.15em] mb-1">Volume</p>
                    <p className="text-white font-semibold text-lg tracking-wide">{selectedProduct.size_ml} <span className="text-white/30 text-xs font-normal">ml</span></p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-6 border-t border-white/[0.06] flex items-center gap-3">
                  <button 
                    onClick={() => {
                      onEdit(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 bg-white text-black font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Product
                  </button>
                  <button 
                    onClick={() => {
                      handleDeleteClick(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                    className="px-6 py-3.5 rounded-xl border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40 transition-all duration-300 font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL (PORTAL) ==================== */}
      {showConfirmId && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <div className="w-full max-w-sm relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] backdrop-blur-xl p-6 shadow-2xl animate-scaleUp">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/[0.05] rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-lg font-light text-white mb-2 tracking-wide">Delete Scent</h3>
              <p className="text-white/30 text-xs font-light leading-relaxed mb-8 tracking-wide">
                Are you sure you want to delete this perfume listing? This action is permanent and cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowConfirmId(null)}
                  disabled={isDeletingId !== null}
                  className="px-5 py-2.5 border border-white/[0.08] text-white/30 text-xs uppercase tracking-[0.15em] font-medium rounded-xl hover:border-white/20 hover:text-white/60 hover:bg-white/[0.03] transition-all duration-300 disabled:opacity-30 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleConfirmDelete(showConfirmId)}
                  disabled={isDeletingId !== null}
                  className="px-5 py-2.5 bg-red-500/80 text-white text-xs uppercase tracking-[0.15em] font-medium rounded-xl hover:bg-red-500 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 backdrop-blur-sm"
                >
                  {isDeletingId ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Deleting</span>
                    </>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}