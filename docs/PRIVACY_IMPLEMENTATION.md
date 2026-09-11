# Súkromie a meranie — implementácia 7. 9. 2026

Verejné informácie: `ochrana-osobnych-udajov/index.html`, SK/EN. Prevádzkovateľa
ADAMSON s. r. o. určil používateľ; názov, IČO a sídlo boli overené cez FinStat
aj aktuálny ORSR. Nejde o novú, ešte nezaloženú spoločnosť.

## Čo web robí

- Pri troch formulároch je krátka informácia s odkazom. Súhlas s reklamou nie je
  podmienkou dopytu. Meno a jeden kontakt sú potrebné na odpoveď; obec na nacenenie.
- Google GTM `GTM-57M8XLQJ` sa načíta až po povolení merania (basic Consent Mode v2).
  Štyri signály sa najprv nastavia na denied. Po súhlase sú povolené analytické
  a reklamné meranie a ad_user_data; **ad_personalization zostáva denied**.
- Jeden voliteľný účel: vyhodnotenie reklamnej návštevy, dopytu a výslednej zákazky.
  Text výslovne zahŕňa hodnotu zákazky a hash kontaktu pri offline meraní. Hash nie
  je anonymný údaj. Žiadny Meta Pixel sa touto zmenou nepridal.
- Rovnocenné tlačidlá povoliť/odmietnuť. Nastavenia sú dostupné v každej pätičke
  aj v texte informácií. Odvolanie vyčistí vlastné meracie cookies a atribúciu,
  odošle denied a obnoví stránku, aby nepokračovali už načítané cudzie skripty.
  Banner na obnovenie upozorní a dá sa zavrieť bez zmeny.
- `ff_consent_v2`: voľba, čas a verzia informácie, platnosť 180 dní. Staré `yes`
  z v1 sa nepovažuje za súhlas s novým rozsahom. Staré atribučné dáta sa vymažú.
- `ff_attr_v2`: iba po súhlase, na reláciu karty; vstupná URL bez query a fragmentu,
  referrer len origin, parametre len whitelist. Bez súhlasu ide spolu s dopytom
  iba `landing_token`, označenie formulára. Zablokované úložisko dopyt nepokazí.
- Fonty sú lokálne WOFF2 s licenciami OFL; žiadna požiadavka Google Fonts pred
  súhlasom. Fotky/video ostávajú na vlastnom hostingu. Externé služby sú odkazy.
- Pôvodné nepravdivé tvrdenie „stránka nič neukladá/neodosiela“ bolo odstránené.

## Prevádzkové povinnosti pred spustením offline merania

Táto zmena upravuje web. Nepotvrdzuje nastavenie GTM, zmluvy s dodávateľmi ani
vykonávanie výmazov v CRM. Kampaň zostáva na používateľovi; API vetvy sa nemenili.

1. **Vyriešené v kóde 11. 9. 2026, nenasadené.** Dôkaz súhlasu už nezostáva
   v prehliadači: web posiela s dopytom `consent_version` a `consent_at`,
   `lead_attribution` ich ukladá a databáza odmietne polovičný dôkaz. Vývoz
   konverzie bez zaznamenaného súhlasu je zavretý na jednom mieste
   (`conversion_consent_gate_sql`), ktoré používajú oba nahrávacie workery aj
   CSV export — pri CSV najmä preto, že odchádza ako súbor a nedá sa stiahnuť
   späť. Staré záznamy bez dôkazu tým prestali byť vývozné automaticky, nie
   rozhodnutím obsluhy.

   **Zostáva prevádzkové:** riadky z WhatsAppu dôkaz nemajú a mať nebudú,
   lebo v tej ceste nie je prehliadač ani banner. Nie sú stratené a nič ich
   neoznačuje natrvalo — každý beh ich spočíta ako `blocked_no_consent` — ale
   kým prevádzkovateľ neurčí právny základ pre *meranie* konverzácie z reklamy
   s prechodom do WhatsAppu, neodídu nikam. Pri kampani, ktorá má ísť ako prvá
   práve cez WhatsApp, je to rozhodnutie, nie detail.
2. Do procesu odvolania/výmazu zahrnúť `lead_attribution`, `conversion_events`,
   zachytenú správu, zákazku, e-mail a zodpovedajúce kópie. Pri odvolaní zastaviť
   aj čakajúci export. Web odkazuje pri už odoslanom dopyte na info@filthyfilter.sk;
   odvolanie v prehliadači sa nesmie vydávať za automatické vymazanie CRM.
3. Prevádzkovateľ zabezpečí retenčný postup podľa uvedených účelov (uzatváranie
   dopytov, záruka/reklamácia, zákonné doklady, právne nároky), zodpovednú osobu za
   žiadosti a zmluvy so sprostredkovateľmi. Stránka nesľubuje neexistujúci cron na výmaz.
4. Pred nasadením nových tagov overiť ich účel, cookies, lehoty a nastavenie
   personalizácie. Samostatná všeobecná analytika alebo Meta potrebuje primerane
   upraviť účely a možnosti súhlasu. Nepridávať značky obchádzajúce túto vrstvu.

## Overenie

`tests/browser.test.cjs` používa Playwright a lokálny HTTP server. Všetky externé
požiadavky sú zachytené; žiadny test neposiela skutočný lead ani meraciu udalosť.
Pokrýva povolenie/odmietnutie/odvolanie/exspiráciu, first touch, chybné URL,
odoslanie bez súhlasu, cenový feed a mobilné/desktopové zobrazenie v SK/EN.

Spustenie: `node --test tests/browser.test.cjs` s dostupným `playwright`.
Voliteľný `FF_BROWSER_EXECUTABLE` určí lokálny Chrome/Edge; `NODE_PATH` môže
ukazovať na bundlované node_modules. Bez build procesu aplikácie.

## Podklady

Overené 7. 9. 2026:
- [FinStat ADAMSON](https://finstat.sk/45378843)
- [Aktuálny výpis ORSR](https://www.orsr.sk/vypis.asp?ID=171337&SID=2&P=0)
- [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj): čl. 6, 7, 12, 13 a 15–22.
- [EDPB — zákonnosť spracúvania](https://www.edpb.europa.eu/sme/be-compliant/process-personal-data-lawfully_en)
- [EDPB — informácie a práva](https://www.edpb.europa.eu/sme/be-compliant/respect-individuals-rights_en)
- [ÚOOÚ SR — práva dotknutých osôb](https://www.dataprotection.gov.sk/sk/dotknute-osoby/prava-dotknutych-osob-slovensko/)
- [Google basic Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Google — partnerské weby](https://policies.google.com/technologies/partner-sites?hl=sk)
- [Google — cookies](https://policies.google.com/technologies/cookies?hl=sk)
- [Google — prenosy](https://policies.google.com/privacy/frameworks?hl=sk)

Starší dokument tej istej firmy na klimuj.sk bol použitý len na porovnanie rozsahu.
Jeho chybný oddiel registra Sa, starý súd a tvrdenie o neprenášaní do tretích krajín
sa nepreberali. Kontaktná doména na novom webe zostáva filthyfilter.sk.
