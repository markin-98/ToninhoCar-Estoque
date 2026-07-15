// Injeta as tags do PWA no dist/index.html gerado pelo `expo export --platform web`.
// No modo SPA (output: "single") o Expo ignora app/+html.tsx, então fazemos a
// injeção aqui, como passo de pós-build. Idempotente: não duplica se rodar 2x.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arquivo = resolve(raiz, 'dist/index.html');

if (!existsSync(arquivo)) {
  console.error('[pwa-inject] dist/index.html não encontrado. Rode o export antes.');
  process.exit(1);
}

let html = readFileSync(arquivo, 'utf8');

const TAGS = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#2563EB" />
    <meta name="application-name" content="ToninhoCar" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="ToninhoCar" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').catch(function (e) {
            console.log('Falha ao registrar o service worker:', e);
          });
        });
      }
    </script>
`;

let mudou = false;

// Idioma correto (o template padrão vem como "en").
if (html.includes('<html lang="en">')) {
  html = html.replace('<html lang="en">', '<html lang="pt-BR">');
  mudou = true;
}

// Injeta as tags do PWA uma única vez, logo antes de </head>.
if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', `${TAGS}  </head>`);
  mudou = true;
}

if (mudou) {
  writeFileSync(arquivo, html);
  console.log('[pwa-inject] Tags do PWA injetadas em dist/index.html');
} else {
  console.log('[pwa-inject] Nada a fazer (tags já presentes).');
}
