import React from 'react';

interface CompanyDetailModalProps {
  company: any;
  onClose: () => void;
}

const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{company.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>
        <pre className="text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
          {JSON.stringify(company, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CompanyDetailModal;
