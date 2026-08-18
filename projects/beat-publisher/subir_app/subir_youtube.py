# -*- coding: utf-8 -*-
"""
Subida a YouTube con Playwright. Sube el MP4 SIN límite de tamaño (input real del navegador)
y rellena el asistente hasta programar.

PROBADO (jul 2026, modo visible — headless lo bloquea con 'navegador no compatible'):
  [x] Crear -> Subir vídeos, subir MP4 por input[type=file] (sin límite)
  [x] Título y Descripción (#textbox contenteditable), 'No es para niños'
  [x] Navegar el asistente (Siguiente x3) hasta Visibilidad
  [x] Abrir 'Programar' (fecha dropdown + hora input '0:00')
POR VALIDAR EN VIVO con el próximo beat real:
  [~] Etiquetas (Mostrar más -> input), fecha exacta (calendario), hora 20:00
  [ ] Botón 'Programar' final (solo con OK de Chavo)
  [ ] Selección de canal (RnB vs afro) si el beat va al otro canal

Mapa de selectores:
  - Crear:        get_by_role button 'Crear' (exact=True) -> get_by_text 'Subir vídeos'
  - Subida:       input[type=file] -> set_input_files
  - Título:       #title-textarea #textbox
  - Descripción:  #description-textarea #textbox
  - Niños:        get_by_role radio 'No, no está creado para niños'
  - Navegación:   get_by_role button 'Siguiente'
  - Programar:    get_by_text 'Programar' -> fecha (dropdown) + hora (input) + 'Zona horaria'
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from comun import abrir_navegador, primera_pagina

SALIDA = Path(__file__).parent / "_inspeccion"


def abrir_dialogo_subida(page, mp4):
    page.goto("https://studio.youtube.com", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(8000)
    page.get_by_role("button", name="Crear", exact=True).click()
    page.wait_for_timeout(1500)
    page.get_by_text("Subir vídeos").click()
    page.wait_for_timeout(3000)
    page.query_selector("input[type=file]").set_input_files(mp4)
    page.wait_for_timeout(10000)


def _set_contenteditable(page, selector, texto):
    box = page.locator(selector)
    box.click()
    box.press("Control+a")
    box.press("Delete")
    box.type(texto, delay=1)


def rellenar_detalles(page, titulo, descripcion, tags=None):
    _set_contenteditable(page, "#title-textarea #textbox", titulo)
    _set_contenteditable(page, "#description-textarea #textbox", descripcion)
    page.get_by_role("radio", name="No, no está creado para niños").click()
    if tags:
        # Etiquetas: bajo 'Mostrar más'
        try:
            page.get_by_role("button", name="Mostrar más").click()
            page.wait_for_timeout(1500)
            ti = page.locator("#tags-container #text-input, #text-input").first
            ti.click()
            ti.type(", ".join(tags[:15]), delay=5)
            ti.press("Enter")
        except Exception as e:
            print("etiquetas (validar en vivo):", e)


def siguiente_hasta_visibilidad(page):
    for _ in range(3):
        page.get_by_role("button", name="Siguiente").click()
        page.wait_for_timeout(2500)


def programar(page, fecha_texto=None, hora="20:00"):
    """Abre Programar y fija hora (20:00). La fecha exacta se elige en el calendario."""
    page.get_by_text("Programar", exact=True).first.click()
    page.wait_for_timeout(2000)
    # Hora: input de tiempo (el segundo input visible del bloque)
    try:
        hora_input = page.locator("ytcp-datetime-picker input, #datepicker-trigger + * input").first
        hora_input.click()
        hora_input.press("Control+a")
        hora_input.type(hora, delay=30)
        hora_input.press("Enter")
    except Exception as e:
        print("hora (validar en vivo):", e)
    # TODO: fecha exacta vía calendario + confirmar 'Programar' (con OK de Chavo)


if __name__ == "__main__":
    # PRUEBA con el vídeo de test (NO publica: no pulsa 'Programar')
    TEST = os.path.join(os.environ["TEMP"], "test_yt.mp4")
    with sync_playwright() as p:
        ctx = abrir_navegador(p, headless=False)
        page = primera_pagina(ctx)
        abrir_dialogo_subida(page, TEST)
        rellenar_detalles(page, "PRUEBA BORRAR - test",
                          "Fmin | 165 bpm\nlinea 2\n#test", tags=["test tag", "otro tag"])
        siguiente_hasta_visibilidad(page)
        programar(page, hora="20:00")
        page.screenshot(path=str(SALIDA / "yt_final.png"))
        print("Flujo OK hasta programar (sin publicar).")
        ctx.close()
