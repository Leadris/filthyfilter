"""Renders docs/SYSTEM_REVIEW.md into interne/system-review/index.html.

Self-contained page in the internal-guide style (no shared CSS, no scripts
except the small TOC helper). Not part of any release package; deployed on
its own to the staging root as /system-review/.

Moved here from tmp/ on 2026-09-10 and committed. tmp/ is gitignored, so the
rendered page was in the repository while the only thing able to rebuild it was
not: anyone editing docs/SYSTEM_REVIEW.md would have had no way to refresh the
page, and the two would drift apart silently.

Needs the `markdown` package. Run from anywhere:  python scripts/build-system-review.py
"""
from pathlib import Path
import re, html, datetime
import markdown

root = Path(__file__).resolve().parents[1]
src = root / 'docs' / 'SYSTEM_REVIEW.md'
dst = root / 'interne' / 'system-review' / 'index.html'
dst.parent.mkdir(parents=True, exist_ok=True)

text = src.read_text(encoding='utf-8')
md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc', 'sane_lists'],
                       extension_configs={'toc': {'toc_depth': '2-3', 'anchorlink': False}})
body = md.convert(text)
toc = md.toc

# The first H1 is the page title; the header block renders it itself.
title_match = re.search(r'<h1 id="[^"]*">(.*?)</h1>', body, re.S)
title = html.unescape(re.sub('<.*?>', '', title_match.group(1))) if title_match else 'Technický review'
body = body[:title_match.start()] + body[title_match.end():] if title_match else body

# Wide tables and code must scroll inside their own box, never the page.
body = body.replace('<table>', '<div class="scroll"><table>').replace('</table>', '</table></div>')

today = datetime.date.today()
generated = f'{today.day}. {today.month}. {today.year}'

page = f'''<!DOCTYPE html>
<html lang="sk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#0a0706">
<title>Technický review funnelu | FilthyFilter interné</title>
<style>
  :root{{
    --bg:#0a0706; --panel:#140f0b; --panel-2:#1b140e; --line:#4a3017; --line-2:#7a4f23;
    --copper:#c8842f; --gold:#e8b057; --cream:#efe6d6; --muted:#c2b49c;
    --dim:#998a74; --danger:#c0533b; --ok:#8fa54e;
    --mono:ui-monospace,"Cascadia Mono",Consolas,"Liberation Mono",monospace;
    --body:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  }}
  *{{box-sizing:border-box}}
  html{{scroll-behavior:smooth;color-scheme:dark}}
  body{{margin:0;padding:0;background:var(--bg);color:var(--cream);
       font:16px/1.65 var(--body);-webkit-text-size-adjust:100%}}
  .layout{{display:grid;grid-template-columns:270px minmax(0,1fr);gap:0;min-height:100vh}}
  nav.toc{{position:sticky;top:0;align-self:start;height:100vh;overflow:auto;
          border-right:1px solid var(--line);background:var(--panel);padding:22px 18px 40px}}
  nav.toc .kicker{{margin-bottom:14px}}
  nav.toc ul{{list-style:none;margin:0;padding:0}}
  nav.toc ul ul{{padding-left:12px;margin:2px 0 6px;border-left:1px solid var(--line)}}
  nav.toc li{{margin:0}}
  nav.toc a{{display:block;padding:5px 6px;color:var(--muted);text-decoration:none;
            font-size:.86rem;line-height:1.35;border-radius:3px}}
  nav.toc ul ul a{{font-size:.78rem;color:var(--dim)}}
  nav.toc a:hover{{color:var(--gold);background:rgba(200,132,47,.08)}}
  nav.toc a.active{{color:var(--gold);background:rgba(200,132,47,.14)}}
  main{{padding:0 0 80px;min-width:0}}
  .wrap{{max-width:900px;margin:0 auto;padding:0 32px}}
  header{{border-bottom:1px solid var(--line);padding:32px 0 24px;margin-bottom:28px}}
  .kicker{{font:0.7rem var(--mono);letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin:0 0 8px}}
  h1{{margin:0 0 10px;font-size:1.75rem;line-height:1.2}}
  .sub{{margin:0;color:var(--muted);font-size:.95rem}}
  .notice{{border:1px solid var(--line-2);border-left:3px solid var(--gold);background:var(--panel);
           border-radius:4px;padding:12px 16px;margin:18px 0 0;font-size:.9rem;color:var(--muted)}}
  h2{{margin:52px 0 10px;font-size:1.35rem;color:var(--gold);border-top:1px solid var(--line);padding-top:28px;scroll-margin-top:16px}}
  h2:first-of-type{{border-top:0;padding-top:0;margin-top:20px}}
  h3{{margin:30px 0 8px;font-size:1.05rem;color:var(--cream);scroll-margin-top:16px}}
  p{{margin:0 0 14px;color:var(--muted)}}
  ul,ol{{margin:0 0 16px;padding-left:24px;color:var(--muted)}}
  li{{margin-bottom:8px}}
  li p{{margin:0 0 6px}}
  strong{{color:var(--cream)}}
  a{{color:var(--gold)}}
  hr{{border:0;height:0;margin:0}}
  code{{font-family:var(--mono);font-size:.86em;color:var(--gold);background:rgba(200,132,47,.09);
       padding:1px 5px;border-radius:3px;word-break:break-word}}
  pre{{margin:0 0 18px;padding:14px 16px;border:1px solid var(--line);border-radius:4px;background:var(--panel);
      overflow-x:auto;font:.82rem/1.55 var(--mono);color:var(--cream)}}
  pre code{{background:none;padding:0;color:inherit;font-size:inherit;word-break:normal}}
  .scroll{{overflow-x:auto;margin:0 0 20px;border:1px solid var(--line);border-radius:4px;background:var(--panel)}}
  table{{border-collapse:collapse;width:100%;font-size:.88rem}}
  th,td{{text-align:left;vertical-align:top;padding:9px 12px;border-bottom:1px solid var(--line)}}
  th{{color:var(--gold);font:0.7rem var(--mono);letter-spacing:.12em;text-transform:uppercase;background:var(--panel-2);white-space:nowrap}}
  tr:last-child td{{border-bottom:0}}
  td{{color:var(--muted)}}
  td code{{white-space:nowrap}}
  td:first-child{{color:var(--cream)}}
  footer{{margin-top:60px;padding-top:20px;border-top:1px solid var(--line);
         font:0.72rem var(--mono);color:var(--dim);letter-spacing:.06em}}
  .menu-btn{{display:none}}
  @media (max-width:960px){{
    .layout{{display:block}}
    nav.toc{{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line);padding:16px 20px}}
    nav.toc ul ul{{display:none}}
    .wrap{{padding:0 20px}}
    h1{{font-size:1.45rem}}
    th,td{{padding:8px 10px}}
  }}
</style>
</head>
<body>
<div class="layout">
<nav class="toc" aria-label="Obsah">
  <p class="kicker">Obsah</p>
  {toc}
</nav>
<main>
<div class="wrap">
<header>
  <p class="kicker">FilthyFilter by whispAir · interný dokument</p>
  <h1>{html.escape(title)}</h1>
  <p class="sub">Zdroj: <code>docs/SYSTEM_REVIEW.md</code> v repozitári FilthyFilter. Vygenerované {generated}.</p>
  <div class="notice">Neindexovaná, neverejná stránka na stagingu. Nie je chránená heslom, adresu berte ako neuvedenú, nie tajnú.</div>
</header>
{body}
<footer>FilthyFilter by whispAir · technický review · {generated}</footer>
</div>
</main>
</div>
<script>
(function(){{
  var links=[].slice.call(document.querySelectorAll('nav.toc a'));
  var heads=links.map(function(a){{return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));}});
  function mark(){{
    var y=window.scrollY+40,i,idx=0;
    for(i=0;i<heads.length;i++){{ if(heads[i]&&heads[i].offsetTop<=y) idx=i; }}
    links.forEach(function(a,j){{a.classList.toggle('active',j===idx);}});
  }}
  window.addEventListener('scroll',mark,{{passive:true}}); mark();
}})();
</script>
</body>
</html>
'''
dst.write_text(page, encoding='utf-8', newline='\n')
print(f'{dst.relative_to(root).as_posix()}: {dst.stat().st_size} bytes')
