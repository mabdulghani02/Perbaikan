// ── utils/groq.js ────────────────────────────────────────────────────────
/**
 * Memanggil endpoint chat‑completion Groq (model Llama‑3.3‑70B‑versatile).
 *
 * @param {string} promptText   – Teks yang akan dikirim ke model.
 * @param {object} [options]    – Override payload (temperature, max_tokens, …).
 * @returns {Promise<string>}   – Balasan model atau pesan error.
 */
export async function callGroqAPI(promptText, options = {}) {
  // 👉 Kunci akan disuntikkan otomatis oleh GitHub Actions
  const apiKey = '__GROQ_API_KEY_PLACEHOLDER__';
  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    return '⚠️ Kunci API Groq belum terpasang pada environment build.';
  }

  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const payload = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    messages: [{ role: 'user', content: promptText }],
    ...options,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errMsg = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        errMsg = errBody?.error?.message || errMsg;
      } catch (_) {
        const txt = await response.text();
        errMsg = txt || errMsg;
      }
      return `⚠️ Error Groq (status ${response.status}): ${errMsg}`;
    }

    const result = await response.json();

    if (result?.choices?.[0]?.message?.content) {
      return result.choices[0].message.content.trim();
    }

    if (result?.error?.message) {
      return `⚠️ Error Groq: ${result.error.message}`;
    }

    return '⚠️ Gagal mendapatkan respons yang diharapkan dari API.';
  } catch (networkErr) {
    return `⚠️ Gagal terhubung ke jaringan: ${networkErr.message}`;
  }
}

