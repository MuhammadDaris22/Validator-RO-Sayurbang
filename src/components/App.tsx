
import React, { useState, useCallback } from 'react';
import { UrlInput } from './UrlInput.tsx';
import { Loader } from './Loader.tsx';
import { ValidationResults } from './ValidationResults.tsx';
import { DataTable } from './DataTable.tsx';
import { ChatInterface } from './ChatInterface.tsx';
import { Instructions } from './Instructions.tsx';
import type { Invoice, ValidationError } from '../types.ts';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';

const getOriginalCaseName = (data: string[][], itemIndex: number, lowerCaseName: string): string => {
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[itemIndex]?.trim().toLowerCase() === lowerCaseName) {
            return row[itemIndex].trim();
        }
    }
    return lowerCaseName;
};

const App: React.FC = () => {
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataValidated, setIsDataValidated] = useState<boolean>(false);

  const parseCSV = (csvText: string): string[][] => {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    return lines.map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const validateData = useCallback((data: string[][]): { invoices: Invoice[], errors: ValidationError[] } => {
    const errors: ValidationError[] = [];
    const invoices: Invoice[] = [];
    
    if (data.length < 2) {
      errors.push({ row: 0, message: "CSV tidak valid atau kosong. Pastikan ada header dan setidaknya satu baris data." });
      return { invoices, errors };
    }

    const header = data[0].map(h => h.toLowerCase().trim());
    const requiredHeaders = ['tgl permintaan', 'tgl selesai', 'pemesan / cabang', 'item', 'jumlah', 'satuan', 'harga', 'total', 'diskon', 'biaya jasa', 'total + biaya jasa - diskon'];
    const missingHeaders = requiredHeaders.filter(rh => !header.includes(rh));

    if (missingHeaders.length > 0) {
        errors.push({ row: 1, message: `Header kolom hilang: ${missingHeaders.join(', ')}.` });
        return { invoices, errors };
    }

    const requestDateIndex = header.indexOf('tgl permintaan');
    const completionDateIndex = header.indexOf('tgl selesai');
    const customerIndex = header.indexOf('pemesan / cabang');
    const itemIndex = header.indexOf('item');
    const quantityIndex = header.indexOf('jumlah');
    const unitIndex = header.indexOf('satuan');
    const priceIndex = header.indexOf('harga');
    const totalIndex = header.indexOf('total');
    const discountIndex = header.indexOf('diskon');
    const serviceFeeIndex = header.indexOf('biaya jasa');
    const finalTotalIndex = header.indexOf('total + biaya jasa - diskon');

    const itemPrices = new Map<string, Set<number>>();
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length <= Math.max(itemIndex, priceIndex)) continue;
        
        const itemName = row[itemIndex]?.trim().toLowerCase();
        const priceStr = row[priceIndex];
        const price = parseFloat(priceStr?.replace(/[^0-9.-]+/g,""));

        if (itemName && !isNaN(price)) {
            if (!itemPrices.has(itemName)) {
                itemPrices.set(itemName, new Set());
            }
            itemPrices.get(itemName)!.add(price);
        }
    }

    const inconsistentItemNames = new Set<string>();
    const significantInconsistentItemNames = new Set<string>();
    const SIGNIFICANT_PRICE_DIFFERENCE_THRESHOLD = 0.25; // 25%

    itemPrices.forEach((prices, itemName) => {
        if (prices.size > 1) {
            inconsistentItemNames.add(itemName);

            const priceArray = Array.from(prices);
            const minPrice = Math.min(...priceArray);
            const maxPrice = Math.max(...priceArray);

            if (minPrice > 0 && (maxPrice - minPrice) / minPrice > SIGNIFICANT_PRICE_DIFFERENCE_THRESHOLD) {
                significantInconsistentItemNames.add(itemName);
            }
        }
    });
    
    const sortedInconsistentItems = Array.from(inconsistentItemNames).sort((a, b) => a.localeCompare(b));

    sortedInconsistentItems.forEach(itemName => {
      const prices = Array.from(itemPrices.get(itemName)!).sort((a, b) => a - b);
      const isSignificant = significantInconsistentItemNames.has(itemName);
      const originalCaseItemName = getOriginalCaseName(data, itemIndex, itemName);

      errors.push({ 
          row: 0,
          message: '',
          isPriceInconsistency: true,
          itemName: originalCaseItemName,
          prices: prices,
          isSignificant: isSignificant,
      });
    });

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 1;
        
        if (row.join('').trim() === '') continue;

        const itemName = row[itemIndex]?.trim().toLowerCase();
        
        const parseNumeric = (val: string | undefined) => parseFloat(val?.replace(/[^0-9.-]+/g, ""));
        const parseOptionalNumeric = (val: string | undefined) => parseNumeric(val) || 0;

        const quantity = parseNumeric(row[quantityIndex]);
        const price = parseNumeric(row[priceIndex]);
        const total = parseNumeric(row[totalIndex]);
        const discount = parseOptionalNumeric(row[discountIndex]);
        const serviceFee = parseOptionalNumeric(row[serviceFeeIndex]);
        const finalTotal = parseNumeric(row[finalTotalIndex]);

        let hasErrorInRow = false;
        const checkIsNaN = (value: number, fieldName: string, originalValue: string | undefined) => {
            if (isNaN(value)) {
                errors.push({ row: rowNum, message: `${fieldName} tidak valid: '${originalValue}'.` });
                hasErrorInRow = true;
            }
        };

        checkIsNaN(quantity, 'Jumlah', row[quantityIndex]);
        checkIsNaN(price, 'Harga', row[priceIndex]);
        checkIsNaN(total, 'Total', row[totalIndex]);
        checkIsNaN(finalTotal, 'Total + Biaya Jasa - Diskon', row[finalTotalIndex]);
        
        if (!hasErrorInRow) {
             invoices.push({
                requestDate: row[requestDateIndex],
                completionDate: row[completionDateIndex],
                customer: row[customerIndex],
                item: row[itemIndex],
                quantity,
                unit: row[unitIndex],
                price,
                total,
                discount,
                serviceFee,
                finalTotal,
                hasPriceInconsistency: inconsistentItemNames.has(itemName),
                hasSignificantPriceInconsistency: significantInconsistentItemNames.has(itemName),
             });
        }
    }
    return { invoices, errors };
  }, []);

  const handleValidate = async () => {
    if (!sheetUrl) {
      setError('Harap masukkan URL Google Sheet.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setInvoices([]);
    setValidationErrors([]);
    setIsDataValidated(false);

    try {
      let csvUrl = sheetUrl;
      if (sheetUrl.includes('/edit')) {
        csvUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv');
      } else if (sheetUrl.includes('/pubhtml')) {
        csvUrl = sheetUrl.replace(/\/pubhtml.*$/, '/pub?output=csv');
      }
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Gagal mengambil data. Pastikan link "Publish to web" sudah benar dan publik.`);
      }
      const csvText = await response.text();
      const parsedData = parseCSV(csvText);
      const { invoices, errors } = validateData(parsedData);
      
      invoices.sort((a, b) => a.item.localeCompare(b.item));

      setValidationErrors(errors);
      setInvoices(invoices);
      setIsDataValidated(true);

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadCsv = () => {
    if (invoices.length === 0) return;

    const headers = [
      'Peringatan', 'Tgl Permintaan', 'Tgl Selesai', 'Pemesan / Cabang', 'Item',
      'Jumlah', 'Satuan', 'Harga', 'Total', 'Diskon', 'Biaya Jasa', 'Total + Biaya Jasa - Diskon'
    ];

    const escapeCsvCell = (cell: any): string => {
        const cellStr = String(cell ?? '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
    };

    const rows = invoices.map(inv => {
        let warning = '';
        if (inv.hasSignificantPriceInconsistency) {
            warning = 'Perbedaan harga signifikan (>25%) untuk item ini.';
        } else if (inv.hasPriceInconsistency) {
            warning = 'Harga tidak konsisten dengan entri lain untuk item ini.';
        }
        
        const rowData = [
            warning,
            inv.requestDate,
            inv.completionDate,
            inv.customer,
            inv.item,
            inv.quantity,
            inv.unit,
            inv.price,
            inv.total,
            inv.discount,
            inv.serviceFee,
            inv.finalTotal
        ];
        return rowData.map(escapeCsvCell).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'hasil_validasi_sayurbang.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Instructions />

          <UrlInput 
            sheetUrl={sheetUrl}
            setSheetUrl={setSheetUrl}
            onValidate={handleValidate}
            isLoading={isLoading}
          />

          {isLoading && <Loader />}
          
          {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {isDataValidated && !isLoading && (
            <div className="mt-8 space-y-8">
              <ValidationResults 
                errors={validationErrors} 
                totalRows={invoices.length} 
                invoices={invoices}
                onDownloadCsv={handleDownloadCsv}
              />
              
              {invoices.length > 0 && (
                <>
                  <DataTable invoices={invoices} />
                  <ChatInterface invoices={invoices} />
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
