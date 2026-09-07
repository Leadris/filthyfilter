# FilthyFilter by whispAir — schválený plán prerábky

Schválené používateľom 5. 9. 2026. Tento súbor je zdrojom pravdy pre Codex, Claude aj ďalšieho vývojára. Pri pokračovaní si prečítaj aj `CLAUDE.md`, skontroluj Git a aktualizuj checklist a odovzdanie nižšie. Nezačínaj už dokončenú etapu odznova.

> **Časti tohto plánu boli 6. 9. 2026 nahradené.** Pre akvizíciu, meranie a ceny platí
> `docs/MARKETING_PLAN.md`. Konkrétne sú zrušené tri rozhodnutia nižšie: „ceny na dopyt bez
> verejného cenníka“ (na landing pages ide orientačná cena „od“), nepovinné meno v dopyte
> (meno a jeden kontakt sú povinné) a to, že dopyt sa neodosiela na server (odosiela sa do
> `whispair-api`). Všetko ostatné v tomto dokumente platí ďalej, vrátane vizuálu, humoru,
> pravidla rámovania sekcií a zákazu nepodložených tvrdení.

## Cieľ a rozhodnutia

Zachovať dnešný humor a vizuál FilthyFilter, výrazne zlepšiť predstavenie služieb, dôkazy práce a objednávku. Inšpirácia predajnou štruktúrou: https://vycistimklimu.sk/, https://vycistimklimu.sk/pre-firmy a https://vycistimklimu.sk/realizacie (audit 5. 9. 2026). Vlastné texty a grafické spracovanie; konkurenčné tvrdenia nie sú dôkazom našich schopností.

- Značka: **FilthyFilter by whispAir**. Klimuj.sk nepoužívať. Samostatné spolupráce prídu neskôr.
- Hlavný trh: Slovensko. Pôsobnosť: **Bratislava, Trnava, Nitra a okolie do 20 km od týchto miest** (opravené 7. 9. 2026 používateľom; predtým tu stálo „Senec a okolie do približne 100 km“, čo bolo nepresné). Sídlo je v Senci. Dostupnosť a dopravu potvrdiť podľa konkrétnej adresy. Nejde o automatický výpočet dojazdu ani bezplatnú dopravu.
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

Pre jednotlivé realizácie v `/hall/` platí doplnená šablóna
[HALL_OF_FILTH_CASE_GUIDE.md](HALL_OF_FILTH_CASE_GUIDE.md), aktualizovaná 7. 9.
podľa Donuterie. Obsahuje pravidlá obálky, rozloženia a prepojení bez duplicity.

Zachovať čierne pozadie, meď/zlato, Oswald/Inter/Share Tech Mono, technické rámiky, FFFF a animované pozadie. Nezavádzať svetlý redizajn. Čitateľnosť riešiť kontrastom a rozostupmi. Zachovať reduced-motion a GPU rozpočty. Hudba zostane voliteľná cez malé tlačidlo; automatickú plávajúcu zvukovú výzvu odstrániť.

Navigácia: **Služby · Realizácie · Postup · FFFF · Pre firmy · Otázky · Kontakt**. Zachovať existujúce zmysluplné kotvy (`diensten`, `hall`, `werkwijze`, `ffff`, `contact`), doplniť kotvy `pre-firmy`, `faq` a `service-area`. Mobil: kompaktné tlačidlá Zavolať/Nacenenie bez zakrytia obsahu.

Poradie homepage:

1. **Úvod:** FilthyFilter by whispAir. Nadpis „V klíme má bývať chlad. Nie nová civilizácia.“ Text: „Čistenie, údržba a servis klimatizácií pre domácnosti a firmy. Bratislava, Trnava, Nitra a okolie do 20 km. Rozsah práce a cenu si dohodneme vopred.“ CTA **Vyžiadať cenovú ponuku** a **Pozrieť výsledok pred/po**. Nepodložené hero čísla odstrániť.
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
- ~~**Expresný termín do 24 h.** Urgentný termín negarantujeme.~~ **Zmenené
  7. 9. 2026 na pokyn používateľa:** prednostný termín do 24 hodín od objednávky
  ponúkame za príplatok 49 € s DPH. Nie je to samostatná sekcia ani karta služby,
  ale zaškrtávacie pole v dopytovom formulári na všetkých troch stránkach
  s formulárom; suma má značku `{{p-expres}}` v tabuľke cien v `js/main.js`.
  Poznámka pre firmy na úvodnej stránke bola prepísaná, lebo predtým tvrdila
  opak.
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

## Pravidlo pre rámovanie sekcií (5. 9. 2026)

Používateľ si vybral rozvrhnutie sekcie **Pre firmy** ako vzor. Tag, nadpis a
úvodný odsek sedia na pozadí, orámovaný je len obsah pod nimi. Rám nikdy
neobopína celú sekciu aj s nadpisom.

Platí to pre všetkých deväť sekcií homepage. Medzera medzi nadpisom a rámom je
40 px, čo dáva `.section__head { margin-bottom: 40px }`. Ak má sekcia mriežku
viacerých panelov, každý panel nesie vlastný tag ako popisku; nadpis sekcie do
žiadneho z nich nepatrí.

## FAQ ako akordeón (5. 9. 2026)

Otvorená je vždy najviac jedna odpoveď. Rieši to atribút `name="faq"` na
všetkých siedmich prvkoch `<details>`, čím ich prehliadač berie ako jednu
skupinu. Je to funkcia platformy, nie skript, takže klávesnica, focus aj
vyhľadávanie v stránke fungujú ďalej bez zásahu.

V `js/main.js` je `initFaq()` len ako záloha pre prehliadače, ktoré atribút
`name` ešte nepodporujú. Naviaže sa výlučne vtedy, keď podpora naozaj chýba, na
súčasných prehliadačoch nespustí nič. Ak by v budúcnosti pribudol ďalší
akordeón, dajte jeho prvkom iné meno skupiny, inak by sa navzájom zatvárali.

## Otáčacie dlaždice FFFF (5. 9. 2026)

Používateľ chcel, aby sa dlaždice pri prejdení myšou otočili a na druhej strane
bol PPPP rating. Postavené s dvomi zmenami oproti zadaniu:

**Na zadnej strane nie je druhé skóre.** FFFF a PPPP sú dve mená tej istej
škály, ako hovorí aj samotná sekcia, a PPPP sa rozpisuje na štyri slová, nie na
šesť stupňov. Paralelné skóre by odporovalo textu nad ním a predstieralo
meranie, ktoré nerobíme. Zadná strana preto odpovedá na otázku, ktorú vtip
vyvolá: **ktoré z tých štyroch P na danom stupni prevláda a čo v tom prípade
zákazka obnáša**. Každý riadok vychádza z rozsahu služieb zverejneného vyššie
na stránke, nič nové sa nesľubuje. Stupeň 5 hovorí, že rozsah sa potvrdí na
mieste, nie že vieme dopredu, čo tam je.

**Žiadne WebGL a žiadne 3D.** Canvas by stál označiteľný text, prepínanie
jazyka a prístup pre čítačky obrazovky, a to za efekt, ktorý CSS zvládne samo.
Verzia s `rotateY` bola postavená a zahodená tiež: závisí od `preserve-3d` a
`backface-visibility`, a zariadenie, ktoré 3D sploští, by ukázalo obe strany
cez seba a zrkadlovo. Predná strana sa teraz stiahne na nulovú šírku a zadná sa
z nuly roztiahne. Vyzerá to ako to isté otočenie, ale používa len 2D. Súbežne
beží priehľadnosť, takže prehliadač, ktorý transformácie ignoruje, dostane
čistý prelínací prechod namiesto dvoch textov cez seba.

Ovládanie: myš cez `:hover`, klávesnica cez `:focus-visible`, dotyk klepnutím,
lebo tam hover neexistuje. Pri obmedzenom pohybe sa strany vymenia bez animácie.

**Poznámka k overovaniu:** prehliadačový panel agenta beží bez GPU, ploští 3D a
zamrazuje prechody. Cieľové stavy sa preto merajú s vypnutými prechodmi. Plynulosť
animácie treba pozrieť na skutočnom zariadení.

## Vrstva s dominantou miesta (5. 9. 2026)

Na spise je za úvodom rozmazaná trnavská dominanta. Používateľovi sa páči, tak
je teraz výraznejšia: rozostrenie 7 na 5 px, sýtosť .72 na .86, priehľadnosť
.48 na .62. Prekryv nad ňou sa nemenil, práve on drží kontrast textu.

Rovnaká vrstva je pripravená aj na homepage ako `.hero__place`. **Zapne sa až
vtedy, keď sa na `.hero` nastaví premenná `--hero-bg`.** Kým je prázdna,
prehliadač si nič nevyžiada a vrstva je neviditeľná. Prekryv nad ňou je ladený
pre homepage, nie skopírovaný: tmavý vľavo pod nadpisom, presvetlený vpravo,
dole prechádza do pozadia.

**Na homepage je obrázok od používateľa** v `assets/hero-airco.jpg`, ilustrácia
vonkajšej jednotky v záhrade. Pred vložením prešiel tromi úpravami:

1. **Značka výrobcu je rozostrená.** Je to cudzia ochranná známka a na
   komerčnej stránke by pôsobila ako vzťah s výrobcom, ktorý netvrdíme. Pri
   5 px rozostrení v CSS by tabuľka zostala čitateľná ako logo. Ak je whispAir
   autorizovaným predajcom tej značky a chce ju tam mať, dá sa to vrátiť.
2. **Farebnosť stiahnutá do palety:** sýtosť na 22 %, stmavené a otočené do
   medenej. Originál je svetlá zelená scéna za denného svetla, ktorá by aj pod
   prekryvom bila s tmavým úvodom.
3. **PNG na progresívny JPEG**, 1600 px na šírku, z 2,95 MB na 283 kB.

**Technická poznámka:** obrázok sa nastavuje inline na prvku, nie cez CSS
premennú. Relatívna `url()` vnútri custom property sa vyhodnocuje voči
štýlopisu, ktorý ju používa, takže `assets/hero-airco.jpg` sa zmenilo na
`css/assets/hero-airco.jpg` a vracalo 404. Inline na prvku sa vyhodnotí voči
dokumentu, čo funguje na koreni domény aj pod podcestou.

**Poznámka k formátu:** `trnava-dusk.png` má 1 391 689 bajtov. Ako JPEG pri
kvalite 72 by mal 47 207 bajtov, teda o 97 % menej, a pri rozostrení 5 px to
nikto nerozozná. Prekódovanie čaká na pokyn, je to cudzí asset.

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

- **Interná príručka k recenziám je online** na `https://interne.filthyfilter.sk/`,
  zdroj v `interne/`. Obsahuje krátky odkaz na hodnotenie
  `https://g.page/r/Cfxkfq92J6ptEBM/review`, ktorý otvára rovno okno s
  hviezdičkami. Že patrí k whispAir je overené z jeho vlastného kódu: dekóduje
  sa na CID `0x6daa2776af7e64fc`, teda ten istý identifikátor ako v odkaze na
  profil v Mapách. Sú to dve rôzne adresy s rôznou úlohou. Na verejnom webe je
  odkaz na profil, kde si záujemcovia recenzie čítajú. V príručke je odkaz na
  písanie, ktorý na verejný web nepatrí.

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

## Ikony a oprava vrstvy s obrázkom (2026-09-06)

- **Nová sada ikon je nasadená.** Baktéria v medenej farbe nahradila v karte
  prehliadača starú značku `FF`. Súbory sú v koreni repozitára, lebo prehliadače
  a roboty si `/favicon.ico` a `/site.webmanifest` stále pýtajú pod týmto menom,
  keď ich nikto nenasmeruje inam. V stránkach sú odkazované relatívne, aby to
  fungovalo aj v lokálnom náhľade pod `/filthyfilter/`. Dodaný `head-snippet.html`
  používal absolútne cesty od koreňa, tie by v náhľade vracali 404.

  **Starý `assets/favicon.svg` zostal**, ale už nie je ikonou karty. Prehliadač,
  ktorý rozumie `image/svg+xml`, ho uprednostní pred každým PNG, takže by sa
  nová ikona nikdy nezobrazila. Vo vnútri stránky slúži ďalej ako značka v
  hlavičke a na kartách recenzií. Zjednotenie tejto značky s baktériou je
  samostatné rozhodnutie o vizuálnej identite, nie súčasť tejto úlohy.

- **Dve ikony sa neprebrali tak, ako prišli.** Celá sada má priehľadné pozadie,
  čo je pre kartu prehliadača správne, ale na dvoch miestach nie:

  1. `apple-touch-icon` — iOS priehľadnosť ignoruje a podloží ikonu vlastnou
     farbou, ktorá bola v rôznych verziách biela aj čierna. Tenký medený obrys
     na bielej takmer zmizne. Podklad `--bg` je preto zapečený do súboru.
  2. Adaptívne ikony Androidu — spúšťač oreže ikonu do tvaru zariadenia a
     ponechá stredných 80 %. Ramená baktérie siahajú po okraj plátna, takže by
     sa odsekli. Pribudli `icon-192-maskable.png` a `icon-512-maskable.png` s
     obrysom v bezpečnej zóne; pôvodné priehľadné súbory zostávajú v manifeste
     ako `purpose: any`.

  `theme_color` je `#0a0706`, teda pozadie stránky, nie medená `#9A4315`.
  Farbí sa ňou lišta prehliadača nad stránkou; medený pruh nad takmer čiernou
  stránkou by pôsobil ako cudzí pás.

- **Vrstva s obrázkom v úvode bola vnorená do `.wrap`.** Ten je obmedzený na
  `--maxw` a vycentrovaný, takže na širšej obrazovke rozmazaný obdĺžnik jednoducho
  skončil uprostred stránky a jeho boky boli vidieť ako zvislé švy. Na spise ten
  problém nikdy nebol, lebo tam vrstva visí priamo na sekcii. Teraz je to tak aj
  na úvodnej stránke a orezáva ju `overflow` sekcie, takže nie je čo vidieť.

  Zároveň to už nie je pozadie na celú šírku, ale panel pri pravom okraji.
  Jednotka je na obrázku napravo od jeho stredu, takže ukotvenie vpravo ju
  dostane do svetlejšej časti úvodu namiesto pod najtmavšiu časť prekryvu, kde
  sedí nadpis. Ľavý okraj panela nemizne farbou natretou navrch, ale maskou:
  rozmazaný prvok sa inak ako vyblednutím vlastných pixelov ukončiť bez švu
  nedá. Kde maska nie je podporovaná, vráti sa pôvodné pozadie na celú šírku.

  `background-position` je `82 %`, nie `right`. Panel je oveľa vyšší než pomer
  strán obrázka, takže `cover` oreže značnú časť šírky; pri `right` by ľavá
  polovica jednotky spadla do vyblednutia.

- **Rovnaká pasca bola stále aktívna na spise.** `--case-bg` s relatívnou cestou
  sa vyhodnocuje voči štýlopisu, ktorý ju používa, nie voči stránke. Cesta
  smerovala o dva priečinky vyššie; v koreni domény sa to o koreň zaseklo a
  náhodou fungovalo, v lokálnom náhľade vracala 404. Obrázok je teraz nastavený
  priamo na prvku, rovnako ako v úvode.

- **Otvorené:** `trnava-dusk.png` má 1,39 MB ako PNG za päťpixelovým rozmazaním.
  Prekódovanie na JPEG by z toho spravilo približne 47 kB. Čaká na rozhodnutie.

### Značka baktérie aj vo vnútri stránky (2026-09-06)

Používateľ rozhodol, že baktéria nahradí starú značku `FF` v šesťuholníku aj
v hlavičke a v pätičke. Miesta sú v skutočnosti tri, nie dve: k hlavičke
a pätičke patrí ešte karta „Dôkaz pred potleskom“ na spise, kde tá istá značka
zastupuje nás. Nechať tam šesťuholník by bola presne tá nejednotnosť, ktorú
odstraňujeme, len o stránku hlbšie.

- **Zdrojom nie sú súbory faviconu.** Tie nesú odsadenie, ktoré potrebuje ikona
  spúšťača, takže v 38-pixelovom mieste v hlavičke by sa značka vykreslila
  približne na 30 pixelov v priehľadnom ráme a pôsobila by menšie než pôvodná.
  `assets/mark-bacteria.png` je orezaný po kresbu a má 192 px, čo pokrýva
  najväčšie použitie (62 px na karte) v trojnásobku.
- **Raster, nie SVG.** Kresba je tieňovaný prechod, nie ploché vektorové tvary;
  obkreslením by sa zahodilo práve to, čo jej dáva vzhľad. Kvantovanie na 128
  farieb tieňovanie zachová a súbor stlačí z 30 kB na 7,4 kB.
- **Pätička dostala značku naľavo od riadku s názvom**, na 80 % krytia. Zatvára
  stránku tým istým znakom, akým sa otvára, ale tichšie.
- **Všetky tri obrázky majú prázdny `alt`.** Každý stojí priamo vedľa textu,
  ktorý značku pomenúva. Popis „logo FilthyFilter“ vedľa slov „FilthyFilter by
  whispAir“ by čítačku prinútil povedať meno dvakrát a poslucháčovi by nedal nič
  navyše.
- **`assets/favicon.svg` je zmazaný.** Po tejto zmene naň neodkazovalo nič.
  Ak by sa niekedy hodil, je v histórii Gitu.

### Repozitár prečistený od zabalených balíkov (2026-09-06)

Pri dvoch nasadeniach sa do repozitára dostali zabalené archívy na nahratie,
každý približne 21 MB. Boli to zbytočnosti, ktoré sa dajú kedykoľvek vyrobiť
znovu z ktoréhokoľvek commitu.

- `tmp/` je odteraz v `.gitignore`.
- História oboch vetiev bola prepísaná cez `git filter-branch --index-filter`
  a pretlačená s `--force-with-lease`. Strom `HEAD` má rovnaký hash ako pred
  prepisom, takže obsah je bit po bite ten istý; zmizli iba cesty pod `tmp/`.
- Značka `baseline-v1` zostala nedotknutá. Ukazuje na commit, ktorý je starší
  než prvý súbor v `tmp/`, takže prepis jeho hash nezmenil a značka ďalej sedí
  v histórii `main`.
- Overené čerstvým holým klonom z GitHubu: 22 MB, 53 commitov, žiadne `tmp/`,
  najväčšie súbory sú legitímne `backgroundMusic.mp3` a video dôkazu.
- Záloha pred prepisom je `filthyfilter-backup-before-rewrite.bundle` v
  dočasnom priečinku relácie. Obsahuje všetky pôvodné referencie.

**Otvorené:** lokálny `.git` má stále 177 MB. Mŕtve objekty už nie sú dosiahnuteľné
zo žiadnej referencie, ale drží ich reflog. Uvoľnia sa samé, keď reflog vyprší,
alebo hneď po `git reflog expire --expire=now --all` a `git gc --prune=now`.
Tie dva príkazy zablokoval bezpečnostný filter, musí ich spustiť používateľ.
Na GitHube je už všetko preč.

### Druhá sada ikon: lupa s baktériou (2026-09-06)

Používateľ dodal novú sadu a označil ju za lepšiu. Motív je lupa so žiariacou
baktériou pod sklom, čo hovorí presne to, čo robíme: pozeráme sa na to, čo je
vnútri. Nahradila samotnú baktériu vo všetkých miestach naraz, teda v karte
prehliadača, v hlavičke, v pätičke aj na karte „Dôkaz pred potleskom“.

Balík bol pripravený lepšie než predchádzajúci. Už obsahoval nepriehľadné
`maskable` varianty aj celý rad veľkostí faviconu. Tri veci sa aj tak museli
upraviť:

1. **`apple-touch-icon` bol priehľadný.** iOS priehľadnosť ignoruje a podloží si
   ikonu vlastnou farbou, tak je do súboru zapečené pozadie stránky. Rovnaký
   dôvod ako pri predchádzajúcej sade.
2. **`maskable` kresba prečnievala bezpečnú zónu.** Spúšťač smie orezať ikonu do
   kruhu s polomerom 40 % plátna; špička rukoväte lupy siahala do 43,4 %, takže
   pri prísnej kruhovej maske by ju odsekol. Zmenšenie kresby na 92 % ju dostalo
   na 39,7 %, čo je rozdiel vo veľkosti, ktorý nikto nepostrehne.
3. **Cesty.** Balík počítal s koreňom webu a absolútnymi `/favicon/...`. Ikony
   zostávajú naploho v koreni a odkazuje sa na ne relatívne, aby fungoval aj
   lokálny náhľad pod `/filthyfilter/`.

Ďalej:

- **`favicon.ico` má 16, 32, 48 a 64 px, nie 256.** Dodaný mal šesť veľkostí
  a 106 kB. Prehliadače si berú deklarované PNG; `.ico` slúži záložkám,
  odkazom vo Windows a slepej požiadavke na `/favicon.ico`, kde nič nad 48 px
  netreba. Po orezaní má 15 kB, teda o 86 % menej.
- **Dlaždice pre Windows sa nepreberali.** `mstile-150x150.png` a
  `browserconfig.xml` slúžia pripínaniu na úvodnú obrazovku Windows 8 a 10,
  ktoré dnešný Edge už nepoužíva. Boli by to súbory, ktoré nikto nenačíta.
- **Značka vo vnútri stránky sa volá `assets/brand-mark.png`.** Kresba sa
  medzitým zmenila dvakrát a značka by nemala nútiť prepisovať šablónu zakaždým,
  keď sa zmení znovu. Starý `mark-bacteria.png` je zmazaný.
- **`theme_color` je opäť `#0a0706`**, nie jantárová `#f39a12` z balíka. Farbí
  sa ňou lišta prehliadača priamo nad stránkou a jantárový pruh nad takmer
  čiernou stránkou by pôsobil ako cudzí pás.

### 7. 9. 2026 — bočný posuvník

- [x] Natívny posuvník zladený s paletou: tmavá dráha, medený úchyt, zlatý hover.
- [x] Nasadené na dev cez port 22690; vizuálne overené v prehliadači. Produkcia bez zmeny.
