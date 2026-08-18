# -*- coding: utf-8 -*-
"""
Generador de vídeo para beats — cover fijo + audio, listo para YouTube.

Uso:
    python generar_video.py "ruta\\al\\'Nombre' Tags Key 96bpm (@17godbeats).mp3"
    python generar_video.py beat.mp3 --cover otra-imagen.png
    python generar_video.py beat.mp3 --solo-metadata   (no genera video, solo parsea el nombre)

El nombre del archivo debe seguir el patrón del script de exportación de FL:
    'Nombre' Tags Key BPMbpm (@17godbeats[ + @colaborador])
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).parent
CONFIG = json.loads((AQUI / "config.json").read_text(encoding="utf-8"))


def parsear_nombre(nombre_archivo: str) -> dict:
    """Extrae nombre, tags, key, bpm y créditos del nombre de archivo del beat."""
    base = Path(nombre_archivo).stem

    m_nombre = re.match(r"^'([^']+)'\s*", base)
    if not m_nombre:
        raise ValueError(
            f"El nombre no empieza con 'Nombre' entre comillas simples: {base}"
        )
    nombre = m_nombre.group(1)
    resto = base[m_nombre.end():]

    m_creditos = re.search(r"\((@[^)]+)\)\s*$", resto)
    creditos = m_creditos.group(1) if m_creditos else "@17godbeats"
    if m_creditos:
        resto = resto[: m_creditos.start()].strip()

    # Key y BPM pueden ir en cualquier orden ('Gmin 96bpm' o '165bpm Fmin').
    m_bpm = re.search(r"(\d+)\s*bpm", resto, re.IGNORECASE)
    if not m_bpm:
        raise ValueError(f"No encuentro el BPM (formato '96bpm') en: {base}")
    bpm = int(m_bpm.group(1))

    m_key = re.search(r"\b([A-G](?:#|b)?(?:min|maj|m))\b", resto)
    key = m_key.group(1) if m_key else ""

    # Los tags son lo que queda al quitar key y bpm.
    limpio = re.sub(r"\d+\s*bpm", "", resto, flags=re.IGNORECASE)
    if m_key:
        limpio = limpio.replace(m_key.group(1), "", 1)
    tags = [t.strip() for t in limpio.split(",") if t.strip()]

    return {
        "nombre": nombre,
        "tags": tags,
        "key": key,
        "bpm": bpm,
        "creditos": creditos,
    }


EXTS_IMAGEN = (".jpg", ".jpeg", ".png", ".webp")


def resolver_cover(audio: Path, meta: dict) -> Path | None:
    """Busca la foto del beat por nombre.

    Mira en la carpeta de fotos (config) y en la carpeta del audio. Prueba, en orden:
    mismo nombre que el audio, el nombre del beat exacto, o que el nombre del archivo
    contenga el nombre del beat.
    """
    carpetas = []
    fotos = CONFIG.get("carpeta_fotos")
    if fotos and Path(fotos).is_dir():
        carpetas.append(Path(fotos))
    carpetas.append(audio.parent)

    # Búsqueda recursiva: las fotos pueden estar en subcarpetas.
    imagenes = []
    for carpeta in carpetas:
        imagenes += [p for p in carpeta.rglob("*")
                     if p.is_file() and p.suffix.lower() in EXTS_IMAGEN]

    stem_audio = audio.stem.lower()
    nombre = meta["nombre"].lower()

    for img in imagenes:
        if img.stem.lower() == stem_audio:
            return img
    for img in imagenes:
        if img.stem.lower() == nombre:
            return img
    for img in imagenes:
        if nombre in img.stem.lower():
            return img
    return None


def generar_video(audio: Path, cover: Path, salida: Path) -> None:
    ancho, alto = CONFIG["resolucion"].split("x")
    # Ajusta la foto dentro del 1920x1080 respetando su proporción.
    # Si sobra espacio, bandas negras (sin fondo desenfocado, decisión de Chavo).
    filtro = (
        f"scale={ancho}:{alto}:force_original_aspect_ratio=decrease,"
        f"pad={ancho}:{alto}:(ow-iw)/2:(oh-ih)/2:black"
    )
    cmd = [
        CONFIG["ffmpeg"], "-y",
        "-loop", "1", "-i", str(cover),
        "-i", str(audio),
        "-vf", filtro,
        "-c:v", "libx264", "-tune", "stillimage", "-preset", "medium",
        "-c:a", "aac", "-b:a", CONFIG["bitrate_audio"],
        "-pix_fmt", "yuv420p",
        "-shortest", "-movflags", "+faststart",
        str(salida),
    ]
    resultado = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if resultado.returncode != 0:
        print(resultado.stderr[-2000:], file=sys.stderr)
        raise RuntimeError(f"ffmpeg falló (código {resultado.returncode})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera el vídeo de YouTube de un beat")
    parser.add_argument("audio", help="Ruta al MP3/WAV del beat")
    parser.add_argument("--cover", help="Imagen de cover (por defecto la de config.json)")
    parser.add_argument("--out", help="Carpeta de salida (por defecto la de config.json)")
    parser.add_argument("--solo-metadata", action="store_true",
                        help="Solo parsea el nombre y muestra los metadatos, sin generar vídeo")
    args = parser.parse_args()

    audio = Path(args.audio)
    if not audio.exists():
        sys.exit(f"No existe el archivo: {audio}")

    meta = parsear_nombre(audio.name)
    print(json.dumps(meta, ensure_ascii=False, indent=2))

    if args.solo_metadata:
        return

    if args.cover:
        cover = Path(args.cover)
    else:
        cover = resolver_cover(audio, meta)
        if cover is None:
            sys.exit(
                "No encuentro la foto del beat en la carpeta del audio.\n"
                f"Pon una imagen con el nombre del beat (p. ej. '{meta['nombre']}.jpg') "
                "junto al archivo, o pásala con --cover."
            )
        print(f"Foto detectada: {cover.name}")
    if not cover.exists():
        sys.exit(f"No existe el cover: {cover}")

    carpeta_salida = Path(args.out) if args.out else AQUI / CONFIG["carpeta_salida_videos"]
    carpeta_salida.mkdir(parents=True, exist_ok=True)
    salida = carpeta_salida / (audio.stem + ".mp4")

    generar_video(audio, cover, salida)
    print(f"\nVídeo generado: {salida}")


if __name__ == "__main__":
    main()
