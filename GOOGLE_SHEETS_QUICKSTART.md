# Google Sheets Integration - Quick Start

Szybki przewodnik do integracji gry z Google Sheets w 5 minut.

---

## ⚡ Quick Start (5 minut)

### 1️⃣ Stwórz Google Sheet

1. Otwórz [Google Sheets](https://sheets.google.com)
2. Kliknij **+ Blank**
3. Nazwij: "Space Invaders Stats"
4. Skopiuj nagłówki z sekcji poniżej

**Nagłówki (wklej w wiersz 1):**
```
Timestamp | Date | Time | Nick | Email | Score | Wave | Enemies Killed | Game Time (s) | Total Shots | Shots/Second | Basic Shots | Triple Shots | Rocket Shots | Life Powerups | Shield Powerups | Autofire Powerups | Tripleshot Powerups | Rocket Powerups | Device | Browser
```

---

### 2️⃣ Apps Script

1. W Google Sheets: **Extensions → Apps Script**
2. Usuń domyślny kod
3. Skopiuj kod z: `GOOGLE_SHEETS_INTEGRATION.md` (sekcja "KROK 2")
4. **Save** (Ctrl+S)
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Kliknij **Deploy**
6. **Authorize access** (zaloguj się)
7. **Skopiuj URL** (format: `https://script.google.com/macros/s/...`)

---

### 3️⃣ Konfiguracja Gry

1. Otwórz: `js/utils/analytics.js`
2. Znajdź linię:
   ```javascript
   const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
3. Zamień `YOUR_DEPLOYMENT_ID` na twój URL z kroku 2
4. Zapisz plik

---

### 4️⃣ Dodaj do sketch.js

Otwórz: `js/sketch.js`

**Dodaj import na górze pliku (około linii 23):**
```javascript
import { sendStatsToGoogleSheets } from './utils/analytics.js';
```

**Znajdź funkcję `drawGameOverScreen` (około linii 414) i dodaj:**
```javascript
if (!game.statsLogged) {
    console.log("Game Statistics:", stats);

    // 🆕 Dodaj tę linię:
    sendStatsToGoogleSheets(game.playerData, stats);

    game.statsLogged = true;
}
```

---

### 5️⃣ Test

1. Uruchom grę: `http-server -c-1`
2. Zagraj i zakończ grę
3. Sprawdź Console (F12): powinno być `✅ Stats sent to Google Sheets!`
4. Sprawdź Google Sheet: powinien być nowy wiersz z danymi

**Test w Console:**
```javascript
testAnalytics() // Wywołaj w Console (F12)
```

---

## 🎉 Gotowe!

Teraz każda zakończona gra będzie zapisywać dane do Google Sheets!

---

## 📊 Przykładowe Dane

Po kilku grach zobaczysz w Google Sheet:

| Timestamp | Nick | Score | Wave | Device | Browser |
|-----------|------|-------|------|--------|---------|
| 2025-11-06 14:30 | Player1 | 12345 | 15 | Mobile | Chrome |
| 2025-11-06 14:35 | Player2 | 9876 | 12 | Desktop | Firefox |
| 2025-11-06 14:40 | Player3 | 15432 | 18 | Tablet | Safari |

---

## 🐛 Nie działa?

### Problem: "endpoint not configured"
**Rozwiązanie:** Sprawdź czy w `analytics.js` wkleiłeś prawdziwy URL (nie `YOUR_DEPLOYMENT_ID`)

### Problem: "Failed to save"
**Rozwiązanie:**
1. Sprawdź czy deployment ma "Who has access: **Anyone**"
2. Re-deploy: Deploy → Manage deployments → Edit → New Version

### Problem: Brak danych w Google Sheet
**Rozwiązanie:**
1. W Apps Script uruchom `testEndpoint()`
2. Sprawdź czy nazwa arkusza to "Sheet1" (zmień w kodzie Apps Script jeśli inna)

---

## 📖 Więcej Informacji

Pełna instrukcja z analizą danych, zabezpieczeniami i troubleshootingiem:
👉 **`GOOGLE_SHEETS_INTEGRATION.md`**

---

_Quick Start Guide v1.0_
