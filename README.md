# GLIWICE: JERZY I WIDŁY

Przeglądarkowe RPG z widokiem z góry. Gra korzysta z Canvas API, działa bez instalowania zależności i zapisuje postęp w pamięci przeglądarki.

## Uruchomienie

Otwórz `index.html` w nowoczesnej przeglądarce. Możesz też uruchomić prosty serwer HTTP z tego folderu, np. `python -m http.server 8000`, a następnie wejść na `http://localhost:8000`.

## Sterowanie

- **WASD / strzałki** — ruch
- **Shift** — sprint (zużywa energię)
- **Spacja** — atak widłami
- **Q** — unik
- **E / Enter** — rozmowa, podnoszenie przedmiotów i używanie fontanny
- **H** — ukryj się przy drzewie lub kontenerze
- **Esc** — pauza i dziennik zadań

Dźwięk włączysz przyciskiem nuty w prawym górnym rogu. Postęp, ekwipunek i ukończone znaleziska zapisują się automatycznie w `localStorage`.

## Zawartość

Rynek, Park Chopina i Podwórko cudów są połączone przejściami. Rynek wykorzystuje dołączoną ilustrację `assets/mapa.jpg`, a `assets/jerzy.png` jest portretem/sprite'em ożywionego Neptuna. Pozostałe postacie, animacje, przedmioty, minimapa i efekty są rysowane proceduralnie. Kolizje blokują budynki, drzewa i elementy otoczenia. Neptun wykrywa Jerzego tylko w zasięgu wzroku, szuka go po utracie kontaktu, a podczas walki używa trójzębu, fali, szarży, strumieni i finałowego „Gniewu gliwickich wód”.
