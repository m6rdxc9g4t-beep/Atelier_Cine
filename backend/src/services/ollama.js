import { config } from '../config.js';

/**
 * Client minimal pour l'API locale d'Ollama (https://github.com/ollama/ollama/blob/main/docs/api.md).
 * Toutes les fonctions échouent proprement si Ollama n'est pas lancé.
 */

export async function ollamaStatus() {
  try {
    const res = await fetch(`${config.ollama.url}/api/tags`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { models = [] } = await res.json();
    const names = models.map((m) => m.name);
    return {
      available: true,
      model: config.ollama.model,
      modelInstalled: names.some((n) => n === config.ollama.model || n.startsWith(`${config.ollama.model}:`)),
      models: names,
    };
  } catch (err) {
    return { available: false, model: config.ollama.model, error: err.message };
  }
}

export async function generate(prompt, { system, json = false, timeoutMs = 60_000 } = {}) {
  const res = await fetch(`${config.ollama.url}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: config.ollama.model,
      prompt,
      system,
      stream: false,
      ...(json ? { format: 'json' } : {}),
      options: { temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama a répondu ${res.status} : ${await res.text()}`);
  const data = await res.json();
  return data.response;
}

/** Résumé immersif + tags pour un média, à partir de ce qu'on sait (titre, année, nom de fichier). */
export async function summarizeMedia(item) {
  const raw = await generate(
    `Titre : ${item.title}\nAnnée : ${item.year ?? 'inconnue'}\nType : ${item.type === 'show' ? 'série' : 'film'}\n` +
      `Réponds en JSON : {"synopsis": "2 à 3 phrases immersives en français, sans spoiler", "genres": ["…"], "tags": ["…"]}. ` +
      `Si tu ne connais pas cette œuvre, dis-le dans le synopsis au lieu d'inventer.`,
    {
      system: "Tu es le programmateur d'un ciné-club. Tu écris des présentations courtes, précises et en français.",
      json: true,
    },
  );
  try {
    return JSON.parse(raw);
  } catch {
    return { synopsis: raw.trim(), genres: [], tags: [] };
  }
}
