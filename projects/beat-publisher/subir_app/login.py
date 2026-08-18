# -*- coding: utf-8 -*-
"""
Login una sola vez. Ejecútalo TÚ en una terminal:

    python "projects/beat-publisher/subir_app/login.py"

Abre YouTube Studio y Beatstars. Inicia sesión en las dos (Claude no ve tu contraseña).
Cuando estés dentro en ambas, vuelve a la terminal y pulsa Enter. La sesión queda
guardada en subir_app/perfil y ya no hará falta repetir el login.
"""
from playwright.sync_api import sync_playwright
from comun import abrir_navegador


def main():
    with sync_playwright() as p:
        ctx = abrir_navegador(p)
        yt = ctx.pages[0] if ctx.pages else ctx.new_page()
        yt.goto("https://studio.youtube.com")
        bs = ctx.new_page()
        bs.goto("https://studio.beatstars.com")

        print("\n" + "=" * 60)
        print("Inicia sesión en las DOS pestañas: YouTube Studio y Beatstars.")
        print("Cuando estés dentro en ambas, pulsa Enter aquí.")
        print("=" * 60)
        input("> Enter para guardar la sesión y cerrar... ")
        ctx.close()
        print("Sesión guardada en subir_app/perfil. Listo.")


if __name__ == "__main__":
    main()
