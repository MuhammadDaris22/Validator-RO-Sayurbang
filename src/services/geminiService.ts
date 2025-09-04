import type { Invoice } from '../types.ts';

export const getInvoiceInsights = async (invoices: Invoice[], question: string): Promise<string> => {
  if (invoices.length === 0) {
    return "Tidak ada data untuk dianalisis.";
  }

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoices, question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Gagal mendapatkan respons dari server.');
    }

    const data = await response.json();
    return data.answer;
    
  } catch (error) {
    console.error("API call error:", error);
    return `Maaf, terjadi kesalahan saat menghubungi asisten AI. (${error instanceof Error ? error.message : 'Unknown error'})`;
  }
};
