# -*- coding: utf-8 -*-
"""
Subida a Beatstars con Playwright. Sube archivos SIN límite de tamaño (usa el input
del navegador real, no el selector de Windows) y rellena todo el formulario.

FUNCIONA (probado con 'lighter', jul 2026):
  [x] Crear track + subir Master (MP3/WAV) por input files[]
  [x] Title, Key (select), BPM, Tags (máx 3) con guardado robusto (autosave debounced)
  [x] Artwork: Edit -> Upload file -> browse files -> chooser -> Save -> Upload N file
  [x] Stems (zip/rar): Add de la fila '.zip/.rar' -> browse files -> chooser
  [x] Publish track -> devuelve modal con Pro Page link (bsta.rs/...) sin comisión
NOTAS:
  - El flujo NUEVO de Beatstars NO tiene campo de vídeo (quitado). El link de YouTube ya no
    se pone en el track; el cruce se hace metiendo el Pro Page link en la descripción de YT.
  - Release Date: selector calendario custom (día/hora, 12h sin AM/PM visible) -> TODO robusto.
    Publicar sin tocarlo = release inmediato (sirve: deja el buy-link vivo antes del vídeo).
  - Primera subida real completa: 'lighter' (TK25837925), Pro Page https://bsta.rs/52Be3W

REGLAS FIJADAS POR CHAVO (2026-07-10) — aplicar en la próxima iteración:
  - SUBIR SIEMPRE EL .WAV como master (no el .mp3). Sin WAV no se venden licencias WAV ni stems.
  - Título Beatstars = 'Artista1 x Artista2 Type Beat - <nombre>' (con artistas, sin [FREE]/género).
  - Descripción Beatstars = siempre Key, BPM y @17godbeats.
  - Publicar PÚBLICO al momento (no tocar release date).

Uso (cuando esté completo):
  python subir_beatstars.py "<ruta master>" --stems "<ruta zip>" --artwork "<ruta png>" \
      --titulo lighter --key F_MINOR --bpm 165 --tags "a,b,c"
"""
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from comun import abrir_navegador, primera_pagina

BASE = "https://studio.beatstars.com"
CREAR = f"{BASE}/content/tracks/uploaded?create=true"


def cerrar_modal(page):
    try:
        b = page.get_by_role("button", name="Dismiss", exact=True)
        if b.count() and b.first.is_visible():
            b.first.click(); page.wait_for_timeout(1000)
    except Exception:
        pass


def guardar(page):
    """El autosave de Beatstars es debounced: blur + espera."""
    page.keyboard.press("Tab")
    page.wait_for_timeout(4000)


def crear_y_subir_master(page, rutas_master):
    page.goto(CREAR, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(6000)
    cerrar_modal(page)
    page.query_selector("input[type=file]").set_input_files(rutas_master)
    page.wait_for_timeout(20000)  # crea el track y abre el detalle
    return page.url  # .../content/tracks/new/TKxxxxxxx


def rellenar_metadatos(page, titulo, key_valor, bpm, tags):
    page.locator("input#title").fill(titulo); guardar(page)
    page.locator("select").first.select_option(key_valor); guardar(page)
    page.locator("input[type=number]").first.fill(str(bpm)); guardar(page)
    tags_in = page.locator("#mat-chip-list-input-0")
    existentes = page.locator("[class*=chip]").all_inner_texts()
    for t in tags[:3]:
        if not any(t in x for x in existentes):
            tags_in.click(); tags_in.type(t, delay=15); tags_in.press("Enter")
            page.wait_for_timeout(700)
    guardar(page)


def _abrir_modal_y_soltar(page, abrir_fn, ruta, espera=12000):
    """Patrón común: abre el modal 'Upload file', pulsa browse files, intercepta
    el selector nativo y suelta el archivo."""
    abrir_fn()
    page.get_by_text("browse files").wait_for(state="visible", timeout=8000)
    with page.expect_file_chooser(timeout=15000) as fc:
        page.get_by_text("browse files").click()
    fc.value.set_files(ruta)
    page.wait_for_timeout(espera)


def subir_artwork(page, ruta_png):
    def abrir():
        for b in page.get_by_role("button", name="Edit").all():
            if b.is_visible():
                b.click(); break
        page.wait_for_timeout(1500)
        page.evaluate("""() => {
            const els=[...document.querySelectorAll('button,a,span,div')]
              .filter(e=>e.textContent.trim()==='Upload file'&&e.offsetParent!==null);
            els[els.length-1].click();
        }""")
    _abrir_modal_y_soltar(page, abrir, ruta_png, espera=12000)
    # Editor de imagen -> Save
    for el in page.get_by_text("Save", exact=True).all():
        if el.is_visible():
            el.click(); break
    page.wait_for_timeout(4000)
    # Botón verde 'Upload N file'
    try:
        page.get_by_role("button", name=re.compile(r"Upload \d+ file")).click(timeout=10000)
    except Exception:
        pass
    page.wait_for_timeout(12000)


def subir_stems(page, ruta_zip):
    def abrir():
        page.evaluate("""() => {
            const btns=[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Add'&&b.offsetParent);
            for (const b of btns){ let n=b,t='';
              for(let i=0;i<4&&n;i++){ n=n.parentElement; if(n) t=(n.textContent||'').toLowerCase(); if(t.includes('.zip')||t.includes('.rar')) break; }
              if(t.includes('.zip')||t.includes('.rar')){ b.click(); return; } }
        }""")
    _abrir_modal_y_soltar(page, abrir, ruta_zip, espera=5000)
    # espera a que termine de subir (zip grande)
    for _ in range(48):
        page.wait_for_timeout(10000)
        if "uploading" not in page.inner_text("body").lower():
            break


if __name__ == "__main__":
    print("Módulo de subida a Beatstars. Ver estado y uso en la cabecera.")
