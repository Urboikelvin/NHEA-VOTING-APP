import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Award,
  Shield,
  Mail,
  User,
  Lock,
  Clock,
  CheckCircle,
  X,
  Menu,
  Home,
  Zap as Vote,
  Trophy,
  Calendar,
  Users,
  LogOut,
  RefreshCw,
  Plus,
  Download,
  Eye,
  Edit,
  ChevronDown,
  Trash2,
  BarChart3,
  AlertCircle,
  Filter
} from 'lucide-react';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: { 'Content-Type': 'application/json' }
});

const NHEAApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (mounted) setCurrentUser(data.user || null);
      } catch (err) {
        setCurrentUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (isLoading) return <LoadingScreen />;

  if (!currentUser) {
    return <AuthFlow onLogin={(user) => setCurrentUser(user)} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminApp user={currentUser} onLogout={() => setCurrentUser(null)} />;
  }

  return <PublicApp user={currentUser} onLogout={() => setCurrentUser(null)} />;
};

// Loading Screen
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(100, p + Math.floor(Math.random() * 12) + 6)), 400);
    const finish = setTimeout(() => {
      setProgress(100);
      clearInterval(id);
    }, 2200);
    return () => {
      clearInterval(id);
      clearTimeout(finish);
    };
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
  const [mode, setMode] = useState('signin'); // signin, signup, admin, verify
  const [formData, setFormData] = useState({ email: '', password: '', name: '', code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      if (mode === 'signup') {
        const { data } = await api.post('/api/auth/signup', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        onLogin(data.user);
      } else if (mode === 'signin') {
        const { data } = await api.post('/api/auth/signin', {
          email: formData.email,
          password: formData.password
        });
        onLogin(data.user);
      } else if (mode === 'admin') {
        const { data } = await api.post('/api/auth/admin', {
          email: formData.email,
          password: formData.password
        });
        onLogin(data.user);
      } else if (mode === 'verify') {
        const { data } = await api.post('/api/auth/verify', { code: formData.code, email: formData.email });
        onLogin(data.user);
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

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

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>

            {message && <p className="text-sm text-red-600 text-center mt-2">{message}</p>}
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
                  onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
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
    const target = new Date('2025-01-25T18:00:00Z').getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [votedCategories, setVotedCategories] = useState(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/categories');
        if (mounted) setCategories(data.categories || []);
        // fetch user's voted categories
        const res = await api.get('/api/votes/me');
        if (mounted) setVotedCategories(new Set(res.data.votedCategories || []));
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleVote = async (categoryId, nomineeId) => {
    try {
      await api.post('/api/vote', { categoryId, nomineeId });
      setVotedCategories((s) => new Set([...Array.from(s), categoryId]));
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2500);
      // optimistic UI: increment local nominee votes
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, nominees: c.nominees.map(n => n.id === nomineeId ? { ...n, votes: (n.votes || 0) + 1 } : n) }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const progress = categories.length ? (votedCategories.size / categories.length) * 100 : 0;

  if (loading) return <div className="p-8">Loading categories...</div>;

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

      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Cast Your Votes</h1>
          <p className="text-gray-600 text-lg mb-6">Vote for your favorite nominees in each category</p>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Your Voting Progress</h3>
              <span className="text-sm text-gray-600 font-medium">{votedCategories.size} of {categories.length} categories completed</span>
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
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{votedCategories.has(category.id) ? 'Voted' : 'Not voted'}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {category.nominees.map((nom) => (
                  <div key={nom.id} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{nom.name}</div>
                      <div className="text-sm text-gray-600">{nom.desc}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-600 mr-2">{nom.votes ?? 0} votes</div>
                      <button
                        onClick={() => handleVote(category.id, nom.id)}
                        disabled={votedCategories.has(category.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          votedCategories.has(category.id) ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {votedCategories.has(category.id) ? 'Voted' : 'Vote'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {votedCategories.size < categories.length && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white mt-8">
            <h3 className="text-2xl font-bold mb-2">Keep Voting!</h3>
            <p className="text-blue-100 mb-4">
              You have {categories.length - votedCategories.size} {categories.length - votedCategories.size === 1 ? 'category' : 'categories'} left
            </p>
          </div>
        )}

        {votedCategories.size === categories.length && (
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
    category: '',
    nomineeName: '',
    nomineeEmail: '',
    organization: '',
    reason: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.category || !formData.nomineeName || !formData.nomineeEmail || formData.reason.length < 10) return;
    setSubmitting(true);
    try {
      await api.post('/api/nominations', {
        category: formData.category,
        nomineeName: formData.nomineeName,
        nomineeEmail: formData.nomineeEmail,
        organization: formData.organization,
        reason: formData.reason
      });
      setSubmitted(true);
      setFormData({ category: '', nomineeName: '', nomineeEmail: '', organization: '', reason: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select a category</option>
                  <option value="best-hospital">Best Hospital</option>
                  <option value="healthcare-professional">Healthcare Professional of the Year</option>
                  <option value="innovation">Innovation in Healthcare</option>
                  <option value="community">Community Health Initiative</option>
                  <option value="research">Medical Research Excellence</option>
                  <option value="patient-care">Outstanding Patient Care</option>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
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
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                Submit Nomination
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
                    onChange={(e) => setGuests(Number(e.target.value))}
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
    { id: 'settings', label: 'Settings', icon: RefreshCw }
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
  const [stats, setStats] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/admin/analytics');
        if (mounted) {
          setStats([
            { label: 'Total Nominations', value: data.totalNominations || '0', change: data.nominationsChange || '+0', icon: Users, color: 'blue' },
            { label: 'Active Categories', value: data.activeCategories || '0', change: data.categoriesChange || '+0', icon: Trophy, color: 'green' },
            { label: 'Total Votes Cast', value: data.totalVotes || '0', change: data.votesChange || '+0', icon: Vote, color: 'purple' },
            { label: 'Days Until Event', value: data.daysUntilEvent ?? '45', change: data.daysChange || '-0', icon: Clock, color: 'orange' }
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Heres whats happening with NHEA 2025</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
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
          <RecentNominationsList />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Category Performance</h3>
            <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <CategoryPerformance />
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

const RecentNominationsList = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/admin/nominations?limit=4');
        if (mounted) setItems(data.nominations || []);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="space-y-4">
      {items.map((n) => (
        <div key={n.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{n.nomineeName}</div>
              <div className="text-sm text-gray-600">{n.category}</div>
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
      {!items.length && <div className="text-sm text-gray-500">No recent nominations</div>}
    </div>
  );
};

const CategoryPerformance = () => {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/admin/category-performance');
        if (mounted) setCats(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="space-y-4">
      {cats.map((cat, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">{cat.name}</span>
            <span className="font-bold text-gray-900">{cat.votes} votes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-2.5 rounded-full transition-all"
              style={{ width: `${(cat.votes / Math.max(1, cat.max)) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
      {!cats.length && <div className="text-sm text-gray-500">No category data</div>}
    </div>
  );
};

const AdminNominations = () => {
  const [filter, setFilter] = useState('pending');
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/nominations');
      setNominations(data.nominations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const approve = async (id) => {
    try {
      await api.post(`/api/admin/nominations/${id}/approve`);
      setNominations((prev) => prev.map(n => n.id === id ? { ...n, status: 'approved' } : n));
    } catch (err) {
      console.error(err);
    }
  };
  const reject = async (id) => {
    try {
      await api.post(`/api/admin/nominations/${id}/reject`);
      setNominations((prev) => prev.map(n => n.id === id ? { ...n, status: 'rejected' } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = nominations.filter(n => filter === 'all' || n.status === filter);

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' }
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
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length ? filtered.map((nom) => (
                <tr key={nom.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{nom.nomineeName.charAt(0)}</span>
                      </div>
                      <div className="font-medium text-gray-900">{nom.nomineeName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{nom.category}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(nom.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      nom.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      nom.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {nom.status.charAt(0).toUpperCase() + nom.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {nom.status === 'pending' && (
                        <>
                          <button onClick={() => approve(nom.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => reject(nom.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">No nominations</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/admin/categories');
        if (mounted) setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
                    {cat.nominees ?? 0} nominees
                  </span>
                  <span className="flex items-center gap-1">
                    <Vote className="w-4 h-4" />
                    {cat.votes ?? 0} votes
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
        {!categories.length && <div className="text-gray-500">No categories found</div>}
      </div>
    </div>
  );
};

const AdminVoting = () => {
  const [votingEnabled, setVotingEnabled] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/admin/voting');
        if (mounted) setVotingEnabled(data.enabled);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggle = async () => {
    try {
      const { data } = await api.post('/api/admin/voting/toggle', { enabled: !votingEnabled });
      setVotingEnabled(data.enabled);
    } catch (err) {
      console.error(err);
    }
  };

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
              onClick={toggle}
              className={`relative w-16 h-8 rounded-full transition-colors ${votingEnabled ? 'bg-green-600' : 'bg-gray-300'}`}
              aria-label="toggle-voting"
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${votingEnabled ? 'translate-x-8' : ''}`}></div>
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
  const [analytics, setAnalytics] = useState(null);
  const [showWinners, setShowWinners] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/admin/analytics/overview');
        if (mounted) setAnalytics(data);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Insights and reports for NHEA 2025</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Total Votes</h4>
          <div className="text-2xl font-bold">{analytics?.totalVotes ?? '—'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Unique Voters</h4>
          <div className="text-2xl font-bold">{analytics?.uniqueVoters ?? '—'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Nominations</h4>
          <div className="text-2xl font-bold">{analytics?.nominations ?? '—'}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Top Performing Categories</h3>
          <button onClick={() => setShowWinners(!showWinners)} className="text-blue-600 font-medium">
            {showWinners ? 'Hide Winners' : 'Show Winners'}
          </button>
        </div>
        <div className="space-y-4">
          {analytics?.topCategories?.map((c, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">{c.name}</div>
                <div className="text-sm text-gray-500">{c.votes} votes</div>
              </div>
              <div className="text-sm text-gray-700 font-semibold">{Math.round((c.votes / (analytics.totalVotes || 1)) * 100)}%</div>
            </div>
          )) || <div className="text-sm text-gray-500">No data</div>}
        </div>
      </div>
    </div>
  );
};

export default NHEAApp;