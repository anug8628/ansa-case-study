import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import './index.css';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/NavBar';
import CompanyTable from './components/CompanyTable';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    
    axios.get(`${apiBaseUrl}/api/companies`)
      .then(res => {
        console.log("Received data:", res.data);
        setCompanies(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error('Failed to fetch companies:', err);
        setCompanies([]);
      });
  }, []);
  
  useEffect(() => {
    console.log("Updated companies state:", companies);
  }, [companies]);
  


  return (
    <>
      {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}

      <div className={`min-h-screen transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"} bg-gray-50 text-gray-800 pt-16`}>
        <Navbar />
        <main className="p-6 max-w-7xl mx-auto">
          <CompanyTable companies={companies} />
        </main>
      </div>
    </>
  );
}

export default App;
