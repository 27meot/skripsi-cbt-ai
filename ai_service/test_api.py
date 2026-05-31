"""Tes koneksi ke Groq API dengan prompt minimal."""
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

print("Menghubungi Groq API...")
print(f"Base URL: {os.getenv('GROQ_BASE_URL')}")
print(f"Model: {os.getenv('GROQ_MODEL')}")

api_key = os.getenv('GROQ_API_KEY', '')
print(f"API Key: {api_key[:10]}... (Total {len(api_key)} karakter)")

try:
    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("GROQ_BASE_URL"),
        timeout=60.0  # timeout 60 detik
    )

    completion = client.chat.completions.create(
        model=os.getenv("GROQ_MODEL"),
        messages=[{"role": "user", "content": "Hai, jawab singkat saja: apa ibukota Indonesia?"}],
        temperature=0.7,
        max_tokens=100
    )

    print(f"\nSUKSES! Jawaban AI: {completion.choices[0].message.content}")
except Exception as e:
    print(f"\nGAGAL! Error: {type(e).__name__}: {e}")
