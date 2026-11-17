# Video demostrativo (Sprint 3)

Graba `Sprint3_Coillector_VideoDemostrativoMVP.mp4` en **una sola toma** contra
https://coillector.vercel.app: tres ventanas reales de Chromium en una pantalla
virtual de 1920×1080 (vendedor · panel del pipeline · recolector), capturadas con
`ffmpeg x11grab`. No hay cortes ni edición: la música se agrega como pista de audio.

- **Evento físico:** la cámara del recolector es una cámara simulada de Chromium
  que "ve" el QR real de la solicitud recién creada (`camara.js`), y el escáner de
  la app lo lee.
- **Backend en tiempo real:** `panel.html` escucha Supabase Realtime (como
  recolector demo) y muestra cada INSERT/UPDATE: confirmación → trigger → webhook
  de Make → respuesta de la API de pago simulada.
- **Billetera:** el panel suma el pago al saldo del vendedor demo y la app del
  vendedor se actualiza sola.

## Requisitos

Linux con `Xvfb`, `ffmpeg` (libx264) y Playwright con Chromium; Python 3 con
numpy para la música. Red hacia `coillector.vercel.app`, `*.supabase.co`,
`photon.komoot.io` y `tile.openstreetmap.org`.

## Grabar

```bash
Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp &
node scripts/video/servidor.js &          # panel en http://localhost:4321
node scripts/video/grabar.js              # deja scripts/video/salida/crudo.mkv
python3 -I scripts/video/musica.py scripts/video/salida/musica.wav 125
```

Mezcla final (ajusta `st` = duración − 3 s):

```bash
cd scripts/video/salida
ffmpeg -i crudo.mkv -i musica.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -c:a aac -b:a 160k \
  -af "volume=0.55,afade=t=in:st=0:d=1.5,afade=t=out:st=78:d=3" -shortest \
  -movflags +faststart Sprint3_Coillector_VideoDemostrativoMVP.mp4
```

**Cada toma crea datos reales** con las cuentas demo (una solicitud, una
confirmación y un pago simulado), que aparecen en las métricas públicas.
