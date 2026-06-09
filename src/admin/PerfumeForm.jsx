import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function PerfumeForm({ perfume, onSubmit, onCancel }) {
  const isEdit = !!perfume;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    brand_id: '',
    name: '',
    description: '',
    size_ml: '',
    price: '',
    stock: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [brands, setBrands] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch brands
  useEffect(() => {
    fetch('http://localhost:8000/api/brands', {
      headers: { Accept: 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setBrands(list);
      })
      .catch(() => {
        setBrands([
          { id: 1, name: 'Jean Paul Gaultier' },
          { id: 2, name: 'Dior' },
          { id: 3, name: "L'Essence" },
        ]);
      });
  }, []);

  // Fill form on edit - separated into a memoized function to avoid re-renders
  const initializeForm = useCallback(() => {
    if (perfume) {
      setFormData({
        brand_id: perfume.brand_id || '',
        name: perfume.name || '',
        description: perfume.description || '',
        size_ml: perfume.size_ml || '',
        price: perfume.price || '',
        stock: perfume.stock || '',
      });
      setImagePreview(
        perfume.image
          ? perfume.image.startsWith('http')
            ? perfume.image
            : `http://localhost:8000/storage/${perfume.image}`
          : ''
      );
      setImageFile(null);
    } else {
      setFormData({
        brand_id: '',
        name: '',
        description: '',
        size_ml: '',
        price: '',
        stock: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
    setErrors({});
  }, [perfume]);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  // Memoized change handler to prevent unnecessary re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Only update if value actually changed
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = useCallback((file) => {
    if (!file) return;
    
    // Clean up old preview
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) setErrors(prev => ({ ...prev, image: null }));
  }, [imagePreview, errors.image]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleImageChange(e.dataTransfer.files[0]);
  }, [handleImageChange]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.brand_id) newErrors.brand_id = 'Please select a brand';
    if (!formData.name?.trim()) newErrors.name = 'Perfume name is required';
    if (!formData.size_ml || Number(formData.size_ml) <= 0) newErrors.size_ml = 'Enter a valid size in ml';
    if (!formData.price || Number(formData.price) < 0) newErrors.price = 'Enter a valid price';
    if (!formData.stock || Number(formData.stock) < 0) newErrors.stock = 'Enter a valid stock quantity';
    return newErrors;
  }, [formData.brand_id, formData.name, formData.size_ml, formData.price, formData.stock]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('brand_id', formData.brand_id);
    data.append('name', formData.name);
    data.append('description', formData.description || '');
    data.append('size_ml', Number(formData.size_ml));
    data.append('price', Number(formData.price));
    data.append('stock', Number(formData.stock));
    if (imageFile) data.append('image', imageFile);
    if (isEdit) data.append('_method', 'PUT');

    try {
      await onSubmit(data, perfume?.id);
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, imageFile, isEdit, perfume?.id, onSubmit, validate]);

  // --- Reusable Input Component with proper value handling ---
  const FloatingInput = React.memo(({ name, type = 'text', label, icon, min, step }) => {
    const isFocused = focusedField === name;
    const hasValue = formData[name]?.toString().length > 0;
    const error = errors[name];

    // Handle number inputs properly to prevent typing interruptions
    const handleLocalChange = (e) => {
      let { value } = e.target;
      
      if (type === 'number') {
        // Allow empty string for user to clear the field
        if (value === '') {
          handleChange({ target: { name, value: '' } });
          return;
        }
        
        // For number inputs, allow typing intermediate values
        if (min === '0') {
          // Allow only numbers and decimal point
          if (/^\d*\.?\d*$/.test(value)) {
            handleChange({ target: { name, value } });
          }
        } else {
          handleChange({ target: { name, value } });
        }
      } else {
        handleChange({ target: { name, value } });
      }
    };

    return (
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors duration-300 group-focus-within:text-emerald-400">
          {icon}
        </div>
        <input
          name={name}
          type={type === 'number' ? 'text' : type}
          inputMode={type === 'number' ? 'decimal' : 'text'}
          min={min}
          step={step}
          value={formData[name] ?? ''}
          onChange={handleLocalChange}
          onFocus={() => setFocusedField(name)}
          onBlur={() => {
            setFocusedField(null);
            // Clean up number inputs on blur
            if (type === 'number' && formData[name] !== '') {
              const numValue = Number(formData[name]);
              if (!isNaN(numValue)) {
                if (formData[name] !== numValue.toString()) {
                  handleChange({ target: { name, value: numValue.toString() } });
                }
              } else if (formData[name] !== '') {
                handleChange({ target: { name, value: '' } });
              }
            }
          }}
          className={`w-full bg-white/[0.03] border rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-transparent outline-none transition-all duration-300
            ${error 
              ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
              : 'border-white/[0.08] focus:border-emerald-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-emerald-500/20'
            }
          `}
          placeholder={label}
        />
        <label
          className={`absolute left-10 transition-all duration-300 pointer-events-none
            ${isFocused || hasValue 
              ? '-top-2.5 text-[10px] bg-black px-1 text-emerald-400 font-medium' 
              : 'top-1/2 -translate-y-1/2 text-sm text-white/30'
            }
            ${error ? 'text-red-400' : ''}
          `}
        >
          {label}
        </label>
        {error && (
          <p className="text-red-400/80 text-xs mt-1.5 ml-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </p>
        )}
      </div>
    );
  });

  // --- Icons (memoized to prevent recreation) ---
  const icons = React.useMemo(() => ({
    name: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    size: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    price: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    stock: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    brand: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    desc: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>,
  }), []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/[0.06] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
          <div>
            <h2 className="text-2xl font-light text-white tracking-wide">
              {isEdit ? 'Edit' : 'Add'} <span className="font-semibold text-emerald-400">Perfume</span>
            </h2>
            <p className="text-white/30 text-sm mt-1">
              {isEdit ? 'Update the details of your fragrance' : 'Create a new fragrance listing'}
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mx-8 mt-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 animate-pulse">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8" noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: Image Upload */}
            <div className="lg:col-span-5 space-y-6">
              <div 
                className={`relative aspect-[4/5] rounded-2xl border-2 border-dashed transition-all duration-500 overflow-hidden group cursor-pointer
                  ${dragActive 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : imagePreview 
                      ? 'border-white/10' 
                      : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center">
                        <svg className="w-10 h-10 text-white/80 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-white/80 text-sm font-medium">Change Image</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (imagePreview && imagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(imagePreview);
                        }
                        setImagePreview('');
                        setImageFile(null);
                      }}
                      className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-full text-white/60 hover:text-red-400 hover:bg-black/80 transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-white/40 font-medium mb-1">Drop your image here</p>
                    <p className="text-white/20 text-xs">or click to browse</p>
                    <p className="text-white/15 text-[10px] mt-4">Supports: JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              {errors.image && <p className="text-red-400 text-xs">{errors.image}</p>}
            </div>

            {/* RIGHT: Form Fields */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Name */}
              <FloatingInput name="name" label="Perfume Name" icon={icons.name} />

              {/* Brand Select */}
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors duration-300 group-focus-within:text-emerald-400">
                  {icons.brand}
                </div>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('brand')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full bg-white/[0.03] border rounded-xl pl-10 pr-4 py-3.5 text-white outline-none appearance-none transition-all duration-300 cursor-pointer
                    ${errors.brand_id 
                      ? 'border-red-500/50 bg-red-500/5 focus:border-red-500' 
                      : 'border-white/[0.08] focus:border-emerald-500/50 focus:bg-white/[0.06]'
                    }
                  `}
                >
                  <option value="" className="bg-[#0a0a0a] text-white/30">Select Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id} className="bg-[#0a0a0a] text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <label className={`absolute left-10 transition-all duration-300 pointer-events-none ${formData.brand_id || focusedField === 'brand' ? '-top-2.5 text-[10px] bg-black px-1 text-emerald-400 font-medium' : 'top-1/2 -translate-y-1/2 text-sm text-white/30'}`}>
                  Brand
                </label>
                {errors.brand_id && (
                  <p className="text-red-400/80 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {errors.brand_id}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="relative group">
                <div className="absolute left-3 top-4 text-white/30 transition-colors duration-300 group-focus-within:text-emerald-400">
                  {icons.desc}
                </div>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-white/[0.06] resize-none"
                  placeholder="Describe the fragrance notes, composition, and inspiration..."
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <FloatingInput name="size_ml" type="number" label="Size (ml)" icon={icons.size} min="0" />
                <FloatingInput name="price" type="number" label="Price ($)" icon={icons.price} min="0" step="0.01" />
                <FloatingInput name="stock" type="number" label="Stock" icon={icons.stock} min="0" />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-black font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span>{isEdit ? 'Update Perfume' : 'Create Perfume'}</span>
                    </>
                  )}
                </button>
                
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}