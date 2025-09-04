
import { GoogleGenAI } from "@google/genai";
import type { Invoice } from '../src/types.ts';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set on the server");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatInvoicesForPrompt = (invoices: Invoice[]): string => {
  const dataSample = invoices.slice(0, 50).map(inv => 
    `{tgl_minta: ${inv.requestDate}, pelanggan: ${inv.customer}, item: ${inv.item}, harga: ${inv.price}, jumlah: ${inv.quantity}, satuan: ${inv.unit}, diskon: ${inv.discount}, total_akhir: ${inv.finalTotal}}`
  ).join('\n');
  
  return `Berikut adalah ringkasan data penjualan (sampel ${invoices.slice(0, 50).length} dari ${invoices.length} total baris):\n${dataSample}`;
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { invoices, question } = await request.json() as { invoices: Invoice[], question: string };

    if (!invoices || !question) {
      return new Response(JSON.stringify({ error: 'Invoices and question are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const invoiceDataString = formatInvoicesForPrompt(invoices);
    
    const prompt = `
      Anda adalah asisten analisis data yang ahli untuk "Boedjang".
      Berdasarkan data penjualan berikut, jawab pertanyaan pengguna.
      Jawab dalam Bahasa Indonesia. Berikan jawaban yang jelas, ringkas, dan langsung ke intinya.

      Konteks Data:
      ${invoiceDataString}

      Pertanyaan Pengguna:
      "${question}"
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return new Response(JSON.stringify({ answer: response.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Gemini API error on server:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
