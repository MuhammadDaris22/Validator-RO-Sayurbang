import React from 'react';

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

export const Instructions: React.FC = () => {
  return (
    <div className="mb-8 bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 p-4 rounded-r-lg">
        <div className="flex">
            <InfoIcon />
            <div>
                <h3 className="font-bold text-lg mb-2">Cara Menggunakan</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                        Buka Google Sheet Anda, klik <strong>File &rarr; Bagikan &rarr; Publikasikan ke web</strong>.
                    </li>
                    <li>
                        Pilih sheet yang relevan, lalu pilih format <strong>"Comma-separated values (.csv)"</strong>.
                    </li>
                    <li>
                        Klik <strong>"Publikasikan"</strong> dan salin link yang diberikan.
                    </li>
                    <li>
                        Tempel link tersebut di bawah ini dan klik "Validasi Data".
                    </li>
                     <li>
                        Pastikan sheet Anda memiliki header berikut: <code className="bg-emerald-100 p-1 rounded text-xs">Tgl Permintaan</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Tgl Selesai</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Pemesan / Cabang</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Item</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Jumlah</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Satuan</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Harga</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Total</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Diskon</code>, <code className="bg-emerald-100 p-1 rounded text-xs">Biaya Jasa</code>, dan <code className="bg-emerald-100 p-1 rounded text-xs">Total + Biaya Jasa - Diskon</code>.
                    </li>
                </ol>
            </div>
        </div>
    </div>
  );
};
