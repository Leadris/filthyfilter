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
| Google Ads | **nezaložený**, čaká na s.r.o. |
| Produkčný web | **stará verzia**, bez formulára aj bez merania |

## Čo je hotové

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

## Čo čaká na používateľa

1. **Údaje o prevádzkovateľovi** pre stránku o spracovaní údajov: obchodné meno, IČO,
   sídlo a kontakt na uplatnenie práv. Bez nej banner o súhlase nemá kam odkázať.
2. **Ktorým mestom začať s reklamou.** Bratislava, Trnava alebo Nitra. Rozhoduje to,
   kam sa vám najlepšie jazdí a kde už máte zákazníkov.
3. **Kto dvíha telefón a do koľkých minút** odpovedá na dopyt.
4. **Prejsť zoznam 41 obcí** v bežiacom pruhu a povedať, čo vyhodiť a čo doplniť.
5. **Skúšobný e-mail na `info@filthyfilter.sk`.** Schránka existuje, doručenie nikto
   nepotvrdil.
6. **Doplniť čistenie klimatizácií do profilu whispAir** na Google.
7. **Google Ads účet** s firemným platobným profilom, až keď vznikne s.r.o. Krajina,
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
