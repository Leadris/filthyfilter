# FilthyFilter — marketingový a merací plán

Zapísané 6. 9. 2026. Tento súbor je zdrojom pravdy pre akvizíciu, meranie a Google Ads.
Pre vizuál, texty a správanie webu ďalej platí `docs/REDESIGN_PLAN.md`; kde sa rozchádzajú,
platí tento súbor a nižšie je vymenované, čo presne ruší.

Vznikol zosúladením marketingového briefu od Codexu
(`filthyfilter_claude_marketing_brief.md`, mimo repozitára) so skutočným stavom kódu.
Brief videl len repozitár FilthyFilter, takže navrhoval postaviť veci, ktoré už bežia
v `whispair-api`. Brief je odteraz historický podklad, nie zadanie.

## 1. Cieľ

Dostať človeka z Google cez čo najkratšiu cestu k realizovanej a zaplatenej zákazke,
a výsledok tej zákazky vrátiť späť do reklamy, aby sa ďalšie euro minulo lepšie.

Merať treba celý reťazec, nie jeho prvý článok:

```text
klik → lead → kvalifikovaný lead → termín → hotová zákazka → zaplatená tržba
```

Ak meriame len počet leadov, kľúčové slovo s desiatimi lacnými dopytmi vyzerá lepšie než
slovo so šiestimi drahšími, ktoré sa menia na zákazky. Preto sa hodnota zákazky musí
dostať späť do Google Ads.

## 2. Rozhodnutia používateľa zo 6. 9. 2026

- **Architektúra.** FilthyFilter zostáva statický web bez buildu a frameworku a napojí sa
  na existujúce `whispair-api`. Nestavia sa Next.js ani druhé CRM.
- **Cena.** Na landing pages ide orientačná cena „od“ s rozsahom a poznámkou, že konečná
  závisí od stavu jednotky a prístupu. **Ruší to** rozhodnutie „ceny na dopyt, bez
  verejného cenníka“ z `REDESIGN_PLAN.md`. Cenová kalkulačka sa naďalej nestavia.

  **Potvrdené ceny (6. 9. 2026), všetky s DPH:**

  | Služba | Cena |
  | --- | --- |
  | Hĺbkové čistenie nástennej jednotky | od 79 € |
  | Hĺbkové čistenie kazetovej jednotky | od 129 € |
  | Preventívna údržba | od 49 € |
  | Diagnostika a servis | 49 €, pri objednaní opravy sa odpočíta |
  | Pravidelný servis pre firmy | ponuka na mieru, bez verejného čísla |

  Toto je jediný zdroj pravdy pre ceny. Pri zmene ich uprav tu aj na homepage a na oboch
  landing pages naraz, inak si budú odporovať. **Stále nepotvrdené a preto nikde
  netvrdené:** zľava na druhú a ďalšiu jednotku, cena vonkajšej jednotky a doprava.
  Pre posledné dve platí ďalej znenie z `REDESIGN_PLAN.md`, teda podľa prístupu
  a potvrdenej ponuky, respektíve doprava dohodou.
- **Štruktúra.** Pribudnú `/cistenie-klimatizacie/` a `/servis-klimatizacie/`. Geografické
  stránky až podľa dát o tom, odkiaľ reálne chodia zákazky, nie dopredu.
- **Polia dopytu.** Meno a aspoň jeden kontakt sú povinné, lebo lead ide na server a bez
  kontaktu je nespracovateľný. **Ruší to** časť rozhodnutia z `REDESIGN_PLAN.md`, kde bolo
  meno nepovinné a formulár sa neodosielal. WhatsApp a telefón zostávajú vedľa ako cesta
  bez vypĺňania.
- **Zásahy do `whispair-api`** sú povolené, na samostatnej vetve toho repozitára.

Čo sa **nemení**: tmavý medený vizuál a humor, značka FilthyFilter by whispAir, iba SK a EN,
žiadne vymyslené recenzie, štatistiky, certifikácie ani zdravotné tvrdenia, a pravidlo
rámovania sekcií.

## 3. Čo už existuje a nesmie sa stavať druhýkrát

Platforma `whispair-api` (PHP 8.2 + PostgreSQL, `api.whispair.sk`, staging
`api-dev.whispair.sk`) pokrýva väčšinu meracích kapitol briefu. Nad ňou bežia portál
v prehliadači a terénna aplikácia.

| Čo | Kde | Zodpovedá kapitole briefu |
| --- | --- | --- |
| Verejný príjem leadu s honeypotom a limitom na IP | `endpoints/submit_lead.php` | 31, TASK 5 |
| Validácia a whitelist atribučných polí | `endpoints/_lead_helpers.php` | 31, TASK 5 |
| `lead_attribution`: gclid, gbraid, wbraid, päť utm, landing_token, landing_url, referrer, ip_hash | migrácia `20260619100500` | 14 |
| `conversion_events`: typ, hodnota, mena, hashovaný e-mail a telefón, stav nahratia | migrácia `20260619101500` | 13 |
| Nahrávanie offline konverzií do Google Ads | `cron/google_ads_conversion_worker.php` | 15 |
| CSV export konverzií ako ručná záloha | `endpoints/export_conversions.php` | 15 |
| Emisia udalostí pri vzniku a dokončení zákazky | `_conversion_helpers.php`, volané z `convert_captured_message_to_job.php` a `update_job.php` | 7, 9 |
| Pipeline od zachytenej správy po hotovú zákazku | `captured_messages` → `jobs` | 9 |
| WhatsApp Business, príjem aj odosielanie | `whatsapp_webhook.php`, `whatsapp_outbound_worker.php` | 10 |
| Cenové pravidlá a servisná oblasť podľa PSČ | `_pricing_helpers.php`, migrácia `20260818150000` | 8 |
| AI koncepty marketingového obsahu k zákazke | `marketing_drafts`, `marketing_ai_config` | 10, 21 |

**Jediná chýbajúca časť je odosielateľ.** `submit_lead.php` zatiaľ nemá žiadneho
konzumenta. FilthyFilter bude prvý.

Typy konverzných udalostí, ktoré schéma dnes pozná: `lead_qualified`, `job_created`,
`job_completed`, `package_sold`. Nové typy vyžadujú migráciu, lebo stĺpec má obmedzenie
`CHECK`.

## 4. Meranie na strane webu

### Atribučné polia

Zachytávajú sa pri príchode z URL a držia sa v `sessionStorage` do odoslania dopytu.
Prvý dotyk v rámci relácie sa neprepisuje neskorším.

```text
gclid, gbraid, wbraid
utm_source, utm_medium, utm_campaign, utm_term, utm_content
landing_url, referrer, landing_token
```

`landing_token` nesie identifikátor stránky, teda `ff-cistenie`, `ff-servis` alebo
`ff-home`. Slúži na rozlíšenie značky a stránky bez zásahu do zoznamu povolených hodnôt
v stĺpci `source`, ktorý zostáva `WebLead`.

### Udalosti

```text
form_start          prvý zmysluplný vstup do formulára
lead_submitted      až po potvrdení z API, nie po kliku na tlačidlo
phone_click         klik na telefónny odkaz
whatsapp_click      klik na odkaz do WhatsAppu
```

`lead_submitted` je hlavná konverzná akcia pri spustení. `phone_click` a `whatsapp_click`
sú pomocné; nie sú to hovory ani správy, len úmysel, a tak sa s nimi musí zaobchádzať.

### Súhlas so sledovaním

Web dnes netrackuje nič a nemá banner. Prvý Google tag ho robí povinným. Preto ešte pred
načítaním tagu:

- Consent Mode v2 s predvoleným zamietnutým stavom pre `ad_storage`, `analytics_storage`,
  `ad_user_data` a `ad_personalization`.
- Banner s rovnocennou možnosťou odmietnuť.
- Voľba jazyka a zvuku v `localStorage` je funkčná preferencia používateľa a súhlas
  nepotrebuje. Nemieša sa s marketingovým úložiskom.

**Stav 7. 9. 2026:** `js/consent.js` používa GTM-57M8XLQJ v basic Consent Mode.
Google skript sa načíta až po povolení merania; odmietnutie nezablokuje dopyt.
Voľba je verzovaná, platí 180 dní a dá sa zmeniť v pätičke. Atribúcia sa ukladá
iba po súhlase, personalizácia reklám zostáva denied. Stránka
`ochrana-osobnych-udajov/` má overeného prevádzkovateľa ADAMSON s. r. o.
Pred offline exportom treba dokončiť evidenciu a odvolávanie súhlasov v CRM;
presný stav a zdroje: `PRIVACY_IMPLEMENTATION.md`. Google Ads dokončí používateľ neskôr.

## 5. Čo brief vynechal a čo s tým

1. **Súhlas a Consent Mode v2.** V briefe nie je ani raz, pritom patrí do prvej meracej
   etapy. Riešené vyššie.
2. **Telefón ako kanál.** Pri domácom servise je hovor hlavný zdroj zákaziek. `phone_click`
   nie je hovor. Kým nemáme meranie hovorov, telefonický lead sa do systému zapisuje ručne
   ako zachytená správa, inak z merania vypadne.
3. **Čas reakcie na lead.** Nikde nie je určené, kto odpovedá a do koľkých minút. Rýchlosť
   odpovede zvýši podiel uzavretých zákaziek viac než ktorýkoľvek test landing page
   z fázy 5 briefu. Treba stanoviť záväzok a merať ho.
4. **Google Business Profile a mapový výsledok.** Na dopyt „čistenie klimatizácie Senec“
   býva mapa lacnejší zdroj leadov než reklama a je zadarmo. Podľa `REDESIGN_PLAN.md` je
   rozhodnutý jeden profil, whispAir, a doplnenie služby čistenia doň stále čaká.
5. **Prechod na whispAir.sk.** Fúnel zámerne prechádza na druhú doménu pri potrebe novej
   jednotky, ale nie je vyriešené meranie naprieč doménami ani to, ako sa predaj
   klimatizácie priradí ku kliku na FilthyFilter. Zatiaľ platí, že odkaz na whispAir nesie
   vlastné UTM, aby sa prechod dal aspoň spočítať.
6. **B2B oslovovanie je právna expozícia, nie len neskoršia fáza.** Zber kontaktov
   a studený e-mail v EÚ spadá pod GDPR a ePrivacy. Pred akýmkoľvek oslovovaním treba
   právne posúdenie, nie len odklad na fázu 7.
7. **Rozpočet verzus územie.** Pôsobnosť je Bratislava, Trnava, Nitra a okolie do 20 km
   (potvrdené používateľom 7. 9. 2026; skoršie „Senec a okolie do 100 km“ bolo nepresné).
   Dvestopäťdesiat až tristo eur mesačne na všetky tri mestá naraz je proti konkurentovi
   usadenému v Bratislave a Trnave tenké. Začať jedným mestom a rozširovať podľa toho,
   odkiaľ chodia zákazky. Ktorým mestom začať, je otvorené.
8. **Dátum prechodu na Data Manager API.** Brief ho uvádza ako overený. Pred implementáciou
   overiť priamo v dokumentácii Google, nie prevziať z druhej ruky.

## 6. FFFF a PPPP zostávajú vtip, nie meranie

Brief chce pre FFFF definované pravidlá, servisné protokoly a automatické reporty.
Pravidlá sa definovať dajú, ale výhradne ako **viditeľné vizuálne kritériá** a s tou istou
nadsádzkou, akú má škála na webe. Platí ďalej z `REDESIGN_PLAN.md`:

- nie je to mikrobiologické meranie a nesmie tak znieť,
- nepomenúvať každé znečistenie ako pleseň bez merania,
- žiadne zdravotné tvrdenia ani percentá účinnosti,
- výstup je **terénny report s FFFF skóre**, nie certifikát,
- stupeň 5 znamená, že rozsah sa potvrdí na mieste, nie diagnózu na diaľku.

## 7. Etapy

- **Etapa 0 — zosúladenie.** Tento dokument a úprava `CLAUDE.md`.
- **Etapa 1 — API. Ukázalo sa, že je hotová.** `POST /api/v1/leads` už na `main` existuje
  ako verejná routa cez front controller, takže prechádza cez `Cors` middleware.
  `LeadsController` a `LeadsService` znovupoužívajú `_lead_helpers.php` a zachovávajú
  honeypot aj limit na IP; `submit_lead.php` zostal nedotknutý. Overené lokálne: preflight
  z `https://filthyfilter.sk` vráti 204 s hlavičkami, prázdny dopyt vráti 422 s kódmi polí,
  vyplnená pasca vráti 202 a nezapíše nič.

  **Rozlíšenie značky sa vyriešilo bez zásahu do API.** Správa začína riadkom „Dopyt
  z filthyfilter.sk“, takže technik vidí pôvod priamo v inboxe. Telefón aj inbox sú
  spoločné s whispAir, takže ten riadok pomáha aj na WhatsApp. `landing_token` nesie to
  isté v atribučnom riadku, ktorý ale nikto nečíta pri práci.

  **Zostáva jediné a je to nasadzovacia úloha, nie kód:** overiť
  `CORS_ALLOWED_ORIGINS` v `.env` na oboch serveroch. Lokálne je hodnota `*`, ktorá by
  fungovala, ale podľa komentára v `src/Middleware/Cors.php` býva produkčný `.env`
  zúžený. Chýbajúci pôvod zlyhá v prehliadači potichu.
- **Etapa 2 — web.** Zachytenie atribúcie, súhlas a Consent Mode v2, odosielanie dopytu na
  API s viditeľným pádom späť na WhatsApp pri zlyhaní siete, štyri udalosti.
- **Etapa 3 — landing pages.** `/cistenie-klimatizacie/` a `/servis-klimatizacie/`.
- **Etapa 4 — Google Ads.** Dve kampane oddelene, úzke geo, negatívne slová, kontrola
  vyhľadávacích dopytov. Bez Performance Max.
- **Etapa 5 — uzavretie okruhu.** Konfigurácia workera a overenie, že hodnota dokončenej
  zákazky dorazí do Google Ads.

**Načasovanie.** GCLID má konverzné okno približne deväťdesiat dní. Ak sa zachytáva od
prvého dňa reklamy, etapa 5 môže prísť neskôr bez straty dát. Reklama teda nemusí čakať na
celý okruh, ale nesmie začať skôr, než web ukladá lead aj GCLID.

## 7b. Delenie práce s Codexom (6. 9. 2026)

Codex rieši Google Ads a tagy, Claude web a meranie na ňom. Hranica je jedna a je
dôležitá: **kód webu má jedného vlastníka.** Druhý tag vložený mimo `js/consent.js` by
obišiel súhlas a zdvojil konverzie.

| Vlastník | Čo |
| --- | --- |
| Codex | Účet Google Ads, konverzné akcie, štruktúra kampaní, kľúčové slová, negatíva, geo, rozpočet, vytvorenie Google tagu |
| Claude | Web, landing pages, zachytávanie atribúcie, súhlas, cesta dopytu do `whispair-api` |
| Spoločné | Názvy udalostí, mapovanie konverzných akcií, konfigurácia workera v `whispair-api` |

**Čo Codex nemá stavať, lebo to už existuje:** formulár na leady, ukladanie GCLID a UTM,
pipeline leadu na zákazku, nahrávanie offline konverzií. Všetko je v `whispair-api`,
podrobne v kapitole 3 tohto dokumentu.

**Čo od Codexu potrebujeme ako vstup:**

1. **Identifikátor Google tagu** do `TAG_ID` v `js/consent.js`. Tag vkladá web, nie Codex.
2. **Identifikátory konverzných akcií** pre štyri typy, ktoré `conversion_events` pozná:
   `lead_qualified`, `job_created`, `job_completed`, `package_sold`. Idú do `.env`
   API, odkiaľ ich číta `cron/google_ads_conversion_worker.php`.
3. **Vývojársky token Google Ads**, kým nie je, worker ticho nič nerobí.

**Pravidlá merania, ktoré musia platiť na oboch stranách:**

- `lead_submitted` je hlavná konverzia a spúšťa sa až po prijatí leadu serverom.
  Konverzná akcia na klik tlačidla by merala úmysel a učila Google nesprávnu vec.
- `phone_click` a `whatsapp_click` nie sú hovor ani správa. Nikdy na ne neoptimalizovať
  samostatne.
- Hodnota zákazky nechodí z webu. Chodí z API po dokončení zákazky, cez GCLID.
- Reklama sa nesmie spustiť skôr, než je web s zachytávaním atribúcie nasadený.

## 8. Google Ads v1

Dve kampane, aby sa nemiešali dva rôzne zámery s rôznou naliehavosťou a cenou.

**Čistenie:** čistenie klimatizácie, hĺbkové čistenie, dezinfekcia, smrdí klimatizácia,
pleseň v klimatizácii, čistenie klimatizácie cena, plus lokalitné varianty.

**Servis a opravy:** servis klimatizácie, oprava klimatizácie, klimatizácia nechladí,
klimatizácia tečie alebo kvapká, klíma hučí, chybový kód.

**Negatívne slová ako východisko:** auto, autoklimatizácia, návod, ako vyčistiť,
svojpomocne, DIY, sprej, pena, čistič kúpiť, prípravok, filter kúpiť, práca, zamestnanie,
kurz, školenie, certifikát, pdf, manuál, bazár. Nepridávať ďalšie naslepo, riadiť sa
skutočnými vyhľadávacími dopytmi.

Prvých štrnásť dní sa nesleduje cena za konverziu, ale či sedí zhoda medzi dopytom
a stránkou a či prichádzajú leady z územia, kam naozaj jazdíme.

## 9. KPI

Merať v tomto poradí dôležitosti, nie naopak:

```text
tržba na lead a na kampaň
podiel lead → zákazka a lead → zaplatené
cena za kvalifikovaný lead a za termín
priemerná hodnota zákazky
CPL, CPC, CTR
```

Kvalita: rozdelenie dôvodov straty, podiel spamu, podiel dopytov mimo územia, podiel
opakovaných zákazníkov, podiel prechodov na whispAir.

Čísla z case study konkurencie sa **nepoužívajú ako cieľ**. Nie sú nezávisle overené
a slúžia nanajvýš ako hrubá orientácia.

## 10. Čo čaká na používateľa

1. **Ceny „od“** pre nástennú a kazetovú jednotku a pre diagnostiku.
2. **Úzke geo pre prvú kampaň**, teda ktoré obce a v akom okruhu.
3. **Kto dvíha telefón a do koľkých minút** odpovedá na lead.
4. **Doplniť čistenie klimatizácií do profilu whispAir** na Google, ak sa tak ešte nestalo.
5. **Skúšobný e-mail na `info@filthyfilter.sk`**, doručenie stále nikto nepotvrdil.
6. **Identifikátor Google tagu** do `TAG_ID` v `js/consent.js`. Kým tam nie je, meranie
   aj banner spia. Doplnené, kontajner je `GTM-57M8XLQJ`.
7. **Id pixela Meta** do `metaPixelId` v `config/environments.json`. Je to iná hodnota
   než dataset a token pre Conversions API: id pixela používa prehliadač, dataset
   a token server. Kým je prázdne, pixel spí. Podrobne `BACKLOG.md` bod T24.
8. **Stránka o spracovaní údajov — hotová 7. 9. 2026**, odkazy v banneri, formulároch a pätičkách.

## 11. Meta (Facebook a Instagram) → WhatsApp

Zadanie používateľa zo 7. 9. 2026. **Google Ads sa zatiaľ nespúšťa**, Meta a Google
Business Profile áno. Kapitoly 8 a 9 tým nestrácajú platnosť, len sa odkladajú;
nič z nich sa nemaže.

Cieľ nie je návštevnosť, lajky ani sledovatelia, ale **relevantná konverzácia na
WhatsApp, ktorá skončí objednaným termínom**. Reklama má teda viesť do WhatsAppu,
nie na stránku, a stránka slúži ako dôveryhodný podklad pre toho, kto si pred
napísaním chce overiť, s kým má do činenia.

Ideálny zákazník: domácnosť alebo menšia prevádzka s nástennou jednotkou, ktorá
nebola dlhšie profesionálne čistená, v obsluhovanom území, ochotná poslať cez
WhatsApp lokalitu, počet jednotiek a fotografiu.

### 11.1 Čo web na túto kampaň nemá (zistené 7. 9. 2026, stav k 12. 9.)

Štyri veci, overené v kóde, nie odhadom. Tri z nich sú odvtedy zavreté; otvorený
zostáva reklamný materiál a id pixela.

1. ~~**WhatsApp nie je v plávajúcej lište na mobile.**~~ **Hotové 8. 9. 2026**, lišta má
   tri tlačidlá na všetkých troch stránkach. Pôvodný nález: na úvodnej stránke aj na oboch
   reklamných obsahovala `.mobile-cta` iba „Zavolať“ a „Nacenenie“. Odkazy do
   WhatsAppu v tele stránok existujú a sú merané, ale trvalá lišta, ktorú vidí
   návštevník po celý čas, hlavný kanál kampane neponúka. Pri stratégii, kde je
   WhatsApp primárny, je to najlacnejšia úprava s najväčším dopadom.
2. ~~**Meta Pixel neexistuje.**~~ **Rozvod hotový 12. 9. 2026, pixel spí.** Sedí
   **v** `js/consent.js`, teda tam, kde kapitola 7b hovorí, že má sedieť: web má
   jedného vlastníka tagov a druhá značka vedľa súhlasu by ho obišla a zdvojila
   konverzie. Id pixela ešte nie je, `metaPixelId` je vo všetkých piatich
   záznamoch v `config/environments.json` prázdne, a prázdne pole znamená, že sa
   `connect.facebook.net` nevolá vôbec — nie že sa volanie odkladá za súhlas.
   Doplnenie id ho zapne bez zásahu do kódu; postup je v `BACKLOG.md` bod T24.
   Po súhlase ide `PageView` raz, `whatsapp_click` a `phone_click` ako `Contact`
   s parametrom `channel`, `lead_submitted` ako `Lead` a `form_start` ako
   `InitiateCheckout`. Pravidlo z kapitoly 11.2, že `whatsapp_click` je úmysel
   a nie správa, tým **nepadá**: `Contact` sa smie sledovať, ale neoptimalizuje
   sa naň.
3. ~~**Žiadna stránka nemá `LocalBusiness` v JSON-LD.**~~ **Doplnené 11. 9. 2026.**
   Bolo to potrebné najmä pre prepojenie s profilom na Google, teda pre kapitolu o mapách.
4. **Materiál na reklamu je z jedinej zákazky.** V `assets/hall/trnava-la-donuteria/`
   je jedna dvojica pred/po, jedno video a jedna fotografia tímu. Na tri koncepty,
   ktoré má kampaň testovať, to nestačí a **nedá sa to vyrobiť kódom**.

### 11.2 Čo platí ďalej a kampaň to nesmie porušiť

- Žiadne zdravotné tvrdenia. Nečistá klimatizácia nie je diagnóza a čistenie nie je
  liečba. Platí kapitola 6 aj pre reklamné texty, nielen pre web.
- Ceny majú jediný zdroj pravdy, tabuľku `PRICES` v `js/main.js`. Suma v reklame,
  ktorá nesedí s webom, je horšia než žiadna suma.
- Pôsobnosť je Bratislava, Trnava, Nitra a okolie do 20 km. Geografické zacielenie
  sa z toho nesmie vymknúť, inak platíme za dopyty, kam nejazdíme.
- `whatsapp_click` je úmysel, nie správa. Neoptimalizovať naň ako na konverziu.

### 11.3 Otvorené, na rozhodnutie používateľa

1. Ktorým mestom začať. Rozpočet na tri mestá naraz je tenký (kapitola 5, bod 7).
2. Kto odpovedá na WhatsApp a do koľkých minút. Pri kampani mierenej do konverzácie
   je čas odpovede priamo konverzný faktor, nie prevádzková drobnosť.
3. Aký materiál vieme nafotiť a nakrútiť na najbližších zákazkách.
4. Či WhatsApp beží ako Business účet a na akom čísle. Dnešné `+421 902 279 094` je
   spoločné s whispAir.
