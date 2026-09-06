# FilthyFilter — pokyny na pokračovanie

Najprv prečítaj `docs/REDESIGN_PLAN.md`. Obsahuje schválené rozhodnutia používateľa, technické správanie, checklist a aktuálne odovzdanie. Je nadradený historickým poznámkam v README/CONTEXT; nové pokyny používateľa majú prednosť.

Pre akvizíciu, meranie, ceny na landing pages a Google Ads platí `docs/MARKETING_PLAN.md` (6. 9. 2026). Kde sa rozchádza s `REDESIGN_PLAN.md`, platí marketingový plán a sám uvádza, ktoré staršie rozhodnutia ruší.

- Začni `git status`, `git log -5 --oneline` a aktuálnym odovzdaním. Pracovná vetva: `codex/filthyfilter-redesign`; nemiešaj súbežné zmeny iného agenta.
- Baseline `baseline-v1` je nemenný pôvodný stav. Netreba ho vytvárať znovu ani prepisovať.
- Zachovaj dnešný tmavý medený vizuál a humor. Značka je **FilthyFilter by whispAir**, hlavný trh Slovensko; Klimuj.sk nepoužívaj.
- Projekt je čisté HTML/CSS/JS bez buildu. Nepridávaj framework ani npm závislosti a nehostuj vlastný backend. **Od 6. 9. 2026 web volá existujúce `whispair-api`** (`D:\whispAir-IT\whispair-api`, PHP + PostgreSQL, `api.whispair.sk`) na odoslanie dopytu a atribúcie. Nestavaj druhé CRM ani vlastnú databázu; čo tá platforma už vie, je v `docs/MARKETING_PLAN.md`.
- Web má iba slovenskú a anglickú verziu. Pri zmene textu udržuj zhodný význam `data-sk` a `data-en` a slovenský text medzi značkami. Pri `data-attr-target` meníš cieľový atribút, nie obsah uzla. Holandčinu nepridávaj späť.
- Nepreberaj konkurenčné ceny, referencie alebo sľuby. Potvrdené kontakty a rozsah sú v pláne.
- Po ucelenej etape over správanie, aktualizuj checklist a odovzdanie v pláne, commitni a pushni pracovnú vetvu. Uveď, čo je hotové, overené a čo zostáva.
- Merge/main/produkčné nasadenie sú samostatná etapa. Postup nasadenia: `docs/DEPLOYMENT.md`; do webrootu patria len verejné súbory uvedené v dokumente.

Produkcia je koreň domény `https://filthyfilter.sk/`; cesty k assetom drž relatívne. Lokálny náhľad: `python -m http.server 8080 --bind 127.0.0.1 --directory D:/whispAir-IT`, potom `http://127.0.0.1:8080/filthyfilter/`. Server spúšťaj len lokálne a po overení zastav, pokiaľ ho používateľ nepotrebuje.
