import { readFileSync, writeFileSync } from 'node:fs'
const dir = '/home/user/Lido/design/lilo-better/'
const manifest = JSON.parse(readFileSync(dir + 'canvas.json', 'utf8'))
const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png' }
const img = {}
for (const n of ['amalfi.jpg', 'positano.jpg', 'tokyo.jpg', 'lilo-mark.png'])
  img[n] = 'data:' + MIME[n.slice(n.lastIndexOf('.'))] + ';base64,' + readFileSync(dir + n).toString('base64')

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const para = t => esc(t).split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
const note = Object.fromEntries(manifest.annotations.map(a => [a.id, a.text]))

// The four explanation boards are not screens, so they are not plate-numbered.
const SCREENS = 13
const CAPTION = { 'Memories.dc.html': note['bond-note'], 'Flows.dc.html': note['flows-note'], 'Gestures.dc.html': note['gest-note'] }

const plates = manifest.artboards.map((ab, i) => {
  const src = readFileSync(dir + ab.file, 'utf8')
  const body = src.slice(src.indexOf('<x-dc>') + 6, src.lastIndexOf('</x-dc>'))
    .replace(/<helmet>[\s\S]*?<\/helmet>/, '')
    .replace(/src="\.?\/?([A-Za-z0-9_.-]+\.(?:jpg|png))"/g, (m, n) => img[n] ? `data-img="${n}"` : m)
    .trim()
  const num = i < SCREENS ? String(i + 1).padStart(2, '0') : '&mdash;'
  const cap = CAPTION[ab.file] ? `<div class="cap">${para(CAPTION[ab.file])}</div>` : ''
  return `<section class="plate" id="s${i}">
  <div class="plate-head"><span class="num">${num}</span><h2>${esc(ab.title || ab.file)}</h2></div>
  ${cap}
  <div class="frame" data-w="${ab.w}" data-h="${ab.h}" style="max-width:${ab.w}px"><div class="inner">${body}</div></div>
</section>`
}).join('\n')

const index = manifest.artboards.map((ab, i) =>
  `<li><a href="#s${i}"><span class="num">${i < SCREENS ? String(i + 1).padStart(2, '0') : '&mdash;'}</span>${esc(ab.title || ab.file)}</a></li>`).join('')

const html = `<title>Lilo Screen Plates</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
  :root {
    --ground: #F2F4F4;
    --panel: #FFFFFF;
    --ink: #101414;
    --ink-2: rgba(16,20,20,.62);
    --ink-3: rgba(16,20,20,.42);
    --rule: rgba(16,20,20,.12);
    --accent: #146F82;
    --lift: 0 12px 40px rgba(16,20,20,.10), 0 0 0 .5px rgba(16,20,20,.09);
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ground: #111516; --panel: #171C1D; --ink: #E7EBEB; --ink-2: rgba(231,235,235,.64);
      --ink-3: rgba(231,235,235,.42); --rule: rgba(231,235,235,.15); --accent: #5EBFD1;
      --lift: 0 16px 48px rgba(0,0,0,.45), 0 0 0 .5px rgba(231,235,235,.10);
      color-scheme: dark;
    }
  }
  :root[data-theme="dark"] {
    --ground: #111516; --panel: #171C1D; --ink: #E7EBEB; --ink-2: rgba(231,235,235,.64);
    --ink-3: rgba(231,235,235,.42); --rule: rgba(231,235,235,.15); --accent: #5EBFD1;
    --lift: 0 16px 48px rgba(0,0,0,.45), 0 0 0 .5px rgba(231,235,235,.10);
    color-scheme: dark;
  }

  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--ground); color: var(--ink);
    font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 15px; line-height: 1.62; -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 820px; margin: 0 auto; padding: 0 24px; }
  a { color: inherit; text-decoration: none; }
  a:focus-visible, [href]:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 3px; }
  .num { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 11.5px; font-weight: 500;
         letter-spacing: .04em; color: var(--accent); font-variant-numeric: tabular-nums; }

  header { padding: 92px 0 0; }
  h1 { font-family: Fraunces, Georgia, serif; font-optical-sizing: auto; font-weight: 600;
       font-size: clamp(38px, 7vw, 56px); line-height: 1.08; letter-spacing: -.022em;
       margin: 0 0 14px; text-wrap: balance; }
  .standfirst { max-width: 60ch; color: var(--ink-2); margin: 0; }
  .lead { max-width: 62ch; color: var(--ink-2); margin: 26px 0 0; }
  .lead p { margin: 0 0 12px; }
  .lead p:first-child { color: var(--ink); font-size: 16.5px; }

  .index { margin: 44px 0 0; padding: 22px 0 0; border-top: 1px solid var(--rule); }
  .index h2 { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 11px; font-weight: 500;
              text-transform: uppercase; letter-spacing: .12em; color: var(--ink-3); margin: 0 0 14px; }
  .index ul { list-style: none; margin: 0; padding: 0;
              display: grid; grid-template-columns: repeat(auto-fill, minmax(178px, 1fr)); gap: 2px 24px; }
  .index a { display: flex; gap: 10px; align-items: baseline; padding: 4px 0;
             border-bottom: 1px solid transparent; color: var(--ink-2); }
  .index a:hover { color: var(--ink); border-bottom-color: var(--rule); }

  main { padding: 26px 0 96px; }
  .plate { padding-top: 46px; }
  .plate-head { display: flex; align-items: baseline; gap: 12px;
                padding-bottom: 9px; border-bottom: 1px solid var(--rule); }
  .plate-head h2 { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 11.5px; font-weight: 500;
                   text-transform: uppercase; letter-spacing: .12em; color: var(--ink-2); margin: 0; }
  .cap { max-width: 58ch; margin: 16px 0 0; color: var(--ink-2); font-size: 14px; }
  .cap p { margin: 0 0 10px; }

  .frame { position: relative; width: 100%; margin: 22px auto 0; overflow: hidden;
           border-radius: 24px; background: #FFF; box-shadow: var(--lift); }
  .inner { transform-origin: top left; }

  footer { border-top: 1px solid var(--rule); padding: 22px 0 60px; color: var(--ink-3); font-size: 13px; }
  @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
  html { scroll-behavior: smooth; }
</style>

<header class="wrap">
  <h1>Lilo Screen Plates</h1>
  <p class="standfirst">Thirteen screens and four explanation boards, flattened out of the design canvas so they read straight down the page.</p>
  <div class="lead">${para(note['top'])}</div>
  <nav class="index">
    <h2>Plates</h2>
    <ul>${index}</ul>
  </nav>
</header>

<main class="wrap">
${plates}
</main>

<footer class="wrap">Same artboards as the editable canvas, rendered flat &mdash; no editor, no frames to load.</footer>

<script>
  var IMG = ${JSON.stringify(img)};
  document.querySelectorAll('[data-img]').forEach(function (el) {
    var u = IMG[el.dataset.img]; if (u) el.setAttribute('src', u)
  })
  function fit() {
    document.querySelectorAll('.frame').forEach(function (f) {
      var w = +f.dataset.w, h = +f.dataset.h, s = Math.min(1, f.clientWidth / w)
      f.querySelector('.inner').style.transform = 'scale(' + s + ')'
      f.style.height = Math.round(h * s) + 'px'
    })
  }
  fit()
  addEventListener('resize', fit)
</script>`
writeFileSync(dir + 'lilo-plates.html', html)
console.log('wrote', (html.length / 1024).toFixed(0) + 'KB')
