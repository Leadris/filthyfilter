# FilthyFilter by whispAir

## Aktuálny stav — 5. 9. 2026

Schválený plán, checklist a aktuálne odovzdanie sú v **[docs/REDESIGN_PLAN.md](docs/REDESIGN_PLAN.md)**. Claude začína súborom **[CLAUDE.md](CLAUDE.md)**. Tieto pokyny nahrádzajú historické rozhodnutia nižšie.

- Baseline pôvodného webu: tag `baseline-v1` na `99b956c`.
- Pracovná vetva: `codex/filthyfilter-redesign`. Produkcia sa nemení automaticky pushom.
- Značka **FilthyFilter by whispAir**; hlavný trh Slovensko, Senec a okolie do približne 100 km. Dostupnosť a doprava sa potvrdzujú podľa adresy.
- Telefón/WhatsApp: **+421 902 279 094**. Email: **info@filthyfilter.sk**; pred nasadením treba overiť doručovanie schránky.
- SK je predvolený jazyk v HTML aj pri prvej návšteve. Manuálna EN/NL voľba zostáva v `ff_lang`; všetky jazyky opisujú slovenskú ponuku. Prekladaj všetky `data-sk/data-en/data-nl` aj viditeľný slovenský text.
- Kontakty sú v `CONTACT` v `js/main.js` a v priamych HTML fallback odkazoch; pri zmene udrž oboje zhodné.
- `steden/` a päť holandských mestských stránok sú už iba kompatibilné presmerovania na homepage `#service-area`, nie aktívne regióny. Sitemap obsahuje homepage a realizáciu La Donuteria.
- Statické HTML/CSS/JS, bez backendu, frameworku a buildu. Dopytový formulár, nové poradie a nové servisné karty sú ďalšie etapy podľa plánu.

Náhľad so zachovaním produkčnej podcesty: `python -m http.server 8080 --bind 127.0.0.1 --directory D:/whispAir-IT`, potom `http://127.0.0.1:8080/filthyfilter/`.

Nasadenie je samostatná etapa podľa [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Dokumentáciu, CLAUDE.md ani dočasné nástroje nepublikovať. Emailová doména nemení adresu webu `https://whispair.sk/filthyfilter/`.

## Historická dokumentácia baseline (už neurčuje aktuálny trh ani kontakty)

Nasledujúci pôvodný opis zachytáva vznik projektu. Pri rozpore platí aktuálny plán vyššie; neobnovovať holandské kontakty, jazykové predvoľby ani mestské ponuky.

Statische, **drietalige (NL/EN/SK)** website voor airco-reiniging, in een dark sci-fi /
HUD-stijl met de signature **FFFF Rating™** (*FilthyFilter Fungus Fun Factor*).

Geen build-stap, geen backend, geen WordPress. Gewoon HTML/CSS/JS.

## Structuur

```
filthyfilter/
  index.html              # de hoofdpagina (3 talen via data-nl / data-en / data-sk)
  css/styles.css          # HUD design system + layout + responsive
  js/main.js              # taalwissel (NL/EN/SK, onthouden in localStorage) + reveal + mobiel menu
  js/background.js        # geanimeerde achtergrond (sporen + groeiend mycelium)
  assets/favicon.svg
  steden/                 # lokale SEO landingspagina's per stad
    index.html            #   hub: "Werkgebieden" (overzicht + links)
    eindhoven/index.html
    tilburg/index.html
    breda/index.html
    den-bosch/index.html
    maastricht/index.html
  sitemap.xml             # alle 7 URL's
  robots.txt              # verwijst naar sitemap
  README.md
```

## Bekijken (lokaal)

Serveer de map (aanbevolen i.v.m. de mappen-URL's `/steden/<stad>/`, fonts en caching):

```powershell
# vanuit de map filthyfilter/
python -m http.server 8080
# open daarna http://localhost:8080  en  http://localhost:8080/steden/
```

## Taal (NL / EN / SK)

- Standaardtaal is **NL**. De keuze wordt onthouden in `localStorage` (`ff_lang`).
- Vertaalbare teksten hebben `data-nl="..."`, `data-en="..."` en `data-sk="..."`.
  Pas je tekst aan? Wijzig **alle drie** de attributen (en de zichtbare tekst ertussen).
- Per pagina staat de `<title>`/meta-omschrijving per taal in een klein `window.FF_META`
  blok in de `<head>` (zo overschrijft de taalwissel niet de stad-specifieke titel).

## Steden / lokale SEO

Elke stadspagina (`/steden/<stad>/`) heeft **unieke** content (lokale intro, wijken, FAQ) +
eigen `<title>`, canonical, Open Graph en **JSON-LD** (`HVACBusiness` met `areaServed` + geo).
Dit is bewust géén "doorway"-aanpak (geen 50 identieke pagina's met alleen een andere
stadsnaam — dat straft Google af). Nieuwe stad toevoegen? Kopieer een bestaande
`steden/<stad>/index.html`, pas content/JSON-LD/`FF_META` aan, en voeg de URL toe aan
`sitemap.xml`, aan de hub `steden/index.html` en aan de footer-links.

> **SEO-let op:** de taalwissel is client-side JavaScript op één URL. Google indexeert dus
> per URL de **standaard NL**-tekst. Voor lokale NL-SEO is dat precies goed. EN/SK zijn voor
> de bezoeker, niet als aparte geïndexeerde URL's. Wil je EN/SK óók apart laten indexeren, dan
> zijn aparte URL's per taal + `hreflang` nodig (grotere wijziging, nu niet gedaan).

## Geanimeerde achtergrond (WebGL) & parallax

`js/background.js` is een **raw WebGL** renderer (geen dependencies) op één fullscreen canvas
(`#spore-field`) en tekent **beide** lagen:
- **Sporen** — GPU point-sprites met additieve gloed, drijven omhoog.
- **Mycelium** — vertakkende lijnen, één keer op de CPU gegenereerd en "onthuld" via een
  `uProgress`-uniform (groeit → houdt → vervaagt → opnieuw), vastgepind op de `.hero`.

**Parallax:** muisbeweging in de hero (lagen + nadpis/ringen verschuiven licht) en
scroll-parallax van de achtergrond — beide via shader-uniforms, dus op de GPU (geen layout =
ook op mobiel vloeiend).

**Performance:** draait nu **ook op mobiel** (GPU), met budget: minder deeltjes, lagere DPR en
FPS-cap op touch/kleine/low-memory toestellen. `prefers-reduced-motion` → één statisch beeld,
geen lus. Pauzeert wanneer het tabblad verborgen is. Als WebGL ontbreekt of de context verloren
gaat, valt het terug op een **statisch 2D-beeld** (zodat de pagina nooit kapot oogt). Alle
instellingen staan bovenin het bestand in `CFG`.

## ⚠️ Nog invullen (placeholders)

Zoek op `TODO` in `index.html` **en in elke** `steden/<stad>/index.html`. Te vervangen:

| Wat | Waar | Huidige placeholder |
|-----|------|---------------------|
| Telefoonnummer | `tel:` links | `+31 6 00 00 00 00` |
| WhatsApp-nummer | `https://wa.me/...` | `31600000000` (landcode zonder `+`/spaties) |
| E-mailadres | `mailto:` links | `info@filthyfilter.nl` |
| Openingstijden | contact-secties | "Ma–za · 08:00–18:00" |
| KvK / BTW | footer | `00000000` / `NL000000000B00` |
| Domein in schema/canonical | `https://filthyfilter.nl/...` | controleer dat dit je echte domein is |

Optioneel later: echte foto's/logo, echte prijzen, klantreviews per stad, social links, een
contactformulier (vereist dan een service zoals Formspree of een eigen backend).

## Publiceren

De productieversie staat op `https://whispair.sk/filthyfilter/`. Volg voor het
exacte SSH-doel, de release-inhoud, rollback en verificatie altijd
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). De stads-URL's werken dankzij de
`index.html` per map (`/steden/eindhoven/` enz.). Enige externe afhankelijkheid:
Google Fonts (Oswald, Share Tech Mono, Inter).
