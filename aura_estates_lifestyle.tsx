import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Diamond, Plane, Anchor, ChefHat, MessageSquare, X, Send, Lock, Plus, Trash2, Home, Check, ChevronLeft, ChevronRight, Download, Users } from 'lucide-react';

// --- SMART FIREBASE CONFIGURATION ---
// Auto-detects if you are in the live preview or your own Render deployment
let firebaseConfig;
if (typeof __firebase_config !== 'undefined') {
  firebaseConfig = JSON.parse(__firebase_config);
} else {
  // Replace these with your actual keys before deploying to Render!
  firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aura-estates-production';

// --- Styles ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Montserrat:wght@300;400;500&display=swap');
  
  :root {
    --gold-light: #F7E7CE;
    --gold-main: #D4AF37;
    --gold-dark: #AA771C;
    --bg-dark: #050505;
  }

  body {
    background-color: var(--bg-dark);
    color: white;
    font-family: 'Montserrat', sans-serif;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6, .font-serif {
    font-family: 'Cinzel', serif;
  }

  .gold-gradient-text {
    background: linear-gradient(to right, #E5C158, #FFF5C3, #FCEE91, #FFF5C3, #E5C158);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
    text-shadow: 0px 2px 15px rgba(212, 175, 55, 0.4);
  }

  .glass-panel {
    background: rgba(15, 15, 15, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(212, 175, 55, 0.15);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }

  .glass-input {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(212, 175, 55, 0.3);
    color: white;
    transition: all 0.3s ease;
  }
  
  .glass-input:focus {
    outline: none;
    border-color: var(--gold-main);
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
  }

  .gold-button {
    background: linear-gradient(45deg, #B38728, #D4AF37, #FBF5B7, #D4AF37);
    background-size: 200% auto;
    color: #000;
    transition: all 0.5s ease;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;
  }

  .gold-button:hover {
    background-position: right center;
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #050505; 
  }
  ::-webkit-scrollbar-thumb {
    background: #D4AF37; 
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #F7E7CE; 
  }

  /* Fade In Animation */
  .fade-in-up {
    animation: fadeInUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    opacity: 0;
    transform: translateY(30px);
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .delay-1 { animation-delay: 0.2s; }
  .delay-2 { animation-delay: 0.4s; }
  .delay-3 { animation-delay: 0.6s; }

  .hover-float {
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.6s ease;
  }
  
  .hover-float:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 30px 60px rgba(0,0,0,0.9), 0 0 30px rgba(212, 175, 55, 0.2);
  }

  .typewriter-container {
    display: inline-block;
  }
  
  .typewriter-text {
    overflow: hidden;
    white-space: nowrap;
    border-right: 3px solid #D4AF37;
    animation: typing 2.5s steps(30, end), blink-caret .75s step-end infinite;
    margin: 0 auto;
  }
  
  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }
  
  @keyframes blink-caret {
    from, to { border-color: transparent }
    50% { border-color: #D4AF37; }
  }
`;

// --- Particle Background Component ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.baseX = this.x;
        this.baseY = this.y;
      }
      update(mouseX, mouseY) {
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let maxDistance = 150;
        let force = (maxDistance - distance) / maxDistance;

        if (distance < maxDistance) {
            this.x -= (dx / distance) * force * 3;
            this.y -= (dy / distance) * force * 3;
        } else {
            if (this.x !== this.baseX) {
                let dxBase = this.x - this.baseX;
                this.x -= dxBase / 20;
            }
            if (this.y !== this.baseY) {
                let dyBase = this.y - this.baseY;
                this.y -= dyBase / 20;
            }
        }

        this.baseX += this.speedX;
        this.baseY += this.speedY;

        if (this.baseX > canvas.width) { this.baseX = 0; this.x = 0; }
        if (this.baseX < 0) { this.baseX = canvas.width; this.x = canvas.width; }
        if (this.baseY > canvas.height) { this.baseY = 0; this.y = 0; }
        if (this.baseY < 0) { this.baseY = canvas.height; this.y = canvas.height; }
      }
      draw() {
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    let mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseout', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
      gradient.addColorStop(0, 'rgba(10, 10, 10, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse.x, mouse.y);
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};


export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [listings, setListings] = useState([]);
  
  // Auth states for Clients
  const [isVip, setIsVip] = useState(false);
  const [vipIdentity, setVipIdentity] = useState('');
  const [showVipLogin, setShowVipLogin] = useState(false);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          try {
            await signInAnonymously(auth);
          } catch (anonErr) {
            if (anonErr.code !== 'auth/operation-not-allowed') {
              throw anonErr;
            }
          }
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const listingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'luxury_listings');
    const q = query(listingsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty && !window.__hasSeededSamples) {
        window.__hasSeededSamples = true;
        const defaultSamples = [
          {
            title: "Azure Enclave",
            category: "Estate",
            price: "$45,000,000",
            description: "A breathtaking clifftop masterpiece featuring panoramic ocean views, infinity pools, and 12 bespoke bedrooms crafted with imported Italian marble. The pinnacle of coastal luxury.",
            imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            createdAt: Date.now()
          }
        ];
        defaultSamples.forEach(async (sample) => {
          try { await addDoc(listingsRef, sample); } catch(e) { console.error(e); }
        });
      }

      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      setListings(items);
    }, (error) => {
      console.error("Firestore Snapshot Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <ParticleBackground />
      
      <Navbar setView={setView} view={view} />

      <main className="min-h-screen pt-24 pb-12 px-6 sm:px-12 lg:px-24">
        {view === 'home' && (
          <HomeView 
            listings={listings} 
            isVip={isVip} 
            vipIdentity={vipIdentity}
            setShowVipLogin={setShowVipLogin} 
          />
        )}
        {view === 'admin' && (
          <AdminView 
            isUnlocked={isAdminUnlocked} 
            setIsUnlocked={setIsAdminUnlocked}
            listings={listings}
            user={user}
          />
        )}
      </main>

      <ChatbotWidget />
      
      <VipAuthModal 
        isOpen={showVipLogin} 
        onClose={() => setShowVipLogin(false)} 
        onSuccess={(identity) => { 
          setIsVip(true); 
          setVipIdentity(identity);
          setShowVipLogin(false); 
        }} 
      />
    </>
  );
}

// --- Components ---

const Navbar = ({ setView, view }) => (
  <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b-0 border-t-0 border-r-0 border-l-0 border-b-white/10">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setView('home')}
      >
        <Diamond className="text-[#D4AF37] w-8 h-8 group-hover:rotate-12 transition-transform duration-500" />
        <span className="font-serif text-2xl tracking-widest text-white group-hover:gold-gradient-text transition-all duration-300">
          AURA
        </span>
      </div>
      
      <div className="flex gap-8 items-center text-sm font-medium tracking-widest uppercase text-gray-300">
        <button 
          onClick={() => setView('home')}
          className={`hover:text-[#D4AF37] transition-colors ${view === 'home' ? 'text-[#D4AF37]' : ''}`}
        >
          Collection
        </button>
        <button 
          onClick={() => setView('admin')}
          className={`hover:text-[#D4AF37] transition-colors flex items-center gap-2 ${view === 'admin' ? 'text-[#D4AF37]' : ''}`}
        >
          <Lock className="w-4 h-4" /> Portal
        </button>
      </div>
    </div>
  </nav>
);

const HomeView = ({ listings, isVip, vipIdentity, setShowVipLogin }) => {
  const [selectedListing, setSelectedListing] = useState(null);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-24">
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center mt-12">
        <div className="typewriter-container mb-6">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl typewriter-text text-white font-bold drop-shadow-lg py-2">
            ELEVATE YOUR <span className="gold-gradient-text">EXISTENCE</span>
          </h1>
        </div>
        <p className="text-gray-100 max-w-2xl text-lg md:text-xl font-medium tracking-wide mb-12 fade-in-up delay-1 drop-shadow-md">
          Exclusive access to the world's most coveted estates, private aviation, and uncompromised luxury services. Reserved for the absolute elite.
        </p>
        <div className="fade-in-up delay-2">
           <a href="#collection" className="gold-button px-10 py-4 rounded-none inline-flex items-center gap-3">
            Explore the Collection
           </a>
        </div>
      </section>

      <section id="collection" className="fade-in-up delay-3 pt-12">
        <div className="flex items-center justify-between mb-16">
          <h2 className="font-serif text-3xl md:text-4xl tracking-widest uppercase">
            Curated <span className="gold-gradient-text">Assets</span>
          </h2>
          <div className="h-[1px] bg-white/20 flex-grow ml-8"></div>
        </div>

        {listings.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-xl border border-white/5">
            <Diamond className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-6" />
            <h3 className="font-serif text-2xl text-white mb-2">The Vault is being curated</h3>
            <p className="text-gray-300 font-light">Our latest acquisitions are currently undergoing private appraisal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((item) => (
              <ListingCard key={item.id} item={item} onClick={() => setSelectedListing(item)} />
            ))}
          </div>
        )}
      </section>

      {selectedListing && (
        <ListingModal 
          item={selectedListing} 
          onClose={() => setSelectedListing(null)} 
          isVip={isVip}
          vipIdentity={vipIdentity}
          setShowVipLogin={setShowVipLogin}
        />
      )}
    </div>
  );
};

const ListingCard = ({ item, onClick }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Estate': return <Home className="w-4 h-4" />;
      case 'Jet': return <Plane className="w-4 h-4" />;
      case 'Yacht': return <Anchor className="w-4 h-4" />;
      case 'Island': return <Diamond className="w-4 h-4" />;
      case 'Service': return <ChefHat className="w-4 h-4" />;
      default: return <Diamond className="w-4 h-4" />;
    }
  };

  const coverImage = (item.images && item.images.length > 0) ? item.images[0] : (item.imageBase64 || item.imageUrl);

  return (
    <div onClick={onClick} className="glass-panel group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full hover-float border border-white/5">
      <div className="relative h-64 overflow-hidden bg-black/50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent z-10 transition-all duration-500"></div>
        <div className="absolute top-4 left-4 z-20 glass-panel px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-[#E5C158] flex items-center gap-2 border border-[#D4AF37]/30">
          {getCategoryIcon(item.category)} {item.category}
        </div>
        <img 
          src={coverImage} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        {!coverImage && <Diamond className="w-10 h-10 text-[#D4AF37]/30 absolute" />}
      </div>
      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/60">
        <h3 className="font-serif text-xl mb-2 text-white font-bold drop-shadow-md group-hover:text-[#FCEE91] transition-colors">{item.title}</h3>
        <p className="text-gray-200 text-sm font-medium leading-relaxed mb-6 flex-grow line-clamp-3">
          {item.description}
        </p>
        <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-auto">
          <span className="text-xs tracking-widest text-gray-300 uppercase font-semibold">Valuation</span>
          <span className="font-serif text-lg text-[#FFF5C3] font-bold tracking-wider">{item.price}</span>
        </div>
      </div>
    </div>
  );
};

const ListingModal = ({ item, onClose, isVip, vipIdentity, setShowVipLogin }) => {
  const [isBooked, setIsBooked] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const images = (item.images && item.images.length > 0) 
    ? item.images 
    : [item.imageBase64 || item.imageUrl].filter(Boolean);

  const hasMultipleImages = images.length > 1;

  const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleSecure = async () => {
    if (!isVip) {
      setShowVipLogin(true);
      return;
    }
    
    setIsProcessing(true);
    try {
      const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
      await addDoc(bookingsRef, {
        assetId: item.id,
        assetTitle: item.title,
        clientIdentity: vipIdentity,
        timestamp: Date.now()
      });
      setIsBooked(true);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md fade-in-up" style={{ animationDuration: '0.3s' }}>
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row rounded-2xl overflow-hidden relative shadow-2xl shadow-black border border-[#D4AF37]/30">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-30 bg-black/60 p-2 rounded-full text-white hover:text-[#FCEE91] transition border border-white/30 hover:border-[#FCEE91] backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="md:w-1/2 h-72 md:h-auto relative group flex items-center bg-black/80 justify-center">
          {images.length > 0 ? (
            <img 
              src={images[currentImgIndex]} 
              alt={`${item.title} - view ${currentImgIndex + 1}`} 
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">No image available</div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r pointer-events-none"></div>
          
          {hasMultipleImages && (
            <>
              <button onClick={prevImg} className="absolute left-4 z-20 bg-black/50 p-2 rounded-full text-white hover:bg-[#D4AF37]/80 hover:text-black transition-all border border-white/20 opacity-0 group-hover:opacity-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextImg} className="absolute right-4 md:right-8 z-20 bg-black/50 p-2 rounded-full text-white hover:bg-[#D4AF37]/80 hover:text-black transition-all border border-white/20 opacity-0 group-hover:opacity-100">
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-[#D4AF37] w-4' : 'bg-white/50 hover:bg-white'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar bg-[#050505]/80">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-[#000] bg-gradient-to-r from-[#D4AF37] to-[#FCEE91] mb-6 w-max">
            {item.category}
          </div>
          
          <h2 className="font-serif text-3xl md:text-5xl text-white mb-4 font-bold leading-tight">{item.title}</h2>
          
          <div className="text-2xl md:text-3xl font-serif text-[#FCEE91] mb-8 pb-8 border-b border-white/20">
            {item.price}
          </div>
          
          <p className="text-gray-100 leading-relaxed font-medium mb-10 text-base md:text-lg">
            {item.description}
          </p>
          
          <div className="mt-auto pt-4">
            <button 
              onClick={handleSecure}
              disabled={isBooked || isProcessing}
              className={`w-full py-5 rounded-md uppercase tracking-[0.2em] font-bold transition-all duration-500 flex items-center justify-center gap-3 ${
                isBooked 
                  ? 'bg-green-900/30 text-green-400 border border-green-500/50' 
                  : 'gold-button shadow-lg shadow-[#D4AF37]/20 text-sm md:text-base'
              }`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : isBooked ? (
                <><Check className="w-5 h-5" /> Concierge Notified</>
              ) : (
                'Secure This Asset'
              )}
            </button>
            {isBooked && (
              <p className="text-center text-xs text-gray-400 mt-4 fade-in-up">
                Aurelia will contact {vipIdentity} shortly to arrange a private viewing.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminView = ({ isUnlocked, setIsUnlocked, listings, user }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'bookings'
  const [bookings, setBookings] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Estate',
    price: '',
    imageFiles: [],
    description: ''
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isUnlocked) return;
    
    // Listen for Bookings
    const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
    const q = query(bookingsRef);
    const unsub = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => b.timestamp - a.timestamp);
      setBookings(items);
    });

    return () => unsub();
  }, [isUnlocked]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password === 'Idole2412') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Invalid access code. Access denied.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormError('');
    if (files.length > 0) {
      setFormData({ ...formData, imageFiles: files });
      
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageFiles.length === 0) {
        setFormError("Please upload at least one image for the asset.");
        return;
    }
    setIsSubmitting(true);
    setFormError('');
    
    try {
      const uploadedUrls = [];
      
      for (const file of formData.imageFiles) {
        const storageRef = ref(storage, `artifacts/${appId}/luxury_images/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }

      const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'luxury_listings');
      await addDoc(collRef, {
        title: formData.title,
        category: formData.category,
        price: formData.price,
        description: formData.description,
        images: uploadedUrls,
        createdAt: Date.now()
      });
      
      setFormData({ title: '', category: 'Estate', price: '', imageFiles: [], description: '' });
      setImagePreviews([]);
      document.getElementById('image-upload-input').value = '';
    } catch (err) {
      console.error("Error adding doc:", err);
      setFormError("Failed to add asset. " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'luxury_listings', id));
    } catch (err) {
      console.error("Error deleting doc:", err);
    }
  };
  
  const handleDeleteBooking = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', id));
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    
    const seedAssets = [
      // Islands
      { title: "Water Cay", category: "Island", price: "$55,000,000", description: "Turks & Caicos. 432 acres of pristine beaches and untouched topography.", images: ["https://images.pexels.com/photos/1005406/pexels-photo-1005406.jpeg"] },
      { title: "Eleuthera Private Island", category: "Island", price: "$43,500,000", description: "Bahamas. Includes deep-water dockage and staff quarters.", images: ["https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg"] },
      { title: "Virgin Gorda Estate", category: "Island", price: "$40,000,000", description: "British Virgin Islands. Dramatic cliffs and coral reefs.", images: ["https://images.pexels.com/photos/38238/maldives-ile-beach-sun-38238.jpeg"] },
      { title: "Exumas Island Retreat", category: "Island", price: "$23,290,000", description: "Bahamas. White sand beaches, private airstrip.", images: ["https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg"] },
      { title: "Motu Nao Nao", category: "Island", price: "Price on Request", description: "French Polynesia. 25 hectares, 800m beach, 3 ultra-luxury bungalows.", images: ["https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"] },
      { title: "Cheval Blanc Randheli", category: "Island", price: "$8,550 / Day", description: "Maldives. 5-bedroom ultra-luxury island haven.", images: ["https://images.pexels.com/photos/1483053/pexels-photo-1483053.jpeg"] },
      { title: "Pumpkin Key", category: "Island", price: "$95,000,000", description: "Florida Keys, USA. 26 acres, 20-slip marina, tennis courts.", images: ["https://images.pexels.com/photos/221436/pexels-photo-221436.jpeg"] },
      { title: "Vatuvara Private Estates", category: "Island", price: "$155,000,000", description: "Fiji. 800-acre volcanic island with golf course and villas.", images: ["https://images.pexels.com/photos/240526/pexels-photo-240526.jpeg"] },
      // Estates
      { title: "Sea Island Estate", category: "Estate", price: "$42,000,000", description: "Georgia, USA. 5 Bed, 9 Bath, 0.75 Acres with ocean views.", images: ["https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"] },
      { title: "Taj Grandeur Residences", category: "Estate", price: "$7,896,528", description: "Palm Jumeirah, Dubai. 5 Bed, 8 Bath, 11,573 Sq. Ft.", images: ["https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg"] },
      { title: "Boca Grande Pass Estate", category: "Estate", price: "$5,575,000", description: "Florida, USA. 5 Bed, 5 Bath, private dock, 0.43 Acres.", images: ["https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg"] },
      { title: "The Holme", category: "Estate", price: "$300,000,000", description: "Regent’s Park, London. 40 bedrooms, 4 acres in central London.", images: ["https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg"] },
      { title: "Casa Encantada", category: "Estate", price: "$195,000,000", description: "Bel-Air, California. 40,000 sq ft, 60 rooms, built in 1930s.", images: ["https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg"] },
      { title: "Villa Les Cèdres", category: "Estate", price: "$410,000,000", description: "French Riviera. 18,000 sq ft, 14 bedrooms, botanical gardens.", images: ["https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg"] },
      { title: "Billionaire Timeless Mansion", category: "Estate", price: "$95,000,000", description: "Emirates Hills, Dubai. 30,000 sq ft, indoor pool, 15-car garage.", images: ["https://images.pexels.com/photos/1125137/pexels-photo-1125137.jpeg"] },
      { title: "Antilia Residence", category: "Estate", price: "$2,000,000,000", description: "Mumbai, India. 27 stories, 3 helipads, 168-car garage.", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Antilia_Mumbai.jpg/800px-Antilia_Mumbai.jpg"] },
      // Yachts
      { title: "Eclipse", category: "Yacht", price: "$1,500,000,000", description: "533 ft (162m). Missile defense, 2 helipads, 2 swimming pools.", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Eclipse_yacht.jpg/800px-Eclipse_yacht.jpg"] },
      { title: "Azzam", category: "Yacht", price: "$600,000,000", description: "590 ft (180m). World's longest yacht, 31.5 knots top speed.", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Azzam_%2816997424040%29.jpg/800px-Azzam_%2816997424040%29.jpg"] },
      { title: "Dilbar", category: "Yacht", price: "$600,000,000", description: "512 ft (156m). Largest gross tonnage, massive indoor pool.", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Dilbar_-_Ona_-_Super_Yacht_-_Antibes.jpg/800px-Dilbar_-_Ona_-_Super_Yacht_-_Antibes.jpg"] },
      { title: "Topaz (A+)", category: "Yacht", price: "$527,000,000", description: "482 ft (147m). 8 decks, cinema, gym, dual helipads.", images: ["https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg"] },
      { title: "Amels Energy", category: "Yacht", price: "$221,443,000", description: "255 ft (77.8m). Built 2022, luxury custom interiors.", images: ["https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg"] },
      { title: "Benetti B. Now 50M", category: "Yacht", price: "$35,000,000", description: "164 ft (50m). Oasis Deck, glass-bottom infinity pool.", images: ["https://images.pexels.com/photos/4005834/pexels-photo-4005834.jpeg"] },
      { title: "Sanlorenzo SL90A", category: "Yacht", price: "$9,200,000", description: "90 ft (27m). Asymmetric design, massive owner's suite.", images: ["https://images.pexels.com/photos/11079140/pexels-photo-11079140.jpeg"] },
      // Jets
      { title: "Airbus A380 Custom", category: "Jet", price: "$600,000,000", description: "Transforms largest passenger jet into a flying palace.", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/A380_Emirates_A6-EDA.jpg/800px-A380_Emirates_A6-EDA.jpg"] },
      { title: "Boeing 747-8 VIP", category: "Jet", price: "$420,000,000", description: "'Queen of the Skies', ultra-long-haul custom luxury.", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Boeing_747-8_first_flight_edit1.jpg/800px-Boeing_747-8_first_flight_edit1.jpg"] },
      { title: "Airbus ACJ350 Custom", category: "Jet", price: "$317,000,000", description: "Wide-body private haven, advanced avionics.", images: ["https://images.pexels.com/photos/20264147/pexels-photo-20264147.jpeg"] },
      { title: "Gulfstream G800", category: "Jet", price: "$72,500,000", description: "Range of 8,000 NM, Mach 0.85, next-gen air filtration.", images: ["https://images.pexels.com/photos/7028711/pexels-photo-7028711.jpeg"] },
      { title: "Gulfstream G700", category: "Jet", price: "$75,000,000", description: "Most spacious cabin in class, up to 5 living areas.", images: ["https://images.pexels.com/photos/3762284/pexels-photo-3762284.jpeg"] },
      { title: "Bombardier Challenger 850", category: "Jet", price: "$10,000,000", description: "16 seats, 69 ft wingspan, incredibly spacious cabin.", images: ["https://images.pexels.com/photos/2800077/pexels-photo-2800077.jpeg"] },
      { title: "Gulfstream G500", category: "Jet", price: "$43,800,000", description: "High-speed cruise, 2020 model, elite comfort.", images: ["https://images.pexels.com/photos/752831/pexels-photo-752831.jpeg"] }
    ];

    try {
      const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'luxury_listings');
      const snapshot = await getDocs(collRef);
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'luxury_listings', docSnap.id)));
      await Promise.all(deletePromises);

      for (let i = 0; i < seedAssets.length; i++) {
        await addDoc(collRef, {
          ...seedAssets[i],
          createdAt: Date.now() - (i * 100)
        });
      }
    } catch (err) {
      console.error("Seed error:", err);
      setFormError("Failed to seed database.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(listings, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "aura_vault_backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center fade-in-up">
        <form onSubmit={handleLogin} className="glass-panel p-10 rounded-2xl w-full max-w-md flex flex-col gap-6">
          <div className="text-center mb-4">
            <Lock className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="font-serif text-2xl tracking-widest">PRIVATE PORTAL</h2>
            <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">Authorized Personnel Only</p>
          </div>
          
          <div className="flex flex-col gap-4">
             <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access Code" 
              className="w-full glass-input px-4 py-3 rounded-md text-center tracking-widest focus:outline-none"
              required
            />
            {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
          </div>
          
          <button type="submit" className="gold-button w-full py-3 rounded-md mt-2">
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto fade-in-up">
      <div className="flex items-center justify-between mb-10">
        <h2 className="font-serif text-3xl tracking-widest">Asset Management</h2>
        <button onClick={() => setIsUnlocked(false)} className="text-sm text-gray-400 hover:text-white uppercase tracking-widest">
          Lock Portal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl flex flex-col gap-4">
            <h3 className="font-serif text-xl mb-2 text-[#D4AF37]">Add New Asset</h3>
            
            <input required name="title" value={formData.title} onChange={handleChange} placeholder="Asset Title (e.g. Monaco Penthouse)" className="glass-input p-3 text-sm rounded" />
            
            <select name="category" value={formData.category} onChange={handleChange} className="glass-input p-3 text-sm rounded appearance-none cursor-pointer [&>option]:bg-[#111] [&>option]:text-white">
              <option value="Estate">Estate</option>
              <option value="Jet">Private Jet</option>
              <option value="Yacht">Yacht</option>
              <option value="Island">Private Island</option>
              <option value="Service">Exclusive Service</option>
            </select>
            
            <input required name="price" value={formData.price} onChange={handleChange} placeholder="Price / Valuation (e.g. $45,000,000)" className="glass-input p-3 text-sm rounded" />
            
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-widest ml-1">Asset Images</label>
              <input 
                id="image-upload-input"
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageUpload} 
                className="glass-input p-2 text-sm rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-[#F7E7CE] transition-all cursor-pointer text-gray-400" 
              />
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
                  {imagePreviews.map((preview, idx) => (
                    <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="h-20 w-20 object-cover rounded border border-[#D4AF37]/30 flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>
            
            <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Luxurious description..." rows="4" className="glass-input p-3 text-sm rounded resize-none" />
            
            {formError && <p className="text-red-400 text-xs text-center">{formError}</p>}

            <button disabled={isSubmitting} type="submit" className="gold-button py-3 mt-2 rounded flex justify-center items-center gap-2 disabled:opacity-50">
              {isSubmitting ? 'Processing...' : <><Plus className="w-4 h-4" /> Add to Vault</>}
            </button>
          </form>

          <div className="glass-panel p-6 rounded-xl mt-6 border-t border-dashed border-[#D4AF37]/30 bg-black/40">
            <h3 className="font-serif text-lg mb-2 text-[#D4AF37]">Developer Tools</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">Populates the database with exactly 30 unique, researched ultra-luxury assets. Existing items will be cleared to prevent duplicates.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSeedDatabase} 
                disabled={isSeeding} 
                className="w-full py-3 rounded text-sm uppercase tracking-widest font-bold border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSeeding ? (
                  <>
                    <div className="w-3 h-3 rounded-full border-2 border-t-transparent border-[#D4AF37] animate-spin"></div>
                    Seeding Vault...
                  </>
                ) : (
                  'Seed 30 Assets'
                )}
              </button>
              
              <button 
                onClick={handleExport} 
                type="button"
                className="w-full py-3 rounded text-sm uppercase tracking-widest font-bold border border-gray-600 text-gray-300 hover:bg-white/5 transition-all flex justify-center items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export Vault Backup
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-xl overflow-hidden flex flex-col h-[750px]">
          <div className="flex gap-6 mb-6 border-b border-white/10 pb-4">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`font-serif text-xl transition-colors ${activeTab === 'inventory' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-white'}`}
            >
              Inventory ({listings.length})
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`font-serif text-xl transition-colors flex items-center gap-2 ${activeTab === 'bookings' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-white'}`}
            >
              Client Inquiries {bookings.length > 0 && <span className="bg-[#D4AF37] text-black text-xs px-2 py-1 rounded-full">{bookings.length}</span>}
            </button>
          </div>
          
          <div className="overflow-y-auto pr-2 flex flex-col gap-4 flex-grow custom-scrollbar">
            {activeTab === 'inventory' ? (
              listings.length === 0 ? (
                 <p className="text-gray-500 text-sm italic text-center py-10">No assets in inventory.</p>
              ) : (
                listings.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="w-24 h-24 shrink-0 rounded overflow-hidden bg-black/50 flex items-center justify-center relative">
                      <img 
                        src={item.images?.[0] || item.imageBase64 || item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover relative z-10" 
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                      <Diamond className="w-6 h-6 text-[#D4AF37]/30 absolute z-0" />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-lg">{item.title}</h4>
                        <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Remove Asset">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1 mb-2">{item.category} &bull; {item.price}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))
              )
            ) : (
              bookings.length === 0 ? (
                 <p className="text-gray-500 text-sm italic text-center py-10">No VIP inquiries yet.</p>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="flex gap-4 p-5 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"></div>
                    <div className="w-12 h-12 shrink-0 rounded-full bg-black flex items-center justify-center border border-[#D4AF37]/30">
                      <Users className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">VIP Client</p>
                          <h4 className="font-bold text-white text-lg">{booking.clientIdentity}</h4>
                        </div>
                        <button onClick={() => handleDeleteBooking(booking.id)} className="text-gray-500 hover:text-green-400 transition-colors" title="Mark as Handled">
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-3 p-3 bg-black/40 rounded border border-white/5">
                        <p className="text-sm text-gray-300">
                          Requested to secure <span className="font-bold text-[#FCEE91]">{booking.assetTitle}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(booking.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Welcome. I am Aurelia, your private luxury concierge. How may I assist you with elevating your lifestyle today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const systemPrompt = "You are Aurelia, an exclusive luxury concierge AI for an ultra-premium real estate and lifestyle platform called 'AURA'. Your clientele consists of billionaires and high-net-worth individuals looking for private jets, mega yachts, private islands, and luxury estates. Your tone is impeccable, discreet, refined, highly sophisticated, and incredibly helpful. Do not use overly enthusiastic punctuation. Keep responses elegant, professional, and concise. Never mention you are an AI or Gemini, you are simply Aurelia.";

      const chatHistory = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

      const payload = {
        contents: chatHistory,
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
        setMessages(prev => [...prev, { role: 'model', content: data.candidates[0].content.parts[0].text }]);
      } else {
         setMessages(prev => [...prev, { role: 'model', content: "Apologies, my connection to the concierge network was momentarily interrupted. Could you repeat that?" }]);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "I am currently unable to process your request. Please try again momentarily." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <div 
        className={`glass-panel w-80 sm:w-96 rounded-2xl overflow-hidden mb-4 transition-all duration-500 origin-bottom-right shadow-2xl shadow-black/80 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
        }`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}
      >
        <div className="bg-black/60 p-4 border-b border-[#D4AF37]/20 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F7E7CE] flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                 <Diamond className="w-4 h-4 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <h3 className="font-serif text-sm text-[#F7E7CE] tracking-wider">AURELIA</h3>
              <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest">Private Concierge</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3 text-sm leading-relaxed rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-[#D4AF37]/20 text-white rounded-br-sm border border-[#D4AF37]/30' 
                    : 'bg-white/5 text-gray-200 rounded-bl-sm border border-white/10'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-3 rounded-2xl rounded-bl-sm border border-white/10 flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/10 shrink-0 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Inquire with Aurelia..."
            className="flex-grow bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/40 disabled:opacity-50 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center transition-all duration-500 hover:scale-110 ${
          isOpen ? 'bg-white/10 border border-white/20 scale-90' : 'bg-gradient-to-tr from-[#B38728] to-[#FCF6BA] border border-[#D4AF37]'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-black" />}
      </button>
    </div>
  );
};

const VipAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl fade-in-up" style={{ animationDuration: '0.4s' }}>
      <div className="glass-panel p-10 rounded-2xl w-full max-w-md relative border border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-[#D4AF37] transition">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-8">
          <Diamond className="w-12 h-12 text-[#D4AF37] mx-auto mb-4 animate-pulse" />
          <h2 className="font-serif text-2xl tracking-widest text-white">AURA MEMBER</h2>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-2">Authentication Required</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSuccess(email); }} className="flex flex-col gap-5">
          <input 
            type="text" 
            placeholder="Membership ID or Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="glass-input px-4 py-4 rounded text-center tracking-widest focus:outline-none w-full bg-white/5" 
          />
          <input 
            type="password" 
            placeholder="Passcode" 
            required 
            className="glass-input px-4 py-4 rounded text-center tracking-widest focus:outline-none w-full bg-white/5" 
          />
          <button type="submit" className="gold-button w-full py-4 rounded-md mt-4 tracking-[0.2em]">
            Verify Identity
          </button>
        </form>
      </div>
    </div>
  );
};