# Hall of Filth — dizajnové a obsahové pravidlá realizácií

**Aktualizácia 5. 9. 2026:** do spisu nepatrí reputácia ani chvála zákazníka. Zákazníka menuj len so súhlasom a vecne, ako kontext zákazky. Zverejňujú sa výhradne naše vlastné Google recenzie.

**Aktualizované 7. 9. 2026 podľa aktuálnej Donuterie a pokynov používateľa.**
Toto je spoločná šablóna pre jednotlivé realizácie čistenia v `/hall/`.
Referenčná implementácia je [Donut Defence](../hall/trnava-la-donuteria/index.html)
a jej triedy v [styles.css](../css/styles.css). Nejde o šablónu všeobecných
predajných stránok `/cistenie-klimatizacie/` a `/servis-klimatizacie/` ani mestských stránok.
Stav nasadenia patrí do [STATUS.md](STATUS.md), spoločné rozhodnutia o vizuále
do [REDESIGN_PLAN.md](REDESIGN_PLAN.md). Pri novom prípade meniť jeho fakty,
fotografie a príbeh; nekopírovať údaje La Donuterie ako všeobecné tvrdenia.

## Dizajnový vzor — Donut Defence

### Vizuál a rozloženie

- Čierne pozadie, medené/zlaté akcenty, Oswald pre nadpisy, Inter pre text,
  Share Tech Mono pre označenia. Používať existujúce CSS premenné a komponenty.
- V úvode tlmená miestna dominanta za obsahom (`.case-hero__city`), tmavý
  gradient pre čitateľnosť. Pozadie je dekoratívne, s `aria-hidden="true"`.
  URL obrázka nastaviť priamo na prvku ako v referencii, nie cez relatívnu CSS premennú.
- Úvod `.case-hero--poster`: na desktope text vľavo, obálka vpravo, pomer stĺpcov
  `1.25fr / .75fr`, zvisle vycentrované. Nadpis, ID, krátky príbeh a CTA zostávajú HTML.
- Pri šírke do 800 px jeden stĺpec: text a tlačidlá, potom obálka.
  Maximálna šírka obálky 370 px, na mobile 340 px; obrázok má prirodzený pomer strán.
- Jemné rámiky patria médiám, štatistikám a obsahovým panelom. Neobaľovať celý
  spis ďalším rámom ani zavádzať samostatnú farebnú tému pre každú zákazku.
- Zachovať existujúce správanie reduced-motion, mobilnú navigáciu a focus tlačidiel.

### Ilustračná obálka

- Jeden plný poster na vlastnej stránke realizácie, v úvode namiesto veľkej kruhovej
  pečate FFFF. Nepridávať druhú posterovú sekciu. FFFF môže zostať pri skutočnom náleze.
- **50 % priehľadnosť = `opacity: .5` na `.case-poster__art`.** Platí pre obrázok
  a jeho rám/tieň, nie pre celý úvod ani popis. Nezamieňať s predchádzajúcimi hodnotami.
- **Bez zoomu:** žiadny odkaz okolo obrázka, lightbox, šípka, zväčšenie pri hoveri
  ani text „Kliknutím zväčšiť“. Aktuálna implementácia používa obyčajný `div`.
- Pod obrázkom plne čitateľný popis „Ilustračná obálka spisu“ / „Illustrated case cover“.
  Ilustrácia nenahrádza autentické fotografie ani sa neoznačuje za dôkaz nálezu.
- Portrét približne 4:5, čierna/medená paleta s malým výstražným žltým akcentom.
  Stručný názov prípadu, značka, mesto, skutočný dátum a doložené vizuálne FFFF skóre.
  Nepoužívať časovo nestále „dnešné čistenie“, vymyslené zdravotné závery ani falošné pred/po.
- Rozmery `width`/`height` a popisný prekladaný `alt` sú súčasťou obrázka.
  Asset uložiť k prípadu v `assets/hall/<slug>/`; pred finálnym vydaním optimalizovať
  veľkosť. Pilotný PNG Donuterie má 2,55 MB a nie je cieľový rozpočet ďalších obálok.
- Pôvod a generačný prompt konkrétnej obálky sú v [POSTER_PILOT.md](POSTER_PILOT.md).

### Poradie obsahu

1. Hlavička značky, návrat na realizácie, navigácia v spise a SK/EN.
2. Úvod: označenie terénneho spisu, jedinečné ID, vlastný názov, krátky príbeh,
   obálka. CTA „Pozrieť pred / po“ vedie na `#before-after`, „Objednať čistenie“
   na `../../cistenie-klimatizacie/#contact`.
3. Pás faktov `.case-stats`: lokalita, dátum, model, výkon, vek — iba známe údaje.
4. Konkrétne poučenie zo zákazky (`.maintenance-signal`), ak ho nález odôvodňuje.
   Donuteria má mladú jednotku; vek dva mesiace nie je univerzálny text šablóny.
5. Skutočné porovnanie pred/po, `#before-after`, popisy a terénny report.
6. Proces: vertikálne video, stručný verdikt a vykonané kroky. Video má vlastný
   náhľad `evidence-poster.jpg`; ten je iný asset než ilustračná obálka spisu.
7. Tím pri práci a vecný kontext prevádzky, ak sú dostupné a zverejniteľné.
8. Naša dôvera/recenzie podľa overených podkladov, spoločná pätička.

Toto je poradie referencie, nie povinnosť dopĺňať prázdne sekcie. Chýbajúce video,
tímovú fotografiu či neznámy technický údaj nenahrádzať vymysleným obsahom.

### Prepojenia bez zbytočnej duplicity

- Homepage ponecháva reálne pred/po a krátku upútavku s mestom, dátumom a odkazom
  na celý spis. Podrobný rozsah a príbeh patria do spisu; plný poster sa nekopíruje.
- Stránka čistenia ukazuje stručný relevantný dôkaz pred/po a odkaz na realizáciu.
  Stránka servisu dostane príklad zodpovedajúci oprave/diagnostike, nie automaticky každý poster.
- Ďalší publikovaný prípad môže prevziať upútavku na homepage. Pôvodný spis,
  jeho URL a obálka zostávajú zachované. Výber je zatiaľ ručný.
- Nový spis nevytvára automaticky mestskú landing page ani nový formulár.
  Objednávka smeruje na existujúcu službu. Budúce mestské stránky môžu odkazovať
  na miestne realizácie bez kopírovania celého príbehu.

## 1. Povinné fakty o zákazke

- Jedinečné ID spisu, dátum, mesto a typ objektu.
- Zákazník/prevádzka iba so súhlasom na zverejnenie názvu a kontaktov.
- Výrobca, presný model, výkon, približný vek jednotky a kto ju montoval.
- Prevádzkové podmienky: intenzita používania, gastro/prašné/vlhké prostredie a iné relevantné okolnosti.
- Minimálny pravdivý opis rozsahu práce. Neuvádzať laboratórne, zdravotné ani mikrobiologické závery bez merania.

## 2. Povinný obrazový dôkaz

- **PRED:** detail valca, výmenníka, filtrov a vnútra ešte pred zásahom.
- **PROCES:** ochrana priestoru, čistenie a zachytené nečistoty/oplachová voda.
- **PO:** čistý výsledok, ideálne z rovnakého uhla, vzdialenosti a pri rovnakom svetle ako záber PRED.
- Jeden horizontálny kompozit PRED/PO pre kartu, OpenGraph a zdieľanie.
- Krátky vertikálny zostrih v poradí PRED → PROCES → PO, bez zbytočne dlhých záberov.
- Tímová fotografia a mestská dominanta ako lokálny archívny podpis, ak sú dostupné.
- Nezverejňovať sériové čísla, adresy súkromných domácností, tváre ani evidenčné údaje bez súhlasu.

## 3. FFFF príbeh

- Prideliť FFFF rating a jednou vetou vysvetliť, čo bolo viditeľne pozorované.
- Humor smerovať na „kolóniu“, zásahový tím a pseudo-vedecký protokol — nie na zákazníka ani výrobcu.
- Oddeliť fakt od vtipu. Znečistenie nie je automaticky pleseň ani zdravotná diagnóza.
- Zachytiť výsledok po zásahu a uzavrieť spis stavom jednotky.
- Ak je jednotka mladá, zvýrazniť, že interval kontroly určuje reálna prevádzka, nie iba vek zariadenia.

## 4. Kontext zákazníka a credits

- Zákazníka predstaviť vecne ako kontext práce a prevádzkovej záťaže; nepridávať
  jeho reputačnú kartu, Google skóre ani osobné odporúčanie prevádzky.
- Adresu a kontakt uviesť len ak sú overené a schválené na zverejnenie.
- Použiť logo alebo produktovú grafiku iba so súhlasom/licenciou a evidovať zdroj.
- Na konci uviesť partnera, odkaz na jeho oficiálnu stránku a zdroj použitej grafiky.
- Pri tomto prípade: logo a donutová ilustrácia pochádzajú z verejných assetov `ladonuteriagroup.com`; pred ďalším komerčným šírením je vhodné mať potvrdený partnerský súhlas.
- V [B2B_TRUST_LAYER.md](B2B_TRUST_LAYER.md) platí úvodná aktualizácia o našich
  vlastných recenziách; historický model dvojitej reputácie sa neobnovuje.

## 5. Konverzný cieľ

- Jasné tlačidlo na objednanie čistenia alebo ďalšej kontroly.
- Pri firemných zákazníkoch ponúknuť dohodnutie pravidelnej odbornej návštevy podľa reálneho zanášania.
- Neuvádzať univerzálny servisný interval bez znalosti podmienok; ďalší termín určiť z nálezu, používania a odporúčaní výrobcu.

## 6. Publikačný checklist

- Dve jazykové verzie SK/EN sú kompletné a významovo zhodné, vrátane `alt` a `aria`
  cez `data-attr-target`. Prvá návšteva používa slovenčinu, manuálna voľba sa zapamätá.
- Odkazy z upútavky a fotografie pred/po vedú na správny spis; obálka samotná nie je odkaz.
- Obálka má `opacity: .5`, nepriehľadný popis a žiadny zoom. Na homepage ani
  na landing pages nie je druhá plná kópia posteru.
- Overiť desktop aj 390/768 px, bez horizontálneho scrollu, čitateľný text a CTA,
  klávesnicu a reduced-motion. Kotva pred/po sa nezakryje pevnou navigáciou.
- Popisné `alt` texty, titulok, meta description, canonical URL a OpenGraph obrázok.
- Prípad je v sitemap a všetky cesty fungujú aj pri nasadení v podadresári.
- Ak je video použité, MP4 aj WebM sa načítajú, má náhľad a funguje mobilný layout.
- Jedinečný `data-ff-page`, ID spisu, titulok a správne miestne údaje. Zachovať
  spoločné skripty merania a súhlasu; ich implementáciu nekopírovať do nového skriptu.
- Credits obsahujú zdroj grafiky, dátum prístupu a stav súhlasu.
- Nasadiť najprv na staging s `noindex, nofollow`; produkcia je samostatné vydanie.
  Po nasadení overiť homepage, detail, obrázky a prípadné byte-range prehrávanie videa.

## Čo sa oplatí pridať nabudúce

- Záber PRED a PO pripraviť vedome z označeného pevného bodu.
- Zaznamenať prevádzkové hodiny jednotky, režim používania a dátum poslednej kontroly.
- Ak sa vykonáva meranie, uložiť teploty, prietok alebo tlak pred/po — iba s použitou metódou a zariadením.
- Dohodnúť súhlas na fotografiu tímu, názov prevádzky, logo a distribúciu na sociálnych sieťach ešte pred publikovaním.
- Do interného záznamu pridať odporúčaný termín ďalšej kontroly a následne ho zákazníkovi pripomenúť.
