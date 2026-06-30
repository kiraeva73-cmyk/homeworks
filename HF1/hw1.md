# HF1 — Teszteset-generálás

## Beadás menete

1. Készítsd el a házi feladatot AI segítségével (bármelyik kurzuson tanult eszközzel).
2. Amikor kész vagy, a lenti **beadási prompttal** generáld le a beadáshoz szükséges JSON fájlt.
3. A generált JSON-t **külön, önálló `.json` fájlként** mentsd — ne ágyazd más dokumentumba és ne másold be szövegként máshova.
4. A fájl neve `Vezeteknev_Keresztnev_HF1.json` legyen (pl. `Gipsz_Jakab_HF1.json`, ékezet nélkül).
5. Kizárólag ezt a `.json` fájlt töltsd fel a megadott felületre.

> **Fontos:** a házikat automatizáltan javítjuk. Ha a JSON formátum hibás, a beadás 0 pontot ér — beadás előtt ellenőrizd (pl. a jsonlint.com oldalon). Az `azonosito` mező **mindhárom házinál pontosan ugyanaz** legyen (a GitHub-felhasználóneved — ugyanaz, amit a HF0-ban megadtál), különben nem fűződnek össze a beadásaid.

---

## A feladat

**Referencia alkalmazás:** https://practicesoftwaretesting.com/

> **User story:** „Vevőként szeretném a termékeket név szerint keresni, kategória és márka szerint szűrni, valamint ár szerint rendezni, hogy gyorsan megtaláljam a számomra releváns szerszámot."
>
> **Acceptance criteria (kiindulás — a pontos viselkedést ellenőrizd magán az appon):**
> - A keresőmezőbe írt szövegre a találati lista a névben egyezőkre szűkül.
> - Kategória és/vagy márka szűrő a megfelelő termékekre szűkít; több szűrő együtt (AND) tovább szűkít.
> - Az ár szerinti rendezés növekvő/csökkenő sorrendbe rendezi a találatokat.
> - Ha nincs találat, a felület üres állapotot / „nincs találat" jelzést mutat.
> - A szűrők törölhetők / visszaállíthatók.

Generálj AI segítségével **teljes teszteset-készletet** (happy path + edge/boundary/negative esetek), és írj **rövid tesztdokumentációt** is (tesztelési scope, megközelítés, összefoglaló).

Követelmények:
- **Legalább 5 teszteset.**
- Köztük **legalább 1 `happy_path`** ÉS **legalább 1** a `edge_case` / `boundary` / `negative` típusokból.
- A `tipus` mező csak ez a négy érték egyike lehet: `happy_path`, `edge_case`, `boundary`, `negative`.
- A lépések legyenek **számozottak**.
- A dokumentáció legyen **150–1000 karakter** (legalább 150, legfeljebb 1000).

> **Tipp:** ne csak a story alapján találgass — nyisd meg az appot, és nézd meg a tényleges viselkedést (keresés, szűrők kombinálása, üres találat, rendezés). A jó tesztesetek konkrét lépésekből és konkrét elvárt eredményből állnak.

---

## Beadási prompt

Amikor elkészültél, másold be az alábbi promptot az AI eszködbe, és illeszd bele a munkádat:

```
Az elkészült munkámat beadandó formátumba öntöd. Készíts EGY VALID JSON-t az alábbi PONTOS struktúrával. Ne adj hozzá és ne hagyj ki mezőt, ne tegyél köré ```json kerítést, és NE írj semmilyen egyéb szöveget — csak a JSON-t.

{
  "nev": "<teljes nevem>",
  "azonosito": "<a GitHub-felhasználóneved — ugyanaz, amit a HF0-ban megadtál>",
  "hazi_szam": 1,
  "tartalom": {
    "user_story": "<a user story teljes szövege>",
    "tesztesetek": [
      { "id": "TC01", "tipus": "<happy_path|edge_case|boundary|negative>",
        "nev": "<név>", "elofeltetel": "<előfeltétel>",
        "lepesek": ["1. ...", "2. ..."], "elvart_eredmeny": "<elvárt eredmény>" }
    ],
    "dokumentacio": "<150–1000 karakter>"
  }
}

SZABÁLYOK: a "tipus" csak a felsorolt 4 érték egyike lehet; legalább 5 teszteset; legalább 1 happy_path ÉS legalább 1 edge_case/boundary/negative; a lépések számozottak; a dokumentáció 150–1000 karakter között van. Adj vissza ELLENŐRZÖTTEN valid JSON-t.

A munkám:
<IDE ILLESZD BE A USER STORY-T ÉS A GENERÁLT TESZTESETEKET>
```

---

## Pontozás (max 50)

| Szempont | Pont |
|----------|------|
| Helyes JSON struktúra | 10 |
| Minimum 5 teszteset | 10 |
| Van happy_path ÉS edge_case/boundary/negative típus | 10 |
| Dokumentáció kitöltve (150–1000 karakter) | 5 |
| Tartalmi minőség (a tesztesetek lefedik az acceptance criteria-t, a lépések egyértelműek) | 15 |
| **Összesen** | **50** |

---

## Gyakori hibák

- **Hibás JSON szintaxis** — beadás előtt ellenőrizd. Hibás JSON = 0 pont.
- **Rossz `tipus` érték** — csak a négy megengedett szó egyike szerepelhet.
- **Túl kevés vagy egysíkú teszteset** — legyen meg az 5, és legyen köztük happy path ÉS edge/boundary/negative.
- **Dokumentáció hossza** — 150–1000 karakter (ne túl rövid, de túl hosszú se).
- **Eltérő `azonosito`** a házik között.
- **Rossz fájlnév** — tartsd a `Vezeteknev_Keresztnev_HF1.json` formátumot.
