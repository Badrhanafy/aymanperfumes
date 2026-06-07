import React, { useState } from 'react';

export default function PerfumeList({ perfumes, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmId, setShowConfirmId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

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

  // Glassmorphism input style
  const inputBase = `w-full bg-white/[0.03] border border-white/[0.08] 
    rounded-xl px-4 py-3 outline-none text-white text-sm font-normal 
    transition-all duration-300 placeholder:text-white/20
    backdrop-blur-md
    hover:bg-white/[0.05] hover:border-white/20
    focus:bg-white/[0.07] focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_1px_2px_rgba(255,255,255,0.05)]`;

  return (
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
                const imgUrl = product.img || (product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:8000/storage/${product.image}`) : '/lemale.jpg');
                const brandName = product.brand?.name || 'N/A';
                
                let displayPrice = product.price;
                if (typeof displayPrice === 'number') {
                  displayPrice = `$${displayPrice.toFixed(2)}`;
                } else if (typeof displayPrice === 'string' && !displayPrice.startsWith('$')) {
                  displayPrice = `$${parseFloat(displayPrice || 0).toFixed(2)}`;
                }

                return (
                  <tr key={product.id} className="hover:bg-white/[0.03] transition-all duration-300 group">
                    {/* Thumbnail */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/[0.05] border border-white/[0.08] flex-shrink-0 group-hover:border-white/20 transition-all duration-300">
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
                        <p className="text-white font-medium text-base tracking-wide">{product.name}</p>
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
                      {displayPrice}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => onEdit(product)}
                          className="px-4 py-2 border border-white/[0.08] text-white/40 hover:border-white/30 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-300 font-medium text-[10px] uppercase tracking-wider backdrop-blur-sm"
                        >
                          Edit
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteClick(product.id)}
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

      {/* Confirmation Modal */}
      {showConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 shadow-2xl animate-scaleUp">
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
    </div>
  );
}