# Google Ads: podmienka ostrého nasadenia

**Stav 9. 9. 2026:** rozpracované a zámerne pozastavené do vzniku vlastnej
s. r. o. Kampaň, platobný profil ani finálne prepojenie účtov sa teraz
nedokončujú pod dočasnou alebo cudzou firemnou identitou.

Táto brána blokuje **plánované ostré nasadenie marketingového funnelu,
zapnutie Google Ads workera na produkcii a spustenie platenej Google Ads
kampane**. Neblokuje neodkladné bezpečnostné opravy ani opravy chýb webu.
Release sa nesmie označiť ako „Google Ads produkcia hotová“, kým nie sú splnené
všetky body nižšie.

## Čo je už pripravené

- Google Cloud projekt: `whispair-hvac`.
- Data Manager API je zapnuté.
- Servisný účet:
  `whispair-data-manager@whispair-hvac.iam.gserviceaccount.com`.
- JSON kľúč je na DEV serveri mimo document rootu ako
  `/home/jg046600/.secrets/google-data-manager.json`, adresár má práva `700`
  a súbor `600`. Kľúč ani jeho obsah nepatrí do Gitu.
- DEV API používa
  `GOOGLE_DM_SERVICE_ACCOUNT_FILE=/home/jg046600/.secrets/google-data-manager.json`
  a `GOOGLE_DM_VALIDATE_ONLY=1`.
- Google Ads worker a deväťdesiatdňová expirácia sú nasadené na `api-dev`.
  Migrácia `20260909042547__conversion_click_window_expiry` je na DEV aplikovaná
  a kontrolný test prešiel.
- Webcron pre DEV worker je založený. Má bežať raz denne, odporúčane
  `15 1 * * *`; nastavenie `* 1 * * *` by ho spúšťalo každú minútu počas jednej
  hodiny a treba ho opraviť.
- Worker je dovtedy bezpečne neaktívny: bez Ads account ID a conversion action
  ID skončí ako `not_configured` a nič do Google neodošle.

Rozpracovaný Google Ads signup ukázal obrazovku na vytvorenie **Manager účtu**,
nie kampane. Zobrazené číslo účtu sa zatiaľ nepovažuje za finálny
`OPERATING_ACCOUNT_ID` ani `LOGIN_ACCOUNT_ID`, kým nie je účet dokončený a jeho
rola overená priamo v Google Ads.

## Až bude existovať vlastná s. r. o.

1. Pripraviť presné firemné údaje: obchodné meno, sídlo, IČO, DIČ/IČ DPH podľa
   skutočného stavu a osobu oprávnenú konať za firmu.
2. Dokončiť Google Ads/Manager účet pod touto firmou. Pri Manager účte určenom
   na vlastné reklamné účty zvoliť **Manage my accounts**, nie správu cudzích
   klientov.
3. Pred potvrdením skontrolovať nemenné nastavenia: billing country
   **Slovakia**, mena **EUR** a časové pásmo pre Bratislavu/Central European
   Time. Samotný nápis „Czechia Time“ sa nepotvrdzuje bez overenia, že ide o
   správne stredoeurópske pásmo účtu.
4. Vytvoriť platobný profil typu organizácia na vlastnú s. r. o., doplniť
   fakturačné a daňové údaje a dokončiť prípadné overenie inzerenta. Nevytvárať
   profil na súkromnú osobu iba preto, aby sa obišiel onboarding.
5. Vytvoriť alebo pripojiť reklamný účet, ktorý bude prijímať konverzie.
   Zapísať jeho zákaznícke ID bez pomlčiek ako `GOOGLE_DM_OPERATING_ACCOUNT_ID`.
6. Ak bude servisný účet pridaný cez Manager účet, zapísať ID Manager účtu bez
   pomlčiek ako `GOOGLE_DM_LOGIN_ACCOUNT_ID`. Ak bude pridaný priamo do
   reklamného účtu, táto premenná zostane prázdna.
7. Pridať servisný účet
   `whispair-data-manager@whispair-hvac.iam.gserviceaccount.com` ako používateľa
   Google Ads účtu alebo nadradeného Manager účtu s oprávnením nahrávať
   konverzie. Google Cloud IAM rola sama osebe prístup do Google Ads nedáva.
8. V Google Ads vytvoriť päť akcií typu import z CRM/offline import z klikov:

   | Udalosť | Premenná API | Hodnota |
   | --- | --- | --- |
   | kvalifikovaný lead | `GOOGLE_DM_ACTION_LEAD_QUALIFIED` | bez hodnoty |
   | vytvorená zákazka | `GOOGLE_DM_ACTION_JOB_CREATED` | bez hodnoty |
   | dokončená zákazka | `GOOGLE_DM_ACTION_JOB_COMPLETED` | bez hodnoty |
   | predaný balík | `GOOGLE_DM_ACTION_PACKAGE_SOLD` | bez hodnoty |
   | uhradená faktúra | `GOOGLE_DM_ACTION_INVOICE_PAID` | netto hodnota a EUR |

   Do premenných patria identifikátory conversion actions používané Data
   Manager API, nie ich zobrazované názvy.

## Povinný postup DEV → PROD

1. Doplniť account ID a všetkých päť action ID najprv iba do `api-dev/.env`.
   Nechať `GOOGLE_DM_VALIDATE_ONLY=1`.
2. Opraviť DEV Webcron na jeden denný beh a spustiť kontrolovanú testovaciu
   udalosť s platným testovacím klikom. Overiť odpoveď Data Manager API aj
   záznam `google_ads_conversion_worker` v `cron_run_logs`; nesmie tam byť
   `not_configured`, chyba oprávnení ani chyba destination/action ID.
3. Až po úspešnom validačnom behu nastaviť na DEV
   `GOOGLE_DM_VALIDATE_ONLY=0` a potvrdiť jeden skutočný upload bez duplicity.
4. Pred produkčným API deployom urobiť databázovú a súborovú zálohu, nasadiť
   overený commit a spustiť všetky čakajúce migrácie. Overiť najmä migráciu
   `20260909042547__conversion_click_window_expiry`.
5. Pre produkciu uložiť samostatne spravovaný JSON kľúč mimo document rootu,
   s právami `700/600`. Nekopírovať tajomstvá do repozitára ani do URL.
6. Do produkčného `.env` doplniť všetky `GOOGLE_DM_*` hodnoty a začať s
   `GOOGLE_DM_VALIDATE_ONLY=1`. Produkčný `JOB_REMINDER_CRON_TOKEN` musí byť iný
   ako DEV token.
7. Založiť produkčný Webcron raz denne, odporúčane `15 1 * * *`:
   `https://api.whispair.sk/cron/google_ads_conversion_worker.php?token=<PROD_JOB_REMINDER_CRON_TOKEN>`.
   Skutočný token sa do dokumentácie ani Gitu nezapisuje.
8. Na produkcii vykonať validačný beh a skontrolovať `cron_run_logs`. Až potom
   nastaviť `GOOGLE_DM_VALIDATE_ONLY=0`, vykonať prvý ostrý upload a overiť, že
   sa udalosť v API označila `Uploaded` a objavila sa v diagnostike Google Ads.
9. Až po tomto overení možno spustiť Google Ads kampaň a označiť Google Ads časť
   produkčného funnelu za hotovú.

## Release rozhodnutie

Pred plánovaným ostrým marketingovým release musí byť v release poznámke
výslovne uvedené jedno z nasledovného:

- **Google Ads gate SPLNENÝ** — všetky kroky vyššie sú overené na DEV aj PROD;
  worker beží denne a kampaň možno aktivovať, alebo
- **Google Ads gate NESPLNENÝ** — release nesmie zapnúť produkčný Google Ads
  worker, prepnúť `GOOGLE_DM_VALIDATE_ONLY` na `0`, spustiť Google Ads kampaň
  ani tvrdiť, že celý marketingový funnel je produkčne dokončený.

Ak ide iba o urgentnú opravu webu, release môže pokračovať s druhým stavom,
ale musí potvrdiť, že nemení Google Ads premenné, Webcron ani kampaň.
