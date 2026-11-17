// Graba el video demostrativo en UNA sola toma contra producción.
// Ver scripts/video/README.md. OJO: cada toma crea una solicitud y una
// confirmación reales (cuentas demo) y dispara el pago simulado en Make.
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const S = path.join(__dirname, 'salida');
fs.mkdirSync(S, { recursive: true });
const SITIO = 'https://coillector.vercel.app';
const DISPLAY = ':99';
const env = { ...process.env, DISPLAY };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const base = ['--disable-features=Translate,TranslateUI', '--lang=es-MX', '--no-first-run', '--no-default-browser-check',
  '--disable-infobars', '--hide-scrollbars', '--force-device-scale-factor=1'];

function cursor() {
  const KEY = '__curpos';
  const crear = () => {
    if (document.getElementById('__cur') || !document.documentElement) return;
    const c = document.createElement('div');
    c.id = '__cur';
    Object.assign(c.style, { position: 'fixed', width: '26px', height: '26px', borderRadius: '50%', border: '3px solid #e8a33d',
      background: 'rgba(232,163,61,.28)', boxShadow: '0 2px 10px rgba(0,0,0,.35)', pointerEvents: 'none', zIndex: 2147483647,
      transform: 'translate(-50%,-50%)', left: '-100px', top: '-100px', transition: 'width .12s, height .12s' });
    try { const p = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (p) { c.style.left = p[0] + 'px'; c.style.top = p[1] + 'px'; } } catch {}
    document.documentElement.appendChild(c);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px';
      try { sessionStorage.setItem(KEY, JSON.stringify([e.clientX, e.clientY])); } catch {} }, true);
    addEventListener('mousedown', (e) => {
      c.style.width = c.style.height = '20px';
      const r = document.createElement('div');
      Object.assign(r.style, { position: 'fixed', left: e.clientX + 'px', top: e.clientY + 'px', width: '10px', height: '10px', borderRadius: '50%',
        border: '3px solid #e8a33d', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 2147483646, transition: 'all .55s ease-out', opacity: '1' });
      document.documentElement.appendChild(r);
      requestAnimationFrame(() => { r.style.width = r.style.height = '70px'; r.style.opacity = '0'; });
      setTimeout(() => r.remove(), 700);
    }, true);
    addEventListener('mouseup', () => { c.style.width = c.style.height = '26px'; }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crear); else crear();
}

async function ventana(nombre, { x, w, url, extra = [], opciones = {} }) {
  const dir = path.join(S, 'perfiles', nombre);
  fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(dir, {
    headless: false, env, viewport: null,
    args: [...base, `--window-position=${x},0`, `--window-size=${w},1080`, `--app=${url}`, ...extra],
    ...opciones,
  });
  let page = ctx.pages()[0];
  for (let i = 0; !page && i < 50; i++) { await espera(100); page = ctx.pages()[0]; }
  return { ctx, page };
}

async function clic(page, loc, { pausa = 350, alejar = null } = {}) {
  await loc.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await espera(650);
  const b = await loc.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 28 });
  await espera(pausa);
  await page.mouse.down(); await espera(90); await page.mouse.up();
  if (alejar) { await espera(250); await page.mouse.move(b.x + b.width / 2 + alejar[0], b.y + b.height / 2 + alejar[1], { steps: 15 }); }
}

async function hover(page, loc, ms = 800) {
  const b = await loc.boundingBox();
  if (b) await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 28 });
  await espera(ms);
}

async function login(page, rol) {
  await page.goto(`${SITIO}/login`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: new RegExp(`${rol} demo`, 'i') }).click();
  await page.waitForURL(new RegExp(`/${rol}$`), { timeout: 60000 });
  await page.waitForLoadState('networkidle');
}

(async () => {
  execFileSync('node', [path.join(__dirname, 'camara.js'), 'Coillector', path.join(S, 'cam.y4m')]);

  // Fondo de escritorio
  const fondo = await ventana('fondo', { x: 0, w: 1920, url: 'data:text/html,<body style="margin:0;background:%23101912"></body>', opciones: { locale: 'es-MX' } });
  // Vendedor (izquierda)
  const ven = await ventana('vendedor', { x: 40, w: 470, url: `${SITIO}/login`,
    opciones: { geolocation: { latitude: 19.3868, longitude: -99.1748 }, permissions: ['geolocation'], locale: 'es-MX' } });
  // Panel (centro)
  const pan = await ventana('panel', { x: 530, w: 860, url: 'http://localhost:4321/panel.html', opciones: { locale: 'es-MX' } });
  // Recolector (derecha) con cámara simulada
  const rec = await ventana('recolector', { x: 1410, w: 470, url: `${SITIO}/login`,
    extra: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${path.join(S, 'cam.y4m')}`],
    opciones: { geolocation: { latitude: 19.3925, longitude: -99.1690 }, permissions: ['geolocation', 'camera'], locale: 'es-MX' } });

  for (const { ctx } of [ven, rec]) await ctx.addInitScript(cursor);
  await login(ven.page, 'vendedor');
  await login(rec.page, 'recolector');
  await pan.page.waitForFunction(() => document.getElementById('estado').textContent.includes('conectado'), null, { timeout: 30000 });
  await pan.page.evaluate(() => window.demo.caption('', ''));
  await espera(2500); // que se vayan los toasts de "Entraste como…"
  // Cursores en un punto neutro (sin pasar sobre enlaces ni teléfonos)
  for (const v of [ven, rec]) await v.page.mouse.move(380, 90, { steps: 5 });
  await espera(600);

  // ---------------- GRABACIÓN (una sola toma) ----------------
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'x11grab', '-framerate', '30', '-video_size', '1920x1080', '-draw_mouse', '0',
    '-i', DISPLAY, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', path.join(S, 'crudo.mkv')], { env, stdio: ['pipe', 'inherit', 'inherit'] });
  const inicio = Date.now();
  const marca = (m) => console.log(`[${((Date.now() - inicio) / 1000).toFixed(1)}s] ${m}`);
  const cap = (k, t) => pan.page.evaluate(([k, t]) => window.demo.caption(k, t), [k, t]);
  const paso = (n) => pan.page.evaluate((n) => window.demo.paso(n), n);
  await espera(400);
  await pan.page.evaluate(() => window.demo.reiniciarReloj());

  await cap('Coillector · MVP funcionando en la nube', 'Del aceite usado al biocombustible… <span style="color:#e8a33d">y al bolsillo del taquero.</span>');
  await espera(5500);

  marca('vendedor');
  await cap('El héroe: el taquero', 'Don Juan junta el aceite usado de su puesto. En vez de tirarlo al drenaje, pide que lo recojan.');
  await espera(2500);
  await clic(ven.page, ven.page.getByRole('link', { name: /nueva solicitud/i }).filter({ visible: true }).first());
  await ven.page.waitForURL(/\/vendedor\/nueva/);
  await ven.page.waitForLoadState('networkidle');
  await espera(800);
  await clic(ven.page, ven.page.getByRole('button', { name: '20 L', exact: true }));
  await espera(500);
  await cap('El héroe: el taquero', 'Su puesto ya está ubicado en el mapa: el recolector llegará al punto exacto.');
  await ven.page.locator('.leaflet-container').evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await espera(900);
  await hover(ven.page, ven.page.locator('.coil-pin'), 3200);
  const notas = ven.page.locator('#notas');
  await clic(ven.page, notas);
  await notas.pressSequentially('Garrafa de 20 L junto a la puerta', { delay: 40 });
  await espera(400);
  await clic(ven.page, ven.page.getByRole('button', { name: /solicitar recolección/i }));
  await ven.page.waitForURL(/\/vendedor\/solicitud\//, { timeout: 30000 });
  const id = ven.page.url().split('/').pop();
  marca(`solicitud ${id}`);
  await cap('En tiempo real', 'La solicitud llega al instante a los recolectores. Don Juan recibe un QR único.');
  // El QR que "verá" la cámara del recolector
  const camara = new Promise((res, rej) => {
    const p = spawn('node', [path.join(__dirname, 'camara.js'), `${SITIO}/recolector/solicitud/${id}`, path.join(S, 'cam.y4m')]);
    p.on('exit', (c) => (c === 0 ? res() : rej(new Error('camara'))));
  });
  await espera(5000);

  marca('ruta');
  await cap('Nuevo: ruta sugerida', 'El recolector ve las paradas más cercanas, ordenadas para cubrir varias entregas con menos vueltas.');
  await clic(rec.page, rec.page.getByRole('link', { name: 'Ruta', exact: true }).filter({ visible: true }).first(), { alejar: [0, -300] });
  await rec.page.waitForURL(/\/recolector\/ruta/);
  await espera(3000);
  await hover(rec.page, rec.page.locator('.coil-parada').first(), 2500);
  await rec.page.locator('ol li').first().evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await espera(1200);
  await rec.page.mouse.move(235, 520, { steps: 20 });
  await espera(2500);
  await camara;

  marca('escaneo');
  await paso(1);
  await cap('1 · Evento físico', 'En el puesto, el recolector escanea el QR de Don Juan con la cámara de su celular.');
  await espera(1500);
  await clic(rec.page, rec.page.getByRole('link', { name: 'Escanear', exact: true }).filter({ visible: true }).first(), { alejar: [0, -350] });
  await rec.page.waitForURL(/\/recolector\/escanear/);
  await espera(1500);
  await clic(rec.page, rec.page.getByRole('button', { name: /activar cámara/i }), { alejar: [0, 330] });
  await rec.page.waitForURL(new RegExp(`/recolector/solicitud/${id}`), { timeout: 30000 });
  await rec.page.waitForLoadState('networkidle');
  marca('confirmar');
  await espera(1200);
  await cap('1 · Evento físico', 'Mide el aceite, valida que la calidad sea apta y confirma la recolección.');
  await espera(2200);
  const litros = rec.page.locator('#litros_reales');
  await clic(rec.page, litros);
  await litros.fill('');
  await litros.pressSequentially('19.5', { delay: 120 });
  await espera(500);
  await clic(rec.page, rec.page.locator('label[for="calidad"]'));
  await espera(600);
  await clic(rec.page, rec.page.getByRole('button', { name: /confirmar y procesar pago/i }), { pausa: 900, alejar: [0, 120] });

  marca('pipeline');
  await cap('2 · Backend en tiempo real', 'Supabase registra la entrega, un trigger dispara el webhook y Make calcula el pago con la API financiera simulada.');
  await ven.page.getByText(/MXN enviado/i).first().waitFor({ timeout: 45000 });
  marca('pagado');
  await espera(4200);
  await paso(3);
  await cap('3 · Impacto en la billetera', 'Don Juan recibe su dinero en segundos: sin efectivo, sin intermediarios, sin recargar la app.');
  const comp = ven.page.getByText(/MXN enviado/i).first();
  if (await comp.count()) await comp.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await espera(1200);
  if (await comp.count()) { await hover(ven.page, comp, 2000); await ven.page.mouse.move(400, 300, { steps: 15 }); }
  await espera(1500);
  await espera(3500);

  marca('cierre');
  await paso(4);
  await cap('Coillector', 'La grasa que tapa el drenaje de la CDMX se convierte en biocombustible… <span style="color:#e8a33d">y en ingreso para el taquero.</span>');
  await espera(7000);

  ff.stdin.write('q');
  await new Promise((r) => ff.on('exit', r));
  marca('fin de la toma');
  for (const v of [ven, rec, pan, fondo]) await v.ctx.close();
})().catch((e) => { console.error(e); process.exit(1); });
