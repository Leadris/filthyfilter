# Sledovanie životného cyklu zákazky: implementačný plán

Zapísané 8. 9. 2026. Nadväzuje na `SYSTEM_REVIEW.md`, ktorý popisuje stav a dlh;
tento súbor popisuje, čo sa má postaviť a v akom poradí. Stav sa píše do
`STATUS.md`, nie sem. Poradie prednosti: pokyny používateľa → `STATUS.md` →
`MARKETING_PLAN.md` → `REDESIGN_PLAN.md` → `SYSTEM_REVIEW.md` → tento súbor.

Cieľ v jednej vete: **od kliku po zaplatenú faktúru má byť jedna nepretržitá
niť, aby sa dalo povedať, koľko eur priniesla konkrétna kampaň.** Dnes tá niť
končí pri dokončení zákazky a ide po nej udalosť bez hodnoty.

---

## 1. Rozhodnutia používateľa (8. 9. 2026)

| Rozhodnutie | Voľba | Dôsledok pre implementáciu |
| --- | --- | --- |
| Fakturačný nástroj | **Billdu zostáva**, napojí sa cez API | Plán úplnej náhrady Billdu v `plan_nahrady_billdu_whispair.pdf` (18. 7. 2026) sa tým **pozastavuje**. API vedie účtovnú knihu, nie fakturáciu. |
| Prístup k Billdu API | **zatiaľ nie je** (8. 9. 2026) | Práca sa delí na dve fázy: kniha s ručným zápisom ide hneď, napojenie na Billdu sa zapne, keď budú kľúče. Pozri kapitolu 6. |
| Účet v Billdu | **Jedna firma pre obe značky** | Jeden `apiKey`, jeden číselný rad. Značka sa nesie na zákazke a v popise položky, nie v účte. |
| Hodnota konverzie | **Netto bez DPH** | Do Google aj Meta ide základ dane. ROAS porovnáva tržbu s nákladom rovnakej povahy. |
| Kedy sa hodnota posiela | **Až po úhrade** | Peniaze nesie nová udalosť `invoice_paid`. `job_completed` zostáva míľnikom bez hodnoty. Pozri riziko v kapitole 7. |
| Vystavenie faktúry | **Návrh, človek potvrdí** | Systém pripraví položky a sumy, portál ich ukáže, tlačidlo vytvorí doklad. |
| WhatsApp číslo | **Spoločné pre obe značky** | Jedno WABA číslo. Značka sa musí odvodiť, nie predpokladať. Pozri krok 2. |
| Sadzba DPH | **jednotná pre všetky služby, ale nastaviteľná v portáli** | Sadzba je v `app_settings`, nie v kóde. Na faktúre sa uloží tá, ktorá platila pri vystavení. |
| Splatnosť | **podľa segmentu**, pozri kapitolu 3 | Domácnosť platí na mieste, firma má lehotu. Predvolené hodnoty sú nastaviteľné. |
| Kto potvrdzuje faktúru | **kancelária** | Technik ju nevystaví. Právo na vystavenie sa viaže na rolu, nie na priradenie k zákazke. |

---

## 2. Billdu API: čo naozaj vie

Overené 8. 9. 2026 proti oficiálnej špecifikácii
(`github.com/billduapp/api_documentation`, `apiary.apib`) a potom aj proti
živému účtu.

**Blokujúce zistenie z 8. 9. 2026 večer: účet API nemá.** Kľúč aj tajomstvo boli
doplnené a podpis je správny, ale každé volanie vracia:

```json
{"error":403,"message":"API not available for your subscription level. Please upgrade to Premium."}
```

Že ide o predplatné a nie o podpis, je istota: chybná signatúra by vrátila inú
odpoveď, a všetky tri varianty podpisu skončili rovnako. Kým sa účet nepovýši na
Premium, fáza 3 sa spraviť nedá. Fáza 2 v ručnom režime tým dotknutá nie je.

- **Základ:** `https://api.billdu.com`.
- **Autentifikácia:** `apiKey` v query, k tomu `signature` a `timestamp`.
  Podpis je `base64(hmac_sha512(json, apiSecret))` nad poľom dát doplneným
  o `timestamp` a `apiKey`, zoradeným podľa kľúčov (`ksort`) a zakódovaným
  s `JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK`.
  Podpis sa url-enkóduje. Kľúč a tajomstvo sú v Billdu pod **Settings → API**
  a vidí ich iba vlastník účtu.
- **Zdroje:** `clients`, `products`, `documents`, `images`.
- **Doklady:** `GET /documents?type=invoice` (stránkovaný zoznam),
  `GET /documents/{id}`, `POST /documents`, `DELETE /documents/{id}`,
  `GET /documents/{id}/download`, `GET /documents/{id}/send`.
- **Doklad nesie:** `id`, `serial`, `vs`, `status`, `payment`, `issue_date`,
  `maturity_date`, `price`, `tax`, `total_price`, `currency`, `client`,
  `supplier`, `items` a **`payments[]`**.
- **Webhooky nie sú.** Úhrada sa zisťuje dopytovaním.

Ich FAQ tvrdí, že komunikácia je jednosmerná a dáta sa von ťahať nedajú. To je
nepravda: špecifikácia aj ich vlastný PHP klient majú `GET /documents`. Riadime
sa špecifikáciou.

**Klienta si píšeme sami.** Balík `billdu/api-client` existuje, ale podpis je
desať riadkov a zvyšok je bežné HTTP. Codebase už rovnako ručne rieši Google
Data Manager, Meta a WhatsApp Cloud API. Ďalšia composer závislosť neznámej
údržby sa neoplatí.

---

## 3. Splatnosť, DPH a e-faktúra

### Sadzba DPH

Sadzba je jednotná pre všetky služby, ale **nesmie byť v kóde**. Uloží sa do
`app_settings` pod `invoicing.vat_rate` a portál ju vie zmeniť. Na faktúre aj na
riadkoch zákazky sa uloží tá sadzba, ktorá platila v okamihu vystavenia, nie
odkaz na nastavenie. Inak by zmena sadzby prepísala históriu a staré doklady by
prestali sedieť s priznaním.

**Revidované 11. 9. 2026 po zmene firmy.** Táto kapitola pôvodne stála na tom, že
prevádzkovateľom je ADAMSON s. r. o., zapísaný slovenský platiteľ DPH
(`IČ DPH SK2022960159`). Prevádzkovateľ je teraz whispAir s.r.o. v štádiu
zakladania, v Česku, bez IČO a bez DIČ. Čo z toho plynie:

- **Sadzbu nerozhoduje sídlo firmy, ale miesto plnenia.** Servis zariadenia
  zabudovaného v budove je službou vzťahujúcou sa na nehnuteľnosť, takže miesto
  plnenia je tam, kde budova stojí (čl. 47 smernice 2006/112/ES, v českom práve
  § 10 zákona o DPH). Slovenská domácnosť teda znamená slovenskú DPH, dnes
  dvadsaťtri percent, a pravdepodobne aj povinnosť registrácie na Slovensku, aj
  keď firma sídli v Česku. Pri odberateľovi, ktorý je platiteľom v krajine
  nehnuteľnosti, sa daň prenáša na neho; pri domácnosti ju odvádza dodávateľ.
  **Toto je vec pre účtovníka.** Systém to preto nerozhoduje a drží obe možné
  sadzby ako nastavenie.
- **Kým firma nie je zapísaná, nie je platiteľom DPH a nemá IČO**, takže doklad
  v jej mene by bol neplatný. Vystavenie je preto zablokované, kým nie sú
  vyplnené `invoicing.tax_jurisdiction`, `supplier_name`, `supplier_company_id`
  a pri nenulovej sadzbe aj `supplier_vat_id`.
- **Netto a brutto zostávajú rôzne sumy** v každom scenári okrem neplatiteľa,
  takže rozlíšenie je nutné tak či tak.

### Splatnosť

Zákon nestanovuje jednu lehotu pre všetkých. Rozhoduje segment:

| Segment | Návrh | Odôvodnenie |
| --- | --- | --- |
| Domácnosť (B2C) | **splatnosť v deň vystavenia**, úhrada na mieste kartou, hotovosťou alebo okamžitým prevodom | Pri jednorazovej službe v domácnosti je bežné zaplatiť po dokončení. Žiadny zákon lehotu nevyžaduje. Peniaze prídu skôr a konverzia s hodnotou odíde takmer hneď, čo je pri voľbe „až po úhrade" dôležité. |
| Firma (B2B) | **14 dní**, nastaviteľné | Kratšie než zákonná predvoľba, stále bežné a pre firemného odberateľa prijateľné. |

Zákonné mantinely pre B2B, ak sa nedohodne inak: predvolená splatnosť je
**30 dní** od doručenia faktúry (§ 340a Obchodného zákonníka), dohodou sa dá
predĺžiť **najviac na 60 dní**, dlhšie len výnimočne a nie hrubo nevýhodne pre
veriteľa (§ 340b). Štrnásť dní je teda bezpečne v medziach.

Obe hodnoty idú do `app_settings` (`invoicing.due_days_b2c`,
`invoicing.due_days_b2b`) a na faktúre sa uloží konkrétny dátum, nie počet dní.

### Lehota na vystavenie

Platiteľ DPH musí faktúru vyhotoviť **do 15 dní** odo dňa dodania služby.
Zhodne to hovorí slovenský § 73 aj český § 28 ods. 5 zákona o DPH, takže zmena
firmy toto číslo nezmenila. Zhoda je ale náhodná, preto je lehota od 11. 9.
nastavením `invoicing.issue_deadline_days` a nie konštantou v kóde. Keďže faktúru potvrdzuje kancelária a nie technik, medzi
dokončením zákazky a vystavením vzniká priestor na omeškanie.

Preto: portál musí mať zoznam zákaziek v stave `Done` **bez faktúry**, zoradený
podľa veku, a upozorniť, keď sa niektorá blíži k pätnástemu dňu. Je to lacná
poistka proti pokute a zároveň to chráni meranie, lebo nevystavená faktúra
znamená aj chýbajúcu konverziu.

### E-faktúra od 1. 1. 2027

Od 1. januára 2027 budú tuzemskí platitelia DPH musieť pri dodaní tuzemskej
zdaniteľnej osobe vystavovať faktúry v štruktúrovanom formáte XML podľa
EN 16931 (Peppol BIS). Dobrovoľná fáza beží už v roku 2026.

**Pozor po zmene firmy:** táto povinnosť je slovenská. Na českú firmu dopadá
český režim, ktorý plošnú tuzemskú e-fakturáciu k tomu istému dátumu nezavádza;
celoeurópsky režim podľa ViDA prichádza neskôr. Ktorý z nich platí, závisí od
toho, kde firma nakoniec vznikne a kde bude registrovaná — ďalší dôvod uzavrieť
jurisdikciu skôr než neskôr.

Pre tento plán je to argument navyše za to, že **Billdu zostáva**. Povinnosť sa
týka toho, kto doklad vystavuje; keby sme si fakturáciu postavili sami, museli
by sme do januára 2027 implementovať Peppol. Takto je to problém dodávateľa
fakturačného nástroja. Overiť treba jediné: či Billdu Peppol včas podporí. Ak
nie, mení sa nástroj, nie náš systém, lebo kniha je od neho oddelená.

Faktúr pre domácnosti sa povinnosť netýka, tie zostávajú bežné.

---

## 4. Čo sa mení na webe (`filthyfilter`)

### 4.1 Štruktúrovaný dopyt

Formulár dnes skladá službu, počet jednotiek, termín a expres do textu
(`buildMessage` v `js/main.js`) a API z toho parsuje iba kontakt. Cena, booking
ani report podľa služby sa nad textom postaviť nedajú.

Do tela požiadavky pribudnú polia popri `message`, ktorý zostáva:
`service_code` (kód balíka `FF-`), `unit_count`, `unit_type`, `postcode`,
`preferred_date`, `express` (bool), `brand` (`filthyfilter`).

Formulár potrebuje dve nové viditeľné polia: **PSČ** a **počet jednotiek**.
Zvyšok sa dá odvodiť z už existujúcich polí.

### 4.2 `fbclid` a Meta

`js/attribution.js` zachytáva iba tri Google identifikátory. Meta kampaň je
prvý platený kanál, takže bez `fbclid` je nemerateľná. Pridáva sa do rovnakého
first-touch mechanizmu a do tela dopytu.

Meta Pixel v `js/consent.js` je samostatná položka a je **hotový od 12. 9. 2026,
spí bez id pixela** (`STATUS.md`, `BACKLOG.md` T24). Rozhodnutie o personalizovaných
reklamách ho už neblokuje: zákaz personalizácie je v texte pomenovaný ako googlovský,
lebo Meta rovnaké nastavenie neponúka. Aj bez pixela sa dá merať cez Conversions API
zo servera, čo je aj tak spoľahlivejšie.

### 4.3 WhatsApp odkazy nesú značku a atribúciu

Odkazy dnes vedú na `https://wa.me/421902279094` bez textu. Pri spoločnom čísle
sa z prichádzajúcej správy nedá povedať, ktorej značky sa týka.

Odkaz dostane predvyplnený text s krátkou značkou a atribučným tokenom,
napríklad `?text=FF%20…%20[ref:<token>]`. Token sa vygeneruje na webe, uloží
sa s atribúciou cez existujúci `POST /api/v1/leads` mechanizmus alebo cez novú
odľahčenú cestu, a API ho z textu prvej správy prečíta.

### 4.4 Test proti rozídeniu formulárov

Formulár je na troch stránkach ako tri kópie. Pri štruktúrovaných poliach to
bude bolieť tretíkrát. Do `tests/` pribudne test, ktorý porovná mená polí,
`data-sk`/`data-en` páry a `service_code` hodnoty vo všetkých troch a zlyhá pri
nesúlade. Pravidlo „bez buildu" zostáva.

---

## 5. Čo sa mení v API (`whispair-api`)

Poradie je zámerné: každý krok je samostatne nasaditeľný, aditívny a spätne
kompatibilný.

### Krok 1 — Štruktúrovaný lead

Migrácia: `captured_messages.lead_details JSONB NULL`, `postcode VARCHAR(16) NULL`,
`brand VARCHAR(32) NULL`.

`LeadsService` prijme nové polia, zvaliduje ich proti známym kódom balíkov
a uloží do `lead_details`. Voľný text zostáva; `CapturedMessageParser` sa
nemení a slúži naďalej pre WhatsApp a e-mail.

### Krok 2 — Atribúcia neutrálna k platforme

Migrácia:

- `lead_attribution`: `platform VARCHAR(16) NULL`, `fbclid VARCHAR(512) NULL`,
  `ctwa_clid VARCHAR(512) NULL`.
- `conversion_events`: `platform VARCHAR(16) NOT NULL DEFAULT 'google'`,
  `fbclid VARCHAR(512) NULL`, `ctwa_clid VARCHAR(512) NULL`.

Parsovanie Meta `referral` z WhatsApp webhooku: `messages[].referral` nesie
`ctwa_clid`, `source_url`, `source_id` a `headline`. Dnes to
`whatsapp_parse_inbound` ignoruje. **Dobrá správa: `whatsapp_messages.raw_payload`
je `jsonb` a celé telo webhooku sa už ukladá,** takže sa dá spätne dopočítať
z existujúcich riadkov. Parser sa doplní a napíše sa jednorazový backfill.

Značka pri spoločnom čísle sa určí v tomto poradí: `referral.source_id` podľa
mapy kampaní → token `[ref:…]` v texte prvej správy → doména v `referral.source_url`
→ inak `NULL` a človek ju v portáli doplní. Nikdy sa nehádže.

### Krok 3 — Peniaze na zákazke

Migrácia:

- `job_services`: `id`, `job_id`, `service_package_id NULL`, `package_code`,
  `label`, `quantity NUMERIC(10,2)`, `unit_price_net NUMERIC(12,2)`,
  `vat_rate NUMERIC(5,2)`, `line_net`, `line_vat`, `line_gross`, `sort_order`.
- `jobs`: `price_net`, `price_vat`, `price_gross` (`NUMERIC(12,2) NULL`),
  `vat_mode VARCHAR(24) NULL` (slovník cenového enginu),
  `currency VARCHAR(3) NULL`, `brand VARCHAR(32) NULL`.

Sumy na `jobs` sú odvodené z riadkov a prepočítavajú sa pri každej zmene
riadkov, aby report nemusel agregovať.

### Krok 4 — Účtovná kniha a Billdu

Migrácia:

- `invoices`: `id`, `job_id`, `client_id`, `brand`, `billdu_document_id INT NULL`
  (**unique**), `serial`, `variable_symbol`, `status VARCHAR(24)`
  (`Draft`, `Issued`, `PartiallyPaid`, `Paid`, `Cancelled`, `CreditNoted`),
  `amount_net`, `amount_vat`, `amount_gross`, `currency`, `issue_date`,
  `due_date`, `paid_at TIMESTAMPTZ NULL`, `billdu_synced_at`, `raw_document JSONB`.
- `invoice_payments`: `id`, `invoice_id`, `amount`, `paid_on`, `method`,
  `billdu_payment_key VARCHAR(128)` (**unique s `invoice_id`**, idempotencia).
- `job_costs`: `id`, `job_id`, `label`, `amount_net`, `category`, `note`,
  `created_by`, `created_at`. Ručný zápis; podklad pre maržu neskôr.

Kód:

- `src/Services/BillduClient.php` — podpis, HTTP, retry, mapovanie chýb.
  Konfigurácia `BILLDU_API_KEY`, `BILLDU_API_SECRET`, `BILLDU_BASE_URL` v `.env`.
- `src/Services/InvoicingService.php`:
  - `draft(jobId)` — z `job_services` poskladá položky a sumy, nič neodošle.
  - `issue(jobId, user)` — `POST /documents` typu `invoice`, uloží
    `billdu_document_id`, `serial`, `vs`, nastaví `status='Issued'`.
    Idempotentné: druhé volanie na už vystavenú zákazku vráti existujúci doklad.
  - `send(invoiceId)` — voliteľné odoslanie e-mailom cez Billdu.
- Routy: `GET /api/v1/jobs/{id}/invoice-draft`, `POST /api/v1/jobs/{id}/invoice`,
  `POST /api/v1/invoices/{id}/send`, `GET /api/v1/invoices`.

Klient v Billdu sa páruje cez `clients.billdu_client_id` (nový stĺpec); ak
neexistuje, `InvoicingService` ho najprv založí cez `POST /clients`.

**Kto smie vystaviť.** Faktúru potvrdzuje kancelária, takže právo sa viaže na
rolu (manažér a vyššie), nie na priradenie k zákazke. Technik s rolou
`technician` alebo `senior_technician` vidí návrh, ale tlačidlo nemá. Existujúci
middleware `RequireManager` na to stačí.

**Nastavenia z portálu.** Sadzba DPH a obe predvolené splatnosti sa čítajú
z `app_settings` (`invoicing.vat_rate`, `invoicing.due_days_b2c`,
`invoicing.due_days_b2b`). Na doklade sa uloží výsledná sadzba a konkrétny
dátum splatnosti, nie odkaz na nastavenie.

**Fáza A bez Billdu.** Kým nie sú kľúče, `InvoicingService` beží v režime
`manual`: faktúru vytvorí v knihe, `billdu_document_id` nechá `NULL`
a kancelária doplní číslo dokladu a dátumy z Billdu ručne. Úhrada sa v tomto
režime označí v portáli. Všetko ostatné, vrátane konverzie `invoice_paid`,
funguje rovnako.

**Fáza B s Billdu.** Po doplnení `BILLDU_API_KEY` a `BILLDU_API_SECRET` sa režim
prepne na `billdu`: doklad vzniká cez API a úhrady zisťuje worker. Prepínač je
konfigurácia, nie iná vetva kódu, a už zapísané faktúry z fázy A zostávajú
platné.

### Krok 5 — Zisťovanie úhrad

`cron/billdu_payment_worker.php`, zapísaný do `cron_run_logs` ako ostatné
workery. Beh raz za hodinu stačí.

1. Vyberie `invoices` v stave `Issued` alebo `PartiallyPaid`.
2. `GET /documents/{billdu_document_id}` pre každú (alebo zoznam po stránkach,
   ak je ich veľa).
3. Zapíše nové položky z `payments[]` do `invoice_payments` podľa
   `billdu_payment_key`, prepočíta stav.
4. Keď súčet úhrad dosiahne `amount_gross`, nastaví `status='Paid'`, `paid_at`
   a **emituje konverziu `invoice_paid`**.

### Krok 6 — Konverzia s hodnotou

Migrácia: rozšírenie `CHECK` na `conversion_events.type` o `invoice_paid`
a nový unikátny index na `(invoice_id, type)` pre idempotenciu.
`conversion_events` už má `value`, `currency`, `hashed_email` aj `hashed_phone`,
takže nové stĺpce na peniaze netreba; pribudne len `invoice_id`.

Udalosť `invoice_paid` nesie:

- `value` = `invoices.amount_net` (**netto**, podľa rozhodnutia),
- `currency`,
- identifikátory kliku z `lead_attribution` cez `client_id` a `job_id`,
- hash e-mailu **aj** telefónu. Dnes `job_completed` posiela iba telefón; to sa
  pri novej udalosti opraví.

V Google Ads sa `invoice_paid` stane primárnou konverznou akciou s hodnotou.
`lead_qualified`, `job_created` a `job_completed` zostanú sekundárne, bez hodnoty.

### Krok 7 — Identita zákazníka a opakovaná zákazka

Migrácia: `clients.email`, `clients.phone_normalized` (E.164, unikátny index),
`clients.customer_type`, `clients.acquisition_lead_attribution_id`.

Prvá atribúcia sa pri konverzii leadu na zákazníka skopíruje na zákazníka
a už sa neprepisuje. Druhá zákazka o rok potom vie povedať, z ktorej kampane
zákazník pôvodne prišiel, čo dnes nevie nikto.

### Krok 8 — Meta Conversions API

`cron/meta_conversions_worker.php` ako zrkadlo existujúceho
`google_ads_conversion_worker.php`, pre riadky s `platform='meta'`. Rovnaká
fronta, rovnaké `upload_status`, iný cieľ.

### Krok 9 — Zmazanie legacy emisie

Štyri endpointy duplikujú biznis logiku a emitujú konverzie druhýkrát
(`update_captured_message`, `convert_captured_message_to_job`, `update_job`,
`create_service_contract`). Postup mazania je v `ARCHITECTURE.md`. Kým sa
nespravia, každý zásah do atribúcie je dvojitý.

---

## 6. Poradie nasadenia

Prístup k Billdu API zatiaľ nie je, takže sa nečaká. Rozdelenie na fázy je
navrhnuté tak, aby chýbajúce kľúče neblokovali nič okrem posledného kroku.

**Fáza 1, front lievika (hneď).** Kroky 1 a 2 plus webové zmeny. Nezávisia od
Billdu ani od peňazí a bez nich sa každý deň strácajú dáta, ktoré sa spätne
nedopočítajú. Výnimkou je `ctwa_clid`, ten sa dá dopočítať z uložených tiel
webhooku.

**Fáza 2, peniaze a kniha (hneď po fáze 1).** Kroky 3 až 6 v režime `manual`.
Zákazka dostane cenu, kniha dostane faktúru, kancelária označí úhradu a
konverzia `invoice_paid` odíde s netto hodnotou. **Celý okruh sa uzavrie aj bez
Billdu**, len s ručným zápisom čísla dokladu a úhrady.

**Fáza 3, napojenie Billdu (keď budú kľúče).** `BillduClient`, prepnutie režimu
na `billdu` a worker na úhrady. Nahrádza ručné kroky z fázy 2, nemení schému.

**Fáza 4, upratovanie.** Kroky 7 až 9. Krok 7 čím neskôr, tým viac duplicitných
zákazníkov treba čistiť ručne, takže ho netreba odkladať zbytočne.

Všetko ide najprv na `api-dev` a `dev.filthyfilter.sk` podľa `ENVIRONMENTS.md`
a `DEPLOYMENT.md`. Produkčné nasadenie je samostatná etapa.

---

## 7. Riziká a to, čo si treba ustrážiť

1. **Okno kliku v Google Ads.** Offline konverzia sa dá nahrať len ak je klik
   mladší než približne 90 dní. Pri voľbe „až po úhrade" je reťaz klik → lead →
   zákazka → faktúra → úhrada dlhšia než pri vystavení. Pri čistení klimatizácií
   to má byť dni až týždne, takže rezerva je veľká, ale **faktúra po splatnosti
   90 dní od kliku sa už do Google nedostane**. Worker musí takú udalosť označiť
   a nahlásiť, nie ju ticho zahodiť.

2. **Billdu nemá webhooky.** Úhrada sa dozvie až pri najbližšom behu workera.
   Hodinový interval znamená hodinové oneskorenie konverzie. To je prijateľné,
   ale treba to vedieť.

3. **Billdu je jediný zdroj pravdy o úhrade.** Ak niekto označí faktúru za
   zaplatenú mimo Billdu, konverzia nikdy neodíde. Pravidlo musí byť, že sa
   platby zapisujú v Billdu.

4. **Netto pri neplatiteľovi DPH.** Ak by fakturujúca firma nebola platiteľom
   DPH, netto a brutto sú tá istá suma a nič sa nepokazí. Pri zmene režimu sa
   ale zmení význam hodnoty, takže `vat_mode` musí byť na faktúre uložený,
   nie odvodený pri čítaní.

5. **Spoločné WhatsApp číslo.** Pri organickej správe bez `referral` a bez
   tokenu sa značka určiť nedá. Preto `brand` zostáva `NULL` a nie
   predvolene FilthyFilter; inak sa whispAir zákazky započítajú do zlých kampaní.

6. **Idempotencia.** Doklad sa smie v Billdu vytvoriť raz. Unikátne
   `invoices.billdu_document_id` a kontrola pred `POST` sú povinné, lebo
   dvojitá faktúra je horšia než chýbajúca.

7. **Tajomstvá.** `BILLDU_API_SECRET` je heslo k fakturácii. Patrí do `.env` na
   serveri, nikdy do repozitára a nikdy do logu. Podpis sa loguje, telo nie.

8. **Fáza 2 stojí na disciplíne kancelárie.** Kým Billdu nie je napojené,
   konverzia odíde len vtedy, keď niekto úhradu v portáli označí. Neoznačená
   faktúra znamená kampaň bez tržby v dátach. Zoznam nezaplatených faktúr
   v portáli je preto súčasť fázy 2, nie neskoršia ozdoba.

9. **Lehota pätnástich dní na vystavenie.** Medzi dokončením zákazky a
   potvrdením faktúry kanceláriou je priestor na omeškanie, ktoré je porušením
   zákona o DPH. Upozornenie v portáli je povinná časť, nie voliteľná.

10. **E-faktúra 2027.** Overiť u Billdu, či Peppol podporí včas. Ak nie, mení sa
    fakturačný nástroj; kniha ostáva, lebo je od neho oddelená.

---

## 8. Čo tento plán vedome nerieši

- Náhradu Billdu. PDF plán je pozastavený.
- Cenový engine pre čistenie (`ServiceQuoteEngine`), booking a recenzie. Sú
  v `SYSTEM_REVIEW.md` ako P1 a majú vlastný plán.
- Import nákladov na reklamu a výpočet ROAS v systéme. Bez neho sa ROAS počíta
  ručne z exportu, čo na začiatok stačí.
- ~~Meta Pixel na webe.~~ Hotový 12. 9. 2026, spí bez id pixela (T24).

---

## 9. Čo zostáva otvorené

1. **Predplatné Billdu Premium.** Kľúče sú na dev doplnené a podpis funguje, ale
   účet API nemá (403, viď kapitolu 2). Bez povýšenia sa fáza 3 nespraví.
2. **Číselný rad.** Používateľ 8. 9. rozhodol, že FilthyFilter má mať **vlastný
   rad oddelený od whispAir**. API pre neho nemá pole: `serial` prideľuje Billdu
   podľa nastavenia firmy. Treba teda overiť v Billdu, či jedna firma zvládne
   viac číselných radov. Ak nie, vlastný rad znamená druhú firmu v Billdu, čo
   mení rozhodnutie „jedna firma pre obe značky" z kapitoly 1.
3. **Personalizované reklamy.** Rozhodnutie stále visí, ale **Meta Pixel už
   neblokuje** (hotový 12. 9., `STATUS.md`). Týka sa teda len remarketingových
   zoznamov v Google Ads. Meranie cez Conversions API na ňom nezávisí.
4. **Mapa kampaní pre `referral.source_id`.** Vznikne až so spustením prvej
   Meta kampane. Do tej doby sa značka určuje z tokenu v texte správy.
