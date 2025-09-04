import React from 'react';

const StoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0 0 12.75 12h-3a.75.75 0 0 0-.75.75V21m-4.5 0H21m-16.5 0H21m-16.5 0v-7.5A.75.75 0 0 0 3.75 12h-3a.75.75 0 0 0-.75.75V21m18 0v-7.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21m-4.5 0H21m-9-18.75h.008v.008H12v-.008ZM12 3.75h.008v.008H12V3.75Zm0 3.75h.008v.008H12v-.008Zm0 3.75h.008v.008H12v-.008Z" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-full">
                <StoreIcon className="h-6 w-6 text-emerald-600"/>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                Validator RO Bahan <span className="text-emerald-600">Sayurbang</span>
            </h1>
        </div>
      </div>
    </header>
  );
};
