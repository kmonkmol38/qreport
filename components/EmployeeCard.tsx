
import React from 'react';
import { Employee } from '../types';

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  return (
    <div className="relative group">
      {/* Dynamic Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-700"></div>
      
      <div className="relative glass-card rounded-[2rem] overflow-hidden p-8 border border-white/10 shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10 pb-8 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                ID: {employee.employeeId}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                Card: {employee.cardNumber}
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white leading-none pt-2">
              {employee.employeeName}
            </h2>
          </div>
          <div className="bg-zinc-950/50 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center min-w-[100px]">
             <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Access</div>
             <div className={`text-sm font-bold ${employee.accessCard?.toLowerCase() === 'active' || employee.accessCard?.toLowerCase() === 'yes' ? 'text-emerald-400' : 'text-zinc-300'}`}>
               {employee.accessCard || 'N/A'}
             </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailBox label="Meal Type" value={employee.mealType} icon="🍱" color="text-orange-400" />
          <DetailBox label="Company" value={employee.companyName} icon="🏢" color="text-blue-400" />
          <DetailBox label="Camp Allocation" value={employee.campAllocation} icon="📍" color="text-lime-400" />
          <DetailBox label="System Status" value="Verified" icon="🛡️" color="text-cyan-400" />
        </div>
      </div>
    </div>
  );
};

const DetailBox: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 transition-colors hover:bg-white/[0.07]">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</span>
    </div>
    <div className={`text-base font-bold truncate ${color}`}>
      {value || 'Not Assigned'}
    </div>
  </div>
);
