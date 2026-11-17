const http = require('http'), fs = require('fs'), path = require('path');
// Sirve el panel y supabase-js (UMD) desde node_modules.
const SUPABASE_UMD = require.resolve('@supabase/supabase-js/dist/umd/supabase.js');
http.createServer((req, res) => {
  const nombre = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'panel.html';
  const f = nombre === 'supabase.js' ? SUPABASE_UMD : path.join(__dirname, nombre);
  if ((f !== SUPABASE_UMD && !f.startsWith(__dirname)) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript' });
  fs.createReadStream(f).pipe(res);
}).listen(4321, () => console.log('panel en :4321'));
