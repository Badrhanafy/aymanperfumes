import React, { useState, useEffect, useRef } from 'react';

export default function BrandManager() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandPerfumes, setBrandPerfumes] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Form fields
  const [newBrandName, setNewBrandName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const fetchBrands = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/brands')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch brands');
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setBrands(list);
        setLoading(false);
      })
      .catch(err => {
        console.warn('API fetch brands failed, using fallback:', err);
        setBrands([
          { id: 1, name: 'Jean Paul Gaultier', logo_url: null },
          { id: 2, name: 'Dior', logo_url: null },
          { id: 3, name: "L'Essence", logo_url: null },
          { id: 4, name: 'Tom Ford', logo_url: null },
          { id: 5, name: 'Byredo', logo_url: null }
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const getBrandLogo = (brand) => {
    if (brand.logo) return `http://localhost:8000/storage/${brand.logo}`;
    return null;
  };

  const fetchPerfumesByBrand = async (brandId) => {
    setModalLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/perfumes`);
      if (!res.ok) throw new Error('Failed to fetch perfumes');
      const data = await res.json();
      const allPerfumes = Array.isArray(data) ? data : (data.data || []);

      const relatedPerfumes = allPerfumes.filter(
        (perfume) => String(perfume.brand_id) === String(brandId)
      );
      
      setBrandPerfumes(relatedPerfumes);
    } catch (err) {
      console.error('Error fetching perfumes:', err);
      setBrandPerfumes([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    fetchPerfumesByBrand(brand.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedBrand(null);
      setBrandPerfumes([]);
    }, 300);
  };

  const handleLogoChange = (file) => {
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleLogoChange(file);
    } else {
      setMessage({ type: 'error', text: 'INVALID FORMAT. IMAGE REQUIRED.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      setMessage({ type: 'error', text: 'BRAND NAME REQUIRED.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', newBrandName);
    if (logoFile) formData.append('logo', logoFile);

    try {
      const res = await fetch('http://localhost:8000/api/brands', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create brand');

      setMessage({ type: 'success', text: 'RECORD PUBLISHED.' });
      setNewBrandName('');
      setLogoFile(null);
      setLogoPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchBrands();
    } catch (err) {
      setMessage({ type: 'error', text: 'SYSTEM ERROR. UPLOAD FAILED.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Glassmorphism input style
  const inputBase = `w-full bg-white/[0.03] border border-white/[0.08] 
    rounded-xl px-4 py-3 outline-none text-white text-sm font-normal 
    transition-all duration-300 placeholder:text-white/20
    backdrop-blur-md
    hover:bg-white/[0.05] hover:border-white/20
    focus:bg-white/[0.07] focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_1px_2px_rgba(255,255,255,0.05)]`;

  return (
    <div className="space-y-12 animate-fadeIn max-w-7xl mx-auto font-sans p-6 md:p-10 bg-black min-h-screen">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white uppercase">Houses</h1>
          <p className="text-white/30 text-xs mt-2 font-light tracking-[0.2em] uppercase">Curated Registry</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium tracking-[0.15em] uppercase pb-1 border-b border-transparent hover:border-white/40 text-white/40 hover:text-white transition-all duration-300"
        >
          {showForm ? 'Close Editor [X]' : 'Append Record [+]'}
        </button>
      </div>

      {/* Slide-down Form */}
      <div
        ref={formRef}
        className={`transition-all duration-700 cubic-bezier-smooth overflow-hidden ${showForm ? 'max-h-[800px] opacity-100 mb-12' : 'max-h-0 opacity-0 mb-0'}`}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-8 md:p-10 shadow-2xl">
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {message.text && (
              <div className={`mb-8 p-4 text-xs tracking-[0.15em] uppercase border rounded-xl backdrop-blur-md ${message.type === 'success' ? 'bg-white/[0.05] text-white border-white/[0.08]' : 'bg-red-500/[0.05] text-red-300 border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold mb-3">
                  01. House Designation
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="E.G. BYREDO"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold mb-3">
                  02. Insignia
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer backdrop-blur-md
                    ${isDragging ? 'border-white/40 bg-white/[0.05]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e.target.files[0])}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-6">
                      <img src={logoPreview} alt="Preview" className="h-32 object-contain opacity-80" />
                      <span className="text-[10px] tracking-[0.2em] text-white/40 border-b border-white/20 pb-1 uppercase">Overwrite File</span>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="w-12 h-12 mx-auto mb-4 border border-white/[0.08] rounded-full flex items-center justify-center text-white/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Drop Image Assets</p>
                      <p className="text-[10px] text-white/20 mt-3 tracking-wider">PNG / JPG / WEBP — MAX 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-white text-black text-xs uppercase tracking-[0.15em] font-bold rounded-xl hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Processing</span>
                    </>
                  ) : (
                    <span>Commit Entry</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* SINGLE ROW BRANDS STRIP */}
      <div>
        {loading ? (
          <div className="py-32 flex justify-center">
            <div className="w-12 h-12 border-2 border-white/[0.08] border-t-white/40 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-px bg-white/[0.03] border border-white/[0.08] custom-scrollbar-horizontal pb-1 rounded-3xl backdrop-blur-md">
            {brands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleBrandClick(brand)}
                className="flex-none w-56 sm:w-64 group flex flex-col items-center justify-center p-8 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 cursor-pointer min-h-[260px] relative overflow-hidden border-r border-white/[0.06] last:border-r-0"
              >
                <div className="absolute top-3 left-3 text-[9px] font-mono text-white/10 group-hover:text-white/30 transition-colors tracking-wider">
                  {String(brand.id).padStart(3, '0')}
                </div>
                
                <div className="w-24 h-24 flex items-center justify-center mb-6 opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110">
                  {getBrandLogo(brand) ? (
                    <img src={getBrandLogo(brand)} alt={brand.name} className="w-full h-full object-contain filter brightness-75 group-hover:brightness-100 transition-all duration-500" />
                  ) : (
                    <span className="text-5xl font-thin text-white/10">{brand.name.charAt(0)}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-white/60 text-center tracking-[0.15em] uppercase w-full truncate group-hover:text-white/90 transition-colors duration-300">{brand.name}</p>
              </div>
            ))}

            {brands.length === 0 && (
              <div className="w-full py-32 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center text-white/10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-white/20 text-sm font-light tracking-wide">No Records Found</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-12 animate-modalGlass">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
          
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-modalContent">
            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between p-8 border-b border-white/[0.08]">
              <div>
                <h2 className="text-3xl font-light tracking-tight text-white uppercase">{selectedBrand?.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                  <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase">Linked Inventory</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-xs font-medium tracking-[0.15em] uppercase text-white/30 hover:text-white/70 transition-colors"
              >
                [ CLOSE ]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-vertical p-8">
              {modalLoading ? (
                <div className="py-32 flex justify-center">
                  <div className="w-10 h-10 border-2 border-white/[0.08] border-t-white/40 rounded-full animate-spin"></div>
                </div>
              ) : brandPerfumes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {brandPerfumes.map((perfume) => (
                    <div key={perfume.id} className="group flex bg-white/[0.02] border border-white/[0.08] hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/[0.04]">
                      <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center border-r border-white/[0.06] overflow-hidden bg-white/[0.02]">
                        {perfume.image ? (
                          <img src={`http://localhost:8000/storage/${perfume.image}`} alt={perfume.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                        ) : (
                          <span className="text-[10px] text-white/10 tracking-widest">NO ASSET</span>
                        )}
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-center">
                        <p className="text-sm font-medium text-white/80 uppercase tracking-widest mb-1">{perfume.name}</p>
                        <p className="text-xs text-white/20 italic mb-4">{selectedBrand?.name}</p>
                        
                        <div className="flex items-center justify-between mt-auto text-[11px]">
                          <span className="bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 rounded-md text-white/40 tracking-wider">{perfume.size_ml} ML</span>
                          <span className="font-medium text-white/80 tracking-wide">${parseFloat(perfume.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 border border-white/[0.08] rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl font-light text-white/20">!</span>
                  </div>
                  <h3 className="text-lg font-light tracking-widest text-white/60 uppercase">Zero Records</h3>
                  <p className="text-xs text-white/20 mt-3 tracking-widest">NO FRAGRANCES LINKED TO THIS HOUSE.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes modalGlass {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(16px); }
        }
        .animate-modalGlass {
          animation: modalGlass 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes modalContent {
          from { opacity: 0; transform: scale(0.98) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalContent {
          animation: modalContent 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .cubic-bezier-smooth {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Horizontal Scrollbar for Brands Strip */
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Vertical Scrollbar for Modal */
        .custom-scrollbar-vertical::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-vertical::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-vertical::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar-vertical::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}