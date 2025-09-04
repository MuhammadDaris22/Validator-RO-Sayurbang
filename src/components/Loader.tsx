
import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    <p className="ml-4 text-slate-600">Memproses data Anda...</p>
  </div>
);
