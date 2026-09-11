# FilthyFilter — pokyny pre všetkých agentov

Toto je hlavný súbor pravidiel pre Claude, Codex, Antigravity a všetkých ostatných
AI agentov pracujúcich v tomto repozitári. Platí rovnako pre všetkých.

**Pre podrobnejší kontext projektu** pozri `CLAUDE.md` (projekt, vetvy, nasadenie).

---

## Pomocné skripty: Python, nie Node.js inline

Keď potrebuješ spustiť pomocný skript na manipuláciu so súbormi, reťazcami,
JSON alebo akoukoľvek command-line úlohou mimo webrootu:

**Použi Python skript uložený do súboru. Nikdy `node -e "..."` ani `python -c "..."`.**

### Prečo

- Inline `-e` / `-c` argumenty v PowerShelli vyžadujú komplikované escapovanie
  úvodzoviek, apostrofov a backtikov, čo vedie k chybám.
- Skript v súbore to nepotrebuje — triple-quoted strings, backticky, špeciálne
  znaky fungujú bez úprav.

### Postup

1. Napíš skript do súboru (odporúčaný adresár: `scratch/` alebo dočasný adresár
   mimo webrootu, nikdy priamo do webrootu).
2. Spusti ho: `python nazov_skriptu.py`
3. Po dokončení súbor buď zmaž alebo ponechaj pre audit.

### Vzor

```python
# Správne: skript v súbore, žiadne escaping peklo
from pathlib import Path

path = Path("D:/whispAir-IT/filthyfilter/docs/STATUS.md")
content = path.read_text(encoding="utf-8")
content = content.replace("starý text", "nový text")
path.write_text(content, encoding="utf-8")
print("Hotovo")
```

```powershell
# Správne: spustenie skriptu
python skript.py

# Zle: inline argument s escapovaním
node -e "const fs = require('fs'); fs.writeFileSync('file.txt', 'hello \`world\`');"
```

### CRLF

Repozitár používa CRLF (`\r\n`). Pri zápise súborov:
- `Path.read_text()` / `Path.write_text()` zachová pôvodné konce riadkov.
- Pri explicitnom zostavovaní reťazcov použi `\r\n` alebo zisti konce riadkov
  z existujúceho obsahu: `nl = "\r\n" if "\r\n" in content else "\n"`.

---

## Ostatné pravidlá projektu

Pozri `CLAUDE.md` — platia rovnako pre všetkých agentov:
- Pracovná vetva: `codex/filthyfilter-redesign`
- Čisté HTML/CSS/JS bez frameworku v produkcii
- Iba SK a EN jazyky
- Značka: **FilthyFilter by whispAir**
