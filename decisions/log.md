# Decision Log

Append-only. When a meaningful decision is made, log it here.

Format: [YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...

---

[2026-07-09] DECISION: Flujo de publicación de beats asistido por navegador (no API) con vídeo autogenerado (cover + audio, sin Premiere) y publicación programada. | REASONING: Beatstars no tiene API pública de subida y la API de YouTube bloquea vídeos de apps sin verificar; el flujo asistido con confirmación evita publicar mal si las webs cambian. | CONTEXT: projects/beat-publisher + skill subir-beat. Premiere solo para vídeos especiales fuera del flujo.

[2026-07-10] DECISION: App local de subida con Playwright (perfil persistente, login una vez). Beatstars: subir SIEMPRE el .WAV como master (sin él no se venden licencias WAV ni stems), título "Artista1 x Artista2 Type Beat - Nombre", descripción con Key+BPM+@17godbeats, máx 3 tags, publicar público al momento (sin programar release). YouTube seguirá con app Playwright (pendiente). | REASONING: El navegador asistido tiene tope de 10 MB y veto de dominio en Beatstars; la app local usa un navegador real sin esos límites. WAV como master es requisito para vender WAV/stems. | CONTEXT: projects/beat-publisher/subir_app. Primera subida real completa: 'lighter' (YouTube programado 11 jul 20:00 + Beatstars publicado por la app, pro page https://bsta.rs/52Be3W).
