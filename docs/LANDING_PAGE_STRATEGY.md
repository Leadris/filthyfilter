# Stratégia landing pages, zámerov a atribúcie

Zapísané 10. 9. 2026. Rozhodovací návrh, **nie stav**. Overené voči kódu:
`filthyfilter` (vetva `codex/filthyfilter-redesign`, `0b22778`) a `whispair-api`
(vetva `main`, `12de52c`).

Poradie prednosti zostáva: pokyny používateľa → `STATUS.md` → `MARKETING_PLAN.md`
→ `REDESIGN_PLAN.md` → `SYSTEM_REVIEW.md` → tento súbor. Kde sa tento dokument
rozchádza s `MARKETING_PLAN.md`, je to vyznačené a pomenované ako návrh na zmenu,
nie ako platné rozhodnutie.

Značky tvrdení: `EXISTING` (overené v kóde), `PARTIAL`, `MISSING`, `PROPOSAL`
(môj návrh), `USER DECISION` (nemôžem rozhodnúť ja).

Vznikol na zadanie prehodnotiť architektúru webu, lead funnelu a atribúcie pre
model „viac landing pages, jeden lead systém, jedno vyhodnotenie v reklame“.

---

## 1. Audit súčasného stavu

### 1.1 Hlavný nález: `SYSTEM_REVIEW.md` už neopisuje realitu

`SYSTEM_REVIEW.md` je zo 7. 9. a sám o sebe hovorí „nič z tohto ešte nie je
implementované“. Za tri dni sa implementovala väčšina jeho P0. Kto by dnes čítal
iba ten dokument — alebo jeho web verziu na `dev.filthyfilter.sk/system-review/`,
ktorá sa s ním bajtovo zhoduje (SHA-256 `213e4cab…`) — postavil by druhýkrát veci,
ktoré už bežia.

| Bod v `SYSTEM_REVIEW.md` | Tvrdenie tam | Skutočnosť 10. 9. |
| --- | --- | --- |
| P0.1 štruktúrovaný lead | chýba | `EXISTING` — migrácia `20260908100000`, `build_lead_details()`, `js/main.js` posiela polia |
| P0.2 atribúcia mimo Google | chýba | `PARTIAL` — `platform`, `fbclid`, `ctwa_clid`, `meta_ad_id` sú; `consent_version`, `consent_at`, `campaign_id`, `adgroup_id`, `keyword_id`, `channel` **nie sú** (grep: nula výskytov) |
| P0.3 peniaze na zákazke | chýba | `EXISTING` — ocenené riadky, súčty, na dev aj na produkcii |
| P0.4 účtovná kniha | chýba | `EXISTING` — `invoices`, `invoice_payments`, `job_costs` |
| P0.5 identita zákazníka | chýba | `EXISTING` — T12, vrátane `acquisition_lead_attribution_id` |
| P0.6 lokalita ako dáta | chýba | `MISSING` — žiadne `service_localities`, `client_locations`, `locality_id`; `service_area_postcodes` je stále iba PSČ a áno/nie |
| P0.7 zmazanie legacy emisie | chýba | `EXISTING` v repozitári (T14, zmazaných päť súborov), **nenasadené** |
| kap. G.4/G.7 hodnota konverzie | `job_completed` s hodnotou | **prekonané** — používateľ zvolil `invoice_paid` v netto až po úhrade; `job_completed` je zámerne míľnik bez hodnoty (migrácia `20260908140000`) |
| P1.7 tri mestské stránky | odporúčané | **v rozpore** s `MARKETING_PLAN.md` kap. 2: geografické stránky až podľa dát |

Kapitoly A až H v `SYSTEM_REVIEW.md` sú teda **zadanie zo 7. 9., nie audit**.
Metóda, doménový model a kapitola G o Google Ads zostávajú užitočné; zoznam
chýbajúceho neplatí. Oprava je v `SYSTEM_REVIEW.md` doplnená ako blok hneď za
úvodom.

### 1.2 Čo web pre viac landing pages už má

| Schopnosť | Kde | Značka |
| --- | --- | --- |
| Zámer stránky ako pole, nie voľný text | `js/attribution.js` číta `<body data-ff-page>` do `landing_token`, `lead_attribution.landing_token` VARCHAR(128) | `EXISTING` |
| Šesť rôznych tokenov už v obehu | `ff-home`, `ff-cistenie`, `ff-servis`, `ff-hall-trnava`, `ff-privacy`, plus `wa-ctwa` z WhatsAppu | `EXISTING` |
| Štruktúrovaný dopyt | `captured_messages.lead_details` JSONB: `service_key`, `service_code`, `place`, `unit_count`, `preferred_time_text`, `express` | `EXISTING` |
| Rozlíšenie značky | `captured_messages.business_brand` s CHECK na `filthyfilter`/`whispair` | `EXISTING` |
| Ceny zo servera | `GET /api/v1/service-packages/published`, tabuľka `PRICES` v `js/main.js` len ako záloha pri výpadku | `EXISTING` |
| Per-stránkové metadáta | `window.FF_META` prepisuje `title` a `description`; komentár v kóde ho už menuje ako hák pre mestské stránky | `EXISTING` |
| Ochrana troch kópií formulára | `tests/forms.test.cjs` porovnáva polia, typy a zoznam služieb | `EXISTING` |
| Dve landing pages s vlastnou štruktúrou sekcií | `/cistenie-klimatizacie/` (cena, rozsah, dôkaz, postup, FAQ), `/servis-klimatizacie/` (príznaky, cena, postup, FAQ) | `EXISTING` |
| Self-canonical na každej stránke | všetkých päť verejných stránok | `EXISTING` |

Základ je teda položený a je lepší, než by sa z `SYSTEM_REVIEW.md` zdalo.
Nechýba architektúra, chýba **vrstva zámeru** a **spôsob, ako pridať stránku
lacno**.

### 1.3 Čo pre viac landing pages chýba alebo je rozbité

**a) `landing_token` robí tri rôzne práce naraz.** `EXISTING`, a je to problém.
Nesie identifikátor stránky (`ff-cistenie`), marker kanála (`wa-ctwa`,
`_whatsapp_helpers.php:203`) aj **kód balíka** (`package_share_link()`
v `_service_helpers.php:186` doň zapíše `FF-CIST-NASTENNA`). Pri dvoch stránkach
sa to unieslo. Pri ôsmich je to stĺpec, na ktorom sa nedá postaviť report.

**b) `landing_token` zo zdieľacieho odkazu sa na web nikdy nedostane.** `MISSING`,
a je to tichá chyba. `package_share_link()` ho pripája do URL, ale
`js/attribution.js` ho z URL **nikdy nečíta** — v `PARAMS` nie je a `get()` ho
vždy prepíše hodnotou z `data-ff-page`. `utm_campaign` z toho istého odkazu
prežije, takže zdieľanie sa dá spočítať; token nie. Nikoho to zatiaľ nebolí, lebo
zdieľacie odkazy sa nepoužívajú, ale s viacerými stránkami sa to prejaví ako
nevysvetliteľný rozdiel medzi dvomi metrikami.

**c) Zámer nie je vlastné pole.** `MISSING`. Žiadny `intent_key` ani `problem_key`
neexistuje nikde. „S akým problémom prišiel“ sa dnes dá iba odvodiť z reťazca
`landing_token`, ktorý podľa bodu (a) nie je spoľahlivý.

**d) Klient si `landing_token` určuje sám a server ho neoveruje.** `PARTIAL`.
`extract_lead_attribution()` ho iba oreže na 128 znakov. `platform` sa naopak
odvodzuje na serveri a nikdy sa neberie z požiadavky — to je správne a je to vzor,
podľa ktorého sa má riešiť aj zámer.

**e) Prechod landing page → WhatsApp stratí stránku.** `MISSING`. Správa nesie
prvý riadok „Dopyt z filthyfilter.sk“ a `whatsapp_business_brand()` si z neho
prečíta **značku**. Ktorú stránku návštevník opustil, v texte nie je. Pri dvoch
stránkach je to jedno; pri ôsmich zmizne polovica atribúcie práve v kanáli, ktorý
má byť podľa `MARKETING_PLAN.md` kap. 11 prvý platený.

**f) Udalosti okrem `lead_submitted` nevedia, na ktorej stránke vznikli.**
`PARTIAL`. `form_start` posiela `{form}`, `phone_click` a `whatsapp_click`
posielajú `{placement}` (`js/main.js:365`). Iba `lead_submitted` posiela `page`.
Porovnať dve landing pages podľa podielu začatých formulárov sa teda dnes nedá.

**g) Súhlas nie je doložený na serveri.** `MISSING`, a je to právna, nie technická
prekážka. `js/consent.js` má `VERSION = "2026-09-07"` a čas voľby, ale
`lead_attribution` nemá kam ich uložiť. `PRIVACY_IMPLEMENTATION.md` to žiada pred
prvým ostrým exportom konverzií.

**h) Lokalita je voľný text.** `MISSING`. `lead_details.place` je reťazec, PSČ nie
je stĺpec, `service_area_postcodes` je iba PSČ a áno/nie. Mestská stránka nemá
z čoho ukázať čokoľvek lokálne pravdivé.

**i) Každá nová stránka je štvrtá kópia formulára.** `EXISTING` dlh, pomenovaný
v `STATUS.md`. Formulár je surové HTML na troch miestach a preklady sú inline
v `data-sk`/`data-en` na každom elemente. Šesť landing pages znamená šesť kópií
formulára, pätičky, lišty, súhlasu a servisnej oblasti, každú v dvoch jazykoch.
Toto je jediný dôvod, prečo by projekt s viacerými landing pages mohol zlyhať na
údržbe, a nie na marketingu.

**j) `LocalBusiness` v JSON-LD nemá ani jedna stránka.** `MISSING`, známe zo
`STATUS.md`.

### 1.4 Premisa zadania, ktorú treba opraviť

Zadanie predpokladá, že každá landing page je cieľom zodpovedajúcej reklamnej
skupiny. **Na prvom platenom kanáli to neplatí.** Používateľ 7. 9. rozhodol
(`MARKETING_PLAN.md` kap. 11), že prvý platený kanál je Meta s prechodom priamo
do WhatsAppu, a Google Ads je pozastavený do vzniku vlastnej s. r. o.
(`GOOGLE_ADS_PRODUCTION_GATE.md`). Reklama teda **landing page obchádza**.

Dôsledok pre poradie prác: landing pages sa pri spustení neplatia z reklamy. Ich
prvá úloha je organické vyhľadávanie a byť dôveryhodným podkladom pre toho, kto
si pred napísaním na WhatsApp overuje, s kým má do činenia. Mapovanie na reklamné
skupiny sa **navrhne teraz a aktivuje neskôr**, pri otvorení brány. To je dobrá
správa: stránky nemusia byť hotové naraz s reklamou a majú čas nazbierať organické
search-term dáta, na ktorých sa neskôr postaví štruktúra kampaní.

---

## 2. Čo zo `SYSTEM_REVIEW.md` zostáva správne

- **Metóda.** Rozšíriť existujúce tabuľky, nové zakladať len tam, kde entita
  naozaj chýba. Platí a týmto dokumentom sa nemení.
- **Kapitola G celá okrem G.4 a G.7.** Ako sa ukladá klik, ako sa reťaz drží cez
  zákazníka a zákazku, prečo `utm_campaign` musí niesť `{campaignid}`, prečo je
  `lead_attribution` nemenná, prečo klik ID platí ~90 dní. Nič z toho sa nezmenilo
  a je to jediné miesto, kde je Google vysvetlený pre vývojára.
- **Pravidlo, že `phone_click` a `whatsapp_click` sú sekundárne navždy.**
- **G.9: marža ako druhá, samostatná konverzná akcia**, nie primiešaná do tržby.
- **Zoznam „čo z benchmarku vedome neberieme“**, najmä stovky mestských stránok.
- **`ServiceQuoteEngine` ako jedna cenová logika** pre web, portál aj WhatsApp
  (P1.1). Stále nepostavené, stále správne.
- **Odmietnutie náhrady Billdu vlastným stackom.** Kniha áno, druhý backend nie.

---

## 3. Čo treba zmeniť alebo doplniť

1. **Označiť A–H v `SYSTEM_REVIEW.md` za zadanie zo 7. 9.** a doplniť stav k 10. 9.
   Hotové v tomto kroku.
2. **Prepísať G.4 a G.7** na skutočný model: peniaze nesie `invoice_paid` v netto
   po úhrade, `job_completed` je míľnik bez hodnoty.
3. **Zrušiť P1.7 (tri mestské stránky) v pôvodnom znení.** Je v rozpore
   s `MARKETING_PLAN.md`. Nahradiť pravidlom, kedy mestská stránka vzniká.
4. **Doplniť vrstvu zámeru**, ktorú `SYSTEM_REVIEW.md` neriešil vôbec:
   `intent_key`, whitelist tokenov, prenos zámeru cez WhatsApp.
5. **Doplniť generátor landing pages.** `SYSTEM_REVIEW.md` predpokladal ručné HTML
   z jednej šablóny. Pri šiestich stránkach v dvoch jazykoch to nevydrží.

---

## 4. Odporúčaná taxonómia zámerov

Zadanie ponúka šesť rozmerov. Rozhodnutie o každom:

| Rozmer | Je to os pre landing page? | Prečo |
| --- | --- | --- |
| **Hlavná služba** | **Áno**, primárna os | Zodpovedá tomu, čo predávame, a už má stránky |
| **Problém / symptóm** | **Áno**, druhá os | Jediné miesto, kde vzniká naozaj odlišný obsah: iná príčina, iná diagnostika, iné CTA |
| **Typ zákazníka** | **Áno**, ale iba jedna stránka (B2B) | Ponuka aj CTA sa líšia: ponuka na mieru namiesto ceny „od“, termíny mimo prevádzky, dokumentácia |
| **Typ zariadenia** | **Nie** | Nástenná verzus kazetová je už dnes **cena a položka formulára**, nie zámer. Dve stránky s rovnakým textom a inou sumou sú presne tá tenká stránka, ktorú nechceme |
| **Lokalita** | **Nie pri spustení** | Rozhodnutie používateľa zo 6. 9.: geografické stránky až podľa dát. Navyše dnes nemáme žiadny lokálny fakt, ktorý by sa dal pravdivo napísať (bod 1.3h) |
| **Urgentnosť** | **Nie pri spustení** | Expres je zaškrtávacie pole s vlastným kódom balíka. Samostatná stránka sľubuje prevádzkový záväzok, ktorý podľa `STATUS.md` nikto nepotvrdil |

**Kombinácie rozmerov (problém × mesto, služba × zariadenie) sa nerobia.** Práve
z nich vzniká kombinatorický výbuch tenkých stránok, pred ktorým zadanie varuje.

### Pravidlo pre celú taxonómiu

> Nová landing page vzniká z **odlišnej odpovede**, nie z odlišnej otázky.
> Ak by sa dve stránky líšili iba nadpisom a poradím tých istých odsekov, je to
> jedna stránka s dvomi sekciami.

---

## 5. MVP zoznam landing pages

Šesť indexovateľných stránok pri spustení. Tri existujú, tri pribudnú.

| # | URL | Zámer | Stav |
| --- | --- | --- | --- |
| 1 | `/` | značka, rozcestník, dôkaz | `EXISTING` |
| 2 | `/cistenie-klimatizacie/` | všeobecné čistenie | `EXISTING` |
| 3 | `/servis-klimatizacie/` | servis, oprava, diagnostika | `EXISTING` |
| 4 | `/smrdi-klimatizacia/` | zápach, pleseň, hygiena | `PROPOSAL` |
| 5 | `/klimatizacia-nechladi/` | slabé alebo žiadne chladenie | `PROPOSAL` |
| 6 | `/servis-pre-firmy/` | B2B, viac jednotiek, prevádzky | `PROPOSAL` |

### Prečo práve tieto tri

**`/smrdi-klimatizacia/`** je zámer s najvyšším objemom zo všetkých symptómov
a zároveň jediný, kde je náš dôkaz najsilnejší: pred/po fotografie výmenníka sú
presne odpoveď na „prečo to smrdí“. Absorbuje `pleseň v klimatizácii`,
`špinavá klimatizácia` aj `dezinfekcia klimatizácie`, ktoré vedú na tú istú prácu
a na tú istú cenu.

**Samostatnú stránku pre pleseň neodporúčam**, hoci ju zadanie navrhuje. Pravidlá
z `MARKETING_PLAN.md` kap. 6 zakazujú označiť každé znečistenie za pleseň bez
merania a zakazujú zdravotné tvrdenia. Stránka menom „pleseň“, ktorá nesmie
povedať nič o plesni, je buď prázdna, alebo porušuje vlastné pravidlá. Ako sekcia
a FAQ na stránke o zápachu sa dá napísať pravdivo.

**`/klimatizacia-nechladi/`** je jediný symptóm, kde je **odpoveď naozaj iná**.
Zvyšné symptómy vedú na čistenie; tento môže viesť na čistenie, na doplnenie
chladiva, na elektroniku alebo na výmenu jednotky. Preto má iné primárne CTA
(diagnostika za 49 € s odpočtom pri oprave, nie objednanie čistenia) a je to
prirodzené a čestné miesto pre prechod na whispAir, keď je odpoveďou nová
jednotka.

**`/servis-pre-firmy/`** má odlišnú ponuku, odlišné CTA a **jediný skutočný
firemný dôkaz, ktorý máme** — spis La Donuteria je prevádzka, nie domácnosť. Dnes
je B2B iba sekcia na úvodnej stránke, čo je pre samostatný zámer s vlastným
rozhodovacím procesom málo.

### Odložené a prečo presne

| Stránka | Blokované na | Kedy sa otvorí |
| --- | --- | --- |
| `/kvapka-klimatizacia/` | dátach | Obsah sa prekrýva s čistením: upchatý odvod kondenzátu je čistiaca práca. Začína ako sekcia + FAQ na stránke čistenia s vlastnou kotvou. Povýši sa podľa pravidla 5.1 |
| `/plesen-v-klimatizacii/` | pravidlách o tvrdeniach | Zlúčené do stránky o zápachu. Samostatne len ak search terms ukážu, že to je iná otázka, a len s textom, ktorý neklame |
| `/expresny-servis/` | `USER DECISION` | Kým nie je jasné, kto sľub do 24 hodín vie dodržať a v ktoré dni. Dovtedy je expres pole vo formulári, nie sľub na vlastnej stránke |
| mestské stránky | dátach + obsahu | Podmienky sú v kapitole 11.5. Rozhodnutie zo 6. 9. platí |
| `/servis-klimatizacie-<značka>/` | — | Nerobiť. Značka jednotky je pole, nie zámer |

### 5.1 Kedy vzniká nová landing page

Musia platiť **všetky tri** podmienky, nie jedna:

1. Zhluk vyhľadávacích dopytov má **≥ 20 zobrazení týždenne štyri týždne po sebe**
   (Search Console alebo report vyhľadávacích dopytov v Ads).
2. Existujúca stránka na ten dopyt **neodpovedá vlastnými slovami** — nie „nemá tam
   to slovo“, ale „čitateľ tam nenájde odpoveď“.
3. Vieme napísať **aspoň 400 slov, ktoré nie sú na žiadnej inej stránke**, a máme
   k tomu **aspoň jeden vlastný dôkaz**: fotografiu, meranie, otázku, ktorú nám
   naozaj kladú.

Tretia podmienka je tá, ktorá zastaví správanie „vyrobme stránku pre každý
keyword“. Bez vlastného dôkazu stránka nevzniká.

### 5.2 Kedy sa dve stránky zlučujú

- Prekryv množín vyhľadávacích dopytov **nad 40 %** za osem týždňov, alebo
- stránka má **menej než 5 relácií mesačne osem týždňov po sebe**, alebo
- obe stránky vedú na to isté CTA s tým istým `service_code` a rozdiel obsahu je
  pod hranicou z kapitoly 9.

Zlúčenie znamená **301 na silnejšiu stránku** a zloženie obsahu do sekcie. Token
slabšej stránky zostáva v mape navždy, aby staré atribučné riadky dávali zmysel.

### 5.3 Strop

**Najviac osem indexovateľných landing pages** bez písomného zdôvodnenia v tomto
súbore. Deviata stránka je rozhodnutie, nie úloha. Toto je jediná ochrana, ktorá
v praxi funguje; pravidlá kvality sa vždy ohnú, číslo nie.

---

## 6. Tabuľka: zámer → kľúčové slová → reklamná skupina → stránka → polia → konverzia

Reklamné skupiny sú `PROPOSAL` a aktivujú sa až po otvorení Google Ads brány
(kapitola 1.4).

### 6.1 Prehľad

| Zámer (`intent_key`) | Stránka | `landing_token` | `service_key` → `service_code` | `problem_key` | Reklamná skupina | Primárne CTA |
| --- | --- | --- | --- | --- | --- | --- |
| `cleaning_general` | `/cistenie-klimatizacie/` | `ff-cistenie` | `nastenna` → `FF-CIST-NASTENNA`, `kazetova` → `FF-CIST-KAZETOVA` | — | `AG1 cistenie` | formulár, objednať čistenie |
| `problem_smell` | `/smrdi-klimatizacia/` | `ff-zapach` | `nastenna` → `FF-CIST-NASTENNA` | `smell` | `AG2 zapach` | formulár, objednať čistenie |
| `problem_no_cooling` | `/klimatizacia-nechladi/` | `ff-nechladi` | `diagnostika` → `FF-DIAGNOSTIKA` | `no_cooling` | `AG3 servis` | formulár, objednať diagnostiku |
| `service_repair` | `/servis-klimatizacie/` | `ff-servis` | `diagnostika` → `FF-DIAGNOSTIKA` | — | `AG3 servis` | formulár, objednať diagnostiku |
| `b2b` | `/servis-pre-firmy/` | `ff-firmy` | `firmy` → bez kódu | — | žiadna pri štarte | ponuka na mieru |
| `brand` | `/` | `ff-home` | podľa výberu | — | žiadna (značku rieši SEO) | formulár |
| `proof` | `/hall/trnava-la-donuteria/` | `ff-hall-trnava` | — | — | žiadna | preklik na čistenie |

### 6.2 Detail podľa stránky

#### `/cistenie-klimatizacie/` — `cleaning_general`

- **Zámer:** „mám špinavú klímu, chcem ju dať vyčistiť, koľko to stojí“.
- **Kľúčové slová:** čistenie klimatizácie, čistenie klímy, hĺbkové čistenie
  klimatizácie, dezinfekcia klimatizácie, vyčistenie klimatizácie cena, čistenie
  klimatizácie v byte.
- **Negatíva:** auto, autoklimatizácia, návod, ako vyčistiť, svojpomocne, DIY,
  sprej, pena, čistič, prípravok, filter kúpiť, práca, brigáda, kurz, školenie,
  pdf, bazár, zadarmo.
- **Primárna konverzia:** `lead_submitted`. **Sekundárne:** `whatsapp_click`,
  `phone_click`, `form_start`.
- **Úspech stránky:** podiel `form_start` → `lead_submitted` nad 40 %, a aspoň
  polovica leadov má vyplnený počet jednotiek.

#### `/smrdi-klimatizacia/` — `problem_smell`

- **Zámer:** „z klímy ide smrad, čo s tým“. Človek ešte nevie, že chce čistenie.
- **Kľúčové slová:** smrdí klimatizácia, zápach z klimatizácie, klíma zapácha,
  smrad z klímy, klimatizácia smrdí plesňou, špinavá klimatizácia, pleseň
  v klimatizácii.
- **Negatíva:** ako doma, sami, sprej na zápach, osviežovač, deodorant, auto,
  v aute, čo znamená (informačný zámer), zdraviu škodlivé, alergia (zdravotný
  zámer, ktorý nesmieme obsluhovať).
- **Primárna konverzia:** `lead_submitted`. Sekundárne rovnako.
- **Úspech stránky:** privádza leady, ktoré predtým nehľadali „čistenie“, teda
  **nekanibalizuje** AG1. Meria sa prekryvom vyhľadávacích dopytov pod 40 %.

#### `/klimatizacia-nechladi/` — `problem_no_cooling`

- **Zámer:** „nefunguje mi to, neviem prečo“. Naliehavejšie, drahšie, menej isté.
- **Kľúčové slová:** klimatizácia nechladí, klíma nechladí, slabo chladí, dlho
  chladí, klimatizácia fúka teplý vzduch, klimatizácia prestala chladiť.
- **Negatíva:** chybový kód (výrobcov, informačný zámer), reset, návod, ako
  doplniť chladivo, chladivo kúpiť, R32 cena, auto, kompresor cena, nová
  klimatizácia (patrí whispAir, nie sem).
- **Primárna konverzia:** `lead_submitted` so `service_code = FF-DIAGNOSTIKA`.
- **Úspech stránky:** podiel leadov, ktoré sa stanú zákazkou, a **podiel
  prechodov na whispAir** ako druhý užitočný výsledok, nie ako strata.

#### `/servis-pre-firmy/` — `b2b`

- **Zámer:** „máme viac jednotiek a potrebujeme to riešiť pravidelne“.
- **Kľúčové slová:** čistenie klimatizácií kancelárie, servis klimatizácií pre
  firmy, pravidelná údržba klimatizácií, čistenie klimatizácie reštaurácia,
  servis klím prevádzka.
- **Negatíva:** práca, zamestnanie, živnosť, subdodávka, školenie, certifikát,
  tender, cenník na stiahnutie.
- **Primárna konverzia:** `lead_submitted`. Hodnota tu príde neskôr a je vyššia,
  takže táto stránka je **kandidát na vlastnú konverznú akciu** až keď bude objem.
- **Úspech stránky:** počet dopytov s viac než tromi jednotkami.
- **Reklamná skupina pri štarte žiadna.** Pri 250–300 € mesačne by odobrala
  rozpočet zámerom, ktoré konvertujú rýchlejšie. Otvoriť pri rozpočte nad 500 €.

---

## 7. Konvencia URL a `landing_token`

### URL

- Slovensky, bez diakritiky, s koncovou lomkou, malými písmenami.
- **Znenie kopíruje to, ako sa človek pýta**, nie ako veci voláme my:
  `/smrdi-klimatizacia/`, nie `/zapach-z-klimatizacie/`.
- Bez mesta v URL, pokiaľ to nie je mestská stránka.
- Bez dátumov, bez čísel, bez `?intent=`. Zámer je v ceste, nie v query.
- **URL sa po zverejnení nemení.** Zmena znamená 301 a stratu časti histórie.

### `landing_token`

Nové tokeny podľa vzoru `ff-<slug>`, malé písmená, najviac 24 znakov, bez
diakritiky. **Existujúce tokeny sa nepremenúvajú** — historické riadky by prestali
byť porovnateľné a nezískali by sme tým nič.

Rozhodujúce je, že sa **nereportuje na tokene, ale na `intent_key`**, ktorý si
server odvodí z mapy. Token je vstup, zámer je dáta.

```text
mapa v _lead_helpers.php (zdroj pravdy)

ff-home         → brand
ff-cistenie     → cleaning_general
ff-servis       → service_repair
ff-zapach       → problem_smell
ff-nechladi     → problem_no_cooling
ff-firmy        → b2b
ff-hall-trnava  → proof
ff-privacy      → info
wa-ctwa         → whatsapp_ad          (nastavuje server pri Meta reklame)
FF-*            → catalog_share        (kód balíka zo zdieľacieho odkazu)
neznámy token   → intent_key = null, token sa uloží tak, ako prišiel
```

Pravidlá:

- Jeden token na jednu URL **navždy**. Nepoužíva sa znovu.
- Vyradený token zostáva v mape, aby staré riadky dávali zmysel.
- Nový token sa pridáva do mapy **v tom istom commite**, v ktorom vzniká stránka.
  Test to vynúti (kapitola 13).
- **Klient token posiela, server ho neverí.** Neznámy token sa uloží, ale zámer
  z neho nevznikne. Presne tak, ako to už dnes robí `platform`.

---

## 8. Dopady na databázu a API

Všetko aditívne a nullable, v duchu existujúcich migrácií.

### 8.1 Migrácia — atribúcia

```sql
ALTER TABLE lead_attribution
    ADD COLUMN IF NOT EXISTS intent_key       VARCHAR(32)  NULL,
    ADD COLUMN IF NOT EXISTS channel          VARCHAR(16)  NULL,
    ADD COLUMN IF NOT EXISTS consent_version  VARCHAR(32)  NULL,
    ADD COLUMN IF NOT EXISTS consent_at       TIMESTAMPTZ  NULL;
```

- `intent_key` — odvodený serverom z `landing_token`. CHECK na zoznam z kapitoly 7.
- `channel` — `web_form` / `whatsapp` / `phone` / `eshop`. Dnes sa to dá uhádnuť
  z toho, ktorý kód riadok zapísal; ako stĺpec sa to dá spočítať.
- `consent_version`, `consent_at` — **`MISSING` od P0.2 a blokuje prvý ostrý
  export** podľa `PRIVACY_IMPLEMENTATION.md`. Web ich pozná z `ff_consent_v2`.

Index: `(intent_key, created_at DESC)` s `WHERE intent_key IS NOT NULL`.

### 8.2 Migrácia — lead

```sql
-- problem_key ide do lead_details, nie do vlastného stĺpca:
-- lead_details už drží service_key, unit_count aj express a je to
-- pracovný záznam, ktorý smie človek opraviť.
CREATE INDEX IF NOT EXISTS idx_captured_messages_problem
    ON captured_messages((lead_details->>'problem_key'))
    WHERE lead_details IS NOT NULL;
```

### 8.3 Deliaca čiara, ktorá musí platiť

> **`lead_attribution` je nemenná história. `lead_details` je pracovný záznam.**

Odtiaľ vyplýva umiestnenie každého poľa zo zadania:

| Pole zo zadania | Kam patrí | Značka |
| --- | --- | --- |
| `business_brand` | `captured_messages.business_brand` | `EXISTING` |
| `landing_token` | `lead_attribution` | `EXISTING` |
| `landing_page_url` | `lead_attribution.landing_url` | `EXISTING` |
| `intent_key` | `lead_attribution` — odvodené serverom | `PROPOSAL` |
| `service_key`, `service_code` | `lead_details` | `EXISTING` |
| `problem_key` | `lead_details` — človek ho smie opraviť | `PROPOSAL` |
| `location_key` | `lead_details.postcode` + neskôr `locality_id` | `MISSING` (P0.6) |
| `campaign_id`, `ad_group_id` | `utm_campaign`, `utm_content` cez ValueTrack | `PARTIAL` — vlastné stĺpce netreba, ak suffix nesie `{campaignid}` |
| `keyword` | `utm_term` | `EXISTING` |
| `match_type` | **iba analytická udalosť**, nie DB | `PROPOSAL` — Google to má vo vlastných reportoch, u nás by to bol šum |
| `utm_*` ×5 | `lead_attribution` | `EXISTING` |
| `gclid`, `gbraid`, `wbraid`, `fbclid`, `ctwa_clid` | `lead_attribution` | `EXISTING` |
| `referrer` | `lead_attribution` | `EXISTING` |
| `first_touch` | `lead_attribution` — prvý dotyk v relácii vyhráva | `EXISTING` |
| `latest_touch` | **neukladať** | `PROPOSAL` — pri jednom leade na návštevu nemá čo zmerať a rozbil by nemennosť riadku |
| `unit_type` | odvodené zo `service_code` | `EXISTING` — nástenná a kazetová sú dnes dva balíky |
| `unit_count` | `lead_details` | `EXISTING` |
| `preferred_time` | `lead_details.preferred_time_text` | `PARTIAL` — je to voľný text, dátum až s rezerváciou (P1.2) |
| `express` | `lead_details` | `EXISTING` |

**Čo sa prenáša ďalej:** na zákazníka iba `acquisition_lead_attribution_id`
(`EXISTING`, prvá kampaň navždy), na zákazku väzba cez `lead_attribution.job_id`
(`EXISTING`). Nič sa nekopíruje; atribúcia zostáva na jednom mieste a väzby sa iba
dopĺňajú.

### 8.4 Čo smie poslať klient a čo musí odvodiť server

| Hodnota | Klient | Server |
| --- | --- | --- |
| `landing_token`, `utm_*`, klik ID, `unit_count`, `express`, `preferred_time_text`, `place` | posiela | oreže a uloží |
| `service_key`, `service_code` | posiela | overí **tvar** pri príjme (`EXISTING`), overí **existenciu v katalógu** až keď sa z toho počíta cena |
| `platform` | nikdy | odvodí z klik ID (`EXISTING`) |
| `intent_key` | nikdy | odvodí z `landing_token` cez mapu (`PROPOSAL`) |
| `business_brand` | posiela | dnes iba whitelist dvoch hodnôt; **odporúčam odvodiť z tokenu**, každý `ff-` token je filthyfilter (`PROPOSAL`) |
| `consent_version`, `consent_at` | posiela | uloží a **opečiatkuje vlastným časom** vedľa (`PROPOSAL`) |
| cena, suma, balík, zľava | **nikdy** | výhradne katalóg a cenový engine (`EXISTING`) |

### 8.5 Zachovanie atribúcie na ceste landing page → WhatsApp → lead → job

Dnešný stav a diera:

```text
landing page ──formulár──► POST /api/v1/leads ──► lead_attribution   ✔ token, zámer, klik ID
landing page ──WhatsApp──► whatsapp_webhook   ──► lead_attribution   ✘ značka áno, stránka NIE
Meta CTWA    ──WhatsApp──► whatsapp_webhook   ──► lead_attribution   ✔ ctwa_clid, meta_ad_id
lead ──convert──► job ──► invoice ──► invoice_paid                   ✔ celé
```

**Návrh (`PROPOSAL`), lacný, na existujúcej mechanike:** predvyplnená WhatsApp
správa dostane druhý riadok `Ref: ff-zapach`. `whatsapp_parse_inbound()` ho
prečíta do `landing_token` a `intent_key` presne tým istým spôsobom, akým už dnes
`whatsapp_business_brand()` číta značku z prvého riadku.

Obmedzenia, ktoré treba napísať do kódu, nie zamlčať:

- Text správy si používateľ môže prepísať. Je to **indícia, nie dôkaz** — rovnaká
  úroveň dôvery, akú už má riadok so značkou.
- Prichádza iba pri prvej správe. Ďalšie správy ho nemajú, preto sa viaže na
  telefónne číslo v okne 24 hodín, ako to už robí `referral`.
- `referral` z Meta reklamy má **prednosť pred textom**. Reklamu určil systém,
  text napísal človek.
- Ak si obe cesty odporujú, riadok zostane prázdny a rozhodne človek. To je už
  dnes pravidlo pre značku a osvedčilo sa.

Toto je **P1 a nie P2**. Bez toho pri šiestich stránkach nevieme, ktorá z nich
priviedla WhatsApp konverzáciu, a to je kanál, ktorý má byť prvý.

### 8.6 Dve opravy mimo zámeru, ktoré sa našli pri audite

1. **`package_share_link()` posiela `landing_token` v URL, web ho zahodí**
   (bod 1.3b). Buď doplniť `landing_token` do `PARAMS` v `js/attribution.js`
   s prednosťou URL pred `data-ff-page`, alebo prestať ho do odkazu dávať
   a spoľahnúť sa na `utm_campaign`, ktorý funguje. **Odporúčam druhé:** menej
   kódu a token si tak udrží jediný význam.
2. **`form_start`, `phone_click` a `whatsapp_click` neposielajú stránku**
   (bod 1.3f). Doplniť `landing_token` a `intent` do parametrov v `track()`, na
   jednom mieste. Bez toho sa landing pages nedajú porovnať inak než podľa
   odoslaných leadov, čo je najmenej citlivá metrika, akú máme.

---

## 9. Obsahový model landing page

Spoločná kostra, individuálny obsah. Blok označený **V** musí byť napísaný pre
tento zámer a nikde inde sa nesmie opakovať; blok **S** je zdieľaný komponent.

| # | Blok | Typ | Poznámka |
| --- | --- | --- | --- |
| 1 | Presné pomenovanie problému v hero | **V** | Doslova to, čo človek napísal do vyhľadávania |
| 2 | Čo to pravdepodobne spôsobuje | **V** | Bez diagnózy na diaľku, bez zdravotných tvrdení |
| 3 | Čo vieme zistiť a čo urobíme | **V** | Konkrétne kroky, nie sľuby |
| 4 | Čo služba zahŕňa | S s výnimkou | Rozsah z `REDESIGN_PLAN.md`; poradie sa smie líšiť |
| 5 | Cena alebo spôsob jej určenia | **S** | Vždy z `GET /api/v1/service-packages/published`, záloha `PRICES`. **Stránka nikdy nedrží vlastnú sumu** |
| 6 | Relevantná realizácia pred/po | **V** | Fotografia, ktorá zodpovedá práve tomuto problému |
| 7 | FFFF / PPPP | **S** | Škála sa neprepisuje, opakuje sa vtip, nie text |
| 8 | Lokálna pôsobnosť | **S** | Bežiaci pruh obcí, rovnaký všade |
| 9 | FAQ pre tento problém | **V** | Najmenej štyri otázky, ktoré nie sú inde |
| 10 | Formulár predvyplnený podľa zámeru | **S** | `service` a `problem_key` prednastavené z `data-ff-*` |
| 11 | WhatsApp s predvyplnenou správou | **S** | Vrátane riadku `Ref:` z kapitoly 8.5 |
| 12 | Telefón | **S** | |
| 13 | Prechod na whispAir | **V**, ak dáva zmysel | Iba tam, kde je výmena reálna odpoveď — dnes stránka o nechladení |

### Pravidlo proti tenkým stránkam, ktoré sa dá zmerať

> Zdieľané bloky **nesmú tvoriť viac než 60 % slov stránky**, a bloky 1, 2, 3 a 9
> musia byť na každej stránke vlastné.

Je to merateľné, takže sa to dá otestovať (kapitola 13), a nie je to názor.
Stránka, ktorá to nespĺňa, nie je landing page — je to sekcia inej stránky.

Ďalej platí bez zmeny: žiadne vymyslené recenzie a realizácie, žiadne zdravotné
tvrdenia, žiadne prevzaté texty ani fotografie konkurencie, ceny majú jediný
zdroj pravdy.

---

## 10. Dopady na GTM a Google Ads

### 10.1 Udalosti — čo je čo

| Udalosť | Rola | Stav |
| --- | --- | --- |
| `page_view` | iba diagnostika, nikdy konverzná akcia | `EXISTING` (GTM) |
| `form_start` | diagnostika; porovnáva kvalitu landing pages | `EXISTING`, chýba mu stránka |
| `phone_click` | **sekundárna navždy** | `EXISTING` |
| `whatsapp_click` | **sekundárna navždy** | `EXISTING` |
| `lead_submitted` | **primárna pri štarte**, až po 2xx z API | `EXISTING` |
| `lead_qualified` | sekundárna, import | `EXISTING` |
| `job_created` | sekundárna, neskôr primárna | `EXISTING` |
| `job_completed` | sekundárna, **zámerne bez hodnoty** | `EXISTING` |
| `invoice_paid` | **nositeľ peňazí**, netto po úhrade | `EXISTING` |
| `job_booked` | neexistuje, rezervácia nie je entita | `MISSING`, P2 |
| `cancelled` | úprava konverzie pri dobropise | `MISSING`, P2 |
| `spam` / `discarded` | **nie konverzia**, interná metrika kvality | stav `Discarded` `EXISTING` |

`paid_job` zo zadania je u nás `invoice_paid` a je **hotový**. Rozhodnutie
používateľa: hodnota odchádza až po úhrade, v netto, v EUR.

### 10.2 Na čo optimalizovať a kedy prepnúť

| Fáza | Podmienka | Primárna | Poznámka |
| --- | --- | --- | --- |
| 1 | štart | `lead_submitted` (web) | Jediná s dostatočným objemom |
| 2 | ≥ 30 importovaných `job_created` za 30 dní | `job_created` | `lead_submitted` na sekundárnu |
| 3 | ≥ 30 `invoice_paid` za 30 dní **a** medián lead → úhrada pod 45 dní | `invoice_paid` s hodnotou, tROAS | |

Druhá podmienka vo fáze 3 je z T13 a je dôležitá: klik ID platí ~90 dní od kliku
a worker staršiu udalosť označí `Expired`. Pri dlhej splatnosti by optimalizácia
na `invoice_paid` hladovala a Google by sa učil z nesystematicky chýbajúcich dát.
**Kým medián nie je pod 45 dní, fáza 3 sa neotvára**, aj keby počet konverzií
stačil.

### 10.3 Štruktúra kampaní pri 250–300 € mesačne

`MARKETING_PLAN.md` kap. 8 navrhuje **dve kampane** (čistenie, servis).
Odporúčam **jednu** (`PROPOSAL`, revidoval by kap. 8):

```text
Kampaň: FF-SK-Search-<mesto>          (jedna, jedno mesto)
├─ AG1 cistenie   → /cistenie-klimatizacie/    intent cleaning_general
├─ AG2 zapach     → /smrdi-klimatizacia/       intent problem_smell
└─ AG3 servis     → /klimatizacia-nechladi/    intent problem_no_cooling
                     (absorbuje servis a opravu; /servis-klimatizacie/
                      zostáva organickou stránkou)
```

Dôvod je aritmetika, nie preferencia. Pri 300 € a CPC okolo 0,50 € je to zhruba
600 klikov mesačne. Rozdelené na dve kampane sa každá učí z polovice, a Smart
Bidding počíta objem **na úrovni kampane**. Tri reklamné skupiny v jednej kampani
zdieľajú rozpočet aj učenie; dve kampane po 150 € sa neučia ani jedna.

Zvyšné dva zámery (`b2b`, `brand`) nemajú pri štarte reklamnú skupinu. B2B sa
otvára nad 500 € mesačne.

**Geo: jedno mesto** (`USER DECISION`, otvorené v troch dokumentoch). Tri mestá za
300 € je proti konkurentovi usadenému v Bratislave a Trnave tenké — to je
pomenované už v `MARKETING_PLAN.md` kap. 5 bod 7 a nič sa odvtedy nezmenilo.

Bez Performance Max, ako hovorí `MARKETING_PLAN.md`. Pri troch stránkach a malom
rozpočte by PMax jediné, čo vie táto štruktúra dobre — priradenie zámeru
k stránke — zahodila.

### 10.4 GTM

- **Každá udalosť dostane `landing_token` a `intent`** ako parameter. Jedno miesto,
  funkcia `track()` v `js/main.js`. Bez novej konverznej akcie sa tým dá porovnať
  ktorákoľvek dvojica stránok v GA4.
- Konverzné akcie sa **neduplikujú na stránku**. Šesť stránok neznamená šesť akcií
  `lead_submitted`; znamená to jednu akciu a jeden parameter navyše.
- Final URL suffix s ValueTrack zostáva podľa `SYSTEM_REVIEW.md` kap. G.1:
  `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}`.
- **Zamedzenie duplicít je hotové a nič sa nepridáva:** `transactionId` je ID riadku
  udalosti, unikátny index `uq_conversion_events_invoice_type` drží jednu platenú
  konverziu na doklad, `upload_status` drží stav fronty.

---

## 11. SEO a ochrana pred doorway modelom

### 11.1 Indexácia

Indexovateľné je šesť stránok z kapitoly 5 plus spis realizácie a stránka
o údajoch. Všetko ostatné `noindex`: interné, system review, budúce
`objednat-znova` tokeny.

### 11.2 Canonical

- Každá stránka **self-canonical**. `EXISTING` na všetkých piatich.
- Problémové stránky **nesmú** mať canonical na stránku služby. Nie sú to jej
  varianty; keby boli, nemajú vzniknúť.
- Parametre `?gclid=`, `?utm_*` canonical neovplyvňujú — canonical je bez query,
  čo dnešný stav spĺňa.

### 11.3 Interné prelinkovanie

- Každá problémová stránka odkazuje **hore** na stránku služby a **do strán**
  najviac na dve súvisiace stránky, vždy v texte a s dôvodom.
- Žiadny blok odkazov v pätičke na všetky landing pages. Tak vyzerá doorway.
- Úvodná stránka odkazuje na všetky, ale zo sekcií, kam obsahovo patria.

### 11.4 Sitemap, breadcrumbs, structured data

- `sitemap.xml`: šesť stránok + spis + údaje. Bez `lastmod`, ktorý si nikto
  neudržiava.
- Breadcrumbs `/` → služba → problém, s `BreadcrumbList` JSON-LD.
- `LocalBusiness` na každej stránke (`MISSING` dnes všade, `STATUS.md` to už vedie).
- `Service` na stránkach služieb, `FAQPage` len tam, kde je FAQ naozaj vlastné.
- **Nikdy `Review` ani `AggregateRating`.** Nemáme recenzie a vymýšľať ich je
  zakázané.

### 11.5 Kedy je mestská stránka dosť hodnotná na indexáciu

Musia platiť **všetky**:

1. Máme z toho mesta **aspoň dve vlastné realizácie s fotografiami**.
2. Vieme napísať aspoň jeden **lokálne pravdivý fakt**, ktorý inde neplatí:
   dojazd, príplatok, dostupné dni, typická zástavba.
3. Search Console ukazuje, že mesto sa v dopytoch **naozaj objavuje**.
4. Stránka spĺňa pravidlo 60 % z kapitoly 9 rovnako ako každá iná.

Bez toho stránka buď nevznikne, alebo vznikne ako `noindex` a slúži len ako cieľ
reklamy. **Nikdy nie desať mestských stránok naraz** a nikdy nie samostatné domény
pre mestá.

### 11.6 Rozdelenie obsahu FilthyFilter a whispAir

| FilthyFilter píše | whispAir píše |
| --- | --- |
| čistenie, dezinfekcia, hygiena | predaj jednotky, výber modelu |
| diagnostika, oprava, porucha | montáž, cenník montáže |
| pravidelná údržba, servisné intervaly | rekonštrukcia, väčšia HVAC zákazka |
| zistenie, že výmena je lacnejšia | samotná výmena |

Ani jedna značka nepíše obsah tej druhej. Prechod je **jeden odkaz v texte
s dôvodom**, nie zrkadlová stránka. Kde by obe mohli písať o tom istom (napr.
„klimatizácia nechladí“), text patrí FilthyFilter, lebo prvá odpoveď je
diagnostika, nie predaj.

---

## 12. Vzťah FilthyFilter a whispAir v dátach

Rozdelenie zo zadania platí a nemení sa. Čo treba vedieť rozlíšiť a čím:

| Otázka | Odpoveď v dátach | Značka |
| --- | --- | --- |
| Ktorá značka lead priviedla | `captured_messages.business_brand` | `EXISTING` |
| S akým zámerom prišiel | `lead_attribution.intent_key` | `PROPOSAL` |
| Ktorá bola prvá zákazka | prvý `job` naviazaný cez `lead_attribution.job_id` | `EXISTING` |
| Ktorá kampaň priviedla zákazníka vôbec prvýkrát | `clients.acquisition_lead_attribution_id` | `EXISTING` |
| Následný cross-sell na whispAir | `commerce_orders.attribution` | `MISSING` — stĺpec existuje, **nikto doň nepíše** |
| Tržba pripísateľná pôvodnej kampani | `invoice_paid` cez `invoices.job_id` | `EXISTING` |
| Interné LTV zákazníka | súčet cez `acquisition_lead_attribution_id` | `EXISTING`, ale **do Google sa neposiela** |

Pravidlo, ktoré musí platiť: **druhá zákazka toho istého zákazníka o rok neskôr
sa neposiela do Google ako nová konverzia z pôvodného kliku.** Klik ID je po 90
dňoch neplatné a worker to už dnes správne označí `Expired` (T13). LTV je naša
interná metrika a do atribučného okna Google nepatrí.

**Prechod na whispAir je dnes nemerateľný.** Odkaz nesie vlastné UTM, takže sa dá
spočítať klik, ale predaj jednotky sa ku kliku na FilthyFilter nepriradí, lebo
`commerce_orders.attribution` nemá zapisovateľa. Pri stránke o nechladení, ktorá
má tento prechod ako jeden zo svojich cieľov, to prestane byť teoretické.
Je to P2 a už je to vedené v `STATUS.md` bod 5.

---

## 13. Implementačný model a malé kroky

### 13.1 Ako stavať stránky

Zadanie ponúka štyri modely. Odporúčam **hybrid: generátor v čase písania,
statický výstup v čase nasadenia** (`PROPOSAL`).

Dôvod je bod 1.3i. Dnes sú tri kópie formulára a preklady inline na každom
elemente. Šesť landing pages znamená šesť kópií formulára, pätičky, lišty,
súhlasu, servisnej oblasti a jazykového prepínača. Ručné písanie by nový obsah
nezdražilo, ale **každá budúca zmena spoločného komponentu by stála šesť úprav**
a `tests/forms.test.cjs` by len hlásil, že sa rozišli.

Návrh:

```text
content/<slug>.json        obsah stránky: intent_key, landing_token, service_key,
                           problem_key, hero, príčiny, rozsah, FAQ, SK aj EN
templates/landing.html     kostra so spoločnými blokmi
scripts/build-landing.mjs  generuje <slug>/index.html
```

- Generuje sa **do repozitára a commituje sa**, ako už dnes funguje
  `tmp/build_system_review.py` aj `scripts/build-runtime-config.mjs`.
- Na server ide **statické HTML**. Pravidlo „bez buildu pri nasadení“
  z `MARKETING_PLAN.md` zostáva nedotknuté; build je autorský nástroj, nie
  runtime.
- Bez CMS, bez databázy obsahu, bez frameworku. Tri súbory a jeden skript.
- Formulár, CTA, ceny, atribúcia a kontakty sa **znovupoužijú**, nekopírujú.

Toto nie je rozšírenie scope na CMS. Je to opak: bez neho scope narastie
šesťnásobne pri každej budúcej zmene.

### 13.2 Kroky s testami

Každý krok je samostatne nasaditeľný a spätne kompatibilný.

**Krok 1 — zámer ako dáta** (P0)

- `whispair-api`: migrácia `lead_attribution ADD intent_key, channel, consent_version, consent_at`;
  mapa tokenov a `lead_intent_key()` v `_lead_helpers.php`.
- `filthyfilter`: `js/main.js` posiela `consent_version` a `consent_at`.
- **Testy:** `LeadHelpersTest` — známy token dá zámer, neznámy dá `null` a token sa
  aj tak uloží, klientom poslaný `intent_key` sa ignoruje.
- **Riziko:** žiadne, všetko nullable.

**Krok 2 — stránka v každej udalosti** (P0)

- `js/main.js`: `track()` pridá `landing_token` a `intent` do každej udalosti.
- **Testy:** `browser.test.cjs` — `form_start` aj `whatsapp_click` nesú token.

**Krok 3 — generátor a prvá vygenerovaná stránka** (P0)

- `scripts/build-landing.mjs`, `templates/`, `content/`; prvou vygenerovanou
  stránkou je **existujúca** `/cistenie-klimatizacie/`, aby sa výstup dal porovnať
  s dnešným ručným HTML.
- **Testy:** vygenerované HTML sa nesmie líšiť od commitnutého (drift test);
  `forms.test.cjs` rozšírený o generované stránky; test na `title`,
  `description`, canonical a `data-ff-page`; test na nefunkčné lokálne odkazy.
- **Riziko:** najväčší krok v pláne. Preto ide **pred** novým obsahom, nie po ňom.

**Krok 4 — tri nové landing pages** (P1)

- `/smrdi-klimatizacia/`, `/klimatizacia-nechladi/`, `/servis-pre-firmy/`;
  tokeny do mapy v tom istom commite; sitemap; interné odkazy.
- **Testy:** pravidlo 60 % ako test nad vygenerovaným HTML; každý token v mape má
  stránku a každá stránka token; canonical a `LocalBusiness` na každej.

**Krok 5 — zámer prežije WhatsApp** (P1)

- Riadok `Ref: <token>` v predvyplnenej správe; `whatsapp_parse_inbound()` ho
  číta; `referral` má prednosť.
- **Testy:** `WhatsAppHelpersTest` — správa s `Ref:`, správa bez neho, správa
  s `referral` aj `Ref:` (vyhráva `referral`), správa s rozporom (zostane prázdna).

**Krok 6 — `problem_key` a JSON-LD** (P1)

- `lead_details.problem_key` z `data-ff-problem` na stránke; `LocalBusiness`
  a `BreadcrumbList` všade.
- **Testy:** `LeadHelpersTest` na whitelist; test na platnosť JSON-LD.

**Krok 7 — mapovanie reklamy** (P1, bez kódu)

- Tabuľka z kapitoly 6 do Google Ads pri otvorení brány. Zmena v účte, nie v kóde.

**Krok 8 — lokalita ako dáta** (P2)

- P0.6 zo `SYSTEM_REVIEW.md`, stále otvorené. Bez neho nemá mestská stránka
  z čoho čerpať.

**Krok 9 — report podľa zámeru** (P2)

- `ad_spend_daily` (T18) a `GET /api/v1/reports/attribution` s `intent_key`
  a `landing_token` ako rozmermi.

### 13.3 Priority

| | Čo |
| --- | --- |
| **P0** | Krok 1 (zámer + súhlas), krok 2 (stránka v udalostiach), krok 3 (generátor). Plus dve opravy z 8.6. Nič z toho nie je viditeľné pre návštevníka a všetko blokuje zvyšok |
| **P1** | Krok 4 (tri stránky), krok 5 (WhatsApp), krok 6 (`problem_key`, JSON-LD), krok 7 (mapovanie do Ads) |
| **P2** | Krok 8 (lokalita), krok 9 (report), `commerce_orders.attribution`, úpravy konverzií pri storne, stránky odložené v kapitole 5 podľa pravidla 5.1 |

Poradie P0 je zámerné: **generátor ide pred obsahom.** Opačné poradie by znamenalo
tri nové ručné kópie formulára a potom migráciu šiestich stránok naraz.

---

## 14. Otvorené rozhodnutia — čo naozaj potrebujem od teba

1. **Ktoré mesto ide prvé.** Bratislava, Trnava alebo Nitra. Otvorené od 6. 9.
   v troch dokumentoch. Blokuje kapitolu 10.3 a názov kampane.
2. **Je sľub „do 24 hodín“ prevádzkovo skutočný, a v ktoré dni?** Bez odpovede
   nevznikne `/expresny-servis/` a expres zostáva poľom vo formulári.
3. **Jedna kampaň, alebo dve podľa `MARKETING_PLAN.md` kap. 8?** Odporúčam jednu
   (10.3). Ak trváš na dvoch, treba zvýšiť rozpočet alebo zúžiť geo ešte viac.
4. **Dostane B2B stránka verejnú cenu „od“, alebo zostáva pri ponuke na mieru?**
   Dnes platí ponuka na mieru. Cena „od“ by zvýšila konverziu a znížila kvalitu
   dopytov; pri malom objeme si vyberáme.
5. **Idú Meta CTWA reklamy naďalej priamo do WhatsAppu, alebo časť rozpočtu na
   landing page?** Mení to, či sa nové stránky pri spustení platia z reklamy alebo
   len z organiky.
6. **Potvrdenie deliacej čiary:** FilthyFilter nikdy nepredáva ani nemontuje,
   každý dopyt na výmenu ide na whispAir, a jeho tržba **opúšťa atribučné okno
   FilthyFilter**. Chcem to potvrdené, lebo stránka o nechladení na tom stojí.
7. **Zoznam 41 obcí** v bežiacom pruhu — čo vyhodiť, čo doplniť. Otvorené od 7. 9.
   Bežiaci pruh je zdieľaný blok na každej landing page, takže sa to premietne
   šesťkrát naraz.

---

## Čo tento dokument vedome nerobí

- Nenavrhuje stránku pre každý keyword. Šesť stránok, strop osem.
- Nenavrhuje mestské stránky pred dátami ani samostatné domény pre mestá.
- Nemení konverzný model. `invoice_paid` v netto po úhrade zostáva.
- Nestavia CMS ani marketingovú platformu. Generátor je skript, nie systém.
- Neruší fungovanie bez reklamného súhlasu. `landing_token` a zámer sa ukladajú
  aj bez súhlasu, klik ID nie — presne ako dnes.
- Nekopíruje texty, fotografie ani štruktúru konkurencie.
