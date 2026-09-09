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
- Google Ads Manager účet **WhispAir Ads Manager** je vytvorený s voľbou
  **Manage my accounts**, krajinou Slovakia, menou EUR a časovým pásmom
  `(GMT+02:00) Czechia Time`, ktoré používa rovnaké stredoeurópske pravidlá ako
  Slovensko. Jeho customer ID je `791-494-5272`.
- Servisný účet je v tomto Manager účte pridaný ako používateľ s úrovňou
  **Standard**. Cloud IAM a Ads prístup sú teda obe pripravené.
- Pod Manager účtom je vytvorený reklamný podúčet `116-266-0696`. Google ho
  založil s názvom **WhispAir Ads Manager** a stavom **Draft**. Otvorenie účtu
  vždy presmeruje na povinný onboarding „business information → campaign →
  payment“; kampaň ani payment sa nedokončili.
- V Manager účte je vytvorená prvá cross-account conversion action
  `lead_qualified`, Conversion type ID `7754841584`, zdroj **Import from
  clicks**, bez hodnoty, count One, click-through window 90 dní, engaged-view
  window 3 dni a data-driven attribution. Stav **Needs attention** je očakávaný,
  kým nie je pripojený zdroj a neprídu dáta.
- V `Accounts → Sub-account settings` má podúčet zatiaľ Google Ads conversion
  account `None`. Voľby `Client` aj `This manager` sú sivé; pozorovaný dôvod je
  nedokončený stav Draft. Zdieľanie conversion actions preto zostáva súčasťou
  brány po aktivácii podúčtu.

## Známe identifikátory a plánované mapovanie

| Úloha | Google Ads ID | Stav |
| --- | --- | --- |
| Manager/login account | `7914945272` | vytvorený, servisný účet má Standard access |
| Reklamný podúčet | `1162660696` | Draft, bez kampane a billingu |
| `lead_qualified` action | `7754841584` | vytvorená na Manager účte |

Plán je používať cross-account conversions vlastnené Manager účtom. V tomto
variante je predbežné mapovanie:

```dotenv
GOOGLE_DM_OPERATING_ACCOUNT_ID=7914945272
GOOGLE_DM_LOGIN_ACCOUNT_ID=7914945272
GOOGLE_DM_ACTION_LEAD_QUALIFIED=7754841584
```

Nie je to ešte schválená produkčná konfigurácia. Data Manager vyžaduje, aby
`operatingAccount` vlastnil conversion action; mapovanie sa preto definitívne
potvrdí až úspešným `validateOnly` behom a po prepnutí podúčtu na conversion
account `This manager`. Ak by sa conversion actions neskôr presunuli priamo do
podúčtu, operating ID by bolo `1162660696` a login ID by zostalo
`7914945272`.

## Kde sú kľúče, tokeny a konfiguračné súbory

Táto tabuľka je inventár umiestnení, nie úložisko tajomstiev. Skutočné heslá,
tokeny a obsah JSON kľúčov sa do Gitu nekopírujú.

| Čo | Umiestnenie | Poznámka |
| --- | --- | --- |
| Pôvodný stiahnutý Google service-account JSON | `C:\Users\cukiv\Downloads\whispair-hvac-b8ad356b95e0.json` | Lokálna citlivá kópia; neodosielať do Gitu ani chatu. Po potvrdení bezpečnej zálohy ju možno z Downloads odstrániť. |
| Google Data Manager JSON používaný na DEV | `/home/jg046600/.secrets/google-data-manager.json` | Mimo document rootu; adresár `700`, súbor `600`. |
| DEV API konfigurácia | `/home/jg046600/_sub_whispair_sk/api-dev/.env` | Tu sú `GOOGLE_DM_*` a DEV `JOB_REMINDER_CRON_TOKEN`. |
| Záloha DEV `.env` pred Google DM zmenou | `/home/jg046600/tmp/api-dev-env-before-google-dm-20260909` | Obnova pôvodnej DEV konfigurácie. |
| Produkčná API konfigurácia | `/home/jg046600/_sub_whispair_sk/api/.env` | Produkčné `GOOGLE_DM_*` a produkčný `JOB_REMINDER_CRON_TOKEN`; zatiaľ nedopĺňať Ads aktiváciu. |
| Budúci produkčný Google DM JSON | odporúčané `/home/jg046600/.secrets/google-data-manager-prod.json` | Ešte nie je pripravený; samostatne spravovaný súbor, práva `600`. |
| Lokálny SSH privátny kľúč pre WebHouse | `C:\Users\cukiv\.ssh\id_ed25519_whispair` | Neposielať ani nekopírovať do repozitára. Aktívny SSH port WebHouse sa mení. |
| Google Ads prihlásenie | Google účet `cuk.ivan@gmail.com` | Google Ads nemá osobitné heslo v projekte; prístup je cez Google účet a servisný účet uvedený vyššie. |

Webcron URL obsahuje hodnotu `JOB_REMINDER_CRON_TOKEN` z príslušného `.env`.
V dokumentácii zostáva iba placeholder. Ak token treba dohľadať, číta sa priamo
z DEV alebo PROD `.env`; nekopíruje sa sem. Produkčný a DEV token musia zostať
odlišné.

## Až bude existovať vlastná s. r. o.

1. Pripraviť presné firemné údaje: obchodné meno, sídlo, IČO, DIČ/IČ DPH podľa
   skutočného stavu a osobu oprávnenú konať za firmu.
2. Manager účet už existuje. Po vzniku firmy v ňom doplniť alebo overiť budúcu
   firemnú identitu všade, kde ju Google vyžiada; účet sa nesmie zameniť s
   dnešným reklamným podúčtom v stave Draft.
3. Nemenné nastavenia Manager účtu sú už Slovakia, EUR a stredoeurópske časové
   pásmo. Pri dokončení reklamného podúčtu ich znovu skontrolovať pred každým
   nezvratným potvrdením.
4. Vytvoriť platobný profil typu organizácia na vlastnú s. r. o., doplniť
   fakturačné a daňové údaje a dokončiť prípadné overenie inzerenta. Nevytvárať
   profil na súkromnú osobu iba preto, aby sa obišiel onboarding.
5. Dokončiť a aktivovať reklamný podúčet `116-266-0696` bez vytvorenia kampane
   alebo billingu pod nesprávnou identitou. Názov podúčtu potom opraviť na
   `FilthyFilter SK`.
6. V Manager účte nastaviť tomuto podúčtu Google Ads conversion account
   **This manager**. Dovtedy sú obe možnosti v rozhraní neaktívne.
7. Ads prístup servisného účtu je už hotový. Pred ostrým použitím iba overiť,
   že zostal na Manager účte s úrovňou Standard.
8. V Google Ads vytvoriť päť akcií typu import z CRM/offline import z klikov:

   | Udalosť | Premenná API | Hodnota |
   | --- | --- | --- |
   | kvalifikovaný lead | `GOOGLE_DM_ACTION_LEAD_QUALIFIED` | bez hodnoty; hotové ID `7754841584` |
   | vytvorená zákazka | `GOOGLE_DM_ACTION_JOB_CREATED` | bez hodnoty |
   | dokončená zákazka | `GOOGLE_DM_ACTION_JOB_COMPLETED` | bez hodnoty |
   | predaný balík | `GOOGLE_DM_ACTION_PACKAGE_SOLD` | bez hodnoty |
   | uhradená faktúra | `GOOGLE_DM_ACTION_INVOICE_PAID` | netto hodnota a EUR |

   Do premenných patria identifikátory conversion actions používané Data
   Manager API, nie ich zobrazované názvy. Zostávajú vytvoriť posledné štyri;
   `lead_qualified` už existuje.

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
