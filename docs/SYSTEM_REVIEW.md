# Technický review: FilthyFilter + whispair-api voči modelu „klik → faktúra → recenzia → ďalšia objednávka“

Zapísané 7. 9. 2026. Review voči skutočnému kódu v `filthyfilter` (vetva
`codex/filthyfilter-redesign`, 98873b5) a `whispair-api` (vetva
`feature/service-package-vat`, a1cbb1e, plus `main` a `wip/installation-slots`).
Benchmark VyčistímKlímu slúži len ako zoznam schopností; ich čísla sa neberú
ako fakt. Nič z tohto dokumentu ešte nie je implementované; je to zadanie.

Poradie prednosti zostáva: pokyny používateľa → `STATUS.md` → `MARKETING_PLAN.md`
→ `REDESIGN_PLAN.md` → tento súbor. Tento súbor opisuje architektúru
a implementačný plán, nie stav; stav sa píše do `STATUS.md`.

Hlavný nález v jednej vete: **cesta klik → lead → zákazka → konverzia do
Google existuje a je overená, ale ide po nej len udalosť, nie peniaze.**
Zákazka nemá cenu, faktúra v systéme neexistuje, takže `job_completed`
odchádza do Google s prázdnou hodnotou a otázka „koľko eur priniesla kampaň“
sa dnes nedá zodpovedať z dát.

---

## A. EXISTING — čo už máme

| Schopnosť | Kde presne |
| --- | --- |
| Zachytenie atribúcie na webe (gclid, gbraid, wbraid, 5× utm, landing_url, referrer, landing_token), first touch, len so súhlasom | `filthyfilter/js/attribution.js`, `js/consent.js` (Consent Mode v2 basic, GTM `GTM-57M8XLQJ`) |
| Udalosti `form_start`, `lead_submitted` (až po 2xx z API), `phone_click`, `whatsapp_click` | `js/main.js` |
| Verejný príjem leadu: honeypot, validácia, limit 5/IP/h, uloženie leadu + atribúcie v jednej transakcii | `POST /api/v1/leads` → `src/Controllers/LeadsController.php`, `src/Services/LeadsService.php`, `src/Repositories/LeadsRepository.php`, `endpoints/_lead_helpers.php`; legacy `endpoints/submit_lead.php` |
| Lead ako entita | tabuľka `captured_messages` (`source='WebLead'`, stavy Open → NeedsDetails → ReadyForJob → JobCreated → Discarded/Archived), `parsed_*` polia |
| Atribučný záznam | tabuľka `lead_attribution` (migrácia `20260619100500`), FK na `captured_message_id`, `client_id`, `job_id` |
| Deterministický parser voľného textu (typ práce, telefón, e-mail, značka, adresa, termín) | `src/Services/CapturedMessageParser.php` |
| Lead → zákazka (dve cesty) | `POST /api/v1/captured-messages/{id}/convert` (`CapturedMessagesService::convert`) a `job_drafts` → `POST /api/v1/job-drafts/{id}/publish` (`JobDraftsService`) |
| Konverzné udalosti | tabuľka `conversion_events` (`lead_qualified`, `job_created`, `job_completed`, `package_sold`; gclid/gbraid/wbraid, hash e-mail/telefón, `upload_status`), `endpoints/_conversion_helpers.php` |
| Emisia udalostí | `CapturedMessagesService` (lead_qualified pri ReadyForJob, job_created pri convert), `JobDraftsService::publish` (job_created), `JobsService::update` (job_completed pri Done), `ServiceContractsService` (package_sold s hodnotou) |
| Nahrávanie konverzií do Google (Data Manager API `events:ingest`, service account, validateOnly, retry) | `cron/google_ads_conversion_worker.php`, `endpoints/_data_manager_helpers.php`, `endpoints/_google_oauth_helpers.php`; `.env` `GOOGLE_DM_*` |
| Ručný CSV export konverzií | `endpoints/export_conversions.php` |
| Zákazky, technici, priradenie, optimistické zamykanie, audit | tabuľky `jobs`, `job_assignments`, `app_users` (roly technician < senior_technician < manager < owner), `audit_logs`; `JobsService`, `JobsRepository` |
| Časová os zákazky s médiami a GPS | `job_timeline_entries` (Text/Photo/Voice/Video/Document, `gps_*`, `marketing_role` Hero/Before/After/Detail/Exclude, `marketing_sort_order`, `marketing_privacy_override`); `POST /api/v1/jobs/{id}/timeline`, `POST /api/v1/jobs/{id}/photos` |
| Marketingový obsah z realizácie (AI výber fotiek, privacy gate, GD render 4:5 a 9:16, schválenie) | `marketing_drafts`, `marketing_draft_photos`, `marketing_assets`, `marketing_caption_templates` (kategória `AcCleaning` existuje); `MarketingDraftsService`, `MarketingVisionService`, `MarketingImageRenderer`; `cron/marketing_draft_worker.php` |
| Zariadenia zákazníka a servisná história | `customer_devices`, `installed_products`, `device_service_plans` (`last_service_at`, `next_service_due_at`), `service_visits` (`visit_type` vrátane `Cleaning`, `checklist_json`, `measurements_json`, `next_recommended_service_at`), `service_visit_attachments` |
| Servisné balíky s cenou, kódom, DPH režimom, verejným názvom a obrázkom | `service_packages` (`price_amount`, `currency`, `price_vat_mode`, `package_code`, `is_published`, `interval_months`, `reminder_days_before`); FF balíky `FF-CIST-NASTENNA`, `FF-CIST-KAZETOVA`, `FF-UDRZBA`, `FF-DIAGNOSTIKA`, `FF-EXPRES-24H` na dev |
| Verejný cenník pre web | `GET /api/v1/service-packages/published`; web ho číta v `js/main.js` nad záložnou tabuľkou `PRICES` |
| Servisné zmluvy s platobným stavom | `service_contracts` (`payment_status` Unpaid/PartiallyPaid/Paid/Waived, `price_amount`) |
| Cenový engine (verzované pravidlá, nemenné verzie a snapshoty, riadky výpočtu, ručný override s dôvodom) | `pricing_rulesets`, `pricing_ruleset_versions`, `pricing_calculations`, `pricing_calculation_lines`, `price_snapshots`; `src/Services/PricingEngine.php`, `PricingService.php`, `ReferencePricePolicy.php`; `/api/v1/pricing/*` |
| Servisná oblasť podľa PSČ, verejný dopyt na jedno PSČ | `service_area_postcodes`, `GET /api/v1/service-areas/lookup`, `scripts/import_service_area_postcodes.php` |
| WhatsApp Cloud API: príjem (HMAC, idempotencia), médiá, odosielanie (fronta, retry), súhlas s marketingovými šablónami, STOP | `endpoints/whatsapp_webhook.php`, `endpoints/_whatsapp_helpers.php`, `endpoints/whatsapp_reply.php`; tabuľky `whatsapp_messages`, `outbound_messages`, `whatsapp_consent`; `cron/whatsapp_outbound_worker.php`, `cron/whatsapp_media_worker.php` |
| Rezervácia termínu (rozpracované, nezlúčené) | vetva `wip/installation-slots`: `installation_slot_holds`, `InstallationSlotsService` (kapacita na deň, prednostný deň, držanie 15 min, `blocked_dates`), verejné `next()`/`hold()` |
| E-shop objednávky s atribučným stĺpcom | `commerce_orders.attribution JSONB` (stĺpec existuje, zatiaľ ho nič nezapisuje) |
| Push notifikácie technikom, pripomienky na zajtra | `push_device_tokens`, `notification_events`, `cron/tomorrow_job_reminders.php` |
| AI tam, kde je to opodstatnené | Groq prepis hlasu (`GroqTranscriptionService`), OpenAI vision pri výbere fotiek, OpenAI pri cenníkoch dodávateľov |
| Testy | `whispair-api/tests/Unit` (PHPUnit, 54 súborov vrátane `ConversionHelpersTest`, `DataManagerHelpersTest`, `LeadHelpersTest`, `WhatsAppHelpersTest`, `PricingEngineTest`); `filthyfilter/tests/browser.test.cjs` (Playwright) |

---

## B. PARTIAL — máme, ale dnešný tvar nestačí

1. **Lead je voľný text.** Web skladá službu, počet jednotiek, termín a expres
   do reťazca `message` (`js/main.js` `buildMessage`) a API ukladá iba
   `parsed_contact_name/phone/email/address/notes`. Kód balíka, počet a typ
   jednotiek, PSČ ani expres neexistujú ako stĺpce. Žiadny cenový engine sa
   nad tým nedá spustiť; človek to musí prečítať.

2. **Hodnota konverzie chýba tam, kde záleží.** `JobsService::update` posiela
   `job_completed` bez `value` a `currency`, lebo `jobs` nemá cenu. Hodnotu
   nesie iba `package_sold`. Google dostane fakt, že sa niečo stalo, nie koľko
   to stálo. Rovnako `job_completed` nemá hash e-mailu, iba telefónu.

3. **Atribúcia žije na leade, nie na zákazníkovi.** `lead_attribution` sa pri
   convert prepojí na `client_id` a `job_id`. Druhá zákazka toho istého
   zákazníka o rok nemá žiadny záznam, z ktorého by sa dalo povedať „tento
   zákazník prišiel z kampane X“. Pre Google je to správne (okno kliku je
   ~90 dní), pre vlastné vyhodnotenie LTV kampane nie.

4. **Google-centrická atribúcia.** `lead_attribution` a `conversion_events`
   poznajú tri Google identifikátory. Používateľ zvolil ako prvý kanál Meta →
   WhatsApp. Meta click-to-WhatsApp reklama posiela vo webhooku pole
   `messages[].referral` (`ctwa_clid`, `source_url`, `source_id`, `headline`),
   ktoré `whatsapp_parse_inbound` **ignoruje**. `fbclid` z webu sa nezachytáva.
   Bez toho sa kampaň, ktorú chcete spustiť ako prvú, nedá zmerať ďalej než
   po počet správ.

5. **WhatsApp je inbox, nie konverzácia.** Každá prichádzajúca správa vytvorí
   nový riadok `captured_messages` (`whatsapp_store_inbound`). Neexistuje
   entita konverzácie ani stav („pýtame sa na počet jednotiek“). Odpoveď sa
   posiela ručne z portálu. Na „WhatsApp ako frontend nad tým istým backendom“
   to nestačí, na ručné vybavovanie áno.

6. **Dva cenové systémy, žiadny pre čistenie.** `service_packages.price_amount`
   je plochý cenník. `PricingEngine` počíta materiál → marža → zľava → DPH nad
   `catalog_listings` a `pricing_calculations.catalog_listing_id` je `NOT NULL`.
   Ani jeden nepozná počet jednotiek, typ, dojazd, expres, B2B ani objemovú
   zľavu. Web má tretiu vrstvu: záložnú tabuľku `PRICES` a expres príplatok
   v kóde. Dobré je, že slovník `vat_mode` je jeden a `pricing_ruleset_versions`
   sú už nemenné, takže sa do nich dá vložiť aj druhý druh pravidiel.

7. **Lokalita je reťazec.** `clients.address` a `jobs.address` sú VARCHAR bez
   PSČ a súradníc. `service_area_postcodes` vie len áno/nie a je pomenovaná
   pre montáže. Mestské landing pages, dojazdová zóna aj plánovanie trasy
   potrebujú lokalitu ako entitu.

8. **Termín bez kapacity.** `jobs.scheduled_start/end` sa zadávajú ručne.
   `InstallationSlotsService` počíta iba e-shopové sloty a v komentári sám
   hovorí, že tímy neexistujú a počet zákaziek nie je signál kapacity.
   Dostupnosť technika, pracovná doba, trvanie práce ani dojazd nie sú
   modelované. GPS existuje len na záznamoch časovej osi, teda spätne.

9. **Zariadenia vznikajú len z montáže.** `ensure_customer_devices_for_installation_job`
   zakladá `customer_devices` iba pri `Installation` + `Done`. Pri čistení
   cudzej jednotky musí zariadenie založiť manažér (`POST /api/v1/customer-devices`
   je `RequireManager`), technik nemôže. `service_visits` má `Cleaning`,
   `checklist_json` aj `measurements_json`, čo je správne miesto pre FFFF/PPPP
   skóre, ale skóre nie je stĺpec a nedá sa podľa neho filtrovať.

10. **Marketingový obsah len z montáží.** `MarketingDraftsService::queueCompletedInstallation`
    sa spúšťa iba pre `type=Installation`. Pred/po z čistenia sa nespracuje,
    hoci role `Before`/`After` a šablóna `AcCleaning` existujú.

11. **Retencia má dáta, nemá motor.** `device_service_plans.next_service_due_at`,
    `service_packages.interval_months` a `reminder_days_before` sa zapisujú, ale
    žiadny cron ich nečíta. `tomorrow_job_reminders` je pre technikov.

12. **Zákazník je meno, telefón, adresa.** `clients` nemá e-mail, typ
    (domácnosť/firma), IČO ani záznam o súhlase. Párovanie pri convert je
    `WHERE phone = :phone` bez normalizácie, hoci `conversion_normalize_phone`
    existuje. `+421 902…` a `0902…` sú dvaja zákazníci.

13. **Súhlas nie je doložený na serveri.** `PRIVACY_IMPLEMENTATION.md` bod 1:
    frontend posiela click ID iba so súhlasom, ale `lead_attribution` nemá
    verziu a čas súhlasu. Pred prvým ostrým exportom to musí existovať.

14. **Legacy a v1 emitujú konverzie dvakrát.** `endpoints/update_captured_message.php`,
    `convert_captured_message_to_job.php`, `create_service_contract.php`,
    `update_job.php` obsahujú tú istú emisiu ako služby v `src/Services`.
    `ARCHITECTURE.md` hovorí, že klienti už legacy nevolajú; kód tam stále je
    a každá zmena atribúcie sa musí robiť na dvoch miestach.

15. **Formulár na webe je trikrát.** Ten istý blok v `index.html`,
    `cistenie-klimatizacie/index.html`, `servis-klimatizacie/index.html`.
    Pridanie štruktúrovaného poľa = tri úpravy (známy dlh v `STATUS.md`).

---

## C. MISSING — čo úplne chýba

| Chýba | Poznámka |
| --- | --- |
| **Faktúra a platba** | V API nie je ani tabuľka. Fakturuje sa v Billdu mimo systému. `plan_nahrady_billdu_whispair.pdf` (18. 7. 2026) navrhuje celú náhradu Billdu v inom stacku (NestJS, Next.js, React Native), čo je v priamom rozpore s `ARCHITECTURE.md` („bez frameworku“) a s pravidlom „nestavaj druhé CRM“. Pozri D.1. |
| **Náklady zákazky a marža** | Nič. `inventory_units.purchase_price` je jediný náklad v systéme a týka sa skladu. |
| **Cenová ponuka ako entita** | Žiadny `quote`: cena sa dohodne v správe alebo telefonicky a nikde sa nezapíše. |
| **Rezervácia/booking pre servis** | Len rozpracované montážne držanie na vetve `wip/installation-slots`. |
| **Dostupnosť technika** | Žiadna tabuľka, žiadny výpočet. |
| **Žiadosť o recenziu a jej sledovanie** | Nič. `B2B_TRUST_LAYER.md` opisuje pravidlá, kód žiadny. |
| **Retenčný worker a „objednať znovu“** | Nič. |
| **Meta Pixel, Meta Conversions API, `fbclid`, `ctwa_clid`** | Nič (Pixel je v `STATUS.md` ako blokujúci pre Meta kampaň). |
| **Import nákladov na reklamu** | Nič. Bez toho sa ROAS nedá spočítať v systéme. |
| **Report atribúcie** | Žiadny endpoint, ktorý by zložil kampaň → leady → zákazky → fakturované → marža. |
| **Meranie hovorov** | `phone_click` je klik; hovor sa zapisuje ručne ako `PhoneNote`. |
| **Mestské stránky** | Len `/cistenie-klimatizacie/` a `/servis-klimatizacie/`; žiadny dátový model lokality. |
| **Verejný endpoint realizácií (Hall of Filth)** | Spis La Donuteria je ručne písané HTML; `marketing_assets` nemajú publikačnú fázu (`publicationUrl` je vždy `null`). |
| **B2B** | Žiadne organizácie, kontakty, sekvencie. |
| **Konverzačný stav pre WhatsApp** | Nič. |
| **Angličtina s vlastnou URL** | Prepína sa len v prehliadači (známe). |

---

## D. ARCHITECTURAL PROBLEMS — kde vzniká dlh

1. **Dva plány na fakturáciu sa vylučujú.** Billdu-náhrada v PDF by znamenala
   tretí backend a druhé CRM. Odporúčanie: **Billdu zostáva fakturačným
   nástrojom**, `whispair-api` dostane iba **účtovnú knihu** (`invoices`,
   `invoice_payments`, `job_costs`) s odkazom na externý doklad. Tým sa dá
   odpovedať na otázku o tržbe a marži bez toho, aby sa stavala fakturácia.
   PDF plán treba označiť za pozastavený, inak sa doň niekto oprie.

2. **Pricing na troch miestach** (B.6). Riešenie nie je štvrté miesto, ale
   jeden `ServiceQuoteEngine` v tom istom rámci ako `PricingEngine`: pravidlá
   v `pricing_ruleset_versions.rules_json` s novým slovníkom krokov, výstup
   v tvare `pricing_calculation_lines`, a web aj WhatsApp aj portál volajú
   ten istý endpoint. Tabuľka `PRICES` v `js/main.js` ostane iba ako záloha
   pre výpadok API, čo už dnes je.

3. **Peniaze nie sú na zákazke.** `jobs` nemá riadky, cenu ani DPH režim.
   Všetko, čo sa o hodnote dá povedať, je v texte alebo v Billdu. Toto je
   najdrahší dlh, lebo bez neho je celý konverzný okruh prázdny.

4. **Adresa ako reťazec** na troch miestach (`clients.address`, `jobs.address`,
   `captured_messages.parsed_address`) bez PSČ. Každá funkcia s geografiou
   (dojazd, mestské stránky, trasa, kapacita) na tom stroskotá.

5. **Legacy endpointy duplikujú biznis logiku** (B.14). Pokiaľ sa nezmažú,
   každý zásah do atribúcie a konverzií je dvojitý. `ARCHITECTURE.md` má
    postup mazania; treba ho vykonať aspoň pre `update_captured_message`,
   `convert_captured_message_to_job`, `update_job`, `create_service_contract`.

6. **Zariadenie viazané na montáž** (B.9). Pre čistenie je zariadenie zákazníka
   primárny objekt (opakovaná služba), nie vedľajší produkt montáže.

7. **Konverzný model pozná len Google.** `conversion_events` nemá `platform`;
   pridanie Meta bude buď kopírovať tabuľku, alebo ju rozšíriť. Rozšíriť teraz
   je lacnejšie.

8. **Marketingový trigger pevne na `Installation`.** Podmienka v kóde, nie
   v dátach; čistenie ako hlavný obsahový zdroj FilthyFilter cez ňu neprejde.

9. **Web bez buildu má tri kópie formulára.** Pri štruktúrovaných poliach
   (P0.1) to bude bolieť tretíkrát. Odporúčanie držať pravidlo „bez buildu“
   pre nasadenie, ale pripustiť **kontrolný test** v `tests/`, ktorý porovná
   tri formuláre a zlyhá pri nesúlade. Lacné a v duchu existujúcich testov.

10. **`commerce_orders.attribution`** je stĺpec bez zapisovateľa. Buď ho
    WooCommerce webhook začne plniť (cookie → hidden field v checkoute), alebo
    prechod FilthyFilter → whispAir zostane nemerateľný (bod 6 v `STATUS.md`).

---

## E. PROPOSED DOMAIN MODEL — porovnané s tým, čo je

Zásada: rozšíriť existujúce tabuľky, nové zakladať len tam, kde entita naozaj
chýba. Názvy nových tabuliek sú návrh.

| Entita zo zadania | Rozhodnutie | Konkrétne |
| --- | --- | --- |
| Lead | **existuje** = `captured_messages` | pridať štruktúru: `lead_details JSONB` (kód služby, počet jednotiek, typ, PSČ, preferovaný termín, expres, zdrojová stránka) + `postcode CHAR(5)`, `locality_id` |
| Customer | **existuje** = `clients` | pridať `email`, `phone_normalized` (E.164, index), `customer_type` (`residential`/`business`), `company_name`, `ico`, `dic`, `ic_dph`, `acquisition_lead_attribution_id` (first touch na úrovni zákazníka), `marketing_consent_at`, `notes` |
| CustomerLocation | **nová** `client_locations` | `client_id`, `label`, `street`, `city`, `postcode`, `lat`, `lng`, `locality_id`, `access_notes` (parkovanie, poschodie, výška montáže), `is_primary`. `jobs.address` zostáva snímkou + `jobs.client_location_id` |
| Contact | **odložiť (P3)** | pre B2B: `client_contacts` (`client_id`, meno, rola, telefón, e-mail, súhlas) |
| MarketingTouch / CampaignAttribution | **existuje** = `lead_attribution` | pridať `platform` (`google`/`meta`/`organic`/`direct`/`referral`), `fbclid`, `ctwa_clid`, `campaign_id`, `adgroup_id`, `keyword_id`, `ad_id`, `consent_version`, `consent_at`, `channel` (`web_form`/`whatsapp`/`phone`/`eshop`) |
| Quote | **nová** `quotes` | `captured_message_id`, `client_id`, `client_location_id`, `pricing_ruleset_version_id`, `inputs_json`, `lines_json` (tvar `pricing_calculation_lines`), `total_net`, `total_vat`, `total_gross`, `vat_mode`, `currency`, `status` (Draft/Sent/Accepted/Declined/Expired), `valid_until`, `sent_via`, `accepted_at`, `public_token` |
| Booking | **rozšíriť** `installation_slot_holds` → `booking_holds` | + `service_kind` (`installation`/`cleaning`/`service`), `quote_id`, `duration_minutes`, `postcode`. Potvrdená rezervácia = `jobs` v stave `Planned` s `quote_id`; samostatná tabuľka bookingov v MVP netreba |
| Job | **existuje** = `jobs` | pridať `quote_id`, `client_location_id`, `postcode`, `locality_id`, `source_channel`, `unit_count`, `estimated_minutes`, `price_net`, `price_vat`, `price_gross`, `vat_mode`, `currency`, `completed_at`, `cancel_reason`. Typ `Service` pokrýva čistenie; ak treba rozlíšiť, `service_kind` a nie nový enum |
| JobService | **nová** `job_services` | `job_id`, `service_package_id`, `package_code` (snímka), `description`, `qty`, `unit_price_net`, `vat_rate`, `line_net`, `line_gross`, `device_id` (voliteľne) |
| Asset / HVACUnit | **existuje** = `customer_devices` | pridať `client_location_id`, `unit_type` (`wall`/`cassette`/`duct`/`floor`/`outdoor`), `mount_height` (`standard`/`high`), `last_cleaned_at`; povoliť technikovi založiť zariadenie z priradenej zákazky |
| JobMedia | **existuje** = `job_timeline_entries` | pridať `device_id`, `capture_phase` (`before`/`during`/`after`) ako dáta, nie iba marketingová rola; `public_use_consent` (súhlas zákazníka so zverejnením) |
| Inspection / Rating | **existuje** = `service_visits` | pridať `filth_rating_before SMALLINT`, `filth_rating_after SMALLINT` (1–5, FFFF/PPPP), `problem_summary_public` (anonymizovaný popis); `visit_type='Cleaning'` už je |
| Invoice | **nová** `invoices` | `job_id`, `client_id`, `provider` (`billdu`/`manual`), `external_id`, `number`, `issued_at`, `due_at`, `net`, `vat`, `gross`, `currency`, `status` (Draft/Issued/Paid/PartiallyPaid/Cancelled/Credited), `paid_at`, `paid_amount`, `pdf_url` |
| Payment | **nová, malá** `invoice_payments` | `invoice_id`, `amount`, `method` (cash/card/transfer/gateway), `paid_at`, `external_ref`. V P1 stačí `invoices.paid_at`; tabuľka v P2 |
| (nové) JobCost | **nová** `job_costs` | `job_id`, `kind` (labor/material/travel/subcontract/other), `amount_net`, `note`, `technician_user_id`, `minutes` — z toho hrubá marža |
| ReviewRequest | **nová** `review_requests` | `job_id`, `client_id`, `channel` (whatsapp/sms/email), `outbound_message_id`, `scheduled_at`, `sent_at`, `follow_up_sent_at`, `link_token`, `clicked_at`, `status` (Scheduled/Sent/Clicked/ProbablyReviewed/Suppressed), `suppressed_reason` |
| Communication | **existuje** = `whatsapp_messages` + `outbound_messages` | pridať do `outbound_messages`: `client_id`, `job_id`, `purpose` (confirmation/reminder/review_request/retention/quote), `channel` (whatsapp/email/sms) — e-mail odosielanie existuje vo `_feedback_helpers.php`, dá sa zovšeobecniť |
| (nové) Conversation | **nová (P2)** `conversations` | `phone`, `client_id`, `captured_message_id`, `state` (JSON stavového automatu), `mode` (`bot`/`human`), `last_inbound_at`, `handover_at` |
| Technician | **existuje** = `app_users` + `job_assignments` | nič nové |
| Availability | **nová (P2)** `technician_availability` | `user_id`, `weekday` alebo `date`, `start_time`, `end_time`, `base_postcode`, `max_minutes` |
| PricingRule | **existuje** = `pricing_rulesets` / `pricing_ruleset_versions` | nový slovník krokov pre služby (F.2), žiadna nová tabuľka |
| (nové) Locality | **nová** `service_localities` | `slug` (`bratislava`), `name_sk`, `name_en`, `kind` (city/district), `center_lat`, `center_lng`, `travel_zone` (0/1/2), `is_published`, `faq_json`, `hero_asset_id`; `service_area_postcodes.locality_id`, `service_area_postcodes.travel_zone` |
| (nové) AdSpend | **nová (P2)** `ad_spend_daily` | `platform`, `account_id`, `campaign_id`, `campaign_name`, `date`, `cost`, `clicks`, `impressions`, `currency`, `imported_at` |

`conversion_events` navyše dostane `platform`, `fbclid`, `ctwa_clid`,
`value_kind` (`revenue_net`/`margin`), `invoice_id`.

---

## F. END-TO-END FLOW — kto vykonáva ktorý krok

```text
1. Google Ads / Meta ad
   └─ URL nesie gclid|gbraid|wbraid alebo fbclid + utm_* (ValueTrack {campaignid} atď.)
      Meta CTWA: reklama otvára WhatsApp priamo, referral ide vo webhooku

2. Landing page (filthyfilter, statická)
   └─ js/consent.js         súhlas, Consent Mode v2, GTM, (Meta Pixel — chýba)
   └─ js/attribution.js     first touch do sessionStorage (+ fbclid — chýba)
   └─ js/main.js            ceny z GET /api/v1/service-packages/published, záloha PRICES
                            (mestské stránky + lokalitné dáta — chýba)

3. Lead
   └─ web:      POST /api/v1/leads → LeadsService → captured_messages + lead_attribution
   └─ WhatsApp: whatsapp_webhook.php → whatsapp_messages + captured_messages (referral — chýba)
   └─ telefón:  ručne POST /api/v1/captured-messages (source PhoneNote)
   └─ štruktúra leadu (služba, jednotky, PSČ) — chýba

4. Quote
   └─ ServiceQuoteEngine nad pricing_ruleset_versions → quotes  — chýba
      volá: web (okamžitá cena), portál (ručná ponuka), WhatsApp (bot v P2)

5. Booking
   └─ booking_holds (z installation_slot_holds) + kapacita z app_settings — chýba pre servis
   └─ potvrdenie: JobDraftsService::publish alebo CapturedMessagesService::convert
      → jobs (Planned) + job_services + conversion_events(job_created)   ← existuje, bez riadkov

6. Job / Technician
   └─ job_assignments, push (tomorrow_job_reminders)                       ← existuje
   └─ whispAirField: timeline Photo before/after (marketing_role), GPS     ← existuje
   └─ customer_devices z čistenia, service_visits + filth_rating          ← čiastočne
   └─ PATCH /api/v1/jobs/{id} status=Done → conversion_events(job_completed)
      + MarketingDraftsService (len Installation — rozšíriť)

7. Invoice / Payment
   └─ Billdu (mimo) → invoices + invoice_payments v API                    — chýba
   └─ job_costs → marža                                                    — chýba
   └─ conversion_events.value = invoices.net                               — chýba

8. Google / Meta spätná väzba
   └─ cron/google_ads_conversion_worker.php → Data Manager API            ← existuje
   └─ Meta CAPI worker                                                     — chýba

9. Review
   └─ review_requests + outbound_messages (šablóna) + cron                 — chýba

10. Retention
   └─ device_service_plans.next_service_due_at → cron → outbound_messages
      → link „objednať znovu“ s tokenom → quote → booking                  — chýba

11. Report
   └─ GET /api/v1/reports/attribution: spend ↔ leads ↔ jobs ↔ invoices ↔ marža — chýba
```

---

## G. GOOGLE ADS A ATRIBÚCIA — vysvetlenie pre vývojára

Toto je jediná kapitola, kde treba rozumieť aj Google, nie len nášmu kódu.
Píšem to tak, ako to reálne beží v našom kóde.

### 1. Čo sa uloží pri návšteve

Reklama pošle návštevníka na URL typu
`https://filthyfilter.sk/cistenie-klimatizacie/?gclid=EAIa…&utm_source=google&utm_campaign=…`.
`gclid` je „Google Click ID“: náhodný reťazec, ktorý Google vie spojiť späť
s konkrétnym klikom, kampaňou, kľúčovým slovom a časom. Bez neho Google nevie,
ktorý klik priniesol čo. `gbraid`/`wbraid` sú náhrady pre iOS, kde `gclid`
niekedy neexistuje.

Na webe sa stane toto (`js/attribution.js`): ak je súhlas s meraním, uložia sa
`gclid|gbraid|wbraid`, päť `utm_*`, vstupná URL bez query a origin referrera do
`sessionStorage` pod `ff_attr_v2`. Prvý dotyk v relácii vyhráva. Bez súhlasu sa
neuloží nič okrem `landing_token` (ktorá stránka).

Súbežne po súhlase GTM načíta Google tag, ktorý si sám uloží cookie `_gcl_aw`
s tým istým `gclid`. Tú cookie používajú **webové** konverzie (bod 4). Naša
`sessionStorage` kópia slúži **offline** konverziám (bod 6). Sú to dve
nezávislé cesty a obe potrebujeme.

**Čo pridať:** do finálnej URL v Google Ads nastaviť „final URL suffix“
`utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}`.
ValueTrack `{campaignid}` Google dosadí sám. Potom `lead_attribution.utm_campaign`
nesie **ID kampane**, nie ručne písaný názov, a dá sa spojiť s exportom nákladov.

### 2. Čo sa uloží pri formulári

`js/main.js` pošle na `POST /api/v1/leads` meno, kontakt, obec, text a všetko
z `ffAttribution.get()`. `LeadsRepository::insert` zapíše v jednej transakcii
`captured_messages` a `lead_attribution` (s `captured_message_id`, `ip_hash`,
`user_agent`). Až po HTTP 2xx web odpáli `lead_submitted` do GTM; GTM ho pošle
Google ako webovú konverziu (spojenie cez cookie `_gcl_aw`).

**Čo pridať:** `consent_version` + `consent_at` do `lead_attribution` (web ich
už pozná z `ff_consent_v2`), `fbclid`, `platform`, a štruktúrované polia leadu.

### 3. Ako sa atribúcia zachová session → customer → job → invoice

Reťaz dnes: `lead_attribution.captured_message_id` → pri convert
`conversion_link_attribution` dopíše `job_id` a `client_id` → pri Done
`conversion_attribution_for_job` nájde riadok a skopíruje click ID do
`conversion_events`.

Kde sa reťaz trhá:

- zákazka vytvorená priamo cez `POST /api/v1/jobs` bez zachytenej správy
  nemá atribúciu (opraviť: v portáli povinne „zdroj“ alebo výber zachytenej správy);
- druhá zákazka zákazníka (opraviť: `clients.acquisition_lead_attribution_id`,
  aby sa dala počítať LTV kampane, ale **neposielať** ju Google ako novú
  konverziu po 90 dňoch, lebo Google ju odmietne);
- faktúra (opraviť: `invoices.job_id`, hodnota konverzie sa berie z nej).

Pravidlo: **`lead_attribution` sa nikdy nemaže ani neprepisuje**, len sa
dopĺňajú väzby. Pri výmaze na žiadosť dotknutej osoby sa maže celý reťazec
(`PRIVACY_IMPLEMENTATION.md` bod 2).

### 4. Čo je primary conversion

V Google Ads má každá konverzná akcia prepínač „primárna“/„sekundárna“.
**Primárne** akcie sa počítajú do stĺpca „Konverzie“ a **na ne sa optimalizuje
Smart Bidding** (Google posúva ponuky tak, aby ich bolo viac). Sekundárne
sa iba zobrazujú.

Odporúčanie pre nás, v troch fázach:

| Fáza | Primárna | Sekundárne |
| --- | --- | --- |
| Štart (prvé týždne) | `lead_submitted` (webová, z GTM) | `phone_click`, `whatsapp_click`, importované `lead_qualified`, `job_created`, `job_completed` |
| Keď má import stabilne dáta (≥ 30 konverzií/mesiac) | importovaná `job_created` | `lead_submitted` prepnúť na sekundárnu, ostatné zostávajú |
| Keď ide hodnota spoľahlivo | `job_completed` **s hodnotou** (stratégia tROAS) | ostatné |

Dôvod poradia: Google potrebuje objem, aby sa učil. Zákaziek je menej než
leadov, tak sa začína leadom a prechádza na kvalitnejší signál, keď je ho dosť.

### 5. Čo je secondary conversion

Akcia, ktorú chceme vidieť, ale nechceme, aby ju Google naháňal. `phone_click`
a `whatsapp_click` musia byť sekundárne navždy (kapitola 7b
`MARKETING_PLAN.md`): sú to úmysly, nie výsledky. Ak by boli primárne, Google
sa naučí privádzať ľudí, ktorí klikajú na telefón a nevolajú.

### 6. Čo vieme posielať späť Google

Cez Data Manager API (`cron/google_ads_conversion_worker.php`) posielame
udalosť s: click ID (`gclid`/`gbraid`/`wbraid`), čas, názov konverznej akcie
(cez `GOOGLE_DM_ACTION_*`), hodnota + mena, hashovaný e-mail a telefón
(„enhanced conversions for leads“: keď click ID chýba, Google skúsi spárovať
hash s prihláseným používateľom). `transactionId` = ID riadku, takže opakované
odoslanie sa nezdvojí.

Čo API vie a my nepoužívame: **úpravy konverzií** (retraction pri storne,
restatement pri zmene sumy). Potrebné, keď hodnota = fakturovaná suma a faktúra
sa dobropisuje. P2.

Obmedzenia: click ID platí ~90 dní od kliku; konverzia staršia ako to sa
neprijme. Hodnotu treba posielať v mene účtu Google Ads (EUR).

### 7. Ako pracovať s conversion value

Hodnota je číslo, ktoré Google pri tROAS delí nákladom na klik. Musí byť
**konzistentná** (vždy to isté: napr. vždy netto bez DPH) a **overiteľná**.

Návrh: `job_completed.value = invoices.net` (fakturovaná suma bez DPH). Kým
faktúra nie je v systéme, dočasne `jobs.price_net` z ponuky. Bez hodnoty je
lepšie **posielať 0 než odhad**, inak si Google naučí nezmysel.

Pri rezervačnom expres príplatku a viacerých jednotkách je hodnota súčet
`job_services`, nie cena balíka.

### 8. Ako neskôr počítať revenue a ROAS

Google **nevracia** náklady kampaní cez Data Manager. Náklady treba dostať k nám
inak: mesačný CSV export z Google Ads (Kampane → Stiahnuť) do `ad_spend_daily`,
alebo neskôr Google Ads API na čítanie (vyžaduje developer token, ktorý sme
pre upload obišli; na čítanie vlastného účtu stačí základný prístup).

Potom je otázka „500 € na kampaň X → koľko fakturovaných eur“ jeden SQL:

```sql
SELECT a.utm_campaign,
       SUM(s.cost)                                   AS spend,
       COUNT(DISTINCT a.captured_message_id)         AS leads,
       COUNT(DISTINCT a.job_id)                      AS jobs,
       COALESCE(SUM(i.net), 0)                       AS invoiced_net,
       COALESCE(SUM(i.paid_amount), 0)               AS paid,
       COALESCE(SUM(i.net) - SUM(c.amount_net), 0)   AS gross_margin
FROM lead_attribution a
LEFT JOIN invoices  i ON i.job_id = a.job_id
LEFT JOIN job_costs c ON c.job_id = a.job_id
LEFT JOIN ad_spend_daily s ON s.campaign_id = a.utm_campaign AND s.date BETWEEN … AND …
WHERE a.platform = 'google'
GROUP BY a.utm_campaign;
```

Preto je dôležité, aby `utm_campaign` niesol `{campaignid}` (bod 1): spája
naše dáta s exportom Google bez ručného prepisovania názvov.

### 9. Ako ešte lepšie pracovať s maržou

Krok 1: `job_costs` (práca v minútach × sadzba, materiál, dojazd). Marža =
`invoices.net − Σ job_costs`. Krok 2: v Google **druhá konverzná akcia**
„Job Margin“ (sekundárna), kam ide marža ako hodnota; tržba zostáva v
„Job Completed“. Tak vidíte obe a kedykoľvek prepnete, na ktorú sa optimalizuje.
Nemiešať obe do jednej akcie. Alternatíva bez druhej akcie: „conversion value
rules“ v Google Ads (násobenie podľa geo/zariadenia) — hrubé, neodporúčam.

### 10. Čo musí byť implementované teraz, aby sa to nezablokovalo

1. ValueTrack v final URL suffix (nastavenie v Google Ads, nie kód).
2. `lead_attribution`: `consent_version`, `consent_at`, `platform`, `fbclid`,
   `ctwa_clid`, `campaign_id`, `adgroup_id`, `keyword_id`.
3. `conversion_events`: `value`, `currency` pri `job_completed` (z `jobs.price_net`
   dnes, z `invoices.net` neskôr), `hashed_email`, `platform`, `invoice_id`.
4. `jobs.price_*` + `job_services`, aby hodnota mala odkiaľ prísť.
5. `invoices` aspoň ako ručný zápis v portáli.
6. `clients.acquisition_lead_attribution_id` a normalizovaný telefón.
7. WhatsApp `referral` do atribúcie (pre Meta kampaň, ktorá ide prvá).
8. Nikdy nemazať `lead_attribution` mimo GDPR výmazu.

---

## H. PRIORITY

### P0 — foundation (teraz; neskôr sa to prerába draho)

| # | Čo | Prečo teraz |
| --- | --- | --- |
| P0.1 | Štruktúrovaný lead: `captured_messages.lead_details JSONB`, `postcode`; web posiela `service_code`, `unit_count`, `unit_type`, `preferred_date`, `express`, `postcode` ako polia | bez toho nie je cenový engine, booking ani report podľa služby |
| P0.2 | Atribúcia neutrálna k platforme + súhlas: rozšírenie `lead_attribution` a `conversion_events`; WhatsApp `referral`; `fbclid` na webe; `clients.acquisition_lead_attribution_id` | Meta kampaň je prvá; súhlas musí byť doložený pred prvým exportom |
| P0.3 | Peniaze na zákazke: `job_services`, `jobs.price_*`, `vat_mode`; `job_completed.value` | konverzný okruh je bez toho prázdny |
| P0.4 | Účtovná kniha: `invoices`, `job_costs` s ručným zápisom v portáli; PDF plán Billdu označiť ako pozastavený | odpovedá na otázku o tržbe a marži; zabráni tretiemu backendu |
| P0.5 | Identita zákazníka: `clients.email`, `phone_normalized`, `customer_type`, firemné polia; párovanie cez normalizovaný telefón | inak vznikajú duplicity a retencia nemá koho osloviť |
| P0.6 | Lokalita ako dáta: `service_localities`, `client_locations`, PSČ na `jobs`, `service_area_postcodes.locality_id/travel_zone` | mestské stránky, dojazd aj kapacita to potrebujú |
| P0.7 | Zmazať legacy emisiu konverzií (4 súbory) podľa postupu v `ARCHITECTURE.md` | jeden zapisovateľ pre atribúciu |

### P1 — MVP FilthyFilter (na reálny launch)

| # | Čo |
| --- | --- |
| P1.1 | `ServiceQuoteEngine` + `quotes` + verejný `POST /api/v1/public/quotes` (rate limit); web ukáže cenu hneď po zadaní obce, typu a počtu jednotiek; portál tvorí ponuku tým istým |
| P1.2 | Dostupnosť pre servis: `booking_holds`, `GET /api/v1/public/availability?kind=cleaning&postcode=`, kapacita z `app_settings` (`cleaning.max_minutes_per_day`, `working_weekdays`, `blocked_dates`); potvrdenie = zákazka `Planned` z ponuky |
| P1.3 | Technik: zariadenie z čistenia (`customer_devices` pre technika na priradenej zákazke), `service_visits` s `filth_rating_before/after`, checklist v `checklist_json`; marketingový trigger aj pre `Service` |
| P1.4 | Faktúra: pri `Done` portál vyžiada číslo a sumy z Billdu (ručne), zapíše `invoices`; `job_completed` dostane hodnotu |
| P1.5 | `review_requests` + `cron/review_request_worker.php`: 2 dni po Done šablóna WhatsApp (vyžaduje schválenú Meta šablónu) s fallbackom e-mail; sledovanie odoslania, follow-upu a kliku cez `link_token` |
| P1.6 | Meta Pixel v `js/consent.js`, WhatsApp v mobilnej lište, `LocalBusiness` JSON-LD (už v `STATUS.md`) |
| P1.7 | Tri mestské stránky (Bratislava, Trnava, Nitra) ako ručné HTML z jednej šablóny; dynamické časti (počet realizácií, najbližší termín, recenzie) z `GET /api/v1/public/localities/{slug}` |
| P1.8 | Test v `tests/`, ktorý zlyhá, keď sa tri kópie formulára rozídu |
| P1.9 | Telefónny lead: v portáli/aplikácii rýchly zápis so `source=PhoneNote` a povinným `lead_details.service_code` |

### P2 — automation (odstráni ručnú prácu po rozbehu)

| # | Čo |
| --- | --- |
| P2.1 | Retenčný worker: `next_service_due_at − reminder_days_before` → `outbound_messages` (`purpose=retention`) s odkazom `/objednat-znova/?t=<token>`, ktorý predvyplní ponuku z `customer_devices` a `client_locations` |
| P2.2 | Meta Conversions API worker (zrkadlo Google workera) pre `conversion_events.platform='meta'` s `fbclid`/`ctwa_clid` |
| P2.3 | `ad_spend_daily` import (CSV z Google Ads a Meta) + `GET /api/v1/reports/attribution` |
| P2.4 | WhatsApp vedený tok: `conversations` so stavovým automatom (služba → jednotky → PSČ → foto → cena → termín), deterministický, s prepnutím na človeka slovom alebo tlačidlom; človek vždy dostupný |
| P2.5 | Technická dostupnosť: `technician_availability`, odhad trvania (`unit_count × minúty + dojazd zo zóny`), automatické priradenie |
| P2.6 | Úpravy konverzií (storno, dobropis) do Google |
| P2.7 | Publikačná fáza `marketing_assets` → verejný `GET /api/v1/public/cases` pre Hall of Filth a mestské stránky |
| P2.8 | `commerce_orders.attribution` z WooCommerce (prechod na whispAir) |
| P2.9 | Import z Billdu (ak má export/API), inak zostáva ručný zápis |

### P3 — optimization

| # | Čo |
| --- | --- |
| P3.1 | AI klasifikácia a extrakcia z voľného textu WhatsApp/e-mail do `lead_details` s deterministickým fallbackom na `CapturedMessageParser`; nikdy nerozhoduje o cene ani termíne |
| P3.2 | B2B: `organisations`, `client_contacts`, `outreach_sequences`; **najprv právne posúdenie** (`MARKETING_PLAN.md` kap. 5 bod 6); zdroj kontaktov len verejné registre a vlastné obhliadky, žiadny scraping osobných údajov |
| P3.3 | Trasa a „mini robotky“: `jobs.is_flexible`, okno dní, dopĺňanie podľa `client_locations.lat/lng` a GPS technika |
| P3.4 | Hodnota = marža ako bidding signál (druhá akcia „Job Margin“) |
| P3.5 | Google Business Profile API: počet recenzií denne → `review_requests.status='ProbablyReviewed'` |
| P3.6 | Angličtina s vlastnou URL a `hreflang` |

---

## I. IMPLEMENTATION PLAN — malé kroky

Každý krok je samostatne nasaditeľný a spätne kompatibilný (aditívne
migrácie, nullable stĺpce). Poradie zodpovedá P0 → P1.

### Krok 1 — Štruktúrovaný lead (P0.1)

- **Cieľ:** lead nesie službu, počet a typ jednotiek, PSČ, termín, expres ako dáta.
- **Komponenty:** `filthyfilter/js/main.js` (3× formulár), `whispair-api`
  `_lead_helpers.php`, `LeadsRepository`, `CapturedMessagesService`, portál (zobrazenie).
- **Migrácia:** `captured_messages ADD lead_details JSONB NULL, postcode CHAR(5) NULL`; index na `(postcode)`.
- **Backend:** `extract_lead_details()` whitelist (`service_code` musí byť existujúci `package_code`, `unit_count` 1–50, `unit_type` z enumu, `preferred_date` dátum, `express` bool); text správy sa ďalej skladá ako doteraz (technik ho číta).
- **Frontend:** formulár pridá `unit_type` (nástenná/kazetová/neviem) a PSČ; posiela polia vedľa `message`.
- **Testy:** `LeadHelpersTest` pre whitelist; `browser.test.cjs` pre payload.
- **Riziká:** tri kópie formulára; app whispAirField musí ignorovať neznáme polia (JSON, robí to).

### Krok 2 — Atribúcia pre Meta a súhlas (P0.2)

- **Cieľ:** jeden atribučný riadok bez ohľadu na platformu, so súhlasom.
- **Komponenty:** `js/attribution.js`, `_lead_helpers.php`, `_whatsapp_helpers.php`, `_conversion_helpers.php`, `ClientsRepository`.
- **Migrácia:** `lead_attribution ADD platform, fbclid, ctwa_clid, campaign_id, adgroup_id, keyword_id, ad_id, consent_version, consent_at, channel`; `conversion_events ADD platform, fbclid, ctwa_clid`; `clients ADD acquisition_lead_attribution_id`.
- **Backend:** `whatsapp_parse_inbound` číta `messages[].referral` a pri vzniku `captured_messages` založí `lead_attribution` (`platform='meta'`, `channel='whatsapp'`); `platform` sa odvodí z click ID a `utm_source`; pri convert sa `acquisition_lead_attribution_id` nastaví, ak je zákazník nový.
- **Frontend:** `PARAMS` + `fbclid`; payload + `consent_version`, `consent_at`.
- **Integrácie:** Google Ads final URL suffix s ValueTrack (nastavenie účtu).
- **Testy:** `WhatsAppHelpersTest` s referral payloadom; `LeadHelpersTest`.
- **Riziká:** `referral` prichádza len pri prvej správe z reklamy; ďalšie správy ho nemajú, preto sa viaže na telefón v okne 24 h.

### Krok 3 — Peniaze na zákazke (P0.3)

- **Cieľ:** zákazka má riadky, cenu a DPH režim; `job_completed` má hodnotu.
- **Komponenty:** `JobsService`, `JobsRepository`, `JobDraftsService`, `CapturedMessagesService`, portál (editor riadkov), whispAirField (iba čítanie).
- **Migrácia:** `job_services` (nová); `jobs ADD price_net, price_vat, price_gross, vat_mode, currency, completed_at`.
- **Backend:** riadky sa predvyplnia z `service_packages` podľa `lead_details.service_code`; `record_conversion_event('job_completed', value = price_net)`; `hashed_email` z `clients.email`.
- **Frontend:** portál: riadky na zákazke; aplikácia: zobrazenie sumy.
- **Testy:** `ConversionHelpersTest` na value; kontraktový test `JobSyncContractTest` (nové polia nullable).
- **Riziká:** MAUI sync feed musí prežiť nové stĺpce; kontrola `JobSyncRepository`.

### Krok 4 — Účtovná kniha (P0.4)

- **Cieľ:** fakturovaná suma, platba a náklady na zákazke.
- **Komponenty:** nový `InvoicesController/Service/Repository`, portál.
- **Migrácia:** `invoices`, `job_costs` (obe nové); `conversion_events ADD invoice_id, value_kind`.
- **Backend:** `POST /api/v1/jobs/{id}/invoices` (manager+), `PATCH .../invoices/{id}` (paid); pri zápise faktúry sa hodnota `job_completed` prepíše z `invoices.net` (ak ešte nebola nahratá) alebo sa vytvorí úprava (P2.6).
- **Frontend:** portál formulár s číslom z Billdu a sumami.
- **Integrácie:** žiadne; Billdu zostáva.
- **Testy:** stavový automat faktúry.
- **Riziká:** dvojité vedenie (Billdu + náš zápis). Zámerne minimálne polia.

### Krok 5 — Zákazník a lokalita (P0.5, P0.6)

- **Migrácia:** `clients ADD email, phone_normalized, customer_type, company_name, ico, dic, ic_dph, marketing_consent_at`; unikátny index `(phone_normalized)` čiastočný; `client_locations`; `service_localities`; `service_area_postcodes ADD locality_id, travel_zone`; `jobs ADD client_location_id, postcode, locality_id`.
- **Backend:** `ClientsRepository::findByPhone` cez `conversion_normalize_phone`; backfill `phone_normalized`; `import_service_area_postcodes.php` rozšíriť o lokalitu a zónu (41 obcí z bežiaceho pruhu).
- **Riziká:** duplicitní zákazníci pri backfille; riešiť reportom, nie automatickým zlúčením.

### Krok 6 — Zrušenie legacy emisie (P0.7)

- Zmazať `endpoints/update_captured_message.php`, `convert_captured_message_to_job.php`, `update_job.php`, `create_service_contract.php` a ich riadky v `index.php`; `scripts/smoke-test.ps1` po nasadení. Predtým overiť access log, ako káže `ARCHITECTURE.md`.

### Krok 7 — ServiceQuoteEngine a ponuka (P1.1)

- **Cieľ:** jedna cenová logika pre web, WhatsApp, portál, technika a faktúru.
- **Komponenty:** nový `src/Services/ServiceQuoteEngine.php` (čistý, bez DB), `QuotesService`, `PricingService` (načítanie aktívnej verzie), `js/main.js`.
- **Migrácia:** `quotes`; `pricing_rulesets ADD kind ('product'|'service')`.
- **Pravidlá (rules_json, príklad):**
  ```json
  { "kind": "service", "currency": "EUR", "vat": { "rate": 0.23 },
    "steps": [
      { "type": "package_base",   "per": "unit" },
      { "type": "unit_type",      "multipliers": { "wall": 1, "cassette": 1.63, "duct": 1.8 } },
      { "type": "volume_discount","from": 2, "percent": 10 },
      { "type": "travel_zone",    "amounts": { "0": 0, "1": 15, "2": 30 } },
      { "type": "mount_height",   "amount": 20 },
      { "type": "express",        "package_code": "FF-EXPRES-24H" },
      { "type": "customer_type",  "business_percent": 0 },
      { "type": "vat" }, { "type": "rounding", "to": 1 }, { "type": "total" } ] }
  ```
  Základ vždy z `service_packages.price_amount` podľa kódu; engine nikdy
  nemá čísla v kóde.
- **Backend:** `POST /api/v1/public/quotes` (rate limit ako leady, vracia riadky a súčet, uloží `quotes` so stavom Draft a `public_token`); `POST /api/v1/quotes` (manager) pre ručnú ponuku; ponuka sa pri booking zamrazí do `job_services`.
- **Frontend:** po vyplnení obce/PSČ, typu a počtu web ukáže „orientačne X €“ z API; záloha `PRICES` zostáva.
- **Testy:** `ServiceQuoteEngineTest` s tabuľkou prípadov (1 nástenná BA, 3 kazetové Nitra expres, B2B).
- **Riziká:** verejná cena musí sedieť s textom „od“; DPH 23 % overiť voči aktuálnej sadzbe pri implementácii, nie preberať z tohto príkladu.

### Krok 8 — Dostupnosť a booking pre servis (P1.2)

- Zovšeobecniť vetvu `wip/installation-slots`: premenovať na `booking_holds` s `service_kind`, kapacita v minútach na deň, verejný `GET /api/v1/public/availability`, `POST /api/v1/public/bookings` (z `quote.public_token`) → `job_drafts` alebo rovno `jobs Planned` s `source_channel='web'`; potvrdenie manažérom zostáva ako dnes pri e-shope.
- **Riziká:** vetva nebola overená; najprv ju zlúčiť samostatne, potom rozširovať.

### Krok 9 — Technik a hodnotenie (P1.3)

- `customer_devices` pre technika na priradenej zákazke (nová routa alebo uvoľnenie `RequireManager` na `Authenticate` + kontrola priradenia v službe); `service_visits ADD filth_rating_before, filth_rating_after, problem_summary_public`; `job_timeline_entries ADD device_id, capture_phase, public_use_consent`; `MarketingDraftsService::queueCompleted*` podľa `service_visits`, nie typu zákazky.
- whispAirField: obrazovka START → pred → skóre → checklist → po → DONE (mimo tento repozitár).

### Krok 10 — Recenzie (P1.5)

- **Migrácia:** `review_requests`; `outbound_messages ADD client_id, job_id, purpose, channel`.
- **Backend:** `cron/review_request_worker.php`: kandidáti = `jobs Done` pred ≥ 2 dňami, bez požiadavky, s `whatsapp_consent` opt_in alebo e-mailom; follow-up po 7 dňoch, max 1; `GET /r/{token}` presmeruje na Google odkaz a zapíše `clicked_at`.
- **Pravidlá:** žiadne filtrovanie podľa spokojnosti, žiadna odmena (`B2B_TRUST_LAYER.md`).
- **Integrácie:** Meta schválenie šablóny správy; Google Place ID (otvorené).
- **Riziká:** bez schválenej šablóny WhatsApp neodíde; e-mail fallback musí existovať od začiatku.

### Krok 11 — Mestské stránky (P1.7)

- `GET /api/v1/public/localities/{slug}` (počet realizácií, priemerný FFFF, najbližší voľný deň, počet recenzií ak je Place ID); tri HTML stránky z jednej šablóny; `LocalBusiness` + `areaServed`; `sitemap.xml`.
- **Riziká:** obsah musí byť odlišný (referencie, FAQ, dojazd), inak je to práve ten spam, ktorý nechceme.

### Krok 12 — Retencia (P2.1)

- `cron/retention_reminder_worker.php`; token `objednat-znova`; predvyplnená ponuka z `customer_devices`; po zákazke čistenia sa `device_service_plans.next_service_due_at` nastaví na `+interval_months` balíka.

### Krok 13 — Report a náklady (P2.3)

- `ad_spend_daily`, import CSV cez portál; `GET /api/v1/reports/attribution?from&to&platform` s SQL z kapitoly G.8; portál tabuľka kampaň → leady → zákazky → fakturované → zaplatené → marža.

### Krok 14 — Meta CAPI (P2.2) a úpravy konverzií (P2.6)

- Worker podľa vzoru `google_ads_conversion_worker.php`, spoločná fronta `conversion_events` filtrovaná podľa `platform`; retraction pri `invoices.status='Credited'`.

---

## Čo z benchmarku vedome neberieme

- Stovky mestských stránok. Tri mestá s vlastným obsahom, ďalšie podľa dát.
- Pohoda API. Fakturácia je Billdu; my vedieme len knihu.
- B2B scraping s Playwrightom. Legálne posúdenie predtým, dáta len z verejných registrov.
- AI pri cene, termíne a stave. Deterministické pravidlá, AI len pri texte.
- Ich čísla ako ciele.

## Otvorené rozhodnutia pre používateľa

1. Billdu: potvrdiť, že plán náhrady v PDF sa **pozastavuje** a API vedie len účtovnú knihu.
2. Kto zapisuje faktúru do portálu po zákazke (technik alebo kancelária) a do kedy.
3. Hodnota konverzie: netto bez DPH (odporúčané) alebo brutto.
4. Meta: číslo WhatsApp Business a či bude spoločné s whispAir (ovplyvňuje `referral` aj šablóny).
5. Ktorým mestom sa začína (opakuje sa zo `STATUS.md`).
