# FilthyFilter by whispAir — schválený plán prerábky

Schválené používateľom 5. 9. 2026. Tento súbor je zdrojom pravdy pre Codex, Claude aj ďalšieho vývojára. Pri pokračovaní si prečítaj aj `CLAUDE.md`, skontroluj Git a aktualizuj checklist a odovzdanie nižšie. Nezačínaj už dokončenú etapu odznova.

## Cieľ a rozhodnutia

Zachovať dnešný humor a vizuál FilthyFilter, výrazne zlepšiť predstavenie služieb, dôkazy práce a objednávku. Inšpirácia predajnou štruktúrou: https://vycistimklimu.sk/, https://vycistimklimu.sk/pre-firmy a https://vycistimklimu.sk/realizacie (audit 5. 9. 2026). Vlastné texty a grafické spracovanie; konkurenčné tvrdenia nie sú dôkazom našich schopností.

- Značka: **FilthyFilter by whispAir**. Klimuj.sk nepoužívať. Samostatné spolupráce prídu neskôr.
- Hlavný trh: Slovensko. Pôsobnosť: **Senec a okolie do približne 100 km**; dostupnosť a dopravu potvrdiť podľa konkrétnej adresy. Nejde o automatický výpočet dojazdu ani bezplatnú dopravu.
- Telefón a WhatsApp: **+421 902 279 094**; `tel:+421902279094`, `https://wa.me/421902279094`.
- Email: **info@filthyfilter.sk** (používateľ potvrdil presný názov). Existencia a doručovanie schránky ešte nie sú overené.
- Ceny na dopyt, bez verejného číselného cenníka a cenovej kalkulačky.
- Statické HTML/CSS/JS, bez frameworku, backendu a buildu. Zachovať nasadenie pod `https://whispair.sk/filthyfilter/`. Emailová doména neznamená sťahovanie webu.
- SK ako východiskový jazyk v HTML aj pri prvej návšteve. Zachovať manuálne EN/NL a zapamätanú voľbu; všetky preklady ponúkajú rovnakú slovenskú službu.
- Žiadne vymyslené IČO, právna identita, recenzie, štatistiky, certifikácie alebo termíny.

## Git, odovzdanie a nasadenie

- Baseline: anotovaný tag **baseline-v1** na `99b956c85f6c857475340ad7be76914f7d24f003`, pôvodný web pred prerábkou. Commit už bol na `origin/main`.
- Repo: https://github.com/Leadris/filthyfilter ; pracovná vetva **codex/filthyfilter-redesign**.
- Všetky úpravy robiť v tejto vetve, po ucelených etapách commitovať a pushovať. Nezahadzovať zmeny iného agenta; vždy začať `git status` a čítaním aktuálneho odovzdania.
- Výstupom je funkčný lokálny náhľad a pushed vetva. Merge do main a produkčný deploy sú ďalšia etapa po posúdení náhľadu, nie súčasť prvých krokov.
- Produkčný postup je v `docs/DEPLOYMENT.md`. Nezverejňovať dokumentáciu, CLAUDE.md, pracovné nástroje ani .git do webrootu. Overiť email pred nasadením; nezriaďovať DNS ani schránku v rámci úprav webu.

## Vizuál a nová štruktúra

Zachovať čierne pozadie, meď/zlato, Oswald/Inter/Share Tech Mono, technické rámiky, FFFF a animované pozadie. Nezavádzať svetlý redizajn. Čitateľnosť riešiť kontrastom a rozostupmi. Zachovať reduced-motion a GPU rozpočty. Hudba zostane voliteľná cez malé tlačidlo; automatickú plávajúcu zvukovú výzvu odstrániť.

Navigácia: **Služby · Realizácie · Postup · FFFF · Pre firmy · Otázky · Kontakt**. Zachovať existujúce zmysluplné kotvy (`diensten`, `hall`, `werkwijze`, `ffff`, `contact`), doplniť kotvy pre firmy, FAQ a pôsobnosť. Mobil: kompaktné tlačidlá Zavolať/Nacenenie bez zakrytia obsahu.

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

Slovenské zdrojové HTML, title, description, OpenGraph, alt a aria popisy. Jazyková voľba EN/NL nemení región služby. Staré `steden/` URL nahradiť jednoduchými statickými presmerovaniami na homepage `#service-area`, s noindex/canonical a náhradným odkazom. Vyradiť ich zo sitemap; zachovať homepage a existujúci spis. Nezavádzať migráciu na filthyfilter.sk.

## Etapy a akceptácia

- [x] Overiť čistý strom, remote main a baseline commit.
- [x] Vytvoriť a pushnúť anotovaný tag baseline-v1.
- [x] Založiť codex/filthyfilter-redesign.
- [x] Zapísať úplný plán a pokyny pre Claude.
- [ ] **Etapa 1:** značka, kontakty, slovenský predvolený jazyk, pôsobnosť, vyradenie holandských mestských stránok; aktualizovať dokumentáciu. Overiť a pushnúť.
- [ ] **Etapa 2:** nový úvod, služby, poradie obsahu, FAQ, firemná ponuka, FFFF texty a očista placeholderov/tvrdení.
- [ ] **Etapa 3:** zostavenie dopytu, predvýber služby, WhatsApp/email/kopírovanie, mobilné CTA a nenápadný zvuk.
- [ ] **Etapa 4:** výsledné vizuálne a funkčné QA, metadata, odovzdanie náhľadu a push.
- [ ] Neskôr: overenie emailovej schránky, posúdenie náhľadu, merge/deploy podľa samostatného zadania.

Finálne QA: desktop + 390/768 px, bez horizontálneho scrollu; mobilné menu a CTA neprekrývajú obsah; klávesnica, focus, labely a reduced-motion. Všetky service CTA predvyberajú správny dopyt. Otestovať validáciu, „Neviem“, diakritiku, zmenu jazyka a linky bez reálneho odoslania. Overiť fotografie, video, presmerovania a cesty pod `/filthyfilter/`, title/canonical/OG/sitemap. Vyhľadať Klimuj.sk, holandské kontakty, nulové čísla, neoverené tvrdenia. Zbytočne nepridávať testovaciu infraštruktúru pre textové úpravy; JS správanie overiť zmysluplnými scenármi.

Hotovo znamená, že návštevník z úvodu pochopí službu a región, nájde rozsah a z každej servisnej karty dokáže pripraviť konkrétny dopyt.

## Aktuálne odovzdanie

**5. 9. 2026 — Codex:** Baseline uložený na GitHube; pracovná vetva založená. Etapa 1 prebieha. Etapy 2–4 nie sú implementované. Produkcia sa nemení. Po dokončení etapy 1 sa tento odsek aktualizuje s overením a presným ďalším krokom.
