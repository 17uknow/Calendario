#Requires AutoHotkey v2.0
#SingleInstance Force
SetTitleMatchMode(2)

; ============================================================
; CONFIGURACION - ajusta aqui si algo cambia
; ============================================================

BasePath := "F:\MUSICA\BEATS\4 SALE"
UsuarioBeatstars := "@17godbeats"

; Coordenadas del dialogo de render de FL Studio (calibradas en vivo
; el 23/06/2026 sobre FL Studio 25.2.5 build 5319, ventana maximizada,
; un solo monitor). Si al probar el script los clics no caen en el
; sitio correcto, usa el diagnostico de Ctrl+Alt+P para ver las
; coordenadas reales de tu pantalla y ajusta los numeros de abajo.
CoordWAV := "577,261"
CoordMP3 := "616,261"
CoordSplitMixerTracks := "712,480"
CoordStart := "860,604"

; Tiempo maximo de espera por cada render (segundos). Si un beat muy
; largo tarda mas que esto, sube este numero.
TimeoutRenderSegundos := 600

; ============================================================
; DIAGNOSTICO - Ctrl+Alt+P muestra la posicion y color del pixel
; bajo el cursor, para recalibrar coordenadas si hace falta
; ============================================================
^!p:: {
    MouseGetPos(&x, &y)
    color := PixelGetColor(x, y, "RGB")
    ToolTip("x=" x " y=" y "`ncolor=" color)
    SetTimer(() => ToolTip(), -3000)
}

; ============================================================
; HOTKEY PRINCIPAL - Ctrl+Alt+E lanza el flujo completo
; ============================================================
^!e:: {
    EjecutarExportacion()
}

EjecutarExportacion() {
    if !WinExist("ahk_exe FL64.exe") {
        MsgBox("No encuentro FL Studio abierto. Abre tu proyecto y vuelve a intentarlo.", "FL Export", "Iconx")
        return
    }

    generos := LeerGeneros(BasePath "\MP3")
    if (generos.Length = 0) {
        MsgBox("No he encontrado ninguna subcarpeta de genero dentro de`n" BasePath "\MP3", "FL Export", "Iconx")
        return
    }

    datos := PedirDatosBeat(generos)
    if !datos
        return ; usuario canceló

    nombreArchivo := ConstruirNombreArchivo(datos)

    carpetaMP3 := BasePath "\MP3\" datos.genero
    carpetaWAV := BasePath "\WAV\" datos.genero
    carpetaStems := BasePath "\STEMS\" datos.genero "\" nombreArchivo

    DirCreate(carpetaMP3)
    DirCreate(carpetaWAV)
    DirCreate(carpetaStems)

    EstadoVentana("Exportando MP3...")
    RenderizarFormato(carpetaMP3 "\" nombreArchivo ".mp3", "MP3", false)

    EstadoVentana("Exportando WAV...")
    RenderizarFormato(carpetaWAV "\" nombreArchivo ".wav", "WAV", false)

    EstadoVentana("Exportando stems...")
    RenderizarFormato(carpetaStems "\" nombreArchivo ".wav", "WAV", true)

    EstadoVentana("Comprimiendo stems a .rar...")
    rutaRar := ComprimirStems(carpetaStems, nombreArchivo)

    EstadoVentana()

    MsgBox(
        "Listo, suprimo.`n`n"
        . "MP3: " carpetaMP3 "\" nombreArchivo ".mp3`n"
        . "WAV: " carpetaWAV "\" nombreArchivo ".wav`n"
        . "Stems: " carpetaStems "`n"
        . "RAR: " rutaRar,
        "FL Export - Completado"
    )
}

; ============================================================
; GUI para pedir nombre, tags, key, bpm, genero y colaborador
; ============================================================
PedirDatosBeat(generos) {
    resultado := false

    g := Gui("+OwnDialogs", "Exportar beat")
    g.SetFont("s10")

    g.AddText("xm y10", "Nombre del beat")
    edNombre := g.AddEdit("xm y+2 w300")

    g.AddText("xm y+10", "Tags (separadas por coma) - ej: Reggaeton, Synth")
    edTags := g.AddEdit("xm y+2 w300")

    g.AddText("xm y+10 w140", "Key")
    g.AddText("x+20 y+0 w140", "BPM")
    edKey := g.AddEdit("xm y+2 w140")
    edBPM := g.AddEdit("x+20 y+0 w140")

    g.AddText("xm y+10", "Colaborador extra (opcional) - ej: @ssaintcardona")
    edColab := g.AddEdit("xm y+2 w300")

    g.AddText("xm y+10", "Genero")
    ddGenero := g.AddDropDownList("xm y+2 w300", generos)
    ddGenero.Choose(1)

    btnOK := g.AddButton("xm y+15 w140 Default", "Exportar")
    btnCancel := g.AddButton("x+20 y+0 w140", "Cancelar")

    datos := {}

    btnOK.OnEvent("Click", (*) => (
        datos.nombre := Trim(edNombre.Value),
        datos.tags := Trim(edTags.Value),
        datos.key := Trim(edKey.Value),
        datos.bpm := Trim(edBPM.Value),
        datos.colaborador := Trim(edColab.Value),
        datos.genero := ddGenero.Text,
        g.Submit(),
        resultado := datos
    ))
    btnCancel.OnEvent("Click", (*) => g.Destroy())
    g.OnEvent("Close", (*) => g.Destroy())

    g.Show()
    WinWaitClose(g.Hwnd)

    if !resultado
        return false
    if (resultado.nombre = "" or resultado.key = "" or resultado.bpm = "") {
        MsgBox("Nombre, key y BPM son obligatorios.", "FL Export", "Iconx")
        return false
    }
    return resultado
}

ConstruirNombreArchivo(datos) {
    nombre := "'" datos.nombre "' " datos.tags " " datos.key " " datos.bpm "bpm (" UsuarioBeatstars
    if (datos.colaborador != "")
        nombre .= " + " datos.colaborador
    nombre .= ")"

    ; quita caracteres no validos en nombres de archivo de Windows
    caracteresProhibidos := ['\', '/', ':', '*', '?', '"', '<', '>', '|']
    for c in caracteresProhibidos
        nombre := StrReplace(nombre, c, "")
    return nombre
}

LeerGeneros(carpeta) {
    lista := []
    Loop Files, carpeta "\*", "D" {
        lista.Push(A_LoopFileName)
    }
    return lista
}

; ============================================================
; Un render completo: Ctrl+R -> guardar como -> opciones FL -> Start
; ============================================================
RenderizarFormato(rutaCompleta, formato, splitMixerTracks) {
    WinActivate("ahk_exe FL64.exe")
    WinWaitActive("ahk_exe FL64.exe",, 5)
    Sleep(200)

    Send("^r")
    if !WinWait("Guardar como", , 10) {
        MsgBox("No aparecio el dialogo de Guardar como. Cancelo aqui.", "FL Export", "Iconx")
        ExitApp()
    }
    WinActivate("Guardar como")
    Sleep(200)
    Send("^a")
    SendText(rutaCompleta)
    Sleep(200)
    Send("{Enter}")

    if !WinWait("Rendering to", , 10) {
        MsgBox("No aparecio el dialogo de render de FL. Cancelo aqui.", "FL Export", "Iconx")
        ExitApp()
    }
    WinActivate("Rendering to")
    Sleep(300)

    AsegurarFormato(formato)
    AsegurarSplitMixerTracks(splitMixerTracks)

    Sleep(150)
    ClickCoord(CoordStart)

    ; Senal de "render terminado": la ventana de render se cierra sola
    if !WinWaitClose("Rendering to", , TimeoutRenderSegundos) {
        MsgBox("El render de " rutaCompleta " no termino en " TimeoutRenderSegundos " segundos. Revisalo a mano.", "FL Export", "Iconx")
        ExitApp()
    }
}

AsegurarFormato(formatoDeseado) {
    wavActivo := EsNaranja(CoordWAV)
    mp3Activo := EsNaranja(CoordMP3)

    if (formatoDeseado = "WAV") {
        if !wavActivo
            ClickCoord(CoordWAV), Sleep(150)
        if mp3Activo
            ClickCoord(CoordMP3), Sleep(150)
    } else if (formatoDeseado = "MP3") {
        if !mp3Activo
            ClickCoord(CoordMP3), Sleep(150)
        ; si WAV seguia activo a la vez, lo desactivamos para dejar solo MP3
        if EsNaranja(CoordWAV)
            ClickCoord(CoordWAV), Sleep(150)
    }
}

AsegurarSplitMixerTracks(deseadoActivo) {
    actual := EsNaranja(CoordSplitMixerTracks)
    if (actual != deseadoActivo)
        ClickCoord(CoordSplitMixerTracks)
}

; Detecta si un control esta en estado "activo" (naranja, color de
; acento de FL Studio) comparando contra un rango de color en vez de
; un valor exacto, para tolerar variaciones de antialiasing.
EsNaranja(coordTexto) {
    partes := StrSplit(coordTexto, ",")
    x := Integer(partes[1])
    y := Integer(partes[2])
    color := PixelGetColor(x, y, "RGB")
    r := (color >> 16) & 0xFF
    g := (color >> 8) & 0xFF
    b := color & 0xFF
    return (r > 180 && g > 90 && g < 180 && b < 90)
}

ClickCoord(coordTexto) {
    partes := StrSplit(coordTexto, ",")
    Click(Integer(partes[1]), Integer(partes[2]))
}

; ============================================================
; Comprime la carpeta de stems a .rar usando WinRAR
; ============================================================
ComprimirStems(carpetaStems, nombreArchivo) {
    rutaRar := carpetaStems ".rar"
    winrar := BuscarWinRAR()
    if !winrar {
        MsgBox("No encuentro WinRAR instalado. Te dejo la carpeta de stems sin comprimir:`n" carpetaStems, "FL Export", "Icon!")
        return "(sin comprimir - WinRAR no encontrado)"
    }
    RunWait('"' winrar '" a -r -ep1 "' rutaRar '" "' carpetaStems '\*"', , "Hide")
    return rutaRar
}

BuscarWinRAR() {
    rutas := [
        "C:\Program Files\WinRAR\WinRAR.exe",
        "C:\Program Files (x86)\WinRAR\WinRAR.exe"
    ]
    for r in rutas
        if FileExist(r)
            return r
    return false
}

EstadoVentana(texto := "") {
    static tt := ""
    if (texto = "")
        ToolTip()
    else
        ToolTip("FL Export: " texto)
}
