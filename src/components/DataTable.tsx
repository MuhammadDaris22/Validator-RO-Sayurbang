import React, { useState } from 'react';
import type { Invoice } from '../types.ts';

interface DataTableProps {
  invoices: Invoice[];
}

export const DataTable: React.FC<DataTableProps> = ({ invoices }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(invoices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const selectedInvoices = invoices.slice(startIndex, startIndex + rowsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (invoices.length === 0) return null;

  return (
    <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Pratinjau Data Penjualan</h2>
        <div className="bg-white p-2 rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th scope="col" className="px-6 py-3 rounded-l-lg">Tgl Permintaan</th>
                    <th scope="col" className="px-6 py-3">Pemesan</th>
                    <th scope="col" className="px-6 py-3">Item</th>
                    <th scope="col" className="px-6 py-3 text-right">Harga</th>
                    <th scope="col" className="px-6 py-3 text-right">Jumlah</th>
                    <th scope="col" className="px-6 py-3">Satuan</th>
                    <th scope="col" className="px-6 py-3 text-right rounded-r-lg">Total Akhir</th>
                </tr>
            </thead>
            <tbody>
                {selectedInvoices.map((invoice, index) => (
                <tr key={index} className={`border-b ${invoice.hasPriceInconsistency ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-white hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.requestDate}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{invoice.customer}</td>
                    <td className="px-6 py-4">{invoice.item}</td>
                    <td className="px-6 py-4 text-right font-mono">{formatCurrency(invoice.price)}</td>
                    <td className="px-6 py-4 text-right font-mono">{invoice.quantity}</td>
                    <td className="px-6 py-4">{invoice.unit}</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold">{formatCurrency(invoice.finalTotal)}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-slate-600">
                    Halaman {currentPage} dari {totalPages}
                </span>
                <div className="inline-flex rounded-md shadow-sm">
                    <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-l-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">
                    Sebelumnya
                    </button>
                    <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-r-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">
                    Berikutnya
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
