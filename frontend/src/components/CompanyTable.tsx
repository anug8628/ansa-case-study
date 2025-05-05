import React, { useState, useMemo } from 'react';
import CompanyDetailModal from './CompanyDetailModal';

interface CompanyTableProps {
  companies: any[];
}

const CompanyTable: React.FC<CompanyTableProps> = ({ companies }) => {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState('similarity_score');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'name',
    'similarity_score',
    'log_funding_total',
    'log_headcount',
  ]);

  const allExportableColumns = [
    'name',
    'similarity_score',
    'log_funding_total',
    'log_headcount',
  ];

  const uniqueSectors = useMemo(() => {
    const sectors = new Set<string>();
    companies.forEach(c => {
      Object.entries(c).forEach(([key, value]) => {
        if (key.startsWith('sector_') && value) sectors.add(key.replace('sector_', ''));
      });
    });
    return ['All', ...Array.from(sectors)];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies
      .filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))
      .filter(c => selectedSector === 'All' || c[`sector_${selectedSector}`])
      .sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
  }, [companies, search, selectedSector, sortBy]);

  const handleRowClick = (company: any) => {
    setSelectedCompany(company);
  };

  const handleCloseModal = () => {
    setSelectedCompany(null);
  };

  const handleExport = (dataToExport: any[]) => {
    const csvHeader = selectedColumns.join(',');
    const csvRows = dataToExport.map(row =>
      selectedColumns.map(col => JSON.stringify(row[col] ?? '')).join(',')
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'companies_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  return (
    <div>
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-64"
        />

        <select
          value={selectedSector}
          onChange={e => setSelectedSector(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {uniqueSectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-sm font-medium">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="similarity_score">Similarity Score</option>
            <option value="log_funding_total">Funding</option>
            <option value="log_headcount">Headcount</option>
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {allExportableColumns.map(col => (
            <label key={col} className="text-sm">
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={() => toggleColumn(col)}
                className="mr-1"
              />
              {col}
            </label>
          ))}
        </div>

        <button
          onClick={() => handleExport(filteredCompanies)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export Filtered
        </button>
        <button
          onClick={() => handleExport(companies)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Export All
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Funding</th>
              <th className="px-4 py-2">Headcount</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => (
              <tr
                key={company.company_id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(company)}
              >
                <td className="px-4 py-2">{company.name}</td>
                <td className="px-4 py-2">{company.similarity_score?.toFixed(3)}</td>
                <td className="px-4 py-2">{company.log_funding_total?.toFixed(2)}</td>
                <td className="px-4 py-2">{company.log_headcount?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CompanyTable;