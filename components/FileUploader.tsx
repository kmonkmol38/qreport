
import React, { useRef, useState } from 'react';
import * as XLSX from 'https://esm.sh/xlsx';
import { Employee } from '../types';
import { EXCEL_HEADERS } from '../constants';
import { AuthModal } from './AuthModal';

interface FileUploaderProps {
  onDataLoaded: (data: Employee[], fileName: string) => void;
  label?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded, label = "Upload Excel (.xlsx)" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Filter out empty rows (common in Excel exports)
        const employees: Employee[] = data
          .map((row: any) => ({
            employeeId: row[EXCEL_HEADERS.EMPLOYEE_ID]?.toString().trim() || '',
            employeeName: row[EXCEL_HEADERS.EMPLOYEE_NAME]?.toString().trim() || '',
            mealType: row[EXCEL_HEADERS.MEAL_TYPE]?.toString().trim() || '',
            companyName: row[EXCEL_HEADERS.COMPANY_NAME]?.toString().trim() || '',
            campAllocation: row[EXCEL_HEADERS.CAMP_ALLOCATION]?.toString().trim() || '',
            accessCard: row[EXCEL_HEADERS.ACCESS_CARD]?.toString().trim() || '',
            cardNumber: row[EXCEL_HEADERS.CARD_NUMBER]?.toString().trim() || ''
          }))
          .filter(emp => emp.employeeId && emp.employeeName); // Ensure basic data exists

        if (employees.length === 0) {
          alert("No valid employee records found in the file.");
          return;
        }

        onDataLoaded(employees, fileName);
      } catch (error) {
        console.error("Error parsing Excel file", error);
        alert("Failed to parse Excel file. Please ensure it matches the required format.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <div className="relative group w-full">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <button
          onClick={() => setIsAuthOpen(true)}
          className="w-full cursor-pointer flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all border border-zinc-700 hover:border-cyan-500/50 shadow-xl"
        >
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          {label}
        </button>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />
    </>
  );
};
