#!/usr/bin/env python3
"""
generate_soal.py
================
Skrip AI untuk membaca PDF dan menghasilkan soal secara otomatis.
Dipanggil oleh Laravel via shell_exec().

Output: JSON murni ke stdout (baris terakhir).
Laravel akan membaca stdout ini dan menyimpan ke database.

Penggunaan:
    python generate_soal.py --file_path="path/to/file.pdf" --jumlah_soal=10 --difficulty=mudah --tipe_soal=pilihan_ganda
"""

import sys
import os
import json
import argparse
import fitz  # PyMuPDF
from openai import OpenAI
from dotenv import load_dotenv
import math
from collections import Counter
import re

# Load konfigurasi dari .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# --- Konfigurasi ---
API_KEY = os.getenv("GROQ_API_KEY")
BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
MODEL = os.getenv("GROQ_MODEL", "llama3-70b-8192")


def baca_pdf(file_path: str) -> str:
    """Mengekstrak teks dari file PDF menggunakan PyMuPDF."""
    try:
        doc = fitz.open(file_path)
        teks = ""
        for halaman in doc:
            teks += halaman.get_text() + "\n"
        doc.close()
        return teks.strip()
    except Exception as e:
        print(json.dumps({"error": f"Gagal membaca PDF: {str(e)}"}))
        sys.exit(1)

def chunk_text(text: str, chunk_size=3000, overlap=500) -> list:
    """Memecah teks menjadi potongan-potongan (chunks) dengan overlapping."""
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start+chunk_size])
        start += chunk_size - overlap
    return chunks

class SimpleTFIDFVectorDB:
    """Implementasi Vector Database lokal yang sangat ringan menggunakan TF-IDF & Cosine Similarity."""
    def __init__(self):
        self.chunks = []
        self.idf = {}
        self.tf_idf_matrix = []

    def _tokenize(self, text):
        return re.findall(r'\w+', text.lower())

    def add_texts(self, chunks):
        self.chunks = chunks
        N = len(chunks)
        df = Counter()
        tfs = []
        
        for chunk in chunks:
            tokens = self._tokenize(chunk)
            tf = Counter(tokens)
            for token in set(tokens):
                df[token] += 1
            tfs.append(tf)

        for token, count in df.items():
            self.idf[token] = math.log((1 + N) / (1 + count)) + 1

        for tf in tfs:
            doc_len = sum(tf.values()) if sum(tf.values()) > 0 else 1
            tfidf = {}
            for token, count in tf.items():
                tfidf[token] = (count / doc_len) * self.idf[token]
            
            norm = math.sqrt(sum(v**2 for v in tfidf.values()))
            if norm > 0:
                for k in tfidf:
                    tfidf[k] /= norm
            self.tf_idf_matrix.append(tfidf)

    def search(self, query, top_k=5):
        if not self.chunks:
            return []
            
        query_tokens = self._tokenize(query)
        query_tf = Counter(query_tokens)
        query_len = sum(query_tf.values()) if sum(query_tf.values()) > 0 else 1
        
        query_tfidf = {}
        for token, count in query_tf.items():
            if token in self.idf:
                query_tfidf[token] = (count / query_len) * self.idf[token]
                
        norm = math.sqrt(sum(v**2 for v in query_tfidf.values()))
        if norm > 0:
            for k in query_tfidf:
                query_tfidf[k] /= norm

        scores = []
        for doc_idx, doc_tfidf in enumerate(self.tf_idf_matrix):
            score = sum(query_tfidf.get(k, 0) * doc_tfidf.get(k, 0) for k in query_tfidf.keys())
            scores.append((score, doc_idx))

        scores.sort(reverse=True, key=lambda x: x[0])
        top_indices = [idx for score, idx in scores[:min(top_k, len(self.chunks))]]
        return [self.chunks[i] for i in top_indices]


def generate_soal_dari_ai(teks_materi: str, konfigurasi: dict) -> list:
    """Mengirim teks ke DeepSeek melalui NVIDIA API dan mendapatkan soal."""
    
    jumlah_soal = konfigurasi.get("jumlah_soal", 5)
    kesulitan = konfigurasi.get("difficulty", "sedang")
    tipe_soal = konfigurasi.get("tipe_soal", "pilihan_ganda")
    instruksi = konfigurasi.get("instruksi", "")

    instruksi_tambahan = f"\nInstruksi khusus dari guru: {instruksi}" if instruksi else ""

    aturan_opsi = ""
    format_contoh = ""
    
    if tipe_soal == "pilihan_ganda":
        aturan_opsi = "2. Setiap soal WAJIB memiliki TEPAT 4 pilihan jawaban (A, B, C, D) dalam array 'options'.\n3. 'correct_answer' berisi TEPAT teks pilihan jawaban yang benar."
        format_contoh = """
  {
    "question_text": "Teks pertanyaan soal di sini?",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "correct_answer": "Pilihan A",
    "explanation": "Penjelasan mengapa jawaban ini benar."
  }"""
    elif tipe_soal == "essay":
        aturan_opsi = "2. Ini adalah soal ESSAY, jadi array 'options' WAJIB diisi kosong [].\n3. 'correct_answer' berisi referensi jawaban benar untuk guru."
        format_contoh = """
  {
    "question_text": "Teks pertanyaan essay di sini?",
    "options": [],
    "correct_answer": "Jawaban panjang yang diharapkan dari siswa.",
    "explanation": "Penjelasan detail poin-poin yang harus ada di jawaban."
  }"""
    else: # campuran
        aturan_opsi = "2. Ini adalah soal CAMPURAN. Jika pilihan ganda, isi 'options' dengan 4 pilihan. Jika essay, isi 'options' dengan [].\n3. 'correct_answer' berisi jawaban benar atau referensi jawaban."
        format_contoh = """
  {
    "question_text": "Teks pertanyaan di sini?",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"], // Atau [] jika essay
    "correct_answer": "Jawaban benar",
    "explanation": "Penjelasan"
  }"""

    prompt = f"""Kamu adalah asisten pembuat soal ujian profesional untuk sekolah di Indonesia.

Berdasarkan materi berikut:
---
{teks_materi}
---

Buatkan TEPAT {jumlah_soal} soal ujian tipe '{tipe_soal.replace('_', ' ')}' dengan tingkat kesulitan "{kesulitan}".{instruksi_tambahan}

ATURAN WAJIB:
1. Gunakan Bahasa Indonesia yang baik dan benar.
{aturan_opsi}
4. Berikan 'explanation' singkat.
5. Soal harus bersumber dari materi yang diberikan.

Format output WAJIB dalam JSON array tanpa komentar, seperti ini:
[{format_contoh}
]"""

    client = OpenAI(api_key=API_KEY, base_url=BASE_URL, timeout=120.0)

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            top_p=0.95,
            max_tokens=4000,
            stream=False
        )

        hasil_teks = completion.choices[0].message.content.strip()

        # Bersihkan output jika ada markdown code block
        if hasil_teks.startswith("```json"):
            hasil_teks = hasil_teks[7:]
        if hasil_teks.startswith("```"):
            hasil_teks = hasil_teks[3:]
        if hasil_teks.endswith("```"):
            hasil_teks = hasil_teks[:-3]

        soal_list = json.loads(hasil_teks.strip())
        return soal_list

    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"AI mengembalikan format yang tidak valid: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Gagal memanggil AI: {str(e)}"}))
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Generator Soal AI - ExamGenius")
    parser.add_argument("--file_path", required=True, help="Path absolut ke file PDF materi")
    parser.add_argument("--jumlah_soal", type=int, default=5, help="Jumlah soal yang dibuat")
    parser.add_argument("--difficulty", default="sedang", help="Tingkat kesulitan: mudah/sedang/sulit")
    parser.add_argument("--tipe_soal", default="pilihan_ganda", help="Tipe soal")
    parser.add_argument("--instruksi", default="", help="Instruksi tambahan untuk AI")

    args = parser.parse_args()

    # Validasi file PDF ada
    if not os.path.exists(args.file_path):
        print(json.dumps({"error": f"File PDF tidak ditemukan: {args.file_path}"}))
        sys.exit(1)

    # Step 1: Baca PDF
    sys.stderr.write("Membaca materi PDF...\n")
    teks_materi = baca_pdf(args.file_path)

    if len(teks_materi) < 50:
        print(json.dumps({"error": "Teks PDF terlalu pendek atau kosong. Pastikan PDF berisi teks, bukan gambar."}))
        sys.exit(1)

    # === IMPLEMENTASI RAG (Retrieval-Augmented Generation) ===
    sys.stderr.write("Memproses Chunking dan Vector Database (RAG)...\n")
    chunks = chunk_text(teks_materi, chunk_size=3000, overlap=500)
    
    vector_db = SimpleTFIDFVectorDB()
    vector_db.add_texts(chunks)
    
    # Query ke Vector DB untuk mencari konteks yang paling relevan
    # Mengambil Top 10 chunk agar konteks hybrid tetap luas dan akurasi tinggi
    query_pencarian = f"konsep utama, definisi penting, poin krusial, {args.tipe_soal}, ringkasan materi"
    retrieved_chunks = vector_db.search(query_pencarian, top_k=10)
    
    # Satukan kembali chunk yang relevan (Hybrid Reassembly)
    konteks_relevan = "\n...\n".join(retrieved_chunks)
    # Batasi akhir untuk jaga-jaga limit token LLaMA3
    konteks_relevan = konteks_relevan[:15000]

    # Step 2: Generate soal dengan AI
    sys.stderr.write(f"Menghubungi AI untuk membuat {args.jumlah_soal} soal...\n")
    konfigurasi = {
        "jumlah_soal": args.jumlah_soal,
        "difficulty": args.difficulty,
        "tipe_soal": args.tipe_soal,
        "instruksi": args.instruksi,
    }
    soal_list = generate_soal_dari_ai(konteks_relevan, konfigurasi)

    # Step 3: Output JSON ke stdout (Laravel akan menangkap ini)
    print(json.dumps({
        "success": True,
        "soal": soal_list
    }))


if __name__ == "__main__":
    main()
