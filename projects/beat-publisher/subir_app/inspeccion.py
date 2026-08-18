# -*- coding: utf-8 -*-
"""
Herramienta interna para que Claude construya la automatización mirando la web real.
Abre una URL con la sesión guardada, saca una captura y vuelca los elementos
interactivos (para localizar botones/campos). No sube nada.

    python inspeccion.py <url> [nombre_captura]
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from comun import abrir_navegador, primera_pagina

SALIDA = Path(__file__).parent / "_inspeccion"


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else "https://studio.beatstars.com"
    nombre = sys.argv[2] if len(sys.argv) > 2 else "captura"
    SALIDA.mkdir(exist_ok=True)

    with sync_playwright() as p:
        ctx = abrir_navegador(p, headless=False)
        page = primera_pagina(ctx)
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(6000)  # deja cargar la SPA

        captura = SALIDA / f"{nombre}.png"
        page.screenshot(path=str(captura), full_page=True)
        print(f"Captura: {captura}")
        print("URL final:", page.url)
        print("Título:", page.title())

        # Vuelca botones / enlaces / inputs con su texto para localizarlos
        for sel in ["button", "a", "input", "[role=button]"]:
            elems = page.query_selector_all(sel)
            print(f"\n--- {sel} ({len(elems)}) ---")
            for e in elems[:60]:
                txt = (e.inner_text() or e.get_attribute("aria-label")
                       or e.get_attribute("placeholder") or "").strip().replace("\n", " ")
                if txt:
                    print(f"  {txt[:70]}")
        ctx.close()


if __name__ == "__main__":
    main()
