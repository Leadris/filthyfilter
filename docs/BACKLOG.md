# Backlog: meranie a životný cyklus zákazky

Zapísané 8. 9. 2026. Jedna úloha na jeden krok, aby sa dali brať po jednej a
nezávisle. Stav projektu je v `STATUS.md`, architektúra a odôvodnenia
v `LIFECYCLE_IMPLEMENTATION.md` a `SYSTEM_REVIEW.md`. Keď je úloha hotová, píše
sa to do `STATUS.md`, nie sem; tu sa len odškrtne.

**Vlastník** hovorí, kto to spraví: *ty* znamená účet alebo rozhodnutie, ku
ktorému nemám a nemám mať prístup, *ja* znamená kód.

Hotové fázy 1 a 2 sú na dev. Tento zoznam je všetko ostatné.

---

## Blokujúce: bez toho meranie nedobehne do konca

### T1 — Konverzná akcia `invoice_paid` v Google Ads
**Vlastník:** ty · **Blokuje:** T2, celý prínos fázy 2 · **Závisí od:** T3

Fáza 2 zapisuje udalosť s peniazmi, ale worker ju do Google neodošle, lebo typ
udalosti sa mapuje na konverznú akciu cez premennú prostredia a pre `invoice_paid`
žiadna neexistuje. Založ v Google Ads konverznú akciu typu **import z CRM,
so sledovaním konverzií z klikov a s hodnotou**.

**Hotové, keď:** akcia existuje a jej identifikátor je v `.env` API ako
`GOOGLE_DM_ACTION_INVOICE_PAID`.

### T2 — Štyri pôvodné konverzné akcie
**Vlastník:** ty · **Závisí od:** T3

Pre `lead_qualified`, `job_created`, `job_completed` a `package_sold`. Rovnaký
typ ako T1, ale **bez hodnoty**: peniaze nesie iba `invoice_paid`.

**Hotové, keď:** štyri identifikátory sú v `.env` ako `GOOGLE_DM_ACTION_*`.

### T3 — Data Manager API a servisný účet
**Vlastník:** ty · **Blokuje:** T1, T2

Zapnúť Data Manager API v Google Cloud projekte `whispair-hvac` a pridať
`firebase-adminsdk-fbsvc@whispair-hvac.iam.gserviceaccount.com` ako používateľa
účtu Google Ads.

**Hotové, keď:** worker prejde jedno volanie s `validateOnly` bez chyby oprávnení.

### T4 — Obrazovky v portáli pre peniaze
**Vlastník:** ja · **Repozitár:** `whispAirPortal` · **Blokuje:** reálne používanie fázy 2

API na ocenenie zákazky, návrh dokladu, vystavenie a označenie úhrady existuje
a je otestované, ale kancelária nemá kam klikať. Treba štyri veci: ocenenie
zákazky riadkami, náhľad dokladu s tlačidlom vystaviť, zápis úhrady a zoznam
hotových zákaziek bez dokladu s odpočtom do pätnástich dní.

**Hotové, keď:** manažér vie v portáli oceniť zákazku, vystaviť doklad, označiť
úhradu a vidí zoznam zákaziek po termíne na vystavenie.

---

## Meta a WhatsApp

### T5 — Worker pre Meta Conversions API
**Vlastník:** ja · **Repozitár:** `whispair-api` · **Závisí od:** nič

Identifikátory z Meta sa už zbierajú a ukladajú, ale neodchádzajú nikam.
`cron/meta_conversions_worker.php` ako zrkadlo existujúceho Google workera, pre
riadky s `platform='meta'`. Rovnaká fronta, rovnaké `upload_status`, iný cieľ.

**Hotové, keď:** udalosť s `fbclid` alebo `ctwa_clid` prejde na Meta v testovacom
režime a `upload_status` sa prepne.

### T6 — Rozhodnutie o personalizovaných reklamách
**Vlastník:** ty · **Blokuje:** T7

Dnes je `ad_personalization` v `js/consent.js` natvrdo zamietnutý aj po súhlase,
takže v Google Ads nevzniknú remarketingové zoznamy. Zmena znamená prepísať aj
vetu v banneri a odsek na stránke o údajoch, čo je právny text.

**Hotové, keď:** povieš áno alebo nie.

### T7 — Meta Pixel na webe
**Vlastník:** ja · **Repozitár:** `filthyfilter` · **Závisí od:** T6

Pixel musí ísť **do** `js/consent.js`, aby prešiel súhlasom, nie vedľa neho.
Meranie zo servera (T5) na ňom nezávisí; pixel pridáva dáta z prehliadača
a možnosť optimalizácie na udalosti na stránke.

**Hotové, keď:** pixel sa nenačíta pred súhlasom a po súhlase posiela `PageView`.

### T8 — Tlačidlo WhatsApp v mobilnej lište — **hotové 8. 9. 2026**
**Vlastník:** ja · **Repozitár:** `filthyfilter` · **Závisí od:** nič

Plávajúca lišta na mobile má len „Zavolať" a „Nacenenie". Hlavný kanál plánovanej
kampane teda nemá trvalé tlačidlo. Platí pre všetky tri stránky a chráni to test
z `tests/forms.test.cjs`.

**Hotové, keď:** lišta má tri tlačidlá na všetkých troch stránkach a odkaz nesie
predvyplnený text so značkou.

Splnené: tretie tlačidlo je na všetkých troch stránkach, nesie
`data-contact="whatsapp"` a predvyplnený riadok „Dopyt z filthyfilter.sk“
(v angličtine „Enquiry from filthyfilter.sk“), z ktorého si API číta značku.
Podrobne v `STATUS.md`.

### T9 — Schválenie šablón správ v Meta
**Vlastník:** ty · **Blokuje:** žiadosti o recenziu a retenciu

Bez schválenej šablóny sa mimo 24-hodinového okna nedá poslať nič.

**Hotové, keď:** aspoň jedna šablóna pre žiadosť o recenziu je schválená.

### T10 — Mapa kampaní pre `referral.source_id`
**Vlastník:** ja · **Závisí od:** spustenej prvej Meta kampane

Značka sa dnes určuje z cieľovej adresy reklamy a z textu správy, čo funguje.
Číslo konkrétnej reklamy sa ale na značku naviazať nedá, kým mapa neexistuje.

**Hotové, keď:** správa z reklamy dostane značku podľa čísla reklamy, nielen
podľa adresy.

### T11 — Rozhodnutie o katalógu Meta
**Vlastník:** ty

Päť balíkov je zverejnených a zaradených do fronty na synchronizáciu s katalógom
Meta, s **placeholder obrázkami**. Worker nikdy nebežal, takže zatiaľ neodišlo
nič. Ak sa spustí teraz, odídu tam tie placeholdery.

**Hotové, keď:** povieš, či sa fronta má spustiť, a s akými obrázkami.

---

## Kvalita dát: bez toho meranie klame

### T12 — Identita zákazníka
**Vlastník:** ja · **Repozitár:** `whispair-api`

`clients` nemá e-mail, normalizovaný telefón ani príznak firma/domácnosť. Tri
dôsledky, všetky reálne: **každá faktúra dnes dostane splatnosť domácnosti**,
lebo segment neexistuje; konverzia nesie len hashovaný telefón, hoci podľa
e-mailu párujú Google aj Meta lepšie; a druhá zákazka toho istého zákazníka
nevie, z ktorej kampane pôvodne prišiel.

Migrácia: `clients.email`, `phone_normalized` (E.164, unikátne),
`customer_type`, `acquisition_lead_attribution_id`.

**Hotové, keď:** firemná zákazka dostane štrnásťdennú splatnosť, konverzia nesie
oba hashe, a prvá atribúcia sa pri konverzii leadu skopíruje na zákazníka.

### T13 — Stráženie deväťdesiatdňového okna
**Vlastník:** ja · **Repozitár:** `whispair-api`

Google prijme offline konverziu, len ak je klik mladší než približne deväťdesiat
dní. Pri voľbe „hodnota až po úhrade" je reťaz dlhšia a faktúra po dlhej
splatnosti sa už nenahrá. Worker to musí označiť a nahlásiť, nie ticho zahodiť.

**Hotové, keď:** taká udalosť skončí s vysvetľujúcou chybou a objaví sa v logu
behu, nie v tichu.

### T14 — Zmazanie starej emisie konverzií
**Vlastník:** ja · **Repozitár:** `whispair-api`

Štyri endpointy duplikujú biznis logiku a emitujú konverzie druhýkrát
(`update_captured_message`, `convert_captured_message_to_job`, `update_job`,
`create_service_contract`). Kým existujú, každý zásah do atribúcie treba robiť
dvakrát. Postup mazania je v `ARCHITECTURE.md`.

**Hotové, keď:** endpointy sú preč a testy prechádzajú.

---

## Billdu

### T15 — Povýšenie účtu na Premium
**Vlastník:** ty · **Blokuje:** T17

Overené volaním: účet vracia `403 API not available for your subscription level`.
Podpis aj kľúče sú v poriadku, chýba len plán.

**Hotové, keď:** čítanie dokladov cez API vráti dvestovku.

### T16 — Číselný rad oddelený od whispAir
**Vlastník:** ty · **Blokuje:** T17

Rozhodol si, že FilthyFilter má mať vlastný rad. API na to nemá pole, číslo
prideľuje Billdu podľa nastavenia firmy. Over v Billdu, či jedna firma zvládne
viac radov. Ak nie, vlastný rad znamená druhú firmu, čím padá skoršie rozhodnutie
o jednom účte pre obe značky.

**Hotové, keď:** vieme, či sa robí jeden účet s dvomi radmi, alebo dva účty.

### T17 — Napojenie Billdu (fáza 3)
**Vlastník:** ja · **Závisí od:** T15, T16

`BillduClient` s podpisom, vystavovanie dokladu z portálu a hodinový worker na
zisťovanie úhrad. Nahrádza ručné kroky z fázy 2 a nemení schému. Doklad sa smie
vytvoriť raz; unikátne `invoices.billdu_document_id` to drží.

**Hotové, keď:** doklad vznikne z portálu v Billdu a úhrada sa v knihe objaví
sama, bez ručného zápisu.

---

## Neskôr, nič neblokuje

### T18 — Import nákladov na reklamu a report návratnosti
**Vlastník:** ja

`ad_spend_daily` z CSV exportu Google Ads a Meta, k tomu endpoint, ktorý zloží
kampaň → leady → zákazky → fakturované. Dovtedy sa návratnosť počíta ručne
z exportu, čo na začiatok stačí.

### T19 — WhatsApp ako vedený dialóg
**Vlastník:** ja

Dnes je to schránka: každá správa založí nový záznam, neexistuje stav dialógu
a odpovedá sa ručne. Na ručné vybavovanie stačí, na objem nie. Deterministický
stavový automat služba → jednotky → PSČ → cena → termín, s prepnutím na človeka
kedykoľvek.

---

## Poradie, ktoré odporúčam

1. **T1 až T3** naraz, sú tvoje a odblokujú všetko okolo Google.
2. **T4**, lebo bez portálu je fáza 2 nepoužiteľná.
3. **T5** (T8 hotové), tá zostáva na otvorenie Meta kampane.
4. **T12**, kým je zákazníkov málo a duplicity sa ešte dajú čistiť.
5. Zvyšok podľa toho, čo sa uvoľní.
