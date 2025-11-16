"use client";

import React, { useState, useEffect } from 'react';
import { Home, Users, Trophy, BarChart3, Settings, Clock, Mail, Lock, User, CheckCircle, Vote, Eye, Calendar, Award, LogOut, Shield, AlertCircle, Search, Filter, Download, Plus, Edit, Trash2, ChevronDown, Menu, X, Bell, RefreshCw } from 'lucide-react';

// API Service Layer
const API_BASE = '/api'; // Adjust based on your setup

const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  
  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  createCategory: async (data) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  updateCategory: async (id, data) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  // Nominations
  getNominations: async (status = null) => {
    const url = status ? `${API_BASE}/nominations?status=${status}` : `${API_BASE}/nominations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch nominations');
    return res.json();
  },

  createNomination: async (data) => {
    const res = await fetch(`${API_BASE}/nominations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create nomination');
    return res.json();
  },

  approveNomination: async (id) => {
    const res = await fetch(`${API_BASE}/nominations/${id}/approve`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to approve nomination');
    return res.json();
  },

  rejectNomination: async (id) => {
    const res = await fetch(`${API_BASE}/nominations/${id}/reject`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reject nomination');
    return res.json();
  },

  deleteNomination: async (id) => {
    const res = await fetch(`${API_BASE}/nominations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete nomination');
    return res.json();
  },

  // Votes
  getVotes: async () => {
    const res = await fetch(`${API_BASE}/votes`);
    if (!res.ok) throw new Error('Failed to fetch votes');
    return res.json();
  },

  castVote: async (categoryId, nominationId) => {
    const res = await fetch(`${API_BASE}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, nominationId })
    });
    if (!res.ok) throw new Error('Failed to cast vote');
    return res.json();
  },

  getUserVotes: async (userId) => {
    const res = await fetch(`${API_BASE}/votes/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user votes');
    return res.json();
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  getCategoryStats: async () => {
    const res = await fetch(`${API_BASE}/analytics/categories`);
    if (!res.ok) throw new Error('Failed to fetch category stats');
    return res.json();
  },

  getTopNominees: async (limit = 5) => {
    const res = await fetch(`${API_BASE}/analytics/top-nominees?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch top nominees');
    return res.json();
  }
};

// Main App Component
const NHEAApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in (you might use JWT/session)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <AuthFlow onLogin={handleLogin} />;
  }

  if (currentUser.role === 'ADMIN') {
    return <AdminApp user={currentUser} onLogout={handleLogout} />;
  }

  return <PublicApp user={currentUser} onLogout={handleLogout} />;
};

// Loading Screen
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 2));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl mx-auto transform hover:scale-105 transition-transform">
          <Award className="w-20 h-20 text-blue-600" />
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">NHEA 2025</h1>
        <p className="text-xl text-blue-100 mb-12 font-light">Nigerian Healthcare Excellence Awards</p>
        
        <div className="w-80 mx-auto">
          <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-white to-blue-200 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-200 mt-4 font-medium">Loading your experience... {progress}%</p>
        </div>
      </div>
    </div>
  );
};

// Auth Flow
const AuthFlow = ({ onLogin }) => {
  const [mode, setMode] = useState('signin');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'verify') {
        onLogin({ name: formData.name, email: formData.email, role: 'USER' });
      } else if (mode === 'admin') {
        const user = await api.login(formData.email, formData.password);
        if (user.role === 'ADMIN') {
          onLogin(user);
        } else {
          setError('Unauthorized: Admin access only');
        }
      } else if (mode === 'signup') {
        await api.register(formData.name, formData.email, formData.password);
        setMode('verify');
      } else {
        const user = await api.login(formData.email, formData.password);
        onLogin(user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600">We sent a 6-digit code to</p>
            <p className="text-blue-600 font-semibold">{formData.email}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter Verification Code</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {mode === 'admin' ? 'Admin Access' : mode === 'signup' ? 'Join NHEA 2025' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600">
            {mode === 'admin' ? 'Secure admin portal' : mode === 'signup' ? 'Create your account to participate' : 'Sign in to continue voting'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {mode === 'admin' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Admin Security Notice</p>
                <p>This area is for authorized administrators only. All actions are logged.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  We will send a verification code to your email to confirm your account
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            {mode !== 'admin' && (
              <button
                onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
          </div>

          {mode !== 'admin' && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <button
                onClick={() => setMode('admin')}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-2 mx-auto group"
              >
                <Shield className="w-4 h-4 group-hover:text-amber-600 transition-colors" />
                Admin Portal
              </button>
            </div>
          )}

          {mode === 'admin' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setMode('signin')}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium"
              >
                ← Back to public login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Public App
const PublicApp = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav 
        user={user} 
        onLogout={onLogout} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {currentPage === 'home' && <PublicHome setCurrentPage={setCurrentPage} />}
      {currentPage === 'vote' && <VotingPage user={user} />}
      {currentPage === 'nominate' && <NominationPage user={user} />}
      {currentPage === 'rsvp' && <RSVPPage user={user} />}
    </div>
  );
};

const PublicNav = ({ user, onLogout, currentPage, setCurrentPage, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">NHEA 2025</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'vote', label: 'Vote', icon: Vote },
              { id: 'nominate', label: 'Nominate', icon: Trophy },
              { id: 'rsvp', label: 'RSVP', icon: Calendar }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{user.name[0]}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'vote', label: 'Vote', icon: Vote },
                { id: 'nominate', label: 'Nominate', icon: Trophy },
                { id: 'rsvp', label: 'RSVP', icon: Calendar }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const PublicHome = ({ setCurrentPage }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 45, hours: 12, minutes: 34, seconds: 22 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => ({
        ...prev,
        seconds: prev.seconds > 0 ? prev.seconds - 1 : 59
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white rounded-full"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-white rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Award className="w-5 h-5" />
            <span className="text-sm font-semibold">2025 Awards Season</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Nigerian Healthcare<br />Excellence Awards
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Celebrating innovation, dedication, and excellence in Nigerian healthcare
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-3xl mx-auto mb-12 border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Clock className="w-7 h-7" />
              <h3 className="text-2xl font-bold">Event Countdown</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Minutes' },
                { value: timeLeft.seconds, label: 'Seconds' }
              ].map((item, i) => (
                <div key={i} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-5xl font-bold mb-2">{String(item.value).padStart(2, '0')}</div>
                  <div className="text-sm text-blue-100 font-medium uppercase tracking-wide">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage('nominate')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Submit Nomination
            </button>
            <button
              onClick={() => setCurrentPage('vote')}
              className="px-8 py-4 bg-blue-700/50 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-blue-600/50 transition-all"
            >
              Vote Now →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to participate</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Submit Nominations',
              desc: 'Nominate outstanding healthcare professionals and organizations making a difference',
              color: 'blue'
            },
            {
              icon: Vote,
              title: 'Cast Your Vote',
              desc: 'Vote for your favorite nominees across multiple categories',
              color: 'green'
            },
            {
              icon: Trophy,
              title: 'Celebrate Winners',
              desc: 'Join us at the live awards ceremony to celebrate excellence',
              color: 'purple'
            }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`w-16 h-16 bg-${item.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
                <item.icon className={`w-8 h-8 text-${item.color}-600`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Award Categories</h2>
            <p className="text-xl text-gray-600">Vote across 12 prestigious categories</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              'Best Hospital',
              'Healthcare Professional',
              'Innovation in Healthcare',
              'Community Health',
              'Medical Research',
              'Patient Care',
              'Healthcare Technology',
              'Public Health Impact'
            ].map((cat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{cat}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const VotingPage = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [userVotes, setUserVotes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, votesData] = await Promise.all([
        api.getCategories(),
        api.getUserVotes(user.id)
      ]);
      
      setCategories(categoriesData);
      setUserVotes(new Set(votesData.map(v => v.categoryId)));
    } catch (err) {
      setError('Failed to load voting data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (categoryId, nominationId) => {
    try {
      await api.castVote(categoryId, nominationId);
      setUserVotes(new Set([...userVotes, categoryId]));
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (err) {
      setError('Failed to cast vote');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  const progress = categories.length > 0 ? (userVotes.size / categories.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {showConfirmation && (
        <div className="fixed top-24 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">Vote Recorded!</p>
            <p className="text-sm text-green-100">Thank you for voting</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Cast Your Votes</h1>
          <p className="text-gray-600 text-lg mb-6">Vote for your favorite nominees in each category</p>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Your Voting Progress</h3>
              <span className="text-sm text-gray-600 font-medium">{userVotes.size} of {categories.length} categories completed</span>
            </div>
            <div className="w-full bg-white rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((category) => {
            const hasVoted = userVotes.has(category.id);
            
            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                    <p className="text-blue-100">{category.nominations?.length || 0} nominees</p>
                  </div>
                  {hasVoted && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <CheckCircle className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold">Voted</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {category.nominations?.map((nomination) => (
                      <div 
                        key={nomination.id}
                        className={`border-2 rounded-xl p-5 transition-all cursor-pointer hover:shadow-lg ${
                          hasVoted 
                            ? 'border-gray-200 bg-gray-50' 
                            : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex-shrink-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-600">{nomination.nomineeName.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1 text-lg">{nomination.nomineeName}</h4>
                            <p className="text-sm text-gray-600 mb-4">{nomination.organization || 'Independent'}</p>
                            {!hasVoted ? (
                              <button
                                onClick={() => handleVote(category.id, nomination.id)}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                              >
                                Vote Now
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Thank you for voting!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {userVotes.size < categories.length && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white mt-8">
            <h3 className="text-2xl font-bold mb-2">Keep Voting!</h3>
            <p className="text-blue-100 mb-4">
              You have {categories.length - userVotes.size} {categories.length - userVotes.size === 1 ? 'category' : 'categories'} left
            </p>
          </div>
        )}

        {userVotes.size === categories.length && categories.length > 0 && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-center text-white mt-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-2">All Done! 🎉</h3>
            <p className="text-green-100 text-lg">
              Thank you for voting across all categories! Your voice matters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const NominationPage = ({ user }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    nomineeName: '',
    nomineeEmail: '',
    organization: '',
    reason: ''
  });
  const [categories, setCategories] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!formData.categoryId || !formData.nomineeName || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createNomination({
        categoryId: parseInt(formData.categoryId),
        nomineeName: formData.nomineeName,
        nomineeEmail: formData.nomineeEmail,
        organization: formData.organization,
        reason: formData.reason,
        nominatedBy: user.id
      });
      
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({ categoryId: '', nomineeName: '', nomineeEmail: '', organization: '', reason: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit nomination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {submitted && (
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Nomination Submitted!</p>
              <p className="text-sm text-green-100">We will review and notify you soon</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold">Submit a Nomination</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Nominate outstanding individuals or organizations making a difference in Nigerian healthcare
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nominee Name *</label>
                <input
                  type="text"
                  placeholder="Full name of individual or organization"
                  value={formData.nomineeName}
                  onChange={(e) => setFormData({...formData, nomineeName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="nominee@example.com"
                  value={formData.nomineeEmail}
                  onChange={(e) => setFormData({...formData, nomineeEmail: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization/Institution</label>
                <input
                  type="text"
                  placeholder="Associated organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Nomination *</label>
                <textarea
                  placeholder="Tell us why this nominee deserves recognition..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                ></textarea>
                <p className="text-sm text-gray-500 mt-2">Minimum 100 characters</p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Review Process</p>
                  <p>All nominations are reviewed by our selection committee. Approved nominations will be added to the voting pool.</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Nomination'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RSVPPage = ({ user }) => {
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [guests, setGuests] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold">Event RSVP</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Join us for the 2025 Nigerian Healthcare Excellence Awards Ceremony
            </p>
          </div>

          <div className="p-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Date & Time</p>
                    <p className="text-gray-600">Saturday, January 25, 2025 • 6:00 PM WAT</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Venue</p>
                    <p className="text-gray-600">Eko Hotels & Suites, Victoria Island, Lagos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Dress Code</p>
                    <p className="text-gray-600">Formal / Black Tie</p>
                  </div>
                </div>
              </div>
            </div>

            {!rsvpStatus ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Will you attend?</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setRsvpStatus('attending')}
                      className="py-4 border-2 border-green-500 text-green-700 bg-green-50 rounded-xl font-semibold hover:bg-green-100 transition-all"
                    >
                      ✓ Yes, I will attend
                    </button>
                    <button
                      onClick={() => setRsvpStatus('not-attending')}
                      className="py-4 border-2 border-gray-300 text-gray-700 bg-gray-50 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                    >
                      ✗ Cant make it
                    </button>
                  </div>
                </div>
              </div>
            ) : rsvpStatus === 'attending' ? (
              <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">RSVP Confirmed!</h3>
                  <p className="text-green-700">We look forward to seeing you at the ceremony</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <strong>Note:</strong> You will receive a confirmation email with your tickets within 24 hours
                  </p>
                </div>

                <button
                  onClick={() => setRsvpStatus(null)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  ← Change RSVP
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-600 mb-4">Sorry you cant make it. We hope to see you next year!</p>
                <button
                  onClick={() => setRsvpStatus(null)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  ← Change RSVP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin App
const AdminApp = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <AdminDashboard />}
        {currentPage === 'categories' && <AdminCategories />}
        {currentPage === 'nominations' && <AdminNominations />}
        {currentPage === 'voting' && <AdminVoting />}
        {currentPage === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  );
};

const AdminSidebar = ({ currentPage, setCurrentPage, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'categories', label: 'Categories', icon: Trophy },
    { id: 'nominations', label: 'Nominations', icon: Users },
    { id: 'voting', label: 'Voting', icon: Vote },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-700">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <span className="font-bold text-xl block">Admin Panel</span>
          <span className="text-xs text-gray-400">NHEA 2025</span>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
              currentPage === item.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-900/20 rounded-xl transition-all mt-4"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalNominations: 0,
    activeCategories: 0,
    totalVotes: 0,
    daysUntilEvent: 45
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getAnalytics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { label: 'Total Nominations', value: stats.totalNominations, change: '+12', icon: Users, color: 'blue' },
    { label: 'Active Categories', value: stats.activeCategories, change: '+2', icon: Trophy, color: 'green' },
    { label: 'Total Votes Cast', value: stats.totalVotes, change: '+156', icon: Vote, color: 'purple' },
    { label: 'Days Until Event', value: stats.daysUntilEvent, change: '-1', icon: Clock, color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Heres whats happening with NHEA 2025</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {statItems.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
              </div>
              <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-lg">
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Nominations</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Example Name</div>
                    <div className="text-sm text-gray-600">Best Hospital Category</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Category Performance</h3>
            <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="space-y-4">
            {[
              { name: 'Best Hospital', votes: 456, max: 500 },
              { name: 'Healthcare Professional', votes: 423, max: 500 },
              { name: 'Innovation Award', votes: 298, max: 500 },
              { name: 'Community Health', votes: 312, max: 500 }
            ].map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">{cat.name}</span>
                  <span className="font-bold text-gray-900">{cat.votes} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${(cat.votes / cat.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Add Category', icon: Plus },
            { label: 'Approve Nominations', icon: CheckCircle },
            { label: 'Export Data', icon: Download },
            { label: 'Reveal Winners', icon: Eye }
          ].map((action, i) => (
            <button
              key={i}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-4 flex flex-col items-center gap-2 transition-all border border-white/20"
            >
              <action.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminNominations = () => {
  const [filter, setFilter] = useState('PENDING');
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNominations();
  }, [filter]);

  const fetchNominations = async () => {
    try {
      setLoading(true);
      const data = await api.getNominations(filter === 'all' ? null : filter);
      setNominations(data);
    } catch (err) {
      setError('Failed to fetch nominations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveNomination(id);
      fetchNominations();
    } catch (err) {
      setError('Failed to approve nomination');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectNomination(id);
      fetchNominations();
    } catch (err) {
      setError('Failed to reject nomination');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this nomination?')) {
      try {
        await api.deleteNomination(id);
        fetchNominations();
      } catch (err) {
        setError('Failed to delete nomination');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Nominations</h1>
          <p className="text-gray-600">Review and approve nominations</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Manually
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nominee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {nominations.map((nom) => (
                  <tr key={nom.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{nom.nomineeName.charAt(0)}</span>
                        </div>
                        <div className="font-medium text-gray-900">{nom.nomineeName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{nom.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(nom.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        nom.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        nom.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {nom.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {nom.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleApprove(nom.id)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(nom.id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(nom.id)}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Award Categories</h1>
          <p className="text-gray-600">Manage categories and subcategories</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Category
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    cat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {cat.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {cat._count?.nominations || 0} nominees
                  </span>
                  <span className="flex items-center gap-1">
                    <Vote className="w-4 h-4" />
                    {cat._count?.votes || 0} votes
                  </span>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminVoting = () => {
  const [votingEnabled, setVotingEnabled] = useState(true);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voting Management</h1>
        <p className="text-gray-600">Configure voting settings and monitor activity</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Voting Controls</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Enable Voting</p>
              <p className="text-sm text-gray-600">Allow users to cast votes</p>
            </div>
            <button
              onClick={() => setVotingEnabled(!votingEnabled)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                votingEnabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                votingEnabled ? 'translate-x-8' : ''
              }`}></div>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Voting Start Date</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Voting End Date</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Security Notice</p>
              <p>Each user can vote once per category. Votes are encrypted and audit-logged.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Votes Today</h4>
            <Vote className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">156</div>
          <p className="text-sm text-green-600 font-medium">+23% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Total Voters</h4>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">1,247</div>
          <p className="text-sm text-gray-600">Unique participants</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Completion Rate</h4>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">68%</div>
          <p className="text-sm text-gray-600">Vote all categories</p>
        </div>
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [showWinners, setShowWinners] = useState(false);
  const [topNominees, setTopNominees] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [nominees, stats] = await Promise.all([
        api.getTopNominees(5),
        api.getCategoryStats()
      ]);
      setTopNominees(nominees);
      setCategoryStats(stats);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
          <p className="text-gray-600">Real-time voting data and winner management</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
          <button
            onClick={() => setShowWinners(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Reveal Winners
          </button>
        </div>
      </div>

      {showWinners && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Reveal Winners?</h3>
              <p className="text-gray-600">
                This will make winners visible to all users. This action cannot be undone.
              </p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Ensure voting has ended and all results are verified before proceeding.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWinners(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowWinners(false)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Confirm Reveal
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Categories by Votes</h3>
            <div className="space-y-4">
              {categoryStats.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    <span className="text-gray-600 font-semibold">{cat.votes} votes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Votes Over Time</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4">
                {[40, 65, 45, 80, 70, 90, 85].map((height, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 font-medium">Day {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Leading Nominees</h3>
              <div className="space-y-3">
                {topNominees.map((nominee, n) => (
                  <div key={nominee.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-blue-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        n === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        n === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        n === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}>
                        {n + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{nominee.nomineeName}</div>
                        <div className="text-sm text-gray-600">{nominee.category?.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600 text-lg">{nominee.voteCount}</div>
                      <div className="text-xs text-gray-600">votes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NHEAApp;
