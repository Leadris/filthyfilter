# FilthyFilter by whispAir — schválený plán prerábky

Schválené používateľom 5. 9. 2026. Tento súbor je zdrojom pravdy pre Codex, Claude aj ďalšieho vývojára. Pri pokračovaní si prečítaj aj `CLAUDE.md`, skontroluj Git a aktualizuj checklist a odovzdanie nižšie. Nezačínaj už dokončenú etapu odznova.

## Cieľ a rozhodnutia

Zachovať dnešný humor a vizuál FilthyFilter, výrazne zlepšiť predstavenie služieb, dôkazy práce a objednávku. Inšpirácia predajnou štruktúrou: https://vycistimklimu.sk/, https://vycistimklimu.sk/pre-firmy a https://vycistimklimu.sk/realizacie (audit 5. 9. 2026). Vlastné texty a grafické spracovanie; konkurenčné tvrdenia nie sú dôkazom našich schopností.

- Značka: **FilthyFilter by whispAir**. Klimuj.sk nepoužívať. Samostatné spolupráce prídu neskôr.
- Hlavný trh: Slovensko. Pôsobnosť: **Senec a okolie do približne 100 km**; dostupnosť a dopravu potvrdiť podľa konkrétnej adresy. Nejde o automatický výpočet dojazdu ani bezplatnú dopravu.
- Telefón a WhatsApp: **+421 902 279 094**; `tel:+421902279094`, `https://wa.me/421902279094`.
- Email: **info@filthyfilter.sk** (používateľ potvrdil presný názov). Existencia a doručovanie schránky ešte nie sú overené.
- Ceny na dopyt, bez verejného číselného cenníka a cenovej kalkulačky.
- Statické HTML/CSS/JS, bez frameworku, backendu a buildu. **Aktualizované 5. 9. 2026:** doména `filthyfilter.sk` je zaregistrovaná a web ide na jej koreň `https://filthyfilter.sk/`, na tom istom WebHouse účte. Staršia adresa `https://whispair.sk/filthyfilter/` zatiaľ drží predchádzajúce vydanie; jej osud sa rieši samostatne.
- SK ako východiskový jazyk v HTML aj pri prvej návšteve. **Aktualizované 5. 9. 2026: iba SK a EN, holandčina je odstránená.** Zachovať manuálnu voľbu jazyka a jej zapamätanie; obe jazykové verzie ponúkajú rovnakú slovenskú službu.
- Žiadne vymyslené IČO, právna identita, recenzie, štatistiky, certifikácie alebo termíny.

## Git, odovzdanie a nasadenie

- Baseline: anotovaný tag **baseline-v1** na `99b956c85f6c857475340ad7be76914f7d24f003`, pôvodný web pred prerábkou. Commit už bol na `origin/main`.
- Repo: https://github.com/Leadris/filthyfilter ; pracovná vetva **codex/filthyfilter-redesign**.
- Všetky úpravy robiť v tejto vetve, po ucelených etapách commitovať a pushovať. Nezahadzovať zmeny iného agenta; vždy začať `git status` a čítaním aktuálneho odovzdania.
- Výstupom je funkčný lokálny náhľad a pushed vetva. Merge do main a produkčný deploy sú ďalšia etapa po posúdení náhľadu, nie súčasť prvých krokov.
- Produkčný postup je v `docs/DEPLOYMENT.md`. Nezverejňovať dokumentáciu, CLAUDE.md, pracovné nástroje ani .git do webrootu. Overiť email pred nasadením; nezriaďovať DNS ani schránku v rámci úprav webu.

## Vizuál a nová štruktúra

Zachovať čierne pozadie, meď/zlato, Oswald/Inter/Share Tech Mono, technické rámiky, FFFF a animované pozadie. Nezavádzať svetlý redizajn. Čitateľnosť riešiť kontrastom a rozostupmi. Zachovať reduced-motion a GPU rozpočty. Hudba zostane voliteľná cez malé tlačidlo; automatickú plávajúcu zvukovú výzvu odstrániť.

Navigácia: **Služby · Realizácie · Postup · FFFF · Pre firmy · Otázky · Kontakt**. Zachovať existujúce zmysluplné kotvy (`diensten`, `hall`, `werkwijze`, `ffff`, `contact`), doplniť kotvy `pre-firmy`, `faq` a `service-area`. Mobil: kompaktné tlačidlá Zavolať/Nacenenie bez zakrytia obsahu.

Poradie homepage:

1. **Úvod:** FilthyFilter by whispAir. Nadpis „V klíme má bývať chlad. Nie nová civilizácia.“ Text: „Čistenie, údržba a servis klimatizácií pre domácnosti a firmy. Senec a okolie do približne 100 km. Rozsah práce a cenu si dohodneme vopred.“ CTA **Vyžiadať cenovú ponuku** a **Pozrieť výsledok pred/po**. Nepodložené hero čísla odstrániť.
2. **Služby:** karty nižšie; každá má rozsah, „Cena podľa rozsahu“ a CTA predvyberajúce službu v dopyte.
3. **Výsledok pred/po:** existujúca La Donuteria, fotky, stručný rozsah zásahu, preklik na celý spis. Odstrániť päť prázdnych kariet „foto čoskoro“.
4. **Postup:** údaje od zákazníka → dohoda o rozsahu, cene a termíne → zásah → výsledok a odporúčanie ďalšej údržby.
5. **FFFF:** humorná škála 0–5; popis „Naša interná vizuálna škála znečistenia, s poriadnou dávkou nadsádzky.“ Nie mikrobiologické meranie. FFFF 5 nesmie tvrdiť, že práca je mimo našej kompetencie.
6. **Pre firmy:** viac jednotiek, plánovanie podľa prevádzky, dokumentácia, pravidelná údržba na mieru. Termíny mimo prevádzky dohodou, bez garancie 24 h alebo pevnej splatnosti faktúr.
7. **FAQ:** cena; trvanie podľa typu/stavu; ochrana okolia; prítomnosť zákazníka; vonkajšia jednotka; príprava priestoru; rozdiel čistenie/oprava. Odpovede vecné, nepreberať neoverené presné trvania ani univerzálny interval údržby.
8. **Pôsobnosť a kontakt:** región, doprava dohodou, zostavenie dopytu, priame kontakty. Namiesto neoverených otváracích hodín „Termíny po dohode“.

## Ponuka a pravidlá textov

| Služba | Rozsah komunikácie |
| --- | --- |
| Hĺbkové čistenie nástennej jednotky | Filtre, výmenník, ventilátor, dostupné vnútorné časti, odvod kondenzátu a dezinfekcia |
| Hĺbkové čistenie kazetovej jednotky | Vnútorné časti a odtokový systém, rozsah podľa typu a prístupu |
| Preventívna údržba | Kontrola stavu, čistenie filtrov, kontrola odvodu a funkčnosti |
| Diagnostika a servis | Posúdenie zápachu, kvapkania, hlučnosti či nedostatočného chladenia; návrh ďalšieho postupu |
| Pravidelný servis pre firmy | Ponuka podľa počtu jednotiek, typu prevádzky a harmonogramu |

Vonkajšia jednotka je položka podľa prístupu a potvrdenej ponuky; neprezentovať ako automaticky bezplatnú. Opravy a materiál naceniť po diagnostike. Montáž, predaj a partnerské ponuky nie sú súčasťou tejto verzie. Urgentný termín negarantovať.

Humor smerovať na špinu a operatívcov, nie na zákazníka či hygienu prevádzky. Vtipný nadpis → vecné vysvetlenie → skutočný dôkaz → jasné CTA. Podporiť aj prevenciu: „Nemusíš čakať, kým si pleseň založí samosprávu. Čistíme aj preventívne.“

Odstrániť nulové prežitie spór, percentuálnu AI istotu, nejasnú certifikáciu, nedoložené počty jednotiek a medicínske sľuby. „FFFF certifikát“ zmeniť na **terénny report s FFFF skóre**. Neoznačovať každé znečistenie za pleseň bez merania.

La Donuteria zostáva realizáciou s existujúcimi médiami a faktami. Výsledok a starostlivosť prevádzky sú hlavné posolstvo. Jej recenzie nesmú byť vydávané za naše. Odstrániť internú poznámku o Place ID, neoverený odkaz na Google profil realizátora a nahradiť Klimuj.sk značkou whispAir. Ďalšie prípady podľa `docs/HALL_OF_FILTH_CASE_GUIDE.md`.

## Dopyt a technické správanie

Nejde o serverovo odosielaný formulár. Polia: povinná služba (aj „Neviem, potrebujem poradiť“), povinná obec/PSČ, počet jednotiek pri čistení a údržbe (aj „Neviem“), voliteľný problém a preferovaný termín. Počet musí byť celé kladné číslo, ak je zadaný.

**Pokračovať cez WhatsApp** a **Pripraviť email** vytvoria riadne URL-kódovanú správu v zvolenom jazyku. Zákazník dokončí odoslanie vo svojej aplikácii; web nezobrazuje falošné potvrdenie doručenia. Fotografie prikladá až tam. Pridať kopírovanie textu a priamy telefón; pri nedostupnej schránke/clipboard API ponechať viditeľný text na ručné skopírovanie. Údaje dopytu neukladať do localStorage ani neposielať na server.

Kontakty a zostavenie správ držať na jednom mieste v existujúcom JS; HTML má zároveň funkčné priame kontakty aj bez JavaScriptu. Bez nového verejného API. Základné informácie musia zostať čitateľné aj pri zlyhaní skriptov.

Slovenské zdrojové HTML, title, description, OpenGraph, alt a aria popisy. Voľba EN nemení región služby. **Aktualizované 5. 9. 2026: adresár `steden/` je zrušený.** Šesť holandských mestských presmerovaní držalo staré URL z filthyfilter.nl. Na doméne `filthyfilter.sk` také URL nikdy neexistovali, takže nemali čo zachovávať a boli len mätúcim zvyškom. Sitemap obsahuje homepage a existujúci spis. **Aktualizované 5. 9. 2026:** canonical, OpenGraph, sitemap a robots ukazujú na `https://filthyfilter.sk/`; cesty k assetom zostávajú relatívne, aby web fungoval na koreni aj pod podcestou.

## Audit formulára na vycistimklimu.sk (5. 9. 2026)

Zisťované kvôli etape 3. Ich formulár odosielajú na server a má šesť polí v
tomto poradí: **Meno**, **Telefón**, **E-mail**, **Lokalita čistenia** (všetky
povinné), **Typ služby** ako rozbaľovací zoznam a nepovinná **Správa**.
Odoslanie má dve tlačidlá, „Odoslať objednávku →“ a „Odoslať cez WhatsApp“.
Súhlas so spracovaním údajov ani poznámka o súkromí pri formulári nie sú.
Možnosti v type služby: hĺbkové čistenie nástennej, hĺbkové čistenie stropnej,
profylaktický servis stropnej, expresný termín do 24 h, firemný servis dohodou,
iné. Samostatne od formulára majú kalkulačku, ktorá z typu jednotky a počtu
kusov vypočíta orientačnú cenu s DPH.

**Čo z toho preberáme:** poradie od služby cez lokalitu k voľnému popisu, jeden
rozbaľovací zoznam služieb namiesto dlhého zoznamu prepínačov, a druhé tlačidlo
na WhatsApp vedľa hlavného.

**Čo nepreberáme a prečo:**

- **Kalkulačku a orientačnú cenu.** Verejné ceny sú v tomto pláne vylúčené a
  nemáme ich čím podložiť.
- **Expresný termín do 24 h.** Urgentný termín negarantujeme.
- **Povinné meno, telefón a e-mail.** Ich formulár ich potrebuje, lebo inak by
  im prišla anonymná správa na server. My server nemáme. Zákazník dokončuje
  odoslanie vo vlastnom WhatsApse alebo e-maile, takže kontakt dostaneme aj tak
  a pýtať si ho vopred je zbytočné trenie. Meno necháme ako nepovinné pre
  prípad, že si text len skopíruje a pošle inak.

Výsledná zostava polí pre etapu 3, spojená s pôvodným zadaním: typ služby
(povinné, vrátane „Neviem, potrebujem poradiť“), počet jednotiek (vrátane
„Neviem“, inak celé kladné číslo), obec alebo PSČ (povinné), meno (nepovinné),
čo vás trápi (nepovinné), preferovaný termín (nepovinné). Akcie: Pokračovať cez
WhatsApp, Pripraviť e-mail, Kopírovať text, Zavolať.

## Google recenzie (rozhodnuté 5. 9. 2026)

**Situácia:** whispAir je na Google registrovaný ako firma, FilthyFilter nie.
FilthyFilter je pritom samostatná doména a samostatná stránka.

**Rozhodnutie používateľa:** ostáva **jeden profil, whispAir**. FilthyFilter
zostáva značkou čistiacej divízie, nezakladá sa mu vlastný zápis. Do profilu
whispAir treba doplniť službu čistenie klimatizácií. Dôvod: whispAir je podľa
vlastnej stránky klimatizačná firma, teda ten istý odbor, takže hodnotenia sedia
a nerozdeľujú sa medzi dva profily. Dva zápisy tej istej firmy na rovnakej
adrese navyše riskujú zlúčenie alebo pozastavenie.

**Zobrazenie:** len tlačidlo na profil. Žiadne skóre, počty ani citácie na
stránke. Web nemá backend, takže čísla by sa museli udržiavať ručne a starli by
bez povšimnutia. Google Places API sme zamietli, kľúč by bol v prehliadači
verejný a plán zakazuje nové API.

**Stav v kóde:** hotové a nasadené. Blok recenzií je na homepage pri dôkazoch a
rovnaké tlačidlo je v našej karte na spise. Cieľová adresa je v
`CONTACT.reviews` v `js/main.js`, vedľa telefónu, e-mailu a WhatsAppu; keby sa
vyprázdnila, blok aj tlačidlo sa samy skryjú.

Z odkazu, ktorý dal používateľ, sú odstránené parametre `hl`, `entry` a `g_ep`.
Sú viazané na jednu návštevu a na verziu Máp, takže by časom prestali platiť.
Zostala časť s názvom firmy a identifikátorom miesta
`0x476c85d17c386543:0x6daa2776af7e64fc`. Kratší tvar `?cid=` by sa dal odvodiť,
ale overiť, kam vedie, sa nedá bez preklikania súhlasovej steny Google.

**Zostáva používateľovi:** doplniť do profilu whispAir službu čistenie
klimatizácií. Profil je vedený ako montáž a servis, takže na dopyt po čistení
sa nemusí zobraziť.

**Zrušené:** partnerská reputačná karta La Donuteria so skóre 4,7 a viac než 135
hodnoteniami, aj odsek chváliaci donutky a zmrzlinu. Sekcia o prevádzke teraz
vecne opisuje záťaž zákazky. `docs/B2B_TRUST_LAYER.md` je označený za prekonaný.

## Odložené nápady (zapísané 5. 9. 2026, nezačínať bez pokynu)

Používateľ ich chce mať zapísané a vrátiť sa k nim neskôr. Nie sú súčasťou
etáp 3 a 4.

1. **Ohodnoť si vlastnú klímu.** Päť otázok s ikonami, bez písania: kedy sa
   naposledy čistila, či je cítiť zápach, či kvapká, či hučí viac ako predtým,
   a či je v kuchyni, u fajčiara alebo so zvieratami. Výsledkom je skóre
   FFFF/PPPP s vtipným verdiktom a tlačidlo, ktoré otvorí dopyt aj so skóre a
   odpoveďami. Beží celé v prehliadači, nič sa neukladá ani neodosiela.
2. **Posuvník na fotke pred a po.** Dnes je to statická koláž. Ťahacia
   deliaca čiara predĺži čas strávený pri dôkaze. Najlacnejšia z týchto troch.
3. **Hádaj skóre.** Fotka z archívu, návštevník tipne FFFF, odhalíme správnu
   hodnotu a jednou vetou povieme, čo tam naozaj rástlo. Potrebuje aspoň päť
   až šesť odfotených zákaziek; s jedinou realizáciou to nemá z čoho žiť.

Pri všetkých platí, že skóre je naša vizuálna škála s nadsádzkou, nie meranie,
a výsledok nesmie znieť ako diagnóza.

## Etapy a akceptácia

- [x] Overiť čistý strom, remote main a baseline commit.
- [x] Vytvoriť a pushnúť anotovaný tag baseline-v1.
- [x] Založiť codex/filthyfilter-redesign.
- [x] Zapísať úplný plán a pokyny pre Claude.
- [x] **Etapa 1:** značka, kontakty, slovenský predvolený jazyk, pôsobnosť, vyradenie holandských mestských stránok; aktualizovať dokumentáciu. Overiť a pushnúť. *(Mestské stránky boli 5. 9. 2026 zrušené úplne, nielen presmerované.)*
- [x] **Etapa 2:** nový úvod, služby, poradie obsahu, FAQ, firemná ponuka, FFFF texty a očista placeholderov/tvrdení.
- [x] **Etapa 3:** zostavenie dopytu, predvýber služby, WhatsApp/email/kopírovanie, mobilné CTA a nenápadný zvuk.
- [x] **Etapa 4:** výsledné vizuálne a funkčné QA, metadata, odovzdanie náhľadu a push.
- [x] Merge do `main` (`a9088f3`) a produkčný deploy. Zostáva overenie emailovej schránky.

Finálne QA: desktop + 390/768 px, bez horizontálneho scrollu; mobilné menu a CTA neprekrývajú obsah; klávesnica, focus, labely a reduced-motion. Všetky service CTA predvyberajú správny dopyt. Otestovať validáciu, „Neviem“, diakritiku, zmenu jazyka a linky bez reálneho odoslania. Overiť fotografie, video, presmerovania a cesty pod `/filthyfilter/`, title/canonical/OG/sitemap. Vyhľadať Klimuj.sk, holandské kontakty, nulové čísla, neoverené tvrdenia. Zbytočne nepridávať testovaciu infraštruktúru pre textové úpravy; JS správanie overiť zmysluplnými scenármi.

Hotovo znamená, že návštevník z úvodu pochopí službu a región, nájde rozsah a z každej servisnej karty dokáže pripraviť konkrétny dopyt.

## Aktuálne odovzdanie

**5. 9. 2026 — všetky štyri etapy sú hotové.** `main` je na `a9088f3`, ostrá
doména aj staging bežia na `4bd5cc3`.

Web je na koreni `https://filthyfilter.sk/` s platným certifikátom, staging na
`https://dev.filthyfilter.sk/` so zákazom indexovania. Postup vydania, obsah
balíkov a rozdiely stagingu sú v `docs/DEPLOYMENT.md`.

### Čo etapa 4 našla a opravila

Mŕtvy CSS blok po zrušených mestských stránkach, ktorého zvyšné pravidlo
`.faq` potichu ovplyvňovalo nové FAQ. Starú značku `.nl` v hlavičke
`background.js`. Pečať na spise, ktorá stále hovorila „certifikát“ namiesto
„report“. Chýbajúce `og:url` a `og:locale` na spise. Potlačený focus outline na
poliach formulára, ktorý by v režime vysokého kontrastu zmizol. A rozťahané
panely rýchleho výberu na tablete.

### Overené

Žiadny Klimuj.sk, holandské atribúty, `filthyfilter.nl` vo vydaných súboroch,
vymyslené počty ani AI percentá. Všetkých 27 lokálnych odkazov, assetov a
kotiev sedí. Jeden `h1` na stránku, obrázky majú alt alebo sú označené ako
dekoratívne, povinné polia sú označené pre asistenčné technológie a chybové
hlásenia sa ohlasujú. Prekladové atribúty sedia 224 párov na homepage a 56 na
spise, po prepnutí do angličtiny nezostal nepreložený uzol. Médiá na spise sa
načítajú vrátane oboch zdrojov videa. Žiadny horizontálny scroll pri 390, 768
ani 1360 px.

### Čo zostáva

1. **Poslať skúšobný e-mail na `info@filthyfilter.sk`.** Schránka existuje a je
   aktívna, MX aj SPF sedia, ale schránka je prázdna, takže doručenie nikto
   nepotvrdil. Adresa je na webe a používa ju tlačidlo Pripraviť e-mail.
2. **Pozrieť si web na skutočnom telefóne.** Oprava nadpisu je nasadená, ale
   nikto ju na reálnom zariadení nevidel. Chyba sa pôvodne ukázala len tam.
3. **Odložené nápady** vyššie v tomto dokumente, až na pokyn.
4. **Dvojjazyčnosť bez vlastných URL.** Anglická verzia sa prepína iba v
   prehliadači, nemá vlastnú adresu. Google preto indexuje výhradne slovenčinu.
   Ak má angličtina prinášať návštevnosť, treba jej dať vlastnú cestu, napríklad
   `/en/`, a prepojiť ich cez `hreflang`. Je to samostatná etapa, nie oprava.

### Vyriešené 5. 9. 2026

- **Montáž a predaj už nekončia slepo.** Poznámka pod servisnými kartami
  hovorila, že montáž a predaj zariadení nie sú súčasťou ponuky, a tým to
  končilo. Teraz posiela na whispAir. Veta o vonkajšej jednotke zostala
  nedotknutá; plán zakazuje tváriť sa, že jej čistenie je automaticky zadarmo.

  **Poznámka k prekladu:** prekladaný text a odkaz sú zámerne dva samostatné
  uzly. Prepínač jazyka priraďuje `textContent`, takže akékoľvek značky vnorené
  do prekladaného uzla by sa pri prvom prepnutí zmazali. Kým je takýchto miest
  málo, je toto správne riešenie. Ak by ich pribudlo, zaviesť radšej samostatný
  atribút pre HTML než prepisovať celý prepínač.

- **Stará adresa `whispair.sk/filthyfilter/` je zrušená.** Web sa presunul na
  vlastnú doménu, tak sa podcesta zmazala; teraz vracia 404. Záloha posledného
  stavu je na serveri v
  `tmp/whispair-filthyfilter-subpath-final-backup.tar.gz`. Presmerovanie sa
  nenastavilo, staré odkazy sú teda mŕtve. Prepojenie značiek príde neskôr,
  používateľ uvažuje o `cistenie.whispair.sk`.
- **Google profil.** Rozhodnuté je jeden profil, whispAir. Do profilu pribudla
  vedľajšia kategória `Air conditioning repair shop` a služby s čistením;
  hlavná kategória zostáva predajňa, lebo whispAir je primárne predaj a e-shop.
  Telefón 0902 279 094 je spoločný pre obe značky, čo je ďalší dôvod nezakladať
  FilthyFilter samostatne.
