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
| Účet v Billdu | **Jedna firma pre obe značky** | Jeden `apiKey`, jeden číselný rad. Značka sa nesie na zákazke a v popise položky, nie v účte. |
| Hodnota konverzie | **Netto bez DPH** | Do Google aj Meta ide základ dane. ROAS porovnáva tržbu s nákladom rovnakej povahy. |
| Kedy sa hodnota posiela | **Až po úhrade** | Peniaze nesie nová udalosť `invoice_paid`. `job_completed` zostáva míľnikom bez hodnoty. Pozri riziko 10.2. |
| Vystavenie faktúry | **Návrh, človek potvrdí** | Systém pripraví položky a sumy, portál ich ukáže, tlačidlo vytvorí doklad v Billdu. |
| WhatsApp číslo | **Spoločné pre obe značky** | Jedno WABA číslo. Značka sa musí odvodiť, nie predpokladať. Pozri krok 2.4. |

---

## 2. Billdu API: čo naozaj vie

Overené 8. 9. 2026 proti oficiálnej špecifikácii
(`github.com/billduapp/api_documentation`, `apiary.apib`).

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

## 3. Čo sa mení na webe (`filthyfilter`)

### 3.1 Štruktúrovaný dopyt

Formulár dnes skladá službu, počet jednotiek, termín a expres do textu
(`buildMessage` v `js/main.js`) a API z toho parsuje iba kontakt. Cena, booking
ani report podľa služby sa nad textom postaviť nedajú.

Do tela požiadavky pribudnú polia popri `message`, ktorý zostáva:
`service_code` (kód balíka `FF-`), `unit_count`, `unit_type`, `postcode`,
`preferred_date`, `express` (bool), `brand` (`filthyfilter`).

Formulár potrebuje dve nové viditeľné polia: **PSČ** a **počet jednotiek**.
Zvyšok sa dá odvodiť z už existujúcich polí.

### 3.2 `fbclid` a Meta

`js/attribution.js` zachytáva iba tri Google identifikátory. Meta kampaň je
prvý platený kanál, takže bez `fbclid` je nemerateľná. Pridáva sa do rovnakého
first-touch mechanizmu a do tela dopytu.

Meta Pixel v `js/consent.js` je samostatná položka a **čaká na rozhodnutie
o personalizovaných reklamách** (`STATUS.md`). Bez pixelu sa dá merať cez
Conversions API zo servera, čo je aj tak spoľahlivejšie.

### 3.3 WhatsApp odkazy nesú značku a atribúciu

Odkazy dnes vedú na `https://wa.me/421902279094` bez textu. Pri spoločnom čísle
sa z prichádzajúcej správy nedá povedať, ktorej značky sa týka.

Odkaz dostane predvyplnený text s krátkou značkou a atribučným tokenom,
napríklad `?text=FF%20…%20[ref:<token>]`. Token sa vygeneruje na webe, uloží
sa s atribúciou cez existujúci `POST /api/v1/leads` mechanizmus alebo cez novú
odľahčenú cestu, a API ho z textu prvej správy prečíta.

### 3.4 Test proti rozídeniu formulárov

Formulár je na troch stránkach ako tri kópie. Pri štruktúrovaných poliach to
bude bolieť tretíkrát. Do `tests/` pribudne test, ktorý porovná mená polí,
`data-sk`/`data-en` páry a `service_code` hodnoty vo všetkých troch a zlyhá pri
nesúlade. Pravidlo „bez buildu" zostáva.

---

## 4. Čo sa mení v API (`whispair-api`)

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
  `POST /api/v1/invoices/{id}/send`, `GET /api/v1/invoices` (manažér a vyššie).

Klient v Billdu sa páruje cez `clients.billdu_client_id` (nový stĺpec); ak
neexistuje, `InvoicingService` ho najprv založí cez `POST /clients`.

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

## 5. Poradie nasadenia

Kroky 1 a 2 sú front lievika a dajú sa nasadiť hneď; bez nich sa dáta strácajú
každý deň. Kroky 3 až 6 sú jeden celok: samostatne nasadené nedávajú zmysel,
lebo peniaze bez faktúry a faktúra bez úhrady neuzavrú okruh. Krok 7 sa dá
spraviť kedykoľvek, ale čím neskôr, tým viac duplicít treba čistiť ručne.
Kroky 8 a 9 sú upratovanie, ktoré nič neblokuje.

Všetko ide najprv na `api-dev` a `dev.filthyfilter.sk` podľa `ENVIRONMENTS.md`
a `DEPLOYMENT.md`. Produkčné nasadenie je samostatná etapa.

---

## 6. Riziká a to, čo si treba ustrážiť

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

---

## 7. Čo tento plán vedome nerieši

- Náhradu Billdu. PDF plán je pozastavený.
- Cenový engine pre čistenie (`ServiceQuoteEngine`), booking a recenzie. Sú
  v `SYSTEM_REVIEW.md` ako P1 a majú vlastný plán.
- Import nákladov na reklamu a výpočet ROAS v systéme. Bez neho sa ROAS počíta
  ručne z exportu, čo na začiatok stačí.
- Meta Pixel na webe. Čaká na rozhodnutie o personalizovaných reklamách.

---

## 8. Čo ešte potrebujem vedieť

1. **Je pre účet Billdu dostupné API v aktuálnom pláne?** Kľúč a tajomstvo sú
   pod Settings → API a vidí ich iba vlastník. Ak tam sekcia nie je, celý
   krok 4 padá a faktúra sa zapisuje ručne.
2. **Sadzba DPH a číselný rad.** Ktorý rad má FilthyFilter používať a či je
   sadzba jednotná pre všetky služby.
3. **Splatnosť.** Koľko dní má byť predvolená `maturity_date`.
4. **Kto v portáli faktúru potvrdzuje** a či to má robiť technik z terénu alebo
   kancelária.
