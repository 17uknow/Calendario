# Plantillas de publicación — PROPUESTA PARA REVISAR

> Estado: **borrador**. Chavo revisa por chat, Claude ajusta el archivo.
> Los campos `{ASI}` se rellenan solos: nombre/key/bpm del archivo, artistas/hashtags/tags
> del `catalogo.md`, y perfiles/precios del `config.json`.

## Título de YouTube

Formato fijado por Chavo (09/07/2026):
```
[FREE] {ARTISTA1} x {ARTISTA2} Type Beat - '{NOMBRE}' | {GENERO} Type Beat
```

Ejemplo: `[FREE] Feid x Myke Towers Type Beat - 'Perdida' | Reggaeton Type Beat`

- `[FREE]` = el beat se puede descargar gratis (MP3 con tag) y la licencia sin tag se compra.
- Los artistas salen del `catalogo.md` según el género/estilo del beat (ver ese archivo).
- Sin "prod. 17." en el título.

## Descripción de YouTube

Texto real de Chavo. Solo cambian los `{campos}`:
```
{KEY} | {BPM}
💰 Download | Purchase (Untagged): {LINK_CORTO_BEATSTARS}
💰 Descarga | Compra (Sin marcas de agua): {LINK_CORTO_BEATSTARS}
💰 BUY 2 GET 1 FREE

🔊 My Beats: https://17beats.beatstars.com/

📋 IMPORTANT:
This beat is free for non-profit use only.
The licenses and info about the beat(s) is also in the webpage.

📋 IMPORTANTE:
Este beat es gratis para uso sin beneficio.
Tanto las licencias como la información del beat se pueden encontrar en la pag. web anterior

Contacto:
Instagram:  https://www.instagram.com/17godbeats/
TikTok: https://www.tiktok.com/@17godbeats

-----TAGS-----
{HASHTAGS}   <- 3-4 hashtags del catalogo.md + los de la subida, afinados con SEO
```

**Nota — qué link usar:** al subir el beat, Beatstars da dos links. Usar SIEMPRE el de la
**pro page** (el que NO cobra comisión), no el link normal. Ese link no existe hasta subir
el beat, así que se completa al final del flujo (YouTube primero, Beatstars después).
Los emojis son de Chavo, van en el contenido público (no en el chat interno).

## Tags de YouTube (los "de ignorar" — no se ven pero posicionan)

Es el campo de etiquetas del vídeo (metadatos). No se muestran al público pero es de lo que
más pesa en el SEO de type beats. Salen del `catalogo.md` (por género + por artista) y se
afinan con la investigación de SEO antes de cada subida (ver sección SEO del README).

## Beatstars — datos del track  (reglas fijadas por Chavo 2026-07-10)

- **Título:** `{ARTISTA1} x {ARTISTA2} Type Beat - {NOMBRE}`
  (con artistas, NO solo el nombre del beat. Sin el `[FREE]` ni el género del título de YouTube.)
  Ej: `Mvrk x L'Haine x UGLY Type Beat - lighter`
- **Descripción:** SIEMPRE incluir **Key, BPM y @17godbeats**.
- **Archivo maestro:** SIEMPRE el **.WAV**, nunca el .mp3. Sin el WAV no se pueden vender
  ni la licencia WAV ni la de stems. (Master = WAV; + Stems = zip. Sin preview.)
- **Tags:** máx **3** (límite de Beatstars). Los mejores del `catalogo.md`.
- **Key / BPM:** {KEY} / {BPM} (Key es un `<select>`, ver subir_beatstars.py).
- **Licencias/precios:** plantillas por defecto de la cuenta (30/35/80$).
- **Publicación:** **público al momento** (avant). No se programa la release date.
- **Vídeo:** el flujo nuevo de Beatstars NO tiene campo de vídeo. El cruce se hace metiendo
  el **Pro Page link** en la descripción de YouTube (líneas Download/Descarga).
