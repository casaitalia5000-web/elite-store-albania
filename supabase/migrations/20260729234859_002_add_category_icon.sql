/*
# Shto kolone icon per kategorite

1. Tabelat e modifikuar
- `categories`: shtohet kolona `icon` (text, nullable) per te ruajtur emrin e ikones lucide.
2. Siguri
- Ndryshim pa ndikim ne RLS.
*/

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text;
