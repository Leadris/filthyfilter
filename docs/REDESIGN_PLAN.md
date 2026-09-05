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

## Etapy a akceptácia

- [x] Overiť čistý strom, remote main a baseline commit.
- [x] Vytvoriť a pushnúť anotovaný tag baseline-v1.
- [x] Založiť codex/filthyfilter-redesign.
- [x] Zapísať úplný plán a pokyny pre Claude.
- [x] **Etapa 1:** značka, kontakty, slovenský predvolený jazyk, pôsobnosť, vyradenie holandských mestských stránok; aktualizovať dokumentáciu. Overiť a pushnúť. *(Mestské stránky boli 5. 9. 2026 zrušené úplne, nielen presmerované.)*
- [x] **Etapa 2:** nový úvod, služby, poradie obsahu, FAQ, firemná ponuka, FFFF texty a očista placeholderov/tvrdení.
- [ ] **Etapa 3:** zostavenie dopytu, predvýber služby, WhatsApp/email/kopírovanie, mobilné CTA a nenápadný zvuk.
- [ ] **Etapa 4:** výsledné vizuálne a funkčné QA, metadata, odovzdanie náhľadu a push.
- [ ] Neskôr: overenie emailovej schránky, posúdenie náhľadu, merge/deploy podľa samostatného zadania.

Finálne QA: desktop + 390/768 px, bez horizontálneho scrollu; mobilné menu a CTA neprekrývajú obsah; klávesnica, focus, labely a reduced-motion. Všetky service CTA predvyberajú správny dopyt. Otestovať validáciu, „Neviem“, diakritiku, zmenu jazyka a linky bez reálneho odoslania. Overiť fotografie, video, presmerovania a cesty pod `/filthyfilter/`, title/canonical/OG/sitemap. Vyhľadať Klimuj.sk, holandské kontakty, nulové čísla, neoverené tvrdenia. Zbytočne nepridávať testovaciu infraštruktúru pre textové úpravy; JS správanie overiť zmysluplnými scenármi.

Hotovo znamená, že návštevník z úvodu pochopí službu a región, nájde rozsah a z každej servisnej karty dokáže pripraviť konkrétny dopyt.

## Aktuálne odovzdanie

**5. 9. 2026 — Claude, etapa 2 dokončená; nasadenie pripravené, nie dokončené.**
Commit `cf5b605` na vetve `codex/filthyfilter-redesign`.

### Nové rozhodnutia používateľa (nadraďujú staršie znenie plánu)

- Web má byť **výrazne bližšie predajnej štruktúre `vycistimklimu.sk`**, ale
  humor a tmavý medený vizuál zostávajú naše.
- **Iba slovenčina a angličtina.** Holandčina je odstránená celá, nie odložená.
- **Doména `filthyfilter.sk` je zaregistrovaná** a beží na tom istom WebHouse
  účte ako projekty whispAir. Web ide na **koreň novej domény**, nie pod
  podcestu. Canonical, OpenGraph, sitemap a robots už ukazujú na
  `https://filthyfilter.sk/`. Cesty k assetom zostali relatívne.

### Hotové v tejto etape

- Nové poradie homepage: úvod so schváleným nadpisom a dvoma CTA, päť
  servisných kariet, dôkaz pred/po vyššie, postup, prečo my, FFFF, sekcia pre
  firmy, FAQ, pôsobnosť a kontakt.
- Odstránené nepodložené tvrdenia: hero čísla 500+ a 0 spór, AI percentá,
  päť prázdnych kariet „foto čoskoro“, samoudelená certifikácia. „FFFF
  certifikát“ je teraz **terénny report s FFFF skóre**; FFFF 5 už netvrdí, že
  práca je mimo našej kompetencie.
- Servisné CTA predvyplnia WhatsApp alebo e-mail so správnou službou v
  zvolenom jazyku. Skladá sa to na jednom mieste v `js/main.js`; obyčajné
  `wa.me` a `mailto` odkazy zostávajú ako fallback bez JavaScriptu. Stránka nič
  neukladá ani sama neodosiela.
- Holandčina preč: 197 atribútov `data-nl`, tlačidlo NL, holandské metadáta a
  holandský text v starých mestských presmerovaniach.
- Plávajúca zvuková výzva odstránená; hudba zostáva dobrovoľná cez malé
  tlačidlo. Zmazané aj jej CSS a nepoužívané CSS starých kariet Hall of Filth.
- Pridané: mobilná lišta Zavolať/Nacenenie, FAQ akordeón, štýly servisných
  kariet. Verzia CSS/JS `?v=whispair-sales-1`.

### Overené

`node --check js/main.js`, lokálny náhľad na `127.0.0.1:8080`. V prehliadači:
prepnutie SK↔EN vrátane titulku a description, päť predvyplnených WhatsApp
odkazov so správnou diakritikou, sedem FAQ položiek, žiadny horizontálny scroll
pri 1280 px ani 375 px, mobilná CTA lišta a zvukové tlačidlo sa neprekrývajú,
nula zvyškov `data-nl`. Snímky obrazovky boli čierne kvôli WebGL plátnu v
zachytávacom prehliadači; rozloženie je overené cez DOM, nie okom. **Vizuálnu
kontrolu v skutočnom prehliadači ešte treba spraviť.**

### Nasadenie — hotové

Commit `cf5b605` je nasadený na `http://filthyfilter.sk/`, document root
`/home/jg046600/www_root_filthyfilter_sk`. Overenie a rollback archív sú
zapísané v `docs/DEPLOYMENT.md`. Placeholder `webhouse.html` je odstránený.
Rovnako je odstránený aj adresár `steden/` s holandskými presmerovaniami, z repa
aj zo živého roota; `/steden/` vracia 404.

**Otvorená vec: HTTPS.** Server zatiaľ posiela wildcard certifikát WebHouse
`CN=*.webhouse.sk`, ktorý túto doménu nepokrýva, takže `https://` hlási nezhodu
mena. Certifikát pre `filthyfilter.sk` treba vystaviť v paneli WebHouse; cez SSH
sa to spraviť nedá. Dovtedy `https://` adresu nikam neuvádzať.

### Staging — dev.filthyfilter.sk

Nové veci pred nasadením na ostro idú na `http://dev.filthyfilter.sk/`, root
`/home/jg046600/_sub_filthyfilter_sk/dev`. Subdoménu Apache zobral automaticky,
v paneli sa nič nastavovať nemuselo. Staging kópia má vždy zablokované
indexovanie: `robots.txt` so zákazom všetkého, `noindex` meta v oboch HTML a bez
sitemap. Canonical zostáva na ostrú doménu. Postup je v `docs/DEPLOYMENT.md`.

Aktuálne na stagingu: commit `e4438e2`, teda trojica rýchleho výberu plus
čitateľnostná úprava. Ostrá `filthyfilter.sk` stále beží na `cf5b605`.

**Pravidlo pre typografiu, potvrdené používateľom 5. 9. 2026:** ozdobná HUD
vrstva zostáva ako je, teda mono verzálky, zvislé súradnice v úvode, FFFF kódy,
čísla krokov, `//` poznámky a meta popisky. Vecný text, ktorý má návštevník
naozaj prečítať, musí byť väčší a s väčšími rozostupmi. Úvodná veta patrí do
čitateľného rezu Inter, nie do úzkeho nadpisového Oswaldu. Priestor nesmie
pôsobiť stiesnene.

### Ďalší krok

1. Posúdiť trojicu rýchleho výberu na stagingu a rozhodnúť o nasadení na ostro.
2. Vystaviť certifikát pre `filthyfilter.sk` a znova overiť `https://`.
3. Vizuálna kontrola živého webu okom; snímky obrazovky agenta sú kvôli WebGL
   plátnu čierne, takže rozloženie bolo overené cez DOM, nie pohľadom.
4. Rozhodnúť o osude starej adresy `whispair.sk/filthyfilter/`.
5. Overiť schránku `info@filthyfilter.sk`.
6. Etapa 3: plnohodnotný dopytový formulár s validáciou, kopírovaním textu a
   voľbou „Neviem“, ak sa ukáže, že predvyplnené správy nestačia.
7. Etapa 4: finálne QA a merge do `main`.
