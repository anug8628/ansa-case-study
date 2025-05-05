import React, { useState, useMemo, useEffect } from 'react';
import CompanyDetailModal from './CompanyDetailModal';

interface CompanyTableProps {
  companies: any[];
}

type SortDirection = 'asc' | 'desc';

interface SortOption {
  column: string;
  direction: SortDirection;
}

const CompanyTable: React.FC<CompanyTableProps> = ({ companies }) => {
  // State hooks for search, selected sector, and selected company
  const [search, setSearch] = useState('');
  const [domainSearch, setDomainSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'name',
    'similarity_score',
    'most_similar_company',
    'funding_total',
    'headcount',
    'domain_only'
  ]);

  // Sort options state to manage column sorting
  const [sortOptions, setSortOptions] = useState<SortOption[]>([
    { column: 'similarity_score', direction: 'desc' }
  ]);

  // List of all columns that can be exported to CSV
  const allExportableColumns = [
    'company_id', 'name', 'similarity_score',
    'funding_total', 'headcount',
    'log_funding_total', 'log_headcount',
    'gpt_sector',
    'last_funding_type', 'last_funding_total', 'funding_stage',
    'domain_only', 'description',
    'last_funding_date', 'years_since_founding',
    'most_similar_company'
  ];

  // Generate unique sectors from the company data dynamically
  const uniqueSectors = useMemo(() => {
    const sectors = new Set<string>();
    companies.forEach(c => {
      Object.entries(c).forEach(([key, value]) => {
        if (key.startsWith('sector_') && value) sectors.add(key.replace('sector_', ''));
      });
    });
    return ['All', ...Array.from(sectors)];
  }, [companies]);

  // Debounced search states to avoid excessive re-renders
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedDomainSearch, setDebouncedDomainSearch] = useState(domainSearch);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);  // Delay to wait for user input
    return () => clearTimeout(timer); 
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDomainSearch(domainSearch), 500);  // Same for domain search
    return () => clearTimeout(timer); 
  }, [domainSearch]);

  // Filter companies based on search, selected sector, and domain
  const filteredCompanies = useMemo(() => {
    const filtered = companies
      .filter(c => c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .filter(c => selectedSector === 'All' || c[`sector_${selectedSector}`])
      .filter(c => c.domain_only?.toLowerCase().includes(debouncedDomainSearch.toLowerCase()));

    return filtered;
  }, [companies, debouncedSearch, selectedSector, debouncedDomainSearch]);

  // Sort filtered companies based on the selected sort options
  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      for (const { column, direction } of sortOptions) {
        const aVal = a[column] ?? 0;
        const bVal = b[column] ?? 0;
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredCompanies, sortOptions]);

  // Handle row click to open company details in a modal
  const handleRowClick = (company: any) => {
    setSelectedCompany(company);
  };

  // Close the company details modal
  const handleCloseModal = () => {
    setSelectedCompany(null);
  };

  // Export filtered data or all data as CSV
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

  // Toggle column visibility for CSV export
  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  // Handle column sorting (ascending or descending)
  const handleSort = (column: string) => {
    setSortOptions(prev => {
      const existing = prev.find(s => s.column === column);
      if (existing) {
        // Toggle direction and move to front
        const updated = prev.map(s =>
          s.column === column
            ? { column, direction: s.direction === 'asc' ? 'desc' : 'asc' }
            : s
        );

        const sorted = updated.sort((a, b) =>
          a.column === column ? -1 : b.column === column ? 1 : 0
        );
        return sorted as SortOption[];
      } else {
        return [{ column, direction: 'desc' as SortDirection }, ...prev];
      }
    });
  };

  // Get sort indicator (arrow) based on column sorting direction
  const getSortIndicator = (column: string) => {
    const entry = sortOptions.find(s => s.column === column);
    if (!entry) return '';
    return entry.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div>
      {/* Search, filtering, and column selection UI */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-64"
        />

        <input
          type="text"
          placeholder="Search by domain"
          value={domainSearch}
          onChange={e => setDomainSearch(e.target.value)}
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

        {/* Checkboxes for column selection */}
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

        {/* Buttons for exporting filtered or all data */}
        <button
          onClick={() => handleExport(sortedCompanies)}
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

      {/* Table displaying the sorted and filtered company data */}
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('name')}>
                Name {getSortIndicator('name')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('domain_only')}>
                Domain {getSortIndicator('domain_only')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('similarity_score')}>
                Score {getSortIndicator('similarity_score')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('most_similar_company')}>
                Most Similar Company {getSortIndicator('most_similar_company')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('funding_total')}>
                Funding (Million) {getSortIndicator('funding_total')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('headcount')}>
                Headcount {getSortIndicator('headcount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCompanies.map(company => (
              <tr
                key={company.company_id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(company)}
              >
                <td className="px-4 py-2">{company.name}</td>
                <td className="px-4 py-2">{company.domain_only}</td>
                <td className="px-4 py-2">{company.similarity_score?.toFixed(3)}</td>
                <td className="px-4 py-2">{company.most_similar_company}</td>
                <td className="px-4 py-2">{company.funding_total?.toFixed(5)}</td>
                <td className="px-4 py-2">{company.headcount?.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show modal with company details */}
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