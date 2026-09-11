# FilthyFilter — stav projektu

**Aktualizované 11. 9. 2026.** Toto je jediné miesto, kde sa pozerá na to, čo je hotové
a čo otvorené. Rozhodnutia a ich dôvody zostávajú v `REDESIGN_PLAN.md` a
`MARKETING_PLAN.md`; postup nasadenia v `DEPLOYMENT.md`. Ak sa niektorý z nich rozchádza
s týmto súborom, platí tento a treba ho tam opraviť.

Vznikol preto, že „čo zostáva“ bolo rozpísané v troch dokumentoch naraz a žiadny z nich
nebol úplný.

## Kde to stojí

| Vrstva | Stav |
| --- | --- |
| Web, obsah a ceny | hotové, na stagingu |
| Meranie a súhlas | hotové, na stagingu, kontajner `GTM-57M8XLQJ` |
| Cesta leadu do systému | hotová a overená end-to-end |
| Okruh tržieb späť do Google Ads | kód, API aj portál existujú; worker a 90-dňová expirácia sú na dev, Ads aktivácia čaká na vlastnú s. r. o. a je produkčnou bránou |
| Reklamné stránky | dve, na stagingu |
| Google Ads | Manager, servisný prístup, Draft podúčet a prvá offline akcia sú pripravené; aktivácia podúčtu, ďalšie štyri akcie, kampaň a billing čakajú na vlastnú s. r. o. Checklist: `GOOGLE_ADS_PRODUCTION_GATE.md`. |
| Meta (Facebook a Instagram) | meranie zo servera hotové, na dev aj na `main` (Conversions API), ale **čaká na dataset a token z Events Managera** (bod 10 nižšie); pixel a reklamný materiál **nezačaté**, zadanie v `MARKETING_PLAN.md` kap. 11 |
| Produkčný web | **od 8. 9. večer** zhodný s dev vrátane WhatsApp tlačidla v mobilnej lište |
| Ikony | hotové na stagingu aj na produkcii; stará baktéria je preč |
| Technický review celého funnelu | `SYSTEM_REVIEW.md` **prepísaný 10. 9. podľa skutočnosti**: čo je hotové, je označené a odkazuje sem. Web verzia z 10. 9. je **od 11. 9. nasadená na dev** (`dev.filthyfilter.sk/system-review/`). |
| Stratégia landing pages a zámerov | rozhodovací návrh v `LANDING_PAGE_STRATEGY.md` (10. 9.); **nič z neho nie je implementované**, čaká na sedem rozhodnutí v jeho kap. 14 |
| Sledovanie životného cyklu zákazky | plán v `LIFECYCLE_IMPLEMENTATION.md`; **fázy 1 a 2 hotové a na dev**, z fázy 4 hotový krok 7 (identita zákazníka, T12); fáza 3 čaká na Billdu Premium |

**Schema.org JSON-LD, podrobný cenový odhad a premenovaná firma (11. 9., v repozitári).**
Tri zmeny na vetve `codex/filthyfilter-redesign`:

1. **Štruktúrované dáta Schema.org.** Do `index.html` pribudol skript `application/ld+json`
   s typom `HVACBusiness` (adresa, telefón, cenník ako `hasOfferCatalog`) a `FAQPage`
   (7 otázok zo sekcie FAQ). Stránky `/cistenie-klimatizacie/` a `/servis-klimatizacie/`
   dostali `Service` + `FAQPage` (6 otázok každá). Overené validátorom Google Rich Results.

2. **Podrobný cenový odhad v dopytovacom formulári.** `js/main.js` doplnený o funkcie
   `priceAmount`, `formatMoney` a `buildEstimateLines`, ktoré vypočítajú transparentný
   rozpis `počet ks × sadzba + expres`. Rozpis sa objaví v náhľade formulára pre zákazníka
   aj v tele správy posielanej do `POST /api/v1/leads` — technik teda v portáli vidí
   rovnaký odhad. Vyžadovalo pridanie číselného `amount` do tabuľky `PRICES`.

3. **Preregistrácia firmy na whispAir s.r.o.** Všetky výskyty `ADAMSON s. r. o.` nahradené
   za `whispAir s.r.o.` vo všetkých piatich HTML súboroch a v teste `tests/browser.test.cjs`.
   Stránka ochrany osobných údajov uvádza `whispAir s.r.o. (v štádiu zakladania, Česká republika)`.
   Bez IČO/DIČ, firma ešte nie je zapísaná.

**Overené:** `node --test tests/forms.test.cjs` — 4/4 prechádza;
`npm test` (Playwright + Chrome) — 13/13 prechádza.

**Nasadené:** zatiaľ len v repozitári na vetve `codex/filthyfilter-redesign`.
Na dev ide s najbližším balíkom podľa `DEPLOYMENT.md`.

**Fakturácia a jurisdikcia (11. 9., v repozitári).** Účtovná kniha vznikla, kým
bol prevádzkovateľom zapísaný slovenský platiteľ DPH. Zmenou firmy prestali byť
faktom tri veci, ktoré mal kód zabudované:

1. **Sadzba.** Dvadsaťtri percent je slovenská, dvadsaťjeden česká. Ktorá platí,
   nerozhoduje sídlo firmy, ale **miesto plnenia**. Servis zariadenia
   zabudovaného v budove je službou vzťahujúcou sa na nehnuteľnosť, takže miesto
   plnenia je tam, kde budova stojí (čl. 47 smernice 2006/112/ES, § 10 českého
   zákona o DPH). Slovenské domácnosti teda ukazujú na slovenskú DPH a na
   slovenskú registráciu bez ohľadu na to, kde firma sídli. **Toto musí potvrdiť
   účtovník, nie vývojár**, preto to zostáva nastavením a nie konštantou.
2. **Pätnásťdňová lehota na vystavenie.** Slovenský § 73 aj český § 28 ods. 5
   hovoria zhodne pätnásť dní, takže číslo zmenu prežilo — ale zhodou okolností.
   Je teraz nastavením vedľa sadzby a zoznam nevyfakturovaných zákaziek ho číta.
3. **Dodávateľ.** Nezapísaná firma nemá IČO a nemôže byť platiteľom DPH, takže
   doklad vystavený v jej mene by bol neplatný. **Vystavenie je preto zablokované**,
   kým nie je vyplnená jurisdikcia, názov, IČO a — ak sa účtuje sadzba — aj IČ DPH.
   Prehľad fakturácie povie dôvod raz, namiesto toho, aby zlyhávalo každé tlačidlo
   zvlášť.

Nič sa za účtovníka nehádže: zavedené hodnoty sú prázdne. Overené 453 testami.
Commit `2e28383` v `whispair-api`.

**Nasadené a overené na dev 11. 9.** Nastavenia hlásia dôvod
`tax_jurisdiction_undecided`, prehľad fakturácie ten dôvod povie, a pokus
vystaviť doklad na ocenenej zákazke skončí s `supplier_not_configured`. Skúšobné
dáta po sebe upratané.

**Na produkcii poistka zatiaľ nie je.** Produkčné API fakturačnú vrstvu má
a migrácie po `20260908140000` sú tam aplikované, takže **doklad sa tam dnes
vystaviť dá** — v mene firmy, ktorá ešte nevznikla, a v sadzbe, ktorú nikto
nepotvrdil. Nič sa zatiaľ nestalo: na produkcii je nula faktúr, nula úhrad, nula
ocenených zákaziek a nula konverzií po úhrade. Nasadenie som nespravil zámerne:
produkcia má tri neaplikované migrácie z inej rozrobenej práce, dve z nich
označené ako deštruktívne, a spustiť cudziu migráciu na produkcii nie je moje
rozhodnutie. Samotný kód je pritom bezpečný aj bez migrácie — chýbajúce
nastavenia padnú na prázdne hodnoty, takže poistka drží zatvorené.

## Čo je hotové

**Technický review je zosúladený so skutočnosťou a jeho generátor je konečne
v gite (10. 9.).** `SYSTEM_REVIEW.md` bol zo 7. 9. a končil vetou „nič z tohto
dokumentu ešte nie je implementované“. Za tri dni sa implementovala väčšina jeho
P0, takže tá veta prestala byť pravdivá presne v dokumente, ktorý mal slúžiť ako
zadanie. Kto by ho čítal, postavil by druhýkrát štruktúrovaný lead, peniaze na
zákazke, účtovnú knihu aj identitu zákazníka.

Kapitoly A až D, H a I sú prepísané: hotové body sú označené a odkazujú sem,
nesplnené zostali. Zmenili sa aj dve rozhodnutia, ktoré dokument popisoval inak,
než sa nakoniec spravili. Hodnotu nesie `invoice_paid` v netto po úhrade, nie
`job_completed`. A bod P1.7 s tromi mestskými stránkami je **odložený, nie
zrušený ako myšlienka**: rozhodnutie zo 6. 9. hovorí „geografické stránky až
podľa dát, nie dopredu“, čo je podmienka na načasovanie, a P1.7 chcel tri
stránky dopredu.

Zo štyroch nesplnených P0 zostáva **jedno celé**: lokalita ako dáta (P0.6).
Z P0.2 chýba polovica, a je to tá právne dôležitá: `consent_version` a
`consent_at` na `lead_attribution` nikde nie sú, hoci ich web pozná, a bez nich
sa nemá púšťať prvý ostrý export konverzií.

**Pri tom sa našla vlastná diera.** Stránka `interne/system-review/index.html` je
v gite, ale `tmp/build_system_review.py`, ktorý ju vyrába, nie: `tmp/` je
v `.gitignore` kvôli 22 MB deploy archívom. Rendrovaná stránka teda bola
verzovaná a jediná vec schopná ju obnoviť nie. Ktokoľvek by upravil zdroj, nemal
by ako stránku prekresliť, a obe by sa ticho rozišli. Skript je presunutý do
`scripts/build-system-review.py` a je verzovaný; postup je opravený
v `DEPLOYMENT.md`.

**Stránka je nasadená na dev (11. 9. večer, SSH port 22491).**
`dev.filthyfilter.sk/system-review/` ukazuje verziu z 10. 9., bajtovo zhodnú
s `interne/system-review/index.html` v gite. Nasadzuje sa samostatne, nie ako
súčasť balíka, podľa postupu v `DEPLOYMENT.md`; záznam je tam.

Súbežne vznikol `LANDING_PAGE_STRATEGY.md`, rozhodovací návrh k viacerým landing
pages podľa zámeru. Nič z neho nie je implementované a čaká na sedem rozhodnutí.

**Zákazník má identitu — T12 (8. 9., na dev).** `clients` niesla meno, telefón
a adresu a nič viac, čo stálo tri veci naraz. `invoicing_due_days` čítal segment,
ktorý v tabuľke neexistoval, takže **každý doklad — aj firemný — bol splatný
v deň vystavenia**. Konverzia po úhrade niesla len hashovaný telefón, hoci
Google aj Meta párujú podľa e-mailu lepšie. A atribúcia žila na leade, takže
druhá zákazka toho istého zákazníka o rok neskôr nevedela povedať, ktorá kampaň
ho priviedla.

Migrácia `20260908160000__client_identity` dopĺňa `email`, `phone_normalized`,
`customer_type` a `acquisition_lead_attribution_id`; `db/schema.sql` je
zosúladený. `customer_type` je `NOT NULL DEFAULT 'household'`, teda presne to,
čím každý riadok doteraz fakticky bol.

**Unikátny index na `phone_normalized` je čiastočný a migrácia zámerne nehádala.**
Riadok, ktorého telefón sa nedá normalizovať, aj každý riadok zo skupiny, ktorá
padne na to isté číslo, zostáva `NULL`. Zlúčenie dvoch zákazníkov je obchodné
rozhodnutie so zákazkami, faktúrami a atribúciou na oboch stranách, nie niečo, čo
si smie vziať migrácia. Na `api-dev` to hneď aj nastalo: obe existujúce klientske
karty majú rovnaké číslo `+421902279094`, obe teda zostali bez normalizovaného
telefónu a treba ich vyriešiť ručne. Nájdu sa dopytom, ktorý je zapísaný priamo
v migrácii.

Normalizácia je jedna funkcia, `client_normalize_phone()` v
`endpoints/_client_identity_helpers.php`, a `conversion_normalize_phone()` na ňu
odteraz len ukazuje. Uložený kľúč a hash odoslaný do Google tak nemôžu opísať
rozdielneho účastníka. `0900 111 222`, `+421 900 111 222`, `00421900111222`,
`(0900) 111-222` aj `421900111222` končia na `+421900111222`; nezmysel končí na
`NULL`, nie na vymyslenom čísle, lebo za tým stojí unikátny index.

Prvá atribúcia sa kopíruje na zákazníka v `conversion_link_attribution()`, teda
na jednom mieste, cez ktoré idú obe cesty konverzie — `CapturedMessagesService::convert`
aj `JobDraftsService::publish`. Zapisuje sa len dovtedy, kým je stĺpec prázdny,
takže neskoršia kampaň prvú nikdy neprepíše.

**Overené 8. 9. na `api-dev` na zahodenom zákazníkovi, ktorý bol potom zmazaný.**
Firemná zákazka vyšla splatná 22. 9. pri vystavení 8. 9., tá istá zákazka po
prepnutí na domácnosť 8. 9. Udalosť `invoice_paid` niesla oba hashe aj netto
hodnotu 100 €. Druhý zákazník na tom istom čísle skončil na porušení unikátneho
indexu. Po úklide zostalo v databáze presne to, čo pred behom.

`php vendor/bin/phpunit`: 401 testov prechádza. Osem zlyhaní je rovnakých pred
zásahom aj po ňom a všetky hovoria `not_configured`, teda chýbajúce kľúče
OpenAI v testovacom prostredí, nie regresia.

Zmena je zatiaľ **len na dev**. Na produkciu ide s najbližším balíkom podľa
`ENVIRONMENTS.md`.

**Starý klik už nezostane ticho vo fronte — T13 (9. 9., na dev).** Google prijíma
offline konverziu iba v deväťdesiatdňovom okne od kliku. Worker doteraz skúšal
príliš starú udalosť znova až po limit pokusov a potom ju nechal bez upozornenia
sedieť ako `Logged`. Pri hodnote zapisovanej až po úhrade tak mohla dlhá splatnosť
potichu zahodiť tržbu z merania.

Worker teraz pred pokusom o upload porovná čas kliku z `lead_attribution.created_at`
s časom samotného pokusu, v UTC. Rozhoduje totiž okamih odoslania, nie okamih
vzniku udalosti: Google odmietne konverziu nahranú viac než deväťdesiat dní po
kliku, takže faktúra uhradená v deň osemdesiatdeväť je stratená, ak sa odošle
v deň deväťdesiatpäť. Presná hranica 90 dní je ešte platná; staršia udalosť
končí v terminálnom stave `Expired`, `upload_error` povie, o koľko okno prekročila,
a počítadlo `expired` je v metrikách aj v čitateľnom súhrne `cron_run_logs`.
Chýbajúca atribúcia sa zámerne neodhaduje: identifikátor môže byť stále platný,
preto udalosť zostane `Logged` a platí pre ňu existujúci limit pokusov. Sweep beží
aj bez Google credentials, lebo poriadok vo fronte nie je sieťová operácia.

Tým sa denný rozvrh stáva nosnou časťou riešenia, nie pohodlím. Vypnutý cron už
tržbu neodkladá, ale ju likviduje. **Webcron pre tento worker na `api-dev` je
založený a opravený na `15 1 * * *`**, teda jeden denný beh; pôvodné `* 1 * * *`
by znamenalo šesťdesiat behov počas jednej hodiny. Za 9. 9. má worker v
`cron_run_logs` iba behy s triggerom `cli`, teda ručné overovanie. Prvý plánovaný
beh treba skontrolovať 10. 9.: má to byť jediný riadok s triggerom `http`.

Migrácia `20260909042547__conversion_click_window_expiry` rozširuje constraint
`upload_status` o `Expired` a dáva mu stabilné meno. `conversion_events` zostáva
podľa pôvodnej konvencie iba v migráciách, nie v `db/schema.sql`.

**Overené 9. 9. na dev databáze dvoma behmi workera.** Zahodený klik starý 120 dní
skončil po prvom behu ako `Expired` s chybou „o 30 dní“ a súhrn obsahoval
`expired=1`. Druhý beh hlásil `expired=0`, teda riadok už nevybral. Obe syntetické
testovacie položky boli potom zmazané a kontrola ukázala `remaining=0`.

**Oprava časomiery je na dev od 9. 9. popoludní (commit `01e1723`).** Prvá verzia
merala okno k času úhrady, čo je iná otázka, než akú kladie Google. Overené presne
na tom rozdiele: klik starý 95 dní a konverzia spred 10 dní, teda 85 dní po kliku.
Pôvodná logika by ju označila za zdravú, nová ju označila za `Expired` s chybou
„o 5 dní“ a `expired=1` v súhrne. Syntetické riadky sú zmazané, `remaining=0`,
zostal jediný pôvodný riadok v stave `Logged`. Záloha pred nasadením je
`/home/jg046600/tmp/api-dev-before-t13-uploadwindow-20260909.tar.gz`, kontrolné
súčty troch nasadených súborov sa zhodujú s repozitárom.

`php vendor/bin/phpunit`: 401 testov, 1172 assertions, všetko prešlo. PHPStan
nenašiel chybu a PHP CS Fixer nad zdrojmi po vylúčení lokálneho chráneného
`.secrets` adresára nenašiel rozdiel.

**Stará emisia konverzií je preč — T14 (10. 9., v repozitári).** Päť endpointov
v `whispair-api` obsahovalo tú istú biznis logiku ako služby v `src/Services`
a emitovalo konverzie druhýkrát. Každý zásah do atribúcie sa preto musel robiť
dvakrát a rozdiel medzi oboma kópiami nikto nevidel, kým sa neprejavil v dátach.
Zmazané sú `update_captured_message.php`, `convert_captured_message_to_job.php`,
`update_job.php`, `create_service_contract.php` a `submit_lead.php`.

**Piaty pribudol zámerne.** `submit_lead.php` bol pri štruktúrovaných leadoch
vedome nechaný bez nových polí a označený na zmazanie práve preto, že ten istý
insert by sa udržiaval dvakrát; platí naň teda rovnaký dôvod ako na ostatné štyri.

**Postup z `ARCHITECTURE.md` bol dodržaný, vrátane kroku o access logu.** Ani
jeden z piatich sa nevolá z portálu, z terénnej aplikácie ani z webu; portál aj
appka idú na `/api/v1`. Access log na serveri za 23. 8. až 10. 9. neukazuje ani
jeden zásah na ktorýkoľvek z nich. Jediný legacy endpoint, ktorý ešte dostáva
prevádzku, je `woocommerce_order_webhook.php`.

**Pri overovaní sa našla mŕtva stránka v portáli.** `portal/lead.php` je nasadená
na `portal.whispair.sk` aj na dev a načíta sa, ale formulár posiela na
`../php-api/endpoints/submit_lead.php`. Taká cesta po prechode na WebHouse
neexistuje, lebo API dostalo vlastnú doménu; overené volaním, vracia 404. Stránka
teda nebola volajúcim, bola už dávno rozbitá a za celé obdobie logu ju nikto
nenačítal. Web `filthyfilter.sk` posiela leady na `POST /api/v1/leads` a funguje.
Stránka je odvtedy opravená: vo vetve `fix/lead-page-v1-endpoint` repozitára
`whispAirPortal` posiela na `POST /api/v1/leads` a adresu API si berie
z `partials/bootstrap.php`, nie z ručne napísanej relatívnej cesty. Posiela aj
`business_brand` a Meta identifikátory `fbclid` a `ctwa_clid`, čo stará verzia
nevedela. CORS preflight overený proti `api.whispair.sk` aj `api-dev.whispair.sk`.
Nasadené ešte nie je.

Z `index.php` odišli dva riadky smerovania, `update_job`
a `create_service_contract`; zvyšné tri boli dostupné len priamou cestou k súboru.
Zdieľané pomocné súbory `_*.php` zostávajú, závisí od nich `/api/v1`.

**Overené na `api-dev`.** Štyri autentifikované náhrady odpovedajú `401`, teda
smerovanie žije a autentifikácia platí; verejné `POST /api/v1/leads` vracia na
honeypot payload `202`. `php vendor/bin/phpunit`: 439 testov, rovnaký výsledok
pred zásahom aj po ňom. Osem zlyhaní hlási `openai_not_configured`, respektíve
`marketing_generation_not_configured`, teda chýbajúce kľúče v pracovnej kópii bez
`.env`, nie regresiu.

**Nasadené na dev aj na produkciu 10. 9.** `api-dev` aj `api` prešli smoke testom
po nasadení. Všetkých päť legacy ciest vracia `404`, prežívajúce legacy endpointy
odpovedajú ďalej (`get_jobs` 401, `whatsapp_reply` 405, `export_conversions` 401)
a náhrady v `/api/v1` odpovedajú `401`, verejné `POST /api/v1/leads` `202`. Záloha
produkcie pred zásahom je
`/home/jg046600/tmp/api-before-t14-legacy-removal-20260910.tar.gz`.

**Prvé nasadenie na dev API zhodilo, a stálo za tým niečo iné ako T14.** Zjednotenie
konfigurácie z 9. 9. pridalo do `load_local_env()` volanie `putenv()` bez kontroly.
WebHouse má `putenv()` v `disable_functions` pre PHP-FPM, takže každá webová
požiadavka skončila na `Call to undefined function putenv()`: `/api/v1/health`
vrátilo `500` s prázdnym telom a legacy `health.php` hlásilo databázu ako
`fail`. Na CLI funkcia existuje, preto to prešlo lokálnymi kontrolami aj serverovou
konfiguračnou kontrolou, ktorá beží tiež na CLI. Oprava volá `putenv()` len tam,
kde ju runtime ponúka; nič od jej úspechu nezáviselo, `$_ENV` sa plní tak či tak
a `auth_value()`, `MailCredentialCipher::key()` aj `env_value()` majú vlastný
fallback. **Na produkciu sa to nikdy nedostalo, lebo to zachytil smoke test po
nasadení.** To je celý dôvod, prečo ten krok v postupe je.

**Portál je nasadený tiež, dev aj produkcia.** Opravená `lead.php` na
`portal.whispair.sk` nesie `data-api-base="https://api.whispair.sk/"` a odoslanie
formulára prejde s `202` a správnou CORS hlavičkou. Stará cesta
`portal/php-api/endpoints/submit_lead.php` vracia `404`, ako má. Promócia išla
zdokumentovanou cestou `promote-to-live.ps1`, so zálohou v
`/home/jg046600/tmp/portal-live-bak-20260910-021559`. Promovala celý strom, nie
len túto stránku: produkcia portálu bola za `main` pozadu vo viacerých súboroch.

**Smoke test portálu bol pokazený a mlčal o tom.** Cielil na predmigračné
`https://cukivan.me/whispair-it`, hľadal portál pod `/portal/` a `health.php`
aj `/api/v1/...` na tom istom hostiteľovi. Po promócii spadol na prvej kontrole,
teda skript na potvrdenie releasu bol zaručený falošný poplach. Teraz berie
adresu portálu a adresu API oddelene a pribudla kontrola, že `lead.php` nesie
absolútnu základnú adresu a nespomína `php-api`. Overený zelený na produkcii
aj na dev.

**Smoke testy sú doplnené vo všetkých troch projektoch.** Dôvod je ten istý
tvar zlyhania, ktorý sa v tomto kole ukázal dvakrát: cesta leadu sa dá ticho
prerušiť a nikto sa to nedozvie, lebo návštevník vidí len chybu a v logu je
obyčajné zobrazenie stránky.

- **API.** Pribudla kontrola, že päť zmazaných endpointov naozaj zostáva preč.
  Nie je to formalita: `-OnlyFiles` je neodstraňujúca vrstva a záložný FTP
  nahráva súbor po súbore, takže ani jeden nič nemaže, a oživená kópia by začala
  emitovať konverziu druhýkrát potichu, nie s chybou. Druhá nová kontrola je
  verejné `POST /api/v1/leads` cez honeypot, ktorý nič neukladá. Kontrola CORS
  teraz overuje, že vrátený origin sa zhoduje s tým, ktorý prehliadač poslal;
  samotná prítomnosť hlavičky negarantuje nič, lebo produkcia má úzky zoznam.
- **Web.** `npm run smoke` a `npm run smoke:staging` sú nové. `npm test` je
  offline a o živom webe nehovorí nič. Smoke overí, že všetky tri stránky
  servírujú formulár, že nasadený `js/main.js` mieri na správne API, že CORS
  preflight z tohto originu prejde a že príjem leadu odpovedá.
- **Portál.** Prepísaný, ako je popísané vyššie.

**Pri tom sa našla latentná diera.** `js/main.js` mapuje hostiteľa
`www.filthyfilter.sk` na produkčné API, ale produkčný `CORS_ALLOWED_ORIGINS`
obsahuje iba apex `https://filthyfilter.sk`. Overené volaním: preflight z www
originu sa vráti bez hlavičky, teda zablokovaný. Dnes to nevadí, lebo www robí
301 na apex a stránka na tom origine nikdy nebeží. Drží to však presmerovanie,
nie konfigurácia. Smoke test preto kontroluje aj to presmerovanie. Čistejšie by
bolo pridať `https://www.filthyfilter.sk` do zoznamu, to je rozhodnutie na teba.

**Prihlásenie cez druhý spôsob padalo na nezmyselnej chybe (11. 9., na dev).**
Prihlásiť sa dá cez Google, a na testovacom serveri aj vývojárskym prihlásením.
Ku každému účtu je uložené, ktorým spôsobom vznikol, a systém ho podľa toho aj
hľadá. Tabuľka `app_users` má však zároveň `UNIQUE (email)`, teda jedna adresa
znamená jeden účet. Tie dve pravidlá si odporujú presne vtedy, keď sa človek,
ktorý už účet má, prihlási tým druhým spôsobom: vyhľadanie ho nenájde, vloženie
narazí na obmedzenie a volajúci dostane `500 Database error`, z ktorého sa nedá
vyčítať nič.

**Nebezpečnejší je opačný smer, nie vývojárske prihlásenie.** To je na produkcii
vypnuté. Ale keby na produkcii existoval čo i len jeden účet vzniknutý inak než
cez Google, ten človek by sa cez Google neprihlásil už nikdy. Overil som
produkčnú databázu: každý riadok je `google` a schválený, jediné iné riadky sú
seedy s doménou `example.invalid`. Dnes to teda dosiahnuteľné nie je, bola to
nastražená pasca, nie prebiehajúci incident.

**Rozhoduje jedna otázka: overil ten spôsob prihlásenia adresu?** Google ju
overuje, odmietne token, ktorého `email_verified` nie je `true`. Zhoda na adrese
je teda tá istá osoba, existujúci účet sa prevezme aj s rolou a stavom
schválenia. Vývojárske prihlásenie neoveruje nič, adresu si tam len napíšeš.
Preberanie účtov by znamenalo, že ktokoľvek s prístupom k nemu na prostredí, kde
je zapnuté, sa môže vydávať za kohokoľvek vrátane vlastníka. Dostane preto `409`
s vysvetlením. Pravidlo je čistá funkcia s piatimi testami, popísané je aj
v `whispair-api/README.md` v sekcii Authentication.

Overené na `api-dev`, nie prečítané: dev-login s adresou registrovanou cez
Google vracia `409`, s voľnou adresou založí čakajúci účet a vráti `403`,
a prevzatie som vyskúšal priamo na zahodenom riadku, ktorý si po prihlásení cez
Google ponechal rolu aj stav a nevznikol duplikát. Testovacie riadky sú zmazané.
Celý tok dev-login, `auth/me` a odhlásenie teraz v smoke teste prechádza;
predtým bola tá skupina preskočená.

**Nasadené na produkciu 11. 9.**, po nasadení na dev a na tvoje slovo. Smoke test
prešiel. Záloha pred zásahom je
`/home/jg046600/tmp/api-before-auth-identity-20260911.tar.gz`. Overené na živom
API: vývojárske prihlásenie zostáva vypnuté a vracia `403 dev_login_disabled`,
prihlásenie cez Google s neplatným tokenom vracia `401`, nasadený kód nesie nové
pravidlo a tabuľka používateľov je nezmenená, stále jediný schválený účet cez
Google. Vetva `409` je na produkcii nedosiahnuteľná zámerne, lebo vývojárske
prihlásenie je tam vypnuté; zmysel opravy na produkcii je ten druhý smer, teda
že sa už nikto nemôže ocitnúť bez možnosti prihlásiť sa cez Google.

**Synchronizácia e-mailov bola celý deň mŕtva a log to nepovedal (9. 9., na dev).**
Worker padal pri každom behu, teda každých päť minút, na chybe `inconsistent types
deduced for parameter $2`. Ten istý pomenovaný parameter je v príkaze dvakrát a
oprava z 8. 9. pridala pretypovanie iba na test na `NULL`. PHP 8.4 opakovaný
parameter nerozdelí na dva, necháva jeden placeholder, takže mu Postgres odvodil raz
`text` a raz `varchar` stĺpca a príkaz sa nepripravil vôbec. Rovnaký tvar mali štyri
miesta. Každé z nich teraz nesie pretypovanie na všetkých výskytoch, čo platí aj
keby ovládač parameter rozdeľoval.

Dôkaz je v plánovaných behoch okolo nasadenia: 15:50 až 16:05 UTC `failed`,
16:10 a ďalej `success`. Vetva `fix/pdo-repeated-parameter-casts`, commit `dd29422`.

**Zlyhanie cronu už hovorí prečo, nielen koľko (9. 9., na dev).** Toto je dôvod,
prečo si mŕtvej synchronizácie nikto deň nevšimol. `cron_run_logs` si z výsledku
workera berie len kľúče zo zoznamu povolených metrík, takže dôvod, ktorý worker
vracal pod vlastným kľúčom, sa cestou zahodil a v tabuľke ostalo `failed=1`
s prázdnym `error_message`. Dôvod teraz cestuje vlastným kanálom: `error` pre celý
beh a `errors` pre jednotlivé položky. Rovnaké dôvody sa zlučujú, takže dvadsať
schránok padnutých na jednej chybe je jedna veta, a nad päť rôznych sa zvyšok
spočíta.

Doplnené je to vo všetkých workeroch, ktoré vedia zlyhať po jednej položke: e-maily,
WhatsApp správy aj médiá, Meta katalóg, WooCommerce katalóg, denný súhrn podnetov,
zajtrajšie pripomienky, marketingové drafty, extrakcia cenníkov, technické aj webové
obohatenie a Google Ads konverzie. Dve miesta dôvod zahadzovali úplne: WooCommerce
nahradil výnimku z prenosu neutrálnou vetou a nikam si ju neuložil, push odosielanie
zabudlo `last_error` hneď po zápise na riadok udalosti. Pravidlo je zapísané
v `whispair-api/ARCHITECTURE.md`, vrátane toho, že neznámy kľúč vo výsledku sa ticho
zahodí.

Overené na dev cez skutočnú logovaciu cestu a zahodené meno úlohy: dva rôzne dôvody
skončili v `error_message`, duplicitný sa zlúčil, testovací riadok bol zmazaný.
Trinásť nasadených súborov má kontrolné súčty zhodné s repozitárom, záloha je
`/home/jg046600/tmp/api-dev-before-cron-logging-20260909.tar.gz`. Plánované behy
o 16:25 UTC už bežali na novom kóde a prešli. Commity `30ea7b2` a `c3bc5ce` na
`fix/pdo-repeated-parameter-casts`, `6e6255e` na `feature/service-package-vat`.

**Všetko z 8. 9. je na ostrej doméne (8. 9. večer).** `filthyfilter.sk` beží na
commite `683bb20`, teda vrátane WhatsApp tlačidla v mobilnej lište, opravy
zablúdeného `data-inquiry` a riadku so značkou v každej WhatsApp správe. Staging
aj produkcia sú na tej istej zostave.

Overené na živej doméne: päť stránok, `robots.txt` aj `sitemap.xml` odpovedá 200,
`noindex` sa nevyskytuje ani raz, `robots.txt` má `Allow: /` a `www` presmeruje
301 na holú doménu. Šesť súborov sedí s repozitárom bajt po bajte. Záloha pred
zásahom je `/home/jg046600/tmp/ff-prod-before-whatsapp-20260908.tar.gz`.

Produkčný root bol pred vydaním prezretý a obsahoval presne očakávanú zostavu,
teda nič po incidente s `noindex` z toho istého dňa. Podrobnosti v
`DEPLOYMENT.md`.

**Značku pomenúva už každé WhatsApp tlačidlo (8. 9., na dev).** Tlačidlá
s konkrétnou službou skladali správu cez `buildTemplate`, ktorý riadok so
značkou neobsahoval. Dopyt cez „Hĺbkové čistenie nástennej jednotky“ teda
dorazil bez `filthyfilter.sk` v texte a `whatsapp_business_brand` si z neho
značku prečítať nevedel. Pri reklame to nevadilo, tam značku určí cieľová
adresa; mimo reklamy, teda pri návštevníkovi, ktorý si stránku našiel sám,
áno. Šablóna má po novom rovnaký prvý riadok ako `buildMessage`, takže
všetkých sedem tlačidiel so službou posiela značku ďalej.

Rovnaký riadok dostali aj ich statické `href`, ktoré doteraz obsahovali holé
číslo. Bez JS otvárali prázdnu správu.

Oba testy sú rozšírené na všetky WhatsApp tlačidlá, nielen na lištu. Statický
neprijme tlačidlo, ktoré padá na holé číslo, prehliadačový kontroluje prvý
riadok každej správy v oboch jazykoch. Overené odobratím riadku zo šablóny:
test spadol a vymenoval všetkých sedem tlačidiel.

**Tlačidlo „Opísať problém“ viedlo na WhatsApp namiesto formulára (8. 9., na dev).**
Na stránke servisu bolo napísané ako odkaz na `#contact`, ale `js/main.js` mu
`href` po načítaní prepísal na WhatsApp. Malo totiž navyše `data-inquiry` a
funkcia `updateInquiryLinks` prepisovala všetko s tým atribútom. Bolo to jediné
z jedenástich tlačidiel na `#contact`, ktoré ten atribút malo, takže išlo
o pozostatok, nie o zámer. Na stránke sa to nedalo vidieť: tlačidlo vyzeralo
rovnako ako ostatné a odviedlo návštevníka preč z formulára.

Opravené na oboch stranách. Zbytočný atribút je preč a funkcia po novom prepisuje
len odkaz, ktorý sám pomenuje svoj kanál cez `data-contact`. Samotné
`data-inquiry` už na prepis nestačí, takže tá istá chyba sa nemôže vrátiť
nepozorovane.

Pribudli dva testy, sada má teraz 13. Statický kontroluje, že lišta na všetkých
troch stránkach drží tri kanály a že WhatsApp odkaz nesie riadok so stránkou aj
v statickom `href`. Prehliadačový kontroluje opačné pravidlo: žiadny odkaz bez
`data-contact` sa nesmie stať WhatsApp odkazom a text v lište musí sedieť
v oboch jazykoch. Oba overené tým, že sa chyba dočasne vrátila do kódu: spadli
a pomenovali stránku.

**WhatsApp v plávajúcej lište na mobile (8. 9., na dev).** Lišta mala dve
tlačidlá, „Zavolať“ a „Nacenenie“, takže kanál, do ktorého plánovaná Meta kampaň
prechádza, nemal na telefóne trvalé tlačidlo. Teraz má tri, na všetkých troch
stránkach. Tým padá prvý blokujúci bod kampane.

Odkaz nesie predvyplnený text s prvým riadkom, ktorý pomenúva stránku: „Dopyt
z filthyfilter.sk“, v angličtine „Enquiry from filthyfilter.sk“. Číslo je
spoločné s whispAir a API si značku číta z textu správy
(`whatsapp_business_brand` v `_whatsapp_helpers.php`), takže bez toho riadku by
sa dopyt na čistenie nedal odlíšiť od predaja jednotky. Text sa prepisuje pri
prepnutí jazyka a ten istý riadok je aj v statickom `href`, aby fungoval bez JS.

Rovnaký riadok dostali aj ostatné WhatsApp tlačidlá bez služby, teda tie
v kontaktnom paneli a pri výzve na vzorku. Doteraz otvárali prázdnu správu, na
ktorej sa značka nedala prečítať.

Meranie sa nemenilo: tlačidlo má `data-contact="whatsapp"` a existujúci
poslucháč posiela `whatsapp_click` s `placement: "generic"`.

Tri tlačidlá museli prestať zalamovať. Anglické „Get a quote“ z lišty urobilo dva
riadky pri každej šírke a lišta začala zakrývať obsah, preto je v lište skrátené
na „Quote“ (slovenské „Nacenenie“ zostáva) a písmo v nej je menšie a tesnejšie.
Najužšia šírka, pri ktorej sa lišta ešte zmestí, je 251 px v slovenčine; na
360 px teda zvyšuje viac ako 100 px. Spodné odsadenie `body` a výška tlačidla
zvuku sú dorovnané na skutočnú výšku lišty, ktorá bola predtým o dva pixely
vyššia než rezerva pod ňou.

Overené: celá sada testov prešla, lišta odmeraná a odfotená na 320, 360, 390
a 414 px v oboch jazykoch, bez zalomenia a bez orezania textu.

**Produkcia bola pol dňa na `noindex` (8. 9., opravené).** Pri nasadení písma sa do
produkčného koreňa rozbalil **staging** balík. Staging sa od produkcie líši práve
v troch veciach a všetky tri sú tam schválne: `robots.txt` so `Disallow: /`,
`noindex, nofollow` v každej stránke a vynechaný `sitemap.xml`. Na ostrej doméne
to znamenalo, že web sám seba vyradil z indexu.

Opravené v ten istý deň: nahraný pravý `robots.txt` a `sitemap.xml`, meta riadok
zmazaný z piatich stránok, záloha pred zásahom je
`/home/jg046600/tmp/ff-prod-before-noindex-fix-20260908.tar.gz`. Overené na živej
doméne: päť stránok odpovedá 200, `noindex` sa nevyskytuje ani raz, `robots.txt`
má `Allow: /` a odkaz na sitemap.

Aby sa to nemohlo zopakovať, produkčný balík **nie je** `build_staging.py` s
prepínačom. Je to samostatný `tmp/build_production.py`, ktorý transformáciu vôbec
neobsahuje a na konci padne, ak v balíku nájde `noindex`. Dva súbory, nie jeden
s vetvou.

**Súvisiace:** ostrá doména tým pádom **už nebeží na starej verzii**. Rozhodnutie
zo 7. 9., že produkcia ide neskôr, je prekonané — od 8. 9. je na
`filthyfilter.sk` tá istá zostava ako na dev, teda s formulárom, atribúciou,
súhlasom, cenami aj novými ikonami. Nebolo to samostatne odsúhlasené, stalo sa to
pri nasadení písma.

**Písmo podľa šírky obrazovky a jednotné FAQ (8. 9., na dev aj na produkcii).**
Oswald je kondenzovaný. Na monitore to číta ako značka, na telefóne sa úzke
vnútorné plochy zatvárajú a verzálkové nadpisy prestanú byť čitateľné. Do 1024 px
sa preto `--f-display` prepína na Inter a menšie popisky dostanú väčší stupeň
a prestrkanie; nad 1024 px zostáva pôvodný Oswald a pôvodné veľkosti.

Prepis je na `:root`, nie po pravidlách, takže spis La Donuteria aj obe reklamné
stránky idú za úvodnou stránkou a nemôžu sa rozísť. Pravidlá, ktoré kombinujú
`--f-display` so 700, sú v tom bloku zrezané na 600: na serveri je Inter iba
400/500/600 a prehliadač by tučné dopočítal sám.

Obe reklamné stránky mali FAQ v jednom paneli a `<details>` bez triedy, takže sa
vykresľovali s predvoleným trojuholníkom prehliadača namiesto akordeónu. Teraz
používajú rovnaké značky ako úvodná stránka (`panel faq__item`, šesť položiek).

Overené v prehliadači výpočtom `getComputedStyle`: pri 1440 px je Oswald na
`.hero__title`, `.section__title`, `.faq__item summary` aj `.case-title`;
pri 640 px je všade Inter. Živé CSS na `filthyfilter.sk` sa bajtovo zhoduje
s repozitárom (SHA-256 `ac94c40f…e7cb`), päť stránok odpovedá 200.

**Technický review funnelu (7. 9. večer).** `SYSTEM_REVIEW.md` porovnáva
`whispair-api` a web s modelom klik → lead → ponuka → termín → zákazka →
faktúra → recenzia → ďalšia objednávka: čo existuje (s tabuľkami a súbormi),
čo je čiastočné, čo chýba, návrh domény, Google Ads pre vývojára, priority
P0 až P3 a inkrementálny plán. Hlavný nález: konverzný okruh existuje, ale
zákazka nemá cenu a faktúra v API neexistuje, takže do Google ide udalosť bez
hodnoty. Web verzia je nasadená neverejne (noindex, bez odkazov, bez hesla)
na `https://dev.filthyfilter.sk/system-review/`; zdroj
`interne/system-review/index.html`. Nič z návrhu nie je implementované.
Rozhodnutia pre používateľa sú na konci dokumentu (Billdu, hodnota konverzie,
číslo WhatsApp Business, prvé mesto).

**Súkromie, ceny a optimalizácia (7. 9., nasadené na dev).**
SK/EN informácie podľa čl. 13 GDPR (vtedy s ADAMSON s. r. o., od 11. 9. whispAir s.r.o.,
pozri „Prevádzkovateľ" nižšie); odkazy pri všetkých troch
formulároch a v piatich pätičkách. Basic Consent Mode blokuje Google pred súhlasom,
atribúcia sa ukladá len so súhlasom, voľba má verziu/čas a platnosť 180 dní, súhlas
sa dá odvolať. Google Fonts sú nahradené lokálnymi WOFF2. Nepravdivé tvrdenie, že
stránka nič neukladá/neodosiela, je opravené. Pravidlá a otvorené povinnosti CRM
pred offline exportom sú v `PRIVACY_IMPLEMENTATION.md`. Sedem prehliadačových testov
prešlo; reálne dopyty sa pri nich neposielali. Cenový feed aj WebP poster sú hotové.
Nasadené na dev cez port 22597: HTTPS 200 a zhodné SHA-256 pre 19 súborov vrátane
piatich noindex stránok. Produkčný index má nezmenený SHA-256. Detaily: `DEPLOYMENT.md`.

**Prednostný termín (7. 9., na dev).** Dopytový formulár má na všetkých troch
stránkach zaškrtávacie pole „Prednostný termín do 24 hodín (+49 € s DPH)“. Sľub
je vyčistenie do 24 hodín od objednávky, príplatok sa pripočíta k cene služby.
Suma je v tabuľke `PRICES` v `js/main.js` pod značkou `{{p-expres}}`, kód balíka
`FF-EXPRES-24H`; balík na dev vznikol 7. 9. večer, dovtedy držala sumu záloha z kódu.
Keď je pole zaškrtnuté, pribudne riadok v texte dopytu, teda aj v tele správy,
ktoré ide do API. Vzor je `vycistimklimu.sk`, ale ich pruh nad kartami ani ich
príplatok 60 € sme nepreberali; používateľ zvolil umiestnenie vo formulári.
Poznámka pre firmy na úvodnej stránke tvrdila opak a bola prepísaná, rovnako
rozhodnutie v `REDESIGN_PLAN.md`.

**Otvorené k tomu:** sľub do 24 hodín je prevádzkový záväzok, nie text. Musí byť
jasné, kto ho vie dodržať a v ktoré dni; inak je to najdrahšie možné sklamanie.
Balík `FF-EXPRES-24H` už na dev existuje a je zverejnený (7. 9. večer), takže
príplatok má svoj kód. Na produkcii nie je.

**Pravidlá realizácií (7. 9.).** `HALL_OF_FILTH_CASE_GUIDE.md` doplnený podľa
Donuterie: rozloženie, poradie obsahu, obálka s 50 % priehľadnosťou bez zoomu,
prepojenia bez duplicity, SK/EN a publikačný checklist. Je to spoločná šablóna
jednotlivých spisov; `POSTER_PILOT.md` eviduje pôvod konkrétnej ilustrácie.

**Pilot posteru (7. 9., na stagingu).** Na pokyn používateľa pripravená prvá
verzia s minimom duplicity: jedna ilustračná obálka v úvode spisu La Donuteria
nahrádza veľkú pečať FFFF. Obálka má na následný pokyn používateľa 50 % priehľadnosť (opacity .5),
bez odkazu, zoomu a jeho označenia; popis zostáva plne čitateľný.
Úvod má odkazy na autentické pred/po a na formulár čistenia. Homepage ponecháva
skutočné pred/po a kratšiu upútavku; landing pages poster neopakujú.
Nové mestské stránky ani archívna stránka nevznikli.

Overené: lokálny detail odpovedá HTTP 200, všetky lokálne odkazy a kotvy na štyroch
verejných stránkach, jedinečnosť ID, páry SK/EN a `git diff --check`.
Vizuálne zobrazenie v prehliadači zatiaľ nebolo overené. Po dodaní nového SSH portu
22418 bol návrh ee3433d nasadený na staging a otvorený v aplikácii na posúdenie.
HTTPS kontrola: štyri stránky odpovedajú 200 a majú noindex, nofollow; CSS a poster
sa bajtovo zhodujú s návrhom, robots.txt zakazuje indexovanie. Produkcia nezmenená.
Poster má responzívne WebP exporty 370/740/1110 px (28 114 / 104 964 / 212 176 B).
HTML používa srcset, pôvodné PNG 2 552 512 B zostáva zdrojom. Opacity .5 sa nemení.
Zdroj a zadanie: `docs/POSTER_PILOT.md`.

**Konverzie odchádzajú aj do Meta (8. 9., na dev).** Krok 8 plánu životného
cyklu, položka T5. Identifikátory z Meta sa zbierali od fázy 1, ale neodchádzali
nikam: `fbclid` z webu aj `ctwa_clid` z reklamy s prechodom do WhatsAppu ležali
v `conversion_events` a nikto ich nečítal. `cron/meta_conversions_worker.php` je
zrkadlom existujúceho Google workera — tá istá fronta, tie isté stavy
`upload_status`, tie isté ohraničené opakovania, len iný cieľ. Berie výhradne
riadky s `platform='meta'`, takže oba workery môžu bežať v ľubovoľnom poradí
a Google riadkov sa nedotkne.

Dve cesty sa **neposielajú rovnako**. Klik z webu ide ako `action_source`
`website` a `fbclid` cestuje ako hodnota cookie `fbc`, lebo Meta pole pre holý
`fbclid` nemá. Klik do WhatsAppu ide ako `business_messaging` s
`messaging_channel: whatsapp` a `ctwa_clid` v `user_data`. Bez oboch tých polí
Meta udalosť prevezme a nepriradí ju k ničomu.

**Telefón sa hašuje nanovo.** Uložený `hashed_phone` je SHA-256 z čísla v tvare
E.164 aj s plusom, čo je pravidlo Google. Meta hašuje samotné číslice, takže ten
istý telefón má u oboch iný haš. Poslať uložený by neznamenalo chybu, len tichú
nulovú zhodu, preto worker číta surové číslo zákazníka a hašuje ho podľa pravidla
Meta. E-mail tento problém nemá, tam sa obe pravidlá zhodujú a uložený haš stačí.

Popri tom sa opravila diera, ktorá by frontu držala navždy prázdnu: oba dopyty
na atribúciu vyberali len tri Google stĺpce, takže každá konverzia sa zapísala
ako `platform='google'` aj vtedy, keď lead prišiel z Meta.

Prístupy sú **samostatné** (`META_CAPI_DATASET_ID`, `META_CAPI_ACCESS_TOKEN`).
Katalógový `META_CATALOG_*` sa použiť nedá: katalóg a dataset sú iné objekty
a token na správu katalógu udalosti zapísať nevie. Bez nich worker ticho nič
nerobí. Meta odmieta udalosť staršiu než sedem dní, preto musí bežať aspoň denne;
riadok, ktorý sa pretiahol, sa z fronty vyradí sám, inak by zhodil celú dávku.

Overené na dev syntetickým riadkom, ktorý po sebe upratal. `--dry-run` postavil
očakávané telo požiadavky pre klik do WhatsAppu vrátane hodnoty 249,50 EUR;
nenastavené prístupy skončili ako `not_configured`; beh proti neexistujúcemu
datasetu zapísal vlastnú hlášku Meta do `upload_error` a zvýšil počet pokusov,
pričom riadok správne zostal `Logged`. Do živého datasetu Meta neodišlo nič.
Každý beh je v `cron_run_logs`. 400 testov API prešlo, `phpstan` aj kontrola
štýlu sú čisté.

**Doplnené 10. 9.** Worker je od 10. 9. na `main` vo `whispair-api`. Ukázalo sa
pritom, že žiadna vetva nemala všetko naraz: jedna niesla T5 a T12 bez okna
z T13, päť ďalších okno z T13 bez T5. Zlúčené sú obe, bez konfliktu, a merge
odhalil vlastnú dieru — kľúče `META_CAPI_*` chýbali v `config/env.schema.php`,
ktorý vznikol na inej vetve neskôr. Doplnené vlastným blokom vedľa katalógových,
nie medzi ne.

Oprava atribúcie sa medzitým z `api-dev` stratila, prepísalo ju nasadenie T13.
Nasadená znova 10. 9. a overená na živom kóde: atribučný riadok s `platform='meta'`
prejde cez `conversion_click_ids` aj s identifikátorom. Záloha pôvodného súboru je
`~/tmp/_conversion_helpers.before-meta-20260910.php`. Dev tým ale **nie je zhodný
s `main`**, má len tú dvojriadkovú záplatu; zosúladí to až riadne nasadenie.

Webcron na jeden denný beh je založený. Prvý plánovaný beh treba potvrdiť riadkom
v `cron_run_logs` s triggerom `http`; doteraz sú tam len behy s `cli`, teda ručné
overovanie.

**Zostáva k tomu:** dataset a systémový token z Events Managera. Až s nimi sa dá
prejsť posledný krok, teda prepnutie riadku na `Uploaded` po skutočnom prevzatí
udalosti. Zapísané ako bod 10 v „Čo čaká na používateľa“ a ako T20 v `BACKLOG.md`.

**Štruktúrovaný dopyt a Meta identifikátor (8. 9., na dev).** Fáza 1 plánu
životného cyklu. Formulár sa už roky pýtal na službu, obec, počet jednotiek,
termín a expres, ale všetko splošťoval do jedného textu a API z neho parsovalo
len kontakt. Tie isté odpovede teraz idú aj ako polia do `captured_messages.lead_details`;
zložený text zostáva nezmenený, lebo ho číta technik. Pribudol stĺpec
`business_brand`, ktorý hovorí, ktorej z našich značiek dopyt patrí. Zámerne to
nie je `parsed_brand`, to je výrobca klimatizácie; WhatsApp číslo aj schránka sú
spoločné, takže bez toho vyzerá čistenie a predaj jednotky rovnako.

Atribúcia prestala byť len Google. `fbclid` a `ctwa_clid` majú vlastné stĺpce
a `platform` sa **odvodzuje na serveri**, nikdy sa neberie z požiadavky, aby
stránka nevedela označiť Google klik za Meta. Prvý platený kanál je Meta, takže
bez `fbclid` by sa lead dal spočítať, ale nie priradiť k reklame.

Overené skutočným testovacím dopytom cez `dev.filthyfilter.sk`: uložený riadok
nesie značku, kód balíka, počet jednotiek, obec aj termín, a atribúcia má
`platform=meta`. Starší lead spred zmeny sa načíta s prázdnymi hodnotami, takže
zmena je spätne kompatibilná. 363 testov API a 8 prehliadačových prešlo.
Podrobnosti: `LIFECYCLE_IMPLEMENTATION.md` kapitola 6.

**Peniaze na zákazke a účtovná kniha (8. 9., na dev aj produkcii).** Fáza 2. Zákazka doteraz
nemala nikde cenu, takže `job_completed` odchádzal do Google ako fakt bez hodnoty
a na otázku „koľko eur priniesla kampaň" sa z dát odpovedať nedalo.

Pribudli ocenené riadky zákazky, súčty na zákazke, a kniha `invoices`,
`invoice_payments` a `job_costs`. **Nie je to druhý fakturačný systém.** Doklady
vystavuje Billdu; kniha eviduje, čo bolo vystavené a čo zaplatené. Kým Billdu
nemá API, kancelária prepíše číslo dokladu a označí úhradu, čo stĺpec
`issue_mode` zaznamenáva pri každom doklade zvlášť.

Konverziu s hodnotou nesie nová udalosť `invoice_paid` a odchádza až po úhrade,
v **netto** sume, s identifikátormi kliku prenesenými z leadu. `job_completed`
zostáva míľnikom bez hodnoty.

Sadzba DPH aj obe splatnosti sú v `app_settings`, teda meniteľné v portáli, ale
na doklade sa zmrazí tá, ktorá platila pri vystavení. Prepočítanie starého
dokladu by prepísalo históriu a prestal by sedieť s priznaním.

Všetky routy sú od role manažér vyššie. Faktúru potvrdzuje kancelária, nie
technik, takže právo visí na role, nie na priradení k zákazke.

Zvlášť je zoznam hotových zákaziek bez dokladu s odpočtom do pätnástich dní,
ktoré na vystavenie dáva zákon o DPH.

Overené na dev celou cestou: ocenenie dvoch riadkov, návrh, vystavenie, čiastočná
úhrada bez konverzie, doplatok s konverziou 307 € netto a prenesným `gclid`,
a ďalšia platba, ktorá druhú konverziu nevytvorila. Skúšobné dáta po sebe
upratané. 381 testov API prešlo.

Produkčné nasadenie 8. 9. doplnilo do portálu detail ocenenia a úhrad aj samostatný
prehľad **Fakturácia** s pätnásťdňovou lehotou. Portálový commit `ac3c935` bol
nasadený najprv na dev a potom na produkciu; produkčný backup je
`/home/jg046600/tmp/portal-live-bak-20260908-143532`. API bolo nasadené bežným
balíkom, všetkých desať čakajúcich migrácií bolo aplikovaných po lokálnej zálohe
produkčnej DB a fakturačná routa na produkcii vracia bez prihlásenia očakávané
`401`. Verejný health, routing, 404 obálka, auth guard a CORS pre
`portal.whispair.sk` prešli. Autentifikovaný produkčný zápis sa zámerne neskúšal;
celý tok zápisu a úhrad je overený na dev podľa odseku vyššie.

**Revízia portálových obrazoviek (8. 9., opravené, zatiaľ nenasadené).** Kontrola
nasadeného T4 našla tri chyby v zobrazení. Dátum vystavenia a splatnosti
prechádzal formátovačom časových značiek, takže doklad z 8. 9. sa v portáli
ukazoval ako „08. 09. 2026 02:00" a v pásme za UTC by ukázal predchádzajúci deň.
Odznak lehoty písal „Zostáva 1 dní", lebo mal jediný tvar množného čísla;
slovenčina ich má pri dňoch tri. Výber balíka sťahoval celý katalóg pri každom
stlačení klávesy, lebo posielal parametre, ktoré tá routa nikdy nečítala.

Opravené portálovým commitom `9f1f248`. Potvrdzovacie okno pri vystavení navyše
hovorí, že číslo dokladu sa už nedá zmeniť — API na opravu ani zrušenie dokladu
routu nemá, takže preklep sa v portáli neopraví.

**Nasadené na dev 8. 9. večer.** `portal-dev.whispair.sk` vracia stránku aj
zabalený `app.js` s fakturačným kódom, `api-dev` odpovedá na health a chránenú
fakturačnú routu bez tokenu zamieta `401`. Na produkciu to zatiaľ nešlo; tá stále
beží na `ac3c935`, teda s tromi chybami v zobrazení popísanými vyššie.

**Meta reklamy cez WhatsApp a ochrana troch formulárov (8. 9., na dev).**
Dokončenie fázy 1. Meta posiela pri reklame s prechodom do WhatsAppu vo webhooku
objekt `referral` s identifikátorom kliku, číslom reklamy a cieľovou adresou.
Doteraz sa zahadzoval, takže prvý platený kanál sa dal spočítať v správach, ale
nie priradiť ku konkrétnej reklame. Teraz sa z neho zakladá atribučný riadok.

Značka sa **číta, nehádže**. Číslo aj schránka sú spoločné pre obe značky, takže
odhad by zaradil predaj jednotky do kampane na čistenie. Dva signály v poradí
dôvery: cieľová adresa reklamy, potom text správy, lebo web si svoje WhatsApp
správy skladá s prvým riadkom, ktorý pomenúva stránku. Správa, ktorá spomína obe
značky, zostane prázdna a rozhodne človek.

Nič sa medzitým nestratilo: `whatsapp_messages.raw_payload` drží celé telo
webhooku, takže `tools/backfill_whatsapp_referrals.php` staré riadky dopočíta.
Na dev zatiaľ žiadna taká správa nie je, skript je pripravený na prvú kampaň.

Formulár existuje na troch stránkach ako tri kópie a jeden `js/main.js` ich
obsluhuje podľa `id`. Pribudol statický test `tests/forms.test.cjs`, ktorý zlyhá,
keď sa polia, ich typy alebo ponuka služieb na stránkach rozídu. Overený tým, že
sa na jednej stránke zmenil typ poľa: test spadol a pomenoval obe stránky.

Overené: 369 testov API a 11 prehliadačových a statických prešlo. Celá cesta
príchodu správy vyskúšaná na dev syntetickou správou, ktorá po sebe upratala.

**Prehliadačové testy sa dajú spustiť (7. 9. večer).** Súbor
`tests/browser.test.cjs` vyžadoval Playwright, ale nič tú závislosť nedeklarovalo,
takže tých sedem testov nevedel spustiť nikto. Pribudol súkromný `package.json`
len s vývojovou závislosťou a výnimka je zapísaná v `CLAUDE.md`: do webrootu
nejde ani `package.json`, ani `node_modules`. Spustenie:
`FF_BROWSER_EXECUTABLE="C:\Program Files\Google\Chrome\Application\chrome.exe" npm test`.
Všetkých sedem prešlo; testy odchytávajú volania na Google, takže sa nič reálne neodoslalo.

**Atribúcia na stránke o údajoch (7. 9. večer).** Stránka `/ochrana-osobnych-udajov/`
bola jediná verejná stránka bez `js/attribution.js`, takže návšteva z reklamy by na nej
stratila identifikátor kliku ešte pred formulárom. Doplnené; zber zostáva podmienený súhlasom.

**Posuvník (7. 9.).** Na dev je bočný posuvník zladený s medeným vizuálom:
tmavá dráha, medený úchyt a zlaté zvýraznenie. Spoločné CSS používajú všetky
štyri verejné stránky; overené zobrazenie v prehliadači. Produkcia bez zmeny.

**Web.** Úvodná stránka, `/cistenie-klimatizacie/`, `/servis-klimatizacie/` a spis
La Donuteria. Ceny sú zverejnené (79 / 129 / 49 s DPH, diagnostika 49 s odpočtom pri
oprave). Pôsobnosť je Bratislava, Trnava, Nitra a okolie do 20 km, s bežiacim pruhom
41 obcí. Stránky sú prepojené z úvodnej, z pätičky aj navzájom.

**Meranie.** `js/attribution.js` zachytáva `gclid`, `gbraid`, `wbraid` a celú sadu UTM,
prvý dotyk vyhráva. `js/consent.js` rieši Consent Mode v2 s predvoleným zamietnutím
a načítava kontajner. Udalosti `form_start`, `lead_submitted`, `phone_click`,
`whatsapp_click`; `lead_submitted` až po prijatí serverom.

**Cesta leadu.** Formulár posiela na `POST /api/v1/leads`, vzniká zachytená správa
a atribučný riadok, lead sa objaví v portáli a dá sa z neho spraviť zákazka. Overené
skutočným dopytom cez staging 6. 9. 2026.

**API.** Offline konverzie presunuté z blokovanej cesty Google Ads API na Data Manager
API. Atribúcia sa prenáša aj cez publikovanie rozpracovanej zákazky, čo bola ticho
rozbitá časť okruhu. Oboje je zlúčené do `main` a nasadené na `api-dev` vrátane
migrácie.

**Infraštruktúra.** Produkčné API púšťa `filthyfilter.sk` v CORS. `www` sa presmerúva
na hlavnú doménu. Staging beží na `dev.filthyfilter.sk` so zákazom indexovania.

## Ikony

Sada s lupou (favicon, apple-touch, PWA aj `maskable`, plus značka
`assets/brand-mark.png` v hlavičke a pätičke) je **kompletná na stagingu**
a overená: všetkých deväť súborov aj `site.webmanifest` sa zhoduje s repozitárom,
všetky štyri verejné stránky odkazujú na tú istú značku a staré `mark-bacteria.png`
aj `favicon.svg` sú preč.

Produkcia beží na zostave zo 6. 9. rána a má ešte baktériu. Vymeniť ju znamená
nasadiť samotný web, nie ikony, lebo produkčné HTML odkazuje na starý názov
súboru. Používateľ 7. 9. rozhodol, že ostrá doména ide neskôr.

Nepokryté zostáva `interne/`. Beží ako samostatný koreň na `interne.filthyfilter.sk`,
takže by potreboval vlastné kópie súborov. Je to neindexovaná interná príručka,
zatiaľ bez ikon zámerne.

## Meta kampaň: čo chýba (7. 9. 2026)

Používateľ zadal ako prvý platený kanál Meta s prechodom do WhatsAppu, nie Google Ads.
Podrobne v `MARKETING_PLAN.md` kapitola 11. Blokujúce je toto:

1. **Meta Pixel neexistuje.** Musí ísť do `js/consent.js`, aby prešiel súhlasom,
   nie vedľa neho.
2. **Reklamný materiál je z jednej zákazky.** Kód to nevyrobí.

Bod „WhatsApp chýba v plávajúcej lište“ padol 8. 9., viď nižšie.

Nebráni spusteniu, ale chýba: **žiadna stránka nemá `LocalBusiness` v JSON-LD**,
čo je strata najmä pre mapový výsledok a prepojenie s profilom na Google.

## Vyriešené 7. 9. 2026 večer

**Prevádzkovateľ a stránka o spracovaní údajov existujú.** `PRIVACY_URL`
v `js/consent.js` na ňu ukazuje.

**Platné od 11. 9. 2026:** prevádzkovateľom je uvedená **whispAir s.r.o.
(v štádiu zakladania, Česká republika)**, bez IČO a bez DIČ. Pôvodne to bola
ADAMSON s. r. o., Topoľčianska 19, 851 05 Bratislava, IČO 45378843,
IČ DPH SK2022960159; tie údaje už na stránke nie sú.

**Otvorené k tomu:** nezapísaná spoločnosť nie je právnickou osobou, takže
prevádzkovateľom podľa GDPR byť nemôže. Do zápisu ním je ten, kto o spracúvaní
skutočne rozhoduje, teda konkrétna osoba alebo existujúca firma. Stránka dnes
menuje subjekt, ktorý ešte nevznikol, a dotknutá osoba tak nemá komu adresovať
žiadosť. Treba to rozhodnúť skôr, než sa spustí platená kampaň.

Používateľ odložil dokončenie Google Ads do vzniku vlastnej s. r. o. Nejde o
identitu dnešného prevádzkovateľa webu, ale o budúcu právnu a fakturačnú identitu
inzerenta. Kampaň ani platobný profil sa preto teraz nedokončujú pod dočasnou
identitou. Produkčná brána je v `GOOGLE_ADS_PRODUCTION_GATE.md`; ochrana údajov
a úlohy pred offline exportom sú v `PRIVACY_IMPLEMENTATION.md`.

**Google Ads sa podarilo pripraviť po technickú hranicu bez billingu (9. 9.).**
Manager účet `791-494-5272` je hotový a servisný účet Data Managera v ňom má
Standard access. Reklamný podúčet `116-266-0696` vznikol, ale je Draft a pri
otvorení núti onboarding business → campaign → payment; ten sa zámerne
nedokončil. Preto je v Sub-account settings conversion account stále `None` a
voľba `This manager` neaktívna.

Na Manager účte existuje prvá cross-account akcia `lead_qualified`, Import from
clicks, Conversion type ID `7754841584`, bez hodnoty, count One a okno 90 dní.
Zostávajú `job_created`, `job_completed`, `package_sold` a `invoice_paid`.
Predbežné operating/login mapovanie oboch na Manager ID sa nesmie považovať za
produkčné, kým neprejde `validateOnly` a podúčet nebude používať `This manager`.

## Čo čaká na používateľa

1. **Prevádzkovateľ nie je uzavretý.** Od 11. 9. je na stránke whispAir s.r.o.
   v štádiu zakladania, bez IČO. Nezapísaná firma nemôže byť prevádzkovateľom;
   treba uviesť toho, kto ním je do zápisu. S tým súvisí aj daňová jurisdikcia,
   pozri „Fakturácia a jurisdikcia" nižšie.
2. **Ktorým mestom začať s reklamou.** Bratislava, Trnava alebo Nitra. Rozhoduje to,
   kam sa vám najlepšie jazdí a kde už máte zákazníkov.
3. **Kto dvíha telefón a do koľkých minút** odpovedá na dopyt.
4. **Prejsť zoznam 41 obcí** v bežiacom pruhu a povedať, čo vyhodiť a čo doplniť.
5. **Skúšobný e-mail na `info@filthyfilter.sk`.** Schránka existuje, doručenie nikto
   nepotvrdil.
6. **Doplniť čistenie klimatizácií do profilu whispAir** na Google.
7. **Po vzniku vlastnej s. r. o. dokončiť Draft reklamný podúčet.** Manager účet
   je už hotový. Podúčet `116-266-0696` nesmie dostať kampaň ani billing pod
   dočasnou identitou; potom ho premenovať na `FilthyFilter SK`.
8. **Dokončiť štyri konverzné akcie.** `lead_qualified` už existuje s ID
   `7754841584`; chýbajú `job_created`, `job_completed`, `package_sold` a
   `invoice_paid`.
9. **Priradiť podúčtu cross-account conversions a overiť Data Manager.** Servisný
   účet už má Standard access. Po aktivácii podúčtu nastaviť `This manager`,
   doplniť `.env` a overiť `validateOnly`. Všetky podmienky sú v
   `GOOGLE_ADS_PRODUCTION_GATE.md`.
10. **Založiť dataset a vydať token v Meta Events Manageri (T20).** Worker
    z T5 je hotový a na dev, ale bez prístupov ticho nič nerobí, takže Meta
    dnes o žiadnej konverzii nevie. Tri kroky v Events Manageri: založiť alebo
    vybrať dataset a odpísať jeho id, vydať systémový token s oprávnením
    `ads_management` naň, a pri reklame s prechodom do WhatsAppu odpísať aj id
    stránky za WhatsApp číslom. Do `.env` idú ako `META_CAPI_DATASET_ID`,
    `META_CAPI_ACCESS_TOKEN` a `META_CAPI_PAGE_ID`. **Katalógové
    `META_CATALOG_*` sa použiť nedajú**, katalóg a dataset sú iné objekty
    a token na správu katalógu udalosti zapísať nevie. Na prvý beh sa oplatí
    pridať `META_CAPI_TEST_EVENT_CODE` a sledovať to v Test Events.
    Podrobnosti v `BACKLOG.md` bod T20.

## Čo čaká na vývoj

1. **Produkčný web je nasadený, ale neprešiel posúdením.** Ostrá doména beží od 8. 9.
   na novej zostave, lebo sa tam dostala pri nasadení písma, nie po schválení.
   Treba ju prejsť tak, ako sa mal prejsť staging: formulár, súhlas, ceny, odkazy.
2. **Vetva `wip/installation-slots`** vo `whispair-api` drží nedokončenú rezerváciu
   montážnych termínov, presun domén z `cukivan.me` a úpravy WooCommerce. Nič z toho
   nebolo overené.
3. **Angličtina nemá vlastnú URL.** Prepína sa iba v prehliadači, takže Google indexuje
   výhradne slovenčinu. Ak má prinášať návštevnosť, potrebuje vlastnú cestu a `hreflang`.
4. **Meranie telefonátov.** `phone_click` nie je hovor. Kým to tak zostane, telefonický
   lead treba do systému zapísať ručne, inak z merania vypadne.
5. **Prechod na whispAir sa nepriradí späť.** Odkaz nesie vlastné UTM, takže sa dá
   spočítať, ale predaj klimatizácie sa ku kliku na FilthyFilter nespojí.
6. **`trnava-dusk.png` má 1,39 MB** ako PNG za päťpixelovým rozostrením. Ako JPEG by mal
   približne 47 kB. Čaká na rozhodnutie, je to cudzí asset.

## Známy dlh

**Ceny majú jeden zdroj pravdy.** Tabuľka `PRICES` v `js/main.js`. Prekladané texty
píšu značku `{{p-nastenna}}` a prepínač jazyka za ňu dosadí sumu. Predtým boli tie štyri
sumy vypísané 77-krát na troch stránkach v dvoch jazykoch.

Literálna suma zostáva medzi značkami ako záloha pre okamih, kým sa nenačíta skript.
Prepíše sa hneď, takže návštevník vidí vždy hodnotu z tabuľky. Pri zmene ceny teda stačí
upraviť tabuľku; zálohu je dobré zosúladiť tiež a **lokálny náhľad na to upozorní
v konzole** hláškou `[ceny]`. Tá istá kontrola nahlási aj sumu napísanú do textu mimo
značky. V produkcii nebeží.

**Ceny sa neskôr majú ťahať z portálu.** Mechanizmus na to existuje a je naň stavaný:
tabuľka `service_packages` vo `whispair-api` má `price_amount`, `currency`, `public_name`,
`package_code` a príznak `is_published`. Montážne položky whispAir ju už používajú pod
prefixom `WA-`. Tabuľka `PRICES` v `js/main.js` preto pri každej sume nesie aj `code`,
teda kód balíka, ktorý tú sumu vlastní, aby neskoršie napojenie bolo vyhľadanie a nie
prepis.

**Hotové 7. 9. 2026:**

- **Štyri balíky `FF-` sú na dev založené** s kódmi `FF-CIST-NASTENNA`,
  `FF-CIST-KAZETOVA`, `FF-UDRZBA`, `FF-DIAGNOSTIKA`, s cenami 79, 129, 49 a 49 EUR
  a s verejnými názvami aj popismi. Zapísané cez tú istú vrstvu, akú používa portál,
  nie surovým SQL.
- **DPH už nie je nejasná.** Pribudol stĺpec `price_vat_mode` so slovníkom cenového
  enginu (`vat_included`, `vat_excluded`, `reverse_charge`, `vat_exempt`), nullovateľný
  a bez predvolenej hodnoty: `null` znamená, že to nikto nepovedal, čo je pravdivý stav
  desiatich `WA-` balíkov. Štyri `FF-` balíky majú `vat_included`. Zverejniť ocenený
  balík, ktorého daňový význam nikto neurčil, už systém odmietne.

**Zostáva:**

1. **Päť balíkov je na dev zverejnených (7. 9. večer).** `FF-CIST-NASTENNA`,
   `FF-CIST-KAZETOVA`, `FF-UDRZBA`, `FF-DIAGNOSTIKA` a nový `FF-EXPRES-24H`.
   Zápis šiel cez `ServicePackagesService`, teda cez tú istú vrstvu ako portál,
   nie surovým SQL. Verejný feed na dev vracia päť položiek.
   **Obrázky sú placeholdery** z `assets/packages/` a treba ich nahradiť fotografiami;
   bez obrázka API zverejnenie odmieta, takže práve toto držalo feed prázdny.
   Zverejnenie zaradilo balíky do fronty na synchronizáciu s katalógom Meta
   (`catalog_sync_status = Pending`). Worker `meta_catalog_sync_worker` na dev nikdy
   nebežal, takže do Meta zatiaľ nič neodišlo.
2. **Na produkcii nič z toho nie je.** Balíky, stĺpec aj routa sú zatiaľ len na dev,
   na vetve `feature/service-package-vat` v `whispair-api`. Adresy obrázkov v dev
   databáze ukazujú na `dev.filthyfilter.sk`; produkčný záznam bude potrebovať
   produkčné adresy.
3. **Frontend je napojený.** `js/main.js` načíta verejný feed po okamžitom zobrazení
   záložných cien. Preberie len jednoznačný známy kód, konečnú číselnú sumu v EUR
   a `vat_included`. Chyba, prázdny zoznam, nejasná DPH alebo 4 s timeout ponechajú
   zálohu. Mení SK/EN texty, metadata aj rozpísané zhrnutie bez straty polí.
   Overené HTTP: dev 200 s piatimi balíkmi a `Cache-Control` na 1800/3600 s,
   CORS pustí `dev.filthyfilter.sk`. Spracovanie feedu držia prehliadačové testy.
4. **Vytvorenie balíka bolo rozbité a je opravené.** `ServicePackagesRepository::insert()`
   mal `price_vat_mode` v zozname hodnôt, ale nie v zozname stĺpcov, takže každé
   vytvorenie balíka cez API padlo na „INSERT has more expressions than target
   columns“. Úprava existujúceho balíka fungovala, preto to nikto nevidel. Opravené
   v `whispair-api` commitom `a1cbb1e` na vetve `feature/service-package-vat`, so
   samostatným testom, ktorý oba zoznamy porovnáva. Na dev nasadené po súboroch.

**Verejná routa je hotová:** `GET /api/v1/service-packages/published`, bez prihlásenia,
vracia len zverejnené a zároveň aktívne balíky a z nich len kód, verejný názov a popis,
obrázok, sumu, menu a daňový režim. Tvar je písaný samostatne, nie odfiltrovaním polí
z portálovej odpovede, aby sa do nej pri budúcom rozšírení nedostala marža alebo náklad;
držia to dva testy. Odpoveď je cachovaná na pol hodiny v prehliadači a hodinu na okraji.

Web už ceny vykresľuje okamžite z vlastnej tabuľky a API používa ako doplnenie.

**Dopytový formulár je stále na troch miestach.** Rovnaká značka je v úvodnej stránke
a v oboch reklamných. Zmena poľa znamená tri úpravy a nič na nesúlad neupozorní. Ceny
sa vyriešiť dali, formulár nie: je to veľký blok značiek a vkladať ho skriptom by
znamenalo, že bez JavaScriptu formulár úplne zmizne. Zatiaľ ostáva ako známy dlh.

## Denník rozhodnutí

| Dátum | Čo |
| --- | --- |
| 5. 9. | Redizajn, štyri etapy, merge do `main`, vlastná doména |
| 6. 9. | Meranie, súhlas, odosielanie leadu do API, ceny, kontajner GTM |
| 6. 9. | CORS na produkčnom API, `www` presmerované na hlavnú doménu |
| 7. 9. | Dve reklamné stránky, bežiaci pruh obcí, oprava pôsobnosti na 20 km |
| 7. 9. | Oprava atribúcie pri publikovaní zákazky, nasadená na `api-dev` |
| 7. 9. | Zrušená holandská dokumentácia, vznikol tento súbor |
| 8. 9. | Fakturácia a účtovná kniha nasadené do produkčného portálu a API; aplikovaných desať migrácií po zálohe DB |
