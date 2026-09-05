# Hall of Filth — B2B vrstva dôvery

**Aktualizácia 5. 9. 2026, na pokyn používateľa:** partnerská reputačná karta je
zrušená. Google skóre a chvála zákazníka sa už nikde nezobrazujú. Na hlavnej
stránke aj na podstránkach majú byť **len naše vlastné Google recenzie**.
Sekcia dôvery na spise `FF-SK-TT-0828` preto obsahuje jedinú kartu, našu, a
sekcia o prevádzke opisuje záťaž zákazky namiesto toho, aby zákazníka
odporúčala. Časti nižšie, ktoré popisujú dvojitú reputáciu a partnerskú kartu,
sú tým prekonané; ostávajú ako záznam pôvodného zámeru.

Aktualizácia 5. 9. 2026: značka realizátora je **FilthyFilter by whispAir** podľa `REDESIGN_PLAN.md`. La Donuteria zostáva zákazkou; samostatná sekcia spoluprác je odložená. Nepoužívať neoverený Google profil realizátora ani verejné poznámky o budúcej API integrácii.

## Zámer

Každý publikovaný prípad má byť viac než reklama na čistenie. Má vytvoriť samostatnú mikrostránku s archívnou hodnotou, ktorá súčasne:

1. dokazuje vykonanú prácu FilthyFilter by whispAir,
2. predstavuje zákazníka ako prevádzku, ktorá sa stará aj o neviditeľné detaily,
3. posiela návštevníkov na oficiálne kanály oboch firiem,
4. drží reputácie oboch strán jasne oddelené a overiteľné.

Pracovná veta formátu: **Dve firmy. Dve nezávislé reputácie. Jeden transparentný spis.**

## Povinná dôkazová pyramída

1. **Realita zákazky:** PRED → PROCES → PO, technické údaje a FFFF rating.
2. **Reputácia partnera:** verejné skóre, počet hodnotení a priamy odkaz na zdroj.
3. **Priama skúsenosť partnera:** krátke vyjadrenie zákazníka k našej práci, iba so súhlasom.
4. **Reputácia realizátora:** naše Google skóre a tematické recenzie, oddelené od partnerových hodnotení.
5. **Konverzia:** samostatné CTA pre návštevu partnera a objednanie našej služby.

Reputácia nesmie nahrádzať dôkaz práce. Recenzie stoja vedľa PRED/PO dokumentácie, nie namiesto nej.

## Obsah partnerovej reputačnej karty

- obchodný názov, logo a mesto,
- aktuálne Google skóre a počet hodnotení,
- dátum poslednej kontroly údajov,
- stručné redakčné zhrnutie opakujúcich sa tém v hodnoteniach,
- tlačidlo smerujúce na oficiálny profil alebo konkrétnu recenziu,
- jasné označenie, že nejde o platené odporúčanie.

Pri spise `FF-SK-TT-0828` používame konzervatívny verejný údaj **4,7/5 a 135+ hodnotení**. Stav bol redakčne skontrolovaný 28. 8. 2026; číslo sa pri ďalšej revízii nesmie znižovať ani zvyšovať odhadom.

## Obsah našej reputačnej karty

- názov realizátora `FilthyFilter by whispAir`,
- odkaz na služby a samostatný odkaz na Google profil,
- aktuálne skóre a počet hodnotení až po potvrdení oficiálneho Google Place ID,
- najviac dve recenzie relevantné k prípadu: odbornosť, čistota práce, komunikácia alebo servis,
- pri každej citovanej Google recenzii autor, dátum/relatívny čas a priamy odkaz na zdroj.

Kým Place ID nie je jednoznačne potvrdené, nepublikovať číslo ani citát. Karta namiesto toho komunikuje overiteľný PRED/PO výsledok a odkazuje na oficiálny web.

## Google pravidlá a technické hranice

- Za recenziu sa nesmie ponúkať zľava, bezplatná služba, publikácia prípadu ani iná protihodnota.
- Nežiadať iba spokojných zákazníkov a neodrádzať nespokojných od verejnej recenzie.
- Pri ručnom redakčnom zázname používať dátum kontroly a odkaz na živý zdroj; neprezentovať ho ako živé API dáta.
- Pri automatizácii použiť Google Places API, potvrdené Place ID a serverovú vrstvu. API kľúč nevkladať neobmedzený do verejného HTML.
- Dodržať Google atribúciu, odkaz na pôvodnú recenziu, autora a pravidlá ukladania dát. Uviesť spôsob výberu alebo radenia recenzií.
- Nepoužiť `AggregateRating` schema pre našu firmu z hodnotenia tretej firmy ani miešať dve skóre do jedného priemeru.

## Dátový záznam pre každý budúci prípad

```text
partner_name:
partner_place_id:
partner_maps_url:
partner_rating:
partner_review_count:
partner_rating_checked_at:
partner_review_summary:
partner_quote:
partner_quote_consent:

operator_place_id:
operator_maps_url:
operator_rating:
operator_review_count:
operator_rating_checked_at:
operator_review_ids:

publication_consent:
logo_source_and_license:
next_review_data_check:
```

## Publikačný postup

1. Uzavrieť technický spis a PRED/PO dôkaz.
2. Získať súhlas partnera s názvom, logom, odkazmi a distribúciou.
3. Overiť oba Google profily a zaznamenať Place ID, URL, skóre, počet a dátum.
4. Vybrať iba tematicky relevantné recenzie; nikdy iba na základe toho, že sú najlichotivejšie.
5. Skontrolovať autorstvo, atribúciu, zdrojové odkazy a jazykové verzie.
6. Publikovať dve oddelené karty a dve oddelené CTA.
7. Po nasadení overiť odkazy a nastaviť termín ďalšej kontroly reputačných údajov.

## Implementačný stav — La Donuteria Trnava

- [x] partnerova karta s dátumovaným verejným reputačným signálom,
- [x] oddelená karta realizátora založená na dôkaze práce,
- [x] odkazy na La Donuteria, naše služby a Google Maps hostiteľa; neoverený profil realizátora odstránený,
- [x] transparentnostná doložka bez výmeny recenzie za protihodnotu,
- [ ] potvrdiť presný Google Place ID La Donuteria,
- [ ] potvrdiť presný Google Place ID whispAir/realizátora,
- [ ] po súhlase pridať priamu vetu La Donuterie o vykonanej práci,
- [ ] po API integrácii nahradiť dátumovaný snapshot živými údajmi v súlade s pravidlami Google.
