import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { AnimatePresence, motion } from 'framer-motion';
import { PricingPlans } from '../components/subscription/PricingPlans';

export function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    '/im1.svg',
    '/im2.svg',
    '/im3.svg',
    '/im4.svg',
    '/im5.svg'
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  const supportedDAWs = [
    { name: 'Logic Pro', icon: '/logicpro.svg' },
    { name: 'FL Studio', icon: '/flstudio.svg' },
    { name: 'Ableton Live', icon: '/ableton.svg' },
    { name: 'Cubase', icon: '/cubase.svg' },
    { name: 'Pro Tools', icon: '/protools.svg' },
    { name: 'Logic Pro', icon: '/logicpro.svg' },
    { name: 'FL Studio', icon: '/flstudio.svg' },
    { name: 'Ableton Live', icon: '/ableton.svg' },
    { name: 'Cubase', icon: '/cubase.svg' },
    { name: 'Pro Tools', icon: '/protools.svg' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <h1 className="text-6xl font-black mb-6">
                Discover.<br />
                Share.<br />
                Create.
              </h1>
              <p className="text-xl mb-8 text-gray-800">
                Download professional project files<br />
                or sell your own.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/browse" className="btn-primary">
                  Browse Projects
                </Link>
                <Link to="/upload" className="btn-secondary">
                  Upload your session
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative aspect-[4/3] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt="Studio Setup"
                  className="absolute inset-0 w-full h-full object-contain"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it Works */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-12">How it Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <img 
                src="/upload.svg" 
                alt="Upload" 
                className="h-32 w-32 mx-auto mb-6"
              />
              <h3 className="text-xl font-bold mb-2">Upload Your Session</h3>
              <p className="text-gray-600">
                Share your project files from any major DAW platform
              </p>
            </div>
            
            <div className="text-center">
              <img 
                src="/prices.svg" 
                alt="Set Price" 
                className="h-32 w-32 mx-auto mb-6"
              />
              <h3 className="text-xl font-bold mb-2">Set Price or Free</h3>
              <p className="text-gray-600">
                Choose to share for free or set your own price
              </p>
            </div>
            
            <div className="text-center">
              <img 
                src="/discover.svg" 
                alt="Get Discovered" 
                className="h-32 w-32 mx-auto mb-6"
              />
              <h3 className="text-xl font-bold mb-2">Get Discovered</h3>
              <p className="text-gray-600">
                Reach producers worldwide and grow your audience
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular DAWs */}
      <section className="py-12 overflow-hidden">
        <div className="w-screen">
          <div className="relative overflow-hidden w-full">
            <div className="animate-scroll">
              <div className="flex gap-32">
                {supportedDAWs.map((daw, index) => (
                  <Link 
                    key={`${daw.name}-${index}`}
                    to={`/browse?dawType=${encodeURIComponent(daw.name)}`} 
                    className="flex-shrink-0"
                  >
                    <img 
                      src={daw.icon}
                      alt={daw.name}
                      className="daw-icon"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <PricingPlans />
      
      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to share your music?</h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join our community of producers and start sharing your projects today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-black hover:bg-gray-100">
              Create Account
            </Link>
            <Link to="/browse" className="btn border-white text-white hover:bg-white/10">
              Browse Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}