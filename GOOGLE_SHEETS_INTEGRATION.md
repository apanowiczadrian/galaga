# Integracja Gry z Google Sheets - Apps Script

Instrukcja krok po kroku jak zbierać statystyki graczy do Google Sheets używając Apps Script.

---

## 📊 Struktura Danych Wysyłanych z Gry

Gra wysyła następujące dane na końcu rozgrywki:

```javascript
{
  // Dane gracza
  nick: "PlayerName",
  email: "player@example.com",

  // Wynik
  finalScore: 12345,
  finalWave: 15,
  enemiesKilled: 234,

  // Czas gry
  totalGameTime: "123.45", // sekundy
  timestamp: 1699273200000, // Unix timestamp

  // Strzały
  totalShots: 456,
  shotsPerSecond: "3.71",
  shotsByWeapon: {
    basic: 300,
    triple: 100,
    rocket: 56
  },

  // Power-upy
  powerUpsCollected: {
    life: 2,
    shield: 3,
    autofire: 5,
    tripleshot: 4,
    rocket: 1
  }
}
```

---

## 🔧 KROK 1: Tworzenie Google Sheet

### 1.1. Utwórz nowy Google Sheet
1. Przejdź do [Google Sheets](https://sheets.google.com)
2. Kliknij **+ Blank** (nowy pusty arkusz)
3. Nazwij arkusz: **"Space Invaders - Player Stats"**

### 1.2. Przygotuj nagłówki kolumn

W pierwszym wierszu (A1-U1) wpisz następujące nagłówki:

```
A1: Timestamp
B1: Date
C1: Time
D1: Nick
E1: Email
F1: Score
G1: Wave
H1: Enemies Killed
I1: Game Time (s)
J1: Total Shots
K1: Shots/Second
L1: Basic Shots
M1: Triple Shots
N1: Rocket Shots
O1: Life Powerups
P1: Shield Powerups
Q1: Autofire Powerups
R1: Tripleshot Powerups
S1: Rocket Powerups
T1: Device
U1: Browser
```

### 1.3. Formatowanie (opcjonalne)

- Zaznacz wiersz 1, ustaw **bold** (Ctrl+B)
- Ustaw **freeze** pierwszego wiersza: View → Freeze → 1 row
- Ustaw **auto-resize** kolumn: Format → Column → Resize columns A-U → Fit to data

---

## 📝 KROK 2: Apps Script - Tworzenie Endpointu

### 2.1. Otwórz Script Editor

1. W Google Sheets kliknij: **Extensions → Apps Script**
2. Usuń domyślny kod
3. Wklej poniższy kod:

```javascript
/**
 * Space Invaders - Google Sheets Integration
 * Endpoint do zbierania statystyk graczy
 */

// Nazwa arkusza (sheet) w którym zapisywać dane
const SHEET_NAME = 'Sheet1'; // Zmień jeśli twój arkusz ma inną nazwę

/**
 * Endpoint POST - odbiera dane z gry
 */
function doPost(e) {
  try {
    // Parse JSON data
    const data = JSON.parse(e.postData.contents);

    // Otwórz spreadsheet i arkusz
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found: ' + SHEET_NAME
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Przygotuj wiersz danych
    const timestamp = new Date(data.timestamp || Date.now());
    const row = [
      timestamp.toISOString(),                    // A: Timestamp (ISO)
      Utilities.formatDate(timestamp, 'GMT+1', 'yyyy-MM-dd'), // B: Date
      Utilities.formatDate(timestamp, 'GMT+1', 'HH:mm:ss'),   // C: Time
      data.nick || '',                            // D: Nick
      data.email || '',                           // E: Email
      data.finalScore || 0,                       // F: Score
      data.finalWave || 0,                        // G: Wave
      data.enemiesKilled || 0,                    // H: Enemies Killed
      parseFloat(data.totalGameTime) || 0,        // I: Game Time
      data.totalShots || 0,                       // J: Total Shots
      parseFloat(data.shotsPerSecond) || 0,       // K: Shots/Second
      data.shotsByWeapon?.basic || 0,             // L: Basic Shots
      data.shotsByWeapon?.triple || 0,            // M: Triple Shots
      data.shotsByWeapon?.rocket || 0,            // N: Rocket Shots
      data.powerUpsCollected?.life || 0,          // O: Life Powerups
      data.powerUpsCollected?.shield || 0,        // P: Shield Powerups
      data.powerUpsCollected?.autofire || 0,      // Q: Autofire Powerups
      data.powerUpsCollected?.tripleshot || 0,    // R: Tripleshot Powerups
      data.powerUpsCollected?.rocket || 0,        // S: Rocket Powerups
      data.device || 'Unknown',                   // T: Device
      data.browser || 'Unknown'                   // U: Browser
    ];

    // Dodaj wiersz na końcu arkusza
    sheet.appendRow(row);

    // Zwróć sukces
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully',
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Zwróć błąd
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint GET - test czy endpoint działa
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'OK',
    message: 'Space Invaders Stats Endpoint is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Funkcja testowa - możesz uruchomić w Script Editor
 */
function testEndpoint() {
  const testData = {
    nick: 'TestPlayer',
    email: 'test@example.com',
    finalScore: 12345,
    finalWave: 10,
    enemiesKilled: 150,
    totalGameTime: '123.45',
    totalShots: 400,
    shotsPerSecond: '3.24',
    shotsByWeapon: {
      basic: 250,
      triple: 100,
      rocket: 50
    },
    powerUpsCollected: {
      life: 1,
      shield: 2,
      autofire: 3,
      tripleshot: 2,
      rocket: 1
    },
    device: 'Desktop',
    browser: 'Chrome',
    timestamp: Date.now()
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

### 2.2. Zapisz i Wdroż

1. **Zapisz projekt**: Kliknij ikonę dyskietki lub Ctrl+S
2. Nazwij projekt: **"Space Invaders Stats API"**
3. **Wdróż jako Web App**:
   - Kliknij **Deploy → New deployment**
   - Wybierz typ: **Web app**
   - Ustawienia:
     - **Description:** "Space Invaders Stats Collector v1"
     - **Execute as:** Me (twoje konto)
     - **Who has access:** Anyone (każdy)
   - Kliknij **Deploy**
4. **Autoryzuj aplikację**:
   - Kliknij **Authorize access**
   - Wybierz swoje konto Google
   - Kliknij **Advanced → Go to [project name] (unsafe)** (to twój własny skrypt)
   - Kliknij **Allow**
5. **Skopiuj URL**:
   - Po deployment zobaczysz **Web app URL**
   - Format: `https://script.google.com/macros/s/AKfycby.../exec`
   - **SKOPIUJ TEN URL** - będziesz go potrzebować w następnym kroku!

---

## 🎮 KROK 3: Modyfikacja Kodu Gry

### 3.1. Stwórz nowy moduł do wysyłania danych

Stwórz nowy plik: `js/utils/analytics.js`

```javascript
/**
 * Analytics - Send game stats to Google Sheets
 */

// WKLEJ TUTAJ SWÓJ WEB APP URL Z APPS SCRIPT
const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

/**
 * Wykryj typ urządzenia
 */
function detectDevice() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

/**
 * Wykryj przeglądarkę
 */
function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    return 'Unknown';
}

/**
 * Wyślij statystyki do Google Sheets
 */
export async function sendStatsToGoogleSheets(playerData, stats) {
    try {
        // Przygotuj dane do wysłania
        const payload = {
            // Dane gracza
            nick: playerData.nick || 'Anonymous',
            email: playerData.email || '',

            // Wyniki
            finalScore: stats.finalScore || 0,
            finalWave: stats.finalWave || 0,
            enemiesKilled: stats.enemiesKilled || 0,

            // Czas gry
            totalGameTime: stats.totalGameTime || '0',

            // Strzały
            totalShots: stats.totalShots || 0,
            shotsPerSecond: stats.shotsPerSecond || '0',
            shotsByWeapon: stats.shotsByWeapon || {
                basic: 0,
                triple: 0,
                rocket: 0
            },

            // Power-upy
            powerUpsCollected: stats.powerUpsCollected || {
                life: 0,
                shield: 0,
                autofire: 0,
                tripleshot: 0,
                rocket: 0
            },

            // Metadata
            device: detectDevice(),
            browser: detectBrowser(),
            timestamp: Date.now()
        };

        console.log('📊 Sending stats to Google Sheets...', payload);

        // Wyślij POST request
        const response = await fetch(GOOGLE_SHEETS_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // Note: mode: 'no-cors' nie pozwala odczytać response,
        // ale request zostanie wysłany i przetworzony
        console.log('✅ Stats sent successfully!');
        return true;

    } catch (error) {
        console.error('❌ Error sending stats:', error);
        return false;
    }
}
```

### 3.2. Zmodyfikuj sketch.js

Znajdź funkcję `drawGameOverScreen` i dodaj wysyłanie danych:

```javascript
// Na początku pliku dodaj import
import { sendStatsToGoogleSheets } from './utils/analytics.js';

// W funkcji drawGameOverScreen (około linia 414):
function drawGameOverScreen(deltaTime) {
    // Draw stars in background
    game.drawStars(deltaTime);

    // Finalize statistics when game ends
    const stats = game.finalizeStats();

    // Log detailed stats to console only once
    if (!game.statsLogged) {
        console.log("Game Statistics:", stats);

        // 🆕 NOWE: Wyślij statystyki do Google Sheets
        sendStatsToGoogleSheets(game.playerData, stats).then(success => {
            if (success) {
                console.log('✅ Data saved to Google Sheets');
            } else {
                console.log('⚠️ Failed to save to Google Sheets (check console)');
            }
        });

        game.statsLogged = true;
    }

    // ... reszta kodu
}
```

### 3.3. Aktualizuj index.html

Dodaj nowy moduł do preload (jeśli używasz module bundlera) lub upewnij się że jest załadowany.

---

## 🧪 KROK 4: Testowanie

### 4.1. Test Apps Script

W Apps Script Editor:
1. Wybierz funkcję `testEndpoint` z dropdown
2. Kliknij **Run**
3. Sprawdź Google Sheet - powinien pojawić się testowy wiersz

### 4.2. Test w grze

1. Uruchom grę lokalnie
2. Zagraj i przegraj (lub ukończ grę)
3. Otwórz Console (F12)
4. Sprawdź czy widzisz:
   ```
   📊 Sending stats to Google Sheets... {nick: "...", score: ...}
   ✅ Stats sent successfully!
   ```
5. Sprawdź Google Sheet - powinien pojawić się nowy wiersz z twoimi danymi

---

## 📈 KROK 5: Analiza Danych (Opcjonalnie)

### 5.1. Dodaj arkusz z analizą

Utwórz nowy sheet (zakładka na dole): **"Analytics"**

### 5.2. Przykładowe formuły

**Top 10 Graczy:**
```
=QUERY(Sheet1!A2:U, "SELECT D, F, G, H ORDER BY F DESC LIMIT 10", 1)
```

**Średni wynik:**
```
=AVERAGE(Sheet1!F2:F)
```

**Łączna liczba gier:**
```
=COUNTA(Sheet1!A2:A)
```

**Najczęściej używana broń:**
```
=IF(SUM(Sheet1!L2:L) > SUM(Sheet1!M2:M),
    IF(SUM(Sheet1!L2:L) > SUM(Sheet1!N2:N), "Basic", "Rocket"),
    IF(SUM(Sheet1!M2:M) > SUM(Sheet1!N2:N), "Triple", "Rocket"))
```

### 5.3. Wykresy

1. **Scores Over Time:**
   - Zaznacz kolumny A (Timestamp) i F (Score)
   - Insert → Chart → Line chart

2. **Most Collected Powerups:**
   - Zaznacz kolumny O-S (Powerups)
   - Insert → Chart → Column chart

3. **Device Distribution:**
   - Zaznacz kolumnę T (Device)
   - Insert → Chart → Pie chart

---

## 🔒 KROK 6: Zabezpieczenia (Opcjonalnie)

### 6.1. Walidacja danych

W Apps Script możesz dodać walidację:

```javascript
// Na początku funkcji doPost():
if (!data.nick || data.nick.length < 2) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Invalid nick'
  })).setMimeType(ContentService.MimeType.JSON);
}

if (data.finalScore < 0 || data.finalScore > 1000000) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Invalid score'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### 6.2. Rate Limiting

Dodaj limit zapytań z tego samego IP:

```javascript
// W Apps Script
const RATE_LIMIT_KEY = 'rate_limit_';
const MAX_REQUESTS = 10; // Max 10 requestów
const TIME_WINDOW = 60 * 1000; // W ciągu 1 minuty

function checkRateLimit(ip) {
  const cache = CacheService.getScriptCache();
  const key = RATE_LIMIT_KEY + ip;
  const count = parseInt(cache.get(key) || '0');

  if (count >= MAX_REQUESTS) {
    return false;
  }

  cache.put(key, (count + 1).toString(), Math.ceil(TIME_WINDOW / 1000));
  return true;
}

// W doPost():
const ip = e.parameter.ip || 'unknown';
if (!checkRateLimit(ip)) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Rate limit exceeded'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🐛 Troubleshooting

### Problem: "Failed to save to Google Sheets"

**Rozwiązanie:**
1. Sprawdź czy URL w `analytics.js` jest poprawny
2. Sprawdź czy deployment jest **Anyone** (nie tylko twoje konto)
3. Sprawdź Console (F12) czy są błędy CORS/network

### Problem: "Sheet not found"

**Rozwiązanie:**
1. W Apps Script zmień `SHEET_NAME` na nazwę twojego arkusza
2. Domyślnie to 'Sheet1', ale może być inna nazwa

### Problem: Dane się nie zapisują

**Rozwiązanie:**
1. Test `testEndpoint()` w Apps Script
2. Sprawdź czy deployment jest aktywny (Deploy → Manage deployments)
3. Sprawdź czy arkusz nie jest chroniony (File → Share → Anyone with link can edit)

### Problem: CORS error

**To normalne!** Mode 'no-cors' nie pozwala odczytać response, ale dane są wysyłane. Sprawdź Google Sheet - dane powinny się tam pojawić.

---

## 📝 Notatki

- **Privacy:** Dane są przechowywane w twoim Google Drive, nie są publiczne
- **Backup:** Google Sheets automatycznie tworzy backup (File → Version history)
- **Export:** Możesz wyeksportować do CSV/Excel (File → Download)
- **Limit:** Google Sheets ma limit 10 milionów komórek (około 200k wierszy z 50 kolumnami)

---

## 🎉 Gotowe!

Teraz każda zakończona gra będzie automatycznie zapisywać statystyki do Google Sheets!

**Następne kroki:**
1. Zbieraj dane przez kilka dni
2. Analizuj wyniki w zakładce "Analytics"
3. Użyj danych do balance'owania gry
4. Stwórz publiczne leaderboardy!

---

_Utworzono: 2025-11-06_
_Wersja: 1.0_
