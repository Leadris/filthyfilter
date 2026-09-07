# FilthyFilter by whispAir

## Aktuálny stav — 5. 9. 2026

Schválený plán, checklist a aktuálne odovzdanie sú v **[docs/REDESIGN_PLAN.md](docs/REDESIGN_PLAN.md)**. Claude začína súborom **[CLAUDE.md](CLAUDE.md)**. Tieto pokyny nahrádzajú historické rozhodnutia nižšie.

- Baseline pôvodného webu: tag `baseline-v1` na `99b956c`.
- Pracovná vetva: `codex/filthyfilter-redesign`. Produkcia sa nemení automaticky pushom.
- Značka **FilthyFilter by whispAir**; hlavný trh Slovensko, Bratislava, Trnava, Nitra a okolie do 20 km. Dostupnosť a doprava sa potvrdzujú podľa adresy.
- Telefón/WhatsApp: **+421 902 279 094**. Email: **info@filthyfilter.sk**; pred nasadením treba overiť doručovanie schránky.
- SK je predvolený jazyk v HTML aj pri prvej návšteve. **Web má iba SK a EN**; holandčina bola 5. 9. 2026 odstránená. Manuálna voľba zostáva v `ff_lang`. Prekladaj `data-sk` aj `data-en` a viditeľný slovenský text.
- Kontakty sú v `CONTACT` v `js/main.js` a v priamych HTML fallback odkazoch; pri zmene udrž oboje zhodné.
- Adresár `steden/` s holandskými mestskými stránkami bol 5. 9. 2026 zrušený. Držal staré URL z filthyfilter.nl, ktoré na novej doméne nikdy neexistovali. Sitemap obsahuje homepage a realizáciu La Donuteria.
- Statické HTML/CSS/JS, bez backendu, frameworku a buildu. Nové poradie obsahu, servisné karty, FAQ a firemná sekcia sú hotové (etapa 2). Plnohodnotný dopytový formulár je ďalšia etapa; servisné CTA zatiaľ predvyplnia správu do WhatsAppu alebo e-mailu.

Lokálny náhľad: `python -m http.server 8080 --bind 127.0.0.1 --directory D:/whispAir-IT`, potom `http://127.0.0.1:8080/filthyfilter/`. Cesty k assetom sú relatívne, takže web funguje na koreni domény aj pod podcestou.

Produkcia je **`https://filthyfilter.sk/`**, koreň vlastnej domény na tom istom WebHouse účte. Postup vydania je v [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md); push do vetvy nenasadzuje. Dokumentáciu, CLAUDE.md ani dočasné nástroje nepublikovať. HTTPS zatiaľ čaká na certifikát pre túto doménu.

## Historická dokumentácia

Pôvodný holandský popis projektu bol 7. 9. 2026 odstránený. Opisoval trojjazyčný
web s adresárom `steden/`, holandskými kontaktmi a holandčinou ako predvoleným
jazykom. Nič z toho už neexistuje a osemdesiat riadkov sebavedomých pokynov
k zrušenej štruktúre je horších než žiadne. Kto ich potrebuje, nájde ich
v histórii Gitu pred týmto commitom.

## Kam ísť ďalej

| Otázka | Dokument |
| --- | --- |
| V akom stave projekt je a čo je otvorené | `docs/STATUS.md` |
| Vizuál, texty, rozhodnutia o obsahu | `docs/REDESIGN_PLAN.md` |
| Akvizícia, meranie, ceny, Google Ads | `docs/MARKETING_PLAN.md` |
| Ako sa nasadzuje | `docs/DEPLOYMENT.md` |
| Ako sa píše spis realizácie | `docs/HALL_OF_FILTH_CASE_GUIDE.md` |

