# Exportación automática de beats — FL Studio

Automatiza las 3 exportaciones manuales (MP3, WAV maestro, WAV stems) que antes hacías a mano en FL Studio, usando AutoHotkey v2 para controlar el diálogo real de render.

## Estado
- [x] Calibración en vivo del diálogo de render (23/06/2026, FL Studio 25.2.5 build 5319)
- [x] Script escrito (`export_beats.ahk`)
- [ ] Probado con un beat real — **pendiente, hazlo antes de confiar en él para producción**

## Cómo usarlo
1. Abre tu proyecto en FL Studio, déjalo maximizado.
2. Ejecuta `export_beats.ahk` (doble clic, con AutoHotkey v2 instalado).
3. Pulsa **Ctrl+Alt+E**.
4. Rellena el formulario: nombre, tags, key, bpm, colaborador extra (opcional) y género.
5. Dale a Exportar y no toques FL Studio hasta que salga el aviso de "Listo".

## Patrón de nombre de archivo
```
'Nombre' Tags Key BPMbpm (@17godbeats[ + @colaborador])
```
Ejemplo: `'Perdida' Reggaeton, Synth Gmin 96bpm (@17godbeats)`

**Supuesto fijado:** Key antes de BPM (era inconsistente en tus archivos existentes — 2 de 3 ejemplos tenían este orden). Si lo quieres al revés, es una línea en `ConstruirNombreArchivo()`.

## Cosas que hay que verificar en la primera prueba real (no asumir que funcionan)
- **Coordenadas de clic.** Se calibraron viendo tu pantalla a través de una herramienta de control remoto, que puede tener un escalado distinto al de Windows en tu máquina real. Si el script clica en el sitio equivocado, usa **Ctrl+Alt+P** (puesto el cursor sobre el botón real) para ver las coordenadas correctas y ajústalas al principio del script (`CoordWAV`, `CoordMP3`, `CoordSplitMixerTracks`, `CoordStart`).
- **Detección de "casilla activada".** El script decide si un checkbox está marcado mirando si el píxel es de color naranja (el acento de FL). Si falla la detección, usa el mismo Ctrl+Alt+P sobre la casilla en sus dos estados (marcada/desmarcada) para ver los valores RGB reales y ajustar el rango en `EsNaranja()`.
- **Modo de render (Pattern vs Song).** El script no toca el desplegable "Mode" del diálogo de render — usa lo que FL tenga guardado de la última vez. Si exportas habitualmente en modo Song, asegúrate de que esté así antes de lanzar el script (o avisa para añadirlo al script).
- **WinRAR.** El script busca WinRAR en las rutas estándar de instalación. Si lo tienes en otra ruta, hay que añadirla en `BuscarWinRAR()`.

## Qué NO hace (todavía)
- No organiza archivos que ya existan — solo genera los nuevos.
- No sube nada a Beatstars ni a YouTube — eso es la siguiente pieza del flujo grande.
- No borra la carpeta de stems sin comprimir después de hacer el .rar (se quedan las dos cosas).
