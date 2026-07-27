# 🎧 Retro odtwarzacz MP3 do wydrukowania 3D - "MP3D"
> **Wbudowany cyfrowy odtwarzacz audio w stylu retro, wyposażony w szpule obracane serwomechanizmem, obudowę z druku 3D i sterowanie ESP32.**

---

## 👋 O projekcie
Projekt został zainspirowany [3D renderem](https://pin.it/7sLObrf5z) kiedyś znalezionym w internecie. Przypomniałem sobie o nim chwile po zakupie drukarki 3D i uznałem, że bedzie to ciekawy projekt do tworzenia w wolnym czasie.  
Projekt miał połączyć w sobie głównie elektronikę i projektowanie 3D, którymi to dziedzinami jestem zaciekawiony, ale jednak nie mam dużo doświadczenia.
Urządzenie ma bazować na mikrokontrolerze **ESP32** orad module audio **DFPlayer Mini**. Wyposażone też będzie w wyświetlacz OLED, fizyczny enkoder do regulacji głośności i kontrolowania muzyki, oraz moduł ładowania akumulatora i dodatek, który najbardziej chciałem uwzględnić - servo - jako narzędzie do obracanie ołówkami, z przodu urządzenia - z celem czysto estetycznym.

### 💡 Lista elementów 
| Element | Funkcja | Interfejs / Protokół |
| :--- | :--- | :--- |
| **Płytka ESP32** | Główny mikrokontroler, logika UI, sterowanie | UART, I2C, GPIO, PWM |
| **DFPlayer Mini** | Dekoder plików MP3/WAV ze slotem MicroSD | UART Serial (`9600 baud`) |
| **OLED 0.96" SSD1306** | Wyświetlacz graficzny (`128x64`) | I2C (`0x3C`) |
| **Enkoder obrotowy (EC11)** | Płynna regulacja głośności z przyciskiem | GPIO |
| **Serwo** | Napęd obrotowy szpul kasety | Sterowanie sygnałem PWM |
| **Gniazdo Mini-Jack 3.5mm** | Wyjście słuchawkowe / AUX | Wyjście analogowe DAC (`DAC_L`, `DAC_R`) |
| **Moduł Powerbank 5V 2.4A + Akumulator 3.7V 1200mAh** | Zarządzanie zasilaniem i ładowanie USB-C | Magistrala zasilania 3.7V - 4.2V |

---

## 📑 Dziennik projektowania CAD i druku 3D

Stworzenie obudowy wymagało wielokrotnych iteracji w celu dopasowania tolerancji wymiarowych, uniknięcia odkształceń termicznych (warping) oraz zapewnienia stabilnej konstrukcji.

### Historia wersji
(Wersje były tworzone na podstawie plików CAD, więc zwykle jeżeli były opisywane to na koniec dnia)

#### `v0.3` — Poprawa jakości druku i orientacji
- **Problem:** Druk elementów pod kątem powodował brzydkie linie warstw i słabą estetykę wykończenia.
- **Rozwiązanie:** Przeprojektowanie obudowy tak, aby drukować elementy płasko na stole. Zastosowanie modułowej konstrukcji (inspirowanej kasetami-lightboxami na makerworld).

#### `v1.1` — Kalibracja tolerancji i kołków montażowych
- **Problem:** Narożne kołki montażowe pękały przy składaniu przez zbyt ciasne pasowanie i słabą wytrzymałość warstw.
- **Problem:** Brak otworów na przewody ekranu OLED oraz zbyt niski uchwyt montażowy ekranu.
- **Rozwiązanie:** Zwiększenie średnicy otworów, podniesienie uchwytu OLED i dodanie kanałów na kable.

#### `v1.2` — Wzmocnienia mechaniczne
- **Problem:** Kołki wciskane nadal pękały pod wpływem nacisku.
- **Rozwiązanie:** Dodanie bloku wspierającego dla ekranu OLED. Dodanie luzu montażowego na połączeniach (`+0.25mm`).

#### `v3.1` — Integracja kasety z obudową główną
- **Poprawki:**
  - Dodanie tylnej podpory ekranu OLED usuwającej efekt przechylania ekranu.
  - Wprowadzenie kieszeni na magnesy (4x magnesy N52) oraz pinów ustalających do stabilnego łączenia kasety z obudową.
  - Wykonanie rowka na górną część i dopasowanie pokrywy.

#### `v3.2` — Zarządzanie ciepłem i poprawki końcowe
- **Wnioski:** Drukowanie wielu elementów jednocześnie na jednej płycie powodowało ponowne nagrzewanie podstawy i odkształcanie narożników (warping). Zakupione magnesy są za małe i nie dają rezultatów lepszych niż zwykłe tarcie pomiędzy elementami - rezygnujemy z magnesów.
- **Poprawki:**
  - Usunięcie kieszeni na magnesy.
  - Przejście na druk pojedynczych elementów z dodaniem krawędzi typu "brim".
  - Zwiększenie promienia komory na akumulator dla łatwiejszego montażu.
  - Wydłużenie otworu na port USB-C.
  - Nowy projekt pokrętła głośności zakrywający elementy montażowe, ale nadal pozostawiający miejsce na klikanie gałką.

#### 🛏️ Przerwa - Oczekiwanie na filamenty
- **Filamenty:** Doszedłem do wniosku, że fajnym ostatecznym designem byłby arbuz. Obudowa koloru zielonego, zaś kaseta czerwona, z czarnymi pestkami z przodu. Projekt wstrzymany, aż będą filamenty. Nie chce kupować ich kiedy w domu jest dużo innych jeszcze niewykorzystanych.
- **Zlutowanie systemu:** Również jest przerwane, zajmę się tym dopiero jak wydrukuje zadawalające mnie ciało MP3ki, poniewaz nie przewiduje opcji rozebrania jej na części po zlutowaniu (servo aby stabilnie siedziało w obudownie, nie będzie miało możliwości bycia wyjętym po zlutowaniu z mikrokontrolerem - co za tym idzie cały układ, również nie będzie wyjmowalny), jedyną opcją byłoby wyłamywanie obudowy, ale naraża to niepotrzebnie elektroniczne podzespoły.

