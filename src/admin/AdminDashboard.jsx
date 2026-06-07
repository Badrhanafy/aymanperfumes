import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { PRODUCTS } from '../Home';
import DashboardOverview from './DashboardOverview';
import PerfumeList from './PerfumeList';
import PerfumeForm from './PerfumeForm';
import BrandManager from './BrandManager';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'list', 'add', 'edit', 'brands'
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPerfume, setEditPerfume] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch all perfumes
  const fetchPerfumes = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/perfumes')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch catalog');
        return res.json();
      })
      .then(data => {
        setPerfumes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API catalog fetch failed, loading fallback:', err);
        setPerfumes(PRODUCTS);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPerfumes();
  }, []);

  // CRUD Operations
  const handleCreatePerfume = async (formData) => {
    const res = await fetch('http://localhost:8000/api/perfumes', {
      method: 'POST',
      credentials: 'include', // for Sanctum cookies / authorization
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw errData;
    }

    fetchPerfumes();
    setActiveTab('list');
  };

  const handleUpdatePerfume = async (formData, id) => {
    // Note: Laravel requires POST with _method=PUT inside formData for multipart files
    const res = await fetch(`http://localhost:8000/api/perfumes/${id}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw errData;
    }

    fetchPerfumes();
    setActiveTab('list');
    setEditPerfume(null);
  };

  const handleDeletePerfume = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/perfumes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) throw new Error('Deletion failed');
      
      fetchPerfumes();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleEditClick = (product) => {
    setEditPerfume(product);
    setActiveTab('edit');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper to extract name initials
  const getInitials = (name = '') => {
    return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar for Desktop / Header for Mobile - Unified Dark Contrast Sidebar */}
      <aside className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-r border-neutral-900 flex flex-col justify-between p-6 md:sticky md:top-0 md:h-screen z-40">
        <div className="flex flex-col gap-8">
          
          {/* Brand Logo */}
          <div className="flex items-center justify-between md:block">
            <Link to="/" className="text-xl tracking-[0.2em] uppercase font-serif text-white flex items-center gap-2 group">
              <span className="text-[#C9A84C]">L'Essence</span>
              <span className="text-[10px] bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 px-2 py-0.5 rounded font-sans font-medium uppercase tracking-widest scale-90">Admin</span>
            </Link>
            
            {/* Mobile Hamburger menu */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white transition"
              aria-label="Toggle Navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col gap-1.5 transition-all duration-300`}>
            
            {/* Overview */}
            <button
              onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-medium transition duration-300 text-left
                ${activeTab === 'overview' 
                  ? 'bg-neutral-900 text-[#C9A84C] border border-neutral-800 shadow-md' 
                  : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Overview
            </button>

            {/* Inventory List */}
            <button
              onClick={() => { setActiveTab('list'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-medium transition duration-300 text-left
                ${activeTab === 'list' || activeTab === 'edit'
                  ? 'bg-neutral-900 text-[#C9A84C] border border-neutral-800 shadow-md' 
                  : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Catalog Inventory
            </button>

            {/* Add New */}
            <button
              onClick={() => { setActiveTab('add'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-medium transition duration-300 text-left
                ${activeTab === 'add' 
                  ? 'bg-neutral-900 text-[#C9A84C] border border-neutral-800 shadow-md' 
                  : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add Fragrance
            </button>

            {/* Manage Brands Tab */}
            <button
              onClick={() => { setActiveTab('brands'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-medium transition duration-300 text-left
                ${activeTab === 'brands' 
                  ? 'bg-neutral-900 text-[#C9A84C] border border-neutral-800 shadow-md' 
                  : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Brand Houses
            </button>

            {/* Divider */}
            <hr className="border-neutral-900 my-4" />

            {/* Return to Store */}
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-medium text-neutral-400 hover:bg-neutral-900/60 hover:text-white transition duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Store
            </Link>
          </nav>

        </div>

        {/* User profile widget at footer */}
        <div className={`mt-auto pt-6 border-t border-neutral-900 ${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-full bg-neutral-900 text-[10px] font-semibold flex items-center justify-center flex-shrink-0 select-none border border-neutral-850" style={{ color: '#C9A84C' }}>
                {user ? getInitials(user.name) : 'AD'}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-neutral-500 truncate font-light leading-none mt-1">L'Essence Admin</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-900/60 transition flex-shrink-0"
              title="Sign Out"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-500 text-xs uppercase tracking-widest font-light">Loading Catalog...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <DashboardOverview perfumes={perfumes} />
            )}
            
            {activeTab === 'list' && (
              <PerfumeList 
                perfumes={perfumes} 
                onEdit={handleEditClick} 
                onDelete={handleDeletePerfume} 
              />
            )}

            {activeTab === 'add' && (
              <PerfumeForm 
                onSubmit={handleCreatePerfume} 
                onCancel={() => setActiveTab('list')} 
              />
            )}

            {activeTab === 'edit' && (
              <PerfumeForm 
                perfume={editPerfume}
                onSubmit={handleUpdatePerfume} 
                onCancel={() => { setActiveTab('list'); setEditPerfume(null); }} 
              />
            )}

            {activeTab === 'brands' && (
              <BrandManager />
            )}
          </>
        )}
      </main>
    </div>
  );
}
