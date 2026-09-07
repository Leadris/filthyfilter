# FilthyFilter — stav projektu

**Aktualizované 7. 9. 2026.** Toto je jediné miesto, kde sa pozerá na to, čo je hotové
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
| Okruh tržieb späť do Google Ads | kód hotový, na dev nasadený, **nie na produkcii** |
| Reklamné stránky | dve, na stagingu |
| Google Ads | používateľ dokončí nastavenie neskôr; kampaň teraz nespúšťame. Plán prvého kanála Meta zostáva samostatne. |
| Meta (Facebook a Instagram) | **nezačaté**, zadanie zapísané v `MARKETING_PLAN.md` kap. 11 |
| Produkčný web | **stará verzia**, formulár pripravuje správu, neposiela lead do API; bez merania |
| Ikony | hotové na stagingu; produkcia má ešte starú baktériu |

## Čo je hotové

**Súkromie, ceny a optimalizácia (7. 9., nasadené na dev).**
SK/EN informácie podľa čl. 13 GDPR s ADAMSON s. r. o.; odkazy pri všetkých troch
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

1. **WhatsApp chýba v plávajúcej lište na mobile.** Všetky tri stránky majú
   „Zavolať“ a „Nacenenie“. Hlavný kanál kampane teda nemá trvalé tlačidlo.
2. **Meta Pixel neexistuje.** Musí ísť do `js/consent.js`, aby prešiel súhlasom,
   nie vedľa neho.
3. **Reklamný materiál je z jednej zákazky.** Kód to nevyrobí.

Nebráni spusteniu, ale chýba: **žiadna stránka nemá `LocalBusiness` v JSON-LD**,
čo je strata najmä pre mapový výsledok a prepojenie s profilom na Google.

## Vyriešené 7. 9. 2026 večer

**Prevádzkovateľ je známy a stránka o spracovaní údajov existuje.** Je ním
ADAMSON s. r. o., Topoľčianska 19, 851 05 Bratislava, IČO 45378843,
IČ DPH SK2022960159. `PRIVACY_URL` v `js/consent.js` na ňu už ukazuje. Tým padá
bod 1 zo zoznamu nižšie aj bod 7 z kapitoly 10 v `MARKETING_PLAN.md`.

Používateľ odložil dokončenie Google Ads; nejde o chýbajúce identifikačné údaje
prevádzkovateľa webu. Podrobnosti implementácie a úlohy pred offline exportom
sú v `PRIVACY_IMPLEMENTATION.md`.

## Čo čaká na používateľa

1. **Prevádzkovateľ vyriešený:** ADAMSON s. r. o.; údaje overené cez FinStat a ORSR.
2. **Ktorým mestom začať s reklamou.** Bratislava, Trnava alebo Nitra. Rozhoduje to,
   kam sa vám najlepšie jazdí a kde už máte zákazníkov.
3. **Kto dvíha telefón a do koľkých minút** odpovedá na dopyt.
4. **Prejsť zoznam 41 obcí** v bežiacom pruhu a povedať, čo vyhodiť a čo doplniť.
5. **Skúšobný e-mail na `info@filthyfilter.sk`.** Schránka existuje, doručenie nikto
   nepotvrdil.
6. **Doplniť čistenie klimatizácií do profilu whispAir** na Google.
7. **Dokončenie Google Ads** používateľom neskôr. Krajina,
   mena a časové pásmo sú pri zakladaní natrvalo; nastaviť podľa firmy. Hneď na prvej
   obrazovke prepnúť do režimu odborníka, inak účet skončí v režime Smart, kde nie sú
   konverzné akcie ani kľúčové slová.
8. **Štyri konverzné akcie** typu import z CRM so sledovaním konverzií z klikov, pre
   `lead_qualified`, `job_created`, `job_completed`, `package_sold`. Ich identifikátory
   idú do `GOOGLE_DM_ACTION_*` v `.env` API.
9. **Zapnúť Data Manager API** v Google Cloud projekte `whispair-hvac` a pridať
   `firebase-adminsdk-fbsvc@whispair-hvac.iam.gserviceaccount.com` ako používateľa
   Google Ads účtu.

## Čo čaká na vývoj

1. **Produkčné nasadenie webu.** Ostrá doména stále beží na starej verzii bez formulára,
   atribúcie aj súhlasu. Až po posúdení stagingu.
2. **Produkčné nasadenie API.** Zmeny sú na `main` a na `api-dev`, na produkcii nie.
   Podľa `ENVIRONMENTS.md` idú produkčné zmeny bežným balíkovým nasadením, nie po
   súboroch.
3. **Vetva `wip/installation-slots`** vo `whispair-api` drží nedokončenú rezerváciu
   montážnych termínov, presun domén z `cukivan.me` a úpravy WooCommerce. Nič z toho
   nebolo overené.
4. **Angličtina nemá vlastnú URL.** Prepína sa iba v prehliadači, takže Google indexuje
   výhradne slovenčinu. Ak má prinášať návštevnosť, potrebuje vlastnú cestu a `hreflang`.
5. **Meranie telefonátov.** `phone_click` nie je hovor. Kým to tak zostane, telefonický
   lead treba do systému zapísať ručne, inak z merania vypadne.
6. **Prechod na whispAir sa nepriradí späť.** Odkaz nesie vlastné UTM, takže sa dá
   spočítať, ale predaj klimatizácie sa ku kliku na FilthyFilter nespojí.
7. **`trnava-dusk.png` má 1,39 MB** ako PNG za päťpixelovým rozostrením. Ako JPEG by mal
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
