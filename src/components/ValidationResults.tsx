import React from 'react';
import type { Invoice, ValidationError } from '../types.ts';

interface ValidationResultsProps {
  errors: ValidationError[];
  totalRows: number;
  invoices: Invoice[];
  onDownloadCsv: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const ExclamationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const ValidationResults: React.FC<ValidationResultsProps> = ({ errors, totalRows, invoices, onDownloadCsv }) => {
  if (errors.length === 0 && totalRows === 0) {
    return null;
  }

  const hasErrors = errors.length > 0;
  const inconsistentInvoices = invoices.filter(invoice => invoice.hasPriceInconsistency);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getWarningCount = (errs: ValidationError[]): number => {
    return errs.filter(e => e.isPriceInconsistency || e.row > 0).length;
  }
  const warningCount = getWarningCount(errors);

  return (
    <div className={`p-6 rounded-xl shadow-md ${hasErrors ? 'bg-yellow-50' : 'bg-green-50'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
            {hasErrors ? <ExclamationIcon /> : <CheckIcon />}
            <div className="ml-4">
            <h3 className={`text-lg font-bold ${hasErrors ? 'text-yellow-800' : 'text-green-800'}`}>
                {hasErrors ? `Ditemukan ${warningCount} Peringatan` : 'Validasi Berhasil'}
            </h3>
            <p className={`text-sm ${hasErrors ? 'text-yellow-700' : 'text-green-700'}`}>
                {hasErrors ? 'Harap tinjau peringatan berikut. Data tetap dimuat.' : `Semua ${totalRows} baris data valid dan berhasil dimuat.`}
            </p>
            </div>
        </div>
        {totalRows > 0 && (
            <button
                onClick={onDownloadCsv}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors flex-shrink-0"
            >
                <DownloadIcon />
                Unduh Hasil (.csv)
            </button>
        )}
      </div>
      
      {hasErrors && (
        <div className="mt-4 space-y-6">
            <ul className="pl-6 space-y-2 list-disc list-inside bg-white p-4 rounded-lg border border-yellow-200">
            {errors.map((error, index) => {
                if (error.isPriceInconsistency && error.prices && error.itemName) {
                    const minPrice = Math.min(...error.prices);
                    const maxPrice = Math.max(...error.prices);

                    return (
                        <li key={index} className="text-sm text-yellow-900">
                            Harga tidak konsisten untuk item '{error.itemName}'. Ditemukan harga:{' '}
                            {error.prices.map((p, i) => {
                                const isSignificantPrice = error.isSignificant && (p === minPrice || p === maxPrice);
                                return (
                                    <span key={i}>
                                        <span className={isSignificantPrice ? 'font-bold text-red-600 bg-red-100 px-1 rounded' : ''}>
                                            {formatCurrency(p)}
                                        </span>
                                        {i < error.prices!.length - 1 ? ', ' : ''}
                                    </span>
                                );
                            })}. Baris yang relevan ditandai.
                        </li>
                    );
                }
                
                if(error.row > 0) {
                    return (
                        <li key={index} className="text-sm text-yellow-900">
                            <span className="font-semibold">Baris {error.row}:</span>{' '}
                            {error.message}
                        </li>
                    );
                }
                
                return null;
            })}
            </ul>

            {inconsistentInvoices.length > 0 && (
                <div>
                    <h4 className="font-bold text-yellow-800 mb-2">Rekapan Semua Inkonsistensi Harga</h4>
                    <div className="bg-white p-2 rounded-lg border border-yellow-200 overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-yellow-100">
                                <tr>
                                    <th scope="col" className="px-4 py-2 rounded-l-lg">No</th>
                                    <th scope="col" className="px-4 py-2">Tgl Permintaan</th>
                                    <th scope="col" className="px-4 py-2">Pemesan</th>
                                    <th scope="col" className="px-4 py-2">Item</th>
                                    <th scope="col" className="px-4 py-2 text-right">Jumlah</th>
                                    <th scope="col" className="px-4 py-2">Satuan</th>
                                    <th scope="col" className="px-4 py-2 text-right rounded-r-lg">Harga</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inconsistentInvoices.map((invoice, index) => (
                                    <tr key={index} className="border-b border-yellow-200 last:border-b-0 bg-yellow-50">
                                        <td className="px-4 py-2 font-medium">{index + 1}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{invoice.requestDate}</td>
                                        <td className="px-4 py-2">{invoice.customer}</td>
                                        <td className="px-4 py-2 font-semibold text-slate-800">{invoice.item}</td>
                                        <td className="px-4 py-2 text-right font-mono">{invoice.quantity}</td>
                                        <td className="px-4 py-2">{invoice.unit}</td>
                                        <td className="px-4 py-2 text-right font-mono text-red-600">{formatCurrency(invoice.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
