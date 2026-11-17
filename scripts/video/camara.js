// Genera un .y4m de "cámara" que enfoca un QR impreso: node camara.js <texto> <salida.y4m>
const QR = require('qrcode');
const { execFileSync } = require('child_process');
const path = require('path');
(async () => {
  const [texto, salida] = process.argv.slice(2);
  const png = path.join(path.dirname(salida), 'qr-tmp.png');
  await QR.toFile(png, texto, { width: 300, margin: 3, errorCorrectionLevel: 'M' });
  // Fondo de mesa oscuro, QR en papel blanco con un leve vaivén, como si la mano sostuviera el celular.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'lavfi', '-i', 'color=c=0x3b3326:s=640x480:r=30:d=6',
    '-loop', '1', '-i', png,
    '-filter_complex',
    "[1:v]scale=300:300,pad=330:330:15:15:white,rotate='0.05*sin(2*PI*t/4)':c=0x3b3326:ow=360:oh=360[q];[0:v][q]overlay=x='if(lt(t,2.2),660-520*(t/2.2),140+6*sin(2*PI*t/3))':y='60+5*cos(2*PI*t/4)':shortest=1,noise=alls=6:allf=t,format=yuv420p",
    '-t', '6', '-pix_fmt', 'yuv420p', salida]);
})().catch(e => { console.error(e); process.exit(1); });
