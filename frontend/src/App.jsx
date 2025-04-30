import React, { useState, useEffect } from 'react';
import Input from './components/ui/Input';
import Card from './components/Card';
import axios from 'axios';

const App = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    // Fetch companies from backend API
    axios.get('http://localhost:5000/api/companies')
      .then(response => {
        setCompanies(response.data);
      })
      .catch(error => console.error(error));
  }, []);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Company Scoring</h1>
      <Input value={search} onChange={handleSearchChange} placeholder="Search for a company" />
      
      <div className="company-list">
        {filteredCompanies.map(company => (
          <Card key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
};

export default App;