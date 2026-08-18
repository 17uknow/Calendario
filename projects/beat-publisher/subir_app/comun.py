# -*- coding: utf-8 -*-
"""Utilidades comunes de la app de subida (Playwright)."""
import json
from pathlib import Path

AQUI = Path(__file__).parent
RAIZ = AQUI.parent
PERFIL = AQUI / "perfil"  # sesión persistente (gitignored). Login una sola vez.
CONFIG = json.loads((RAIZ / "config.json").read_text(encoding="utf-8"))


def abrir_navegador(p, headless=False):
    """Lanza Chrome con un perfil persistente propio de la app.

    Usa el Chrome instalado en el sistema (channel='chrome'), más 'humano' que el
    Chromium de prueba, para reducir los bloqueos de login de Google. El perfil vive
    en subir_app/perfil, separado de tu Chrome normal.
    """
    PERFIL.mkdir(parents=True, exist_ok=True)
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=str(PERFIL),
        channel="chrome",
        headless=headless,
        no_viewport=True,
        args=["--start-maximized", "--disable-blink-features=AutomationControlled"],
    )
    return ctx


def primera_pagina(ctx):
    return ctx.pages[0] if ctx.pages else ctx.new_page()
