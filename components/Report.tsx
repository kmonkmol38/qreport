
import React, { useState, useMemo, useEffect } from 'react';
import { Employee } from '../types';

interface ReportProps {
  employees: Employee[];
  onRecordSelect: (emp: Employee) => void;
}

export const Report: React.FC<ReportProps> = ({ employees, onRecordSelect }) => {
  const [filters, setFilters] = useState({
    mealType: 'All',
    company: 'All',
    camp: 'All'
  });

  // Calculate dynamic options based on current filters (Cascading Filters)
  const options = useMemo(() => {
    const meals = ['All', ...new Set(employees
      .filter(e => (filters.company === 'All' || e.companyName === filters.company) && (filters.camp === 'All' || e.campAllocation === filters.camp))
      .map(e => e.mealType).filter(Boolean))].sort();

    const companies = ['All', ...new Set(employees
      .filter(e => (filters.mealType === 'All' || e.mealType === filters.mealType) && (filters.camp === 'All' || e.campAllocation === filters.camp))
      .map(e => e.companyName).filter(Boolean))].sort();

    const camps = ['All', ...new Set(employees
      .filter(e => (filters.company === 'All' || e.companyName === filters.company) && (filters.mealType === 'All' || e.mealType === filters.mealType))
      .map(e => e.campAllocation).filter(Boolean))].sort();

    return { meals, companies, camps };
  }, [employees, filters]);

  // Auto-reset filters if current selection becomes unavailable
  useEffect(() => {
    let changed = false;
    const newFilters = { ...filters };

    if (filters.mealType !== 'All' && !options.meals.includes(filters.mealType)) {
      newFilters.mealType = 'All';
      changed = true;
    }
    if (filters.company !== 'All' && !options.companies.includes(filters.company)) {
      newFilters.company = 'All';
      changed = true;
    }
    if (filters.camp !== 'All' && !options.camps.includes(filters.camp)) {
      newFilters.camp = 'All';
      changed = true;
    }

    if (changed) {
      setFilters(newFilters);
    }
  }, [options, filters]);

  const filteredData = useMemo(() => {
    return employees.filter(emp => {
      const matchMeal = filters.mealType === 'All' || emp.mealType === filters.mealType;
      const matchCompany = filters.company === 'All' || emp.companyName === filters.company;
      const matchCamp = filters.camp === 'All' || emp.campAllocation === filters.camp;
      return matchMeal && matchCompany && matchCamp;
    });
  }, [employees, filters]);

  const handleExportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    // Portrait orientation (p), A4 paper
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Request: Left and right margin 0.5 mm
    const marginSize = 0.5;
    const pageWidth = 210;
    const usableWidth = pageWidth - (marginSize * 2); // 209mm

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Record Master Report', marginSize + 2, 15);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const stats = `Generated: ${new Date().toLocaleString()} | Selection: ${filteredData.length} records`;
    doc.text(stats, marginSize + 2, 21);

    const tableData = filteredData.map(emp => [
      emp.employeeId || '',
      emp.employeeName || '',
      emp.companyName || '',
      emp.mealType || '',
      emp.campAllocation || '',
      emp.accessCard || '',
      emp.cardNumber || ''
    ]);

    (doc as any).autoTable({
      startY: 25,
      head: [['ID', 'Name', 'Company', 'Meal', 'Camp', 'Acc.', 'Card No']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 0, 0], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold', 
        halign: 'center',
        fontSize: 8
      },
      styles: { 
        fontSize: 7, 
        cellPadding: 1, 
        overflow: 'linebreak',
        valign: 'middle'
      },
      // Expanded column widths to fill 209mm (Total = 209)
      columnStyles: {
        0: { cellWidth: 14 },  // ID
        1: { cellWidth: 44 },  // Name
        2: { cellWidth: 49 },  // Company
        3: { cellWidth: 21 },  // Meal
        4: { cellWidth: 29 },  // Camp
        5: { cellWidth: 17 },  // Acc
        6: { cellWidth: 35 },  // Card No
      },
      margin: { left: marginSize, right: marginSize },
      didDrawPage: (data: any) => {
        const str = `Page ${doc.internal.getNumberOfPages()}`;
        doc.setFontSize(7);
        doc.text(str, doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 5);
      }
    });

    doc.save(`Employee_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-zinc-900/30 p-8 rounded-[2rem] border border-white/5">
        <div className="space-y-4 w-full md:w-auto">
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Records <span className="text-cyan-400">Hub</span></h2>
          <div className="flex flex-wrap gap-4">
            <StatPill label="Database Size" value={employees.length} color="text-zinc-400" />
            <StatPill label="Found" value={filteredData.length} color="text-cyan-400" />
          </div>
        </div>
        <button 
          onClick={handleExportPDF}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
          disabled={filteredData.length === 0}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Export Portrait PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterSelect 
          label="Meal Filter" 
          value={filters.mealType} 
          options={options.meals} 
          onChange={(v) => setFilters(prev => ({...prev, mealType: v}))}
        />
        <FilterSelect 
          label="Organization" 
          value={filters.company} 
          options={options.companies} 
          onChange={(v) => setFilters(prev => ({...prev, company: v}))}
        />
        <FilterSelect 
          label="Location/Camp" 
          value={filters.camp} 
          options={options.camps} 
          onChange={(v) => setFilters(prev => ({...prev, camp: v}))}
        />
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <th className="px-6 py-5 border-b border-white/5">ID</th>
                <th className="px-6 py-5 border-b border-white/5">Full Name</th>
                <th className="px-6 py-5 border-b border-white/5">Company</th>
                <th className="px-6 py-5 border-b border-white/5">Meal</th>
                <th className="px-6 py-5 border-b border-white/5">Camp</th>
                <th className="px-6 py-5 border-b border-white/5 text-right">Card No</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredData.length > 0 ? filteredData.map((emp) => (
                <tr 
                  key={emp.employeeId + emp.cardNumber}
                  onDoubleClick={() => onRecordSelect(emp)}
                  className="group hover:bg-cyan-500/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                >
                  <td className="px-6 py-4 font-black text-cyan-500/70 group-hover:text-cyan-400">{emp.employeeId}</td>
                  <td className="px-6 py-4 font-bold text-zinc-200">{emp.employeeName}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400 max-w-[200px] truncate">{emp.companyName}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-zinc-300">{emp.mealType}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{emp.campAllocation}</td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-500 group-hover:text-white">{emp.cardNumber}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                    No results for current selection
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="text-center text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-4">
        Double click any record to view profile
      </p>
    </div>
  );
};

const StatPill = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mr-2">{label}:</span>
    <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);

const FilterSelect = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
