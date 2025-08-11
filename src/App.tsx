import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import Listings from './Pages/Listings';
import Detail from './Pages/Detail';
import AboutUs from './Pages/AboutUs';
import Contact from './Pages/Contact';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Profile from './Pages/Profile';
import Developer from './Pages/Developer';
import PropertyDetails from './Pages/PropertyDetails';

// Define the type for ScrollToTop component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log('ScrollToTop: Scrolling to top for pathname:', pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// Define the type for App component
const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('App: Checking initial load');
    // Simulate a quick check for readiness (e.g., assets or auth)
    const checkLoad = async () => {
      try {
        // Add any async checks here (e.g., auth or Supabase ping) if needed
        console.log('App: Load check passed');
        setLoading(false);
      } catch (error) {
        console.error('App: Load check failed', error);
        setLoading(false); // Proceed even if check fails to avoid being stuck
      }
    };

    checkLoad();
    return () => console.log('App: Cleaning up load effect');
  }, []);

  if (loading) {
    console.log('App: Rendering loading screen');
    return (
      <div className="min-h-screen flex justify-center items-center w-full bg-white" aria-busy="true">
        <div className="flex flex-col items-center">
          <img
            src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg"
            alt="Zivaas Logo"
            className="h-32 w-auto object-contain animate-pulse"
            onLoad={() => console.log('App: Logo image loaded successfully')}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              console.error('App: Failed to load logo image');
              e.currentTarget.src = 'https://via.placeholder.com/128x128?text=Logo'; // Fallback image
            }}
          />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('App: Rendering main content');
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <noscript>Please enable JavaScript to use this application.</noscript>
      <Header />
      <ScrollToTop />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/properties/developer/:developerName" element={<PropertyDetails />} />
          <Route path="/listings/:id" element={<Detail />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<div className="text-center p-8">404: Page Not Found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;