import React, { useState, useEffect } from 'react';

export default function PerfumeForm({ perfume, onSubmit, onCancel }) {
  const isEdit = !!perfume;

  const [formData, setFormData] = useState({
    brand_id: '',
    name: '',
    description: '',
    size_ml: '',
    price: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch brands on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/brands')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch brands');
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setBrands(list);
        setLoadingBrands(false);
      })
      .catch(err => {
        console.warn('Could not fetch brands, using defaults:', err);
        setBrands([
          { id: 1, name: 'Jean Paul Gaultier' },
          { id: 2, name: 'Dior' },
          { id: 3, name: "L'Essence" }
        ]);
        setLoadingBrands(false);
      });
  }, []);

  // Pre-fill form if editing
  useEffect(() => {
    if (perfume) {
      setFormData({
        brand_id: perfume.brand_id || '',
        name: perfume.name || '',
        description: perfume.description || '',
        size_ml: perfume.size_ml || '',
        price: perfume.price || '',
      });
      if (perfume.image) {
        setImagePreview(perfume.image.startsWith('http') ? perfume.image : `http://localhost:8000/storage/${perfume.image}`);
      } else if (perfume.img) {
        setImagePreview(perfume.img);
      } else {
        setImagePreview('');
      }
    } else {
      setFormData({
        brand_id: '',
        name: '',
        description: '',
        size_ml: '',
        price: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
    setErrors({});
  }, [perfume]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const newErrors = {};
    if (!formData.brand_id) newErrors.brand_id = 'Brand is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.size_ml || parseInt(formData.size_ml) <= 0) newErrors.size_ml = 'Size must be greater than 0';
    if (!formData.price || parseFloat(formData.price) < 0) newErrors.price = 'Price must be 0 or greater';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('brand_id', formData.brand_id);
    data.append('name', formData.name);
    data.append('description', formData.description || '');
    data.append('size_ml', formData.size_ml);
    data.append('price', formData.price);

    if (imageFile) {
      data.append('image', imageFile);
    }

    if (isEdit) {
      data.append('_method', 'PUT');
    }

    try {
      await onSubmit(data, perfume?.id);
    } catch (err) {
      console.error(err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'Something went wrong' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable glassmorphism input classes
  const inputBase = `w-full bg-white/[0.03] border border-white/[0.08] 
    rounded-xl px-4 py-3 outline-none text-white text-sm font-normal 
    transition-all duration-300 placeholder:text-white/20
    backdrop-blur-md
    hover:bg-white/[0.05] hover:border-white/20
    focus:bg-white/[0.07] focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_1px_2px_rgba(255,255,255,0.05)]`;

  const inputError = `border-red-500/50 bg-red-500/[0.05] 
    focus:border-red-400 focus:shadow-[0_0_20px_rgba(239,68,68,0.1),inset_0_1px_2px_rgba(239,68,68,0.05)]`;

  const inputNormal = `border-white/[0.08]`;

  const labelBase = `text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold mb-2 block`;

  return (
    <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl p-8 md:p-10 shadow-2xl bg-black">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-sm" />
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Ambient glow effects */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Form Header */}
        <div className="mb-10 pb-6 border-b border-white/[0.08]">
          <h2 className="text-3xl font-light text-white tracking-tight">
            {isEdit ? 'Edit Scent' : 'Add New Fragrance'}
          </h2>
          <p className="text-white/30 text-xs mt-2 uppercase tracking-[0.2em]">
            {isEdit ? 'Refine the essence' : 'Curate a new masterpiece'}
          </p>
        </div>

        {/* General Error Alert */}
        {errors.general && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] backdrop-blur-md text-red-300/80 text-xs font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            
            {/* Left Column */}
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className={labelBase}>
                  Fragrance Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                  placeholder="e.g. Sauvage Essence"
                />
                {errors.name && (
                  <span className="text-red-400/80 text-[10px] font-medium mt-1.5 block tracking-wide">
                    {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                  </span>
                )}
              </div>

              {/* Brand Dropdown */}
              <div>
                <label className={labelBase}>
                  Maison / Brand
                </label>
                <div className="relative">
                  <select
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.brand_id ? inputError : inputNormal} appearance-none cursor-pointer pr-10`}
                  >
                    <option value="" className="bg-gray-900 text-white/30">Select a House</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id} className="bg-gray-900 text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {/* Custom chevron */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                {errors.brand_id && (
                  <span className="text-red-400/80 text-[10px] font-medium mt-1.5 block tracking-wide">
                    {Array.isArray(errors.brand_id) ? errors.brand_id[0] : errors.brand_id}
                  </span>
                )}
              </div>

              {/* Size & Price Row */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelBase}>
                    Volume (ml)
                  </label>
                  <input 
                    type="number" 
                    name="size_ml"
                    min="1"
                    value={formData.size_ml}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.size_ml ? inputError : inputNormal}`}
                    placeholder="100"
                  />
                  {errors.size_ml && (
                    <span className="text-red-400/80 text-[10px] font-medium mt-1.5 block tracking-wide">
                      {Array.isArray(errors.size_ml) ? errors.size_ml[0] : errors.size_ml}
                    </span>
                  )}
                </div>

                <div>
                  <label className={labelBase}>
                    Price ($)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.price ? inputError : inputNormal}`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <span className="text-red-400/80 text-[10px] font-medium mt-1.5 block tracking-wide">
                      {Array.isArray(errors.price) ? errors.price[0] : errors.price}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Image Upload Area */}
              <div>
                <label className={labelBase}>
                  Visual Presentation
                </label>
                <div className={`relative border border-white/[0.08] bg-white/[0.03] rounded-xl overflow-hidden group h-52 cursor-pointer hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 backdrop-blur-md`}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75" 
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="text-white/90 text-[10px] uppercase tracking-[0.2em] font-medium border border-white/30 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md">
                          Replace Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                      <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center text-white/20 group-hover:border-white/30 group-hover:text-white/40 transition-all duration-300 bg-white/[0.02]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/40 font-medium tracking-wide">Drop or click to upload</p>
                        <p className="text-[9px] text-white/20 mt-1.5 tracking-wider">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {errors.image && (
                  <span className="text-red-400/80 text-[10px] font-medium mt-1.5 block tracking-wide">
                    {Array.isArray(errors.image) ? errors.image[0] : errors.image}
                  </span>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className={labelBase}>
                  Olfactory Story
                </label>
                <textarea 
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputBase} resize-none`}
                  placeholder="Describe the scent journey, notes, and inspiration..."
                ></textarea>
                {errors.description && (
                  <span className="text-red-400/80 text-[10px] font-medium mt-1.5 block tracking-wide">
                    {errors.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-white/[0.08]">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.15em] font-medium rounded-xl hover:border-white/20 hover:text-white/70 hover:bg-white/[0.03] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-3 bg-white text-black text-xs uppercase tracking-[0.15em] font-bold rounded-xl hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Saving Essence</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Publish Fragrance'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}