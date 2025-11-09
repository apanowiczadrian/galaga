# PWA Installation Issue - Investigation Report

**Data:** 2025-11-09
**Problem:** PWA nie instaluje się na Android Chrome - pokazuje tylko "Dodaj do ekranu głównego" zamiast "Zainstaluj"
**Status:** ❌ NIEROZWIĄZANE

---

## 🔍 Analiza Problemu

### Problem Zgłoszony
- Android Chrome wyświetla tylko opcję "Add to Home Screen" (shortcut)
- Brak opcji "Install" (prawdziwa instalacja PWA)
- Starsza wersja (commit na githubie) działała poprawnie
- Wprowadzono zbyt wiele zmian aby cofnąć do działającej wersji

### Porównanie z Działającą Wersją (Backup)

**Backup manifest.json (DZIAŁAŁO):**
```json
{
  "short_name": "spaceInv",
  "name": "Space Invaders",
  "icons": [
    {"src": "assets/spaceship.png", "type": "image/png", "sizes": "192x192"},
    {"src": "assets/spaceship.png", "type": "image/png", "sizes": "512x512"}
  ],
  "start_url": "index.html",
  "display": "fullscreen",
  "orientation": "landscape",
  "theme_color": "#000000",
  "background_color": "#000000"
}
```

**Kluczowe różnice:**
- Backup NIE miał service worker
- Backup używał prostego start_url: "index.html"
- Backup nie miał scope, id, ani innych dodatkowych pól
- Backup deklarował te same rozmiary ikon co current

---

## 📋 Badania - PWA Requirements 2025

### Źródła Research
1. MDN Progressive Web Apps Documentation
2. Chrome for Developers - Lighthouse PWA Guide
3. Web.dev PWA Guidelines
4. Stack Overflow - Recent PWA issues

### Wymagania Chrome dla PWA (2025)

**Obowiązkowe:**
1. ✅ HTTPS lub localhost
2. ✅ Valid manifest.json z polami:
   - `name` lub `short_name`
   - `icons` (192x192 i 512x512 PNG)
   - `start_url`
   - `display` (fullscreen/standalone/minimal-ui)
3. ✅ Service Worker z fetch handler
4. ✅ Ikony PNG (nie JPG) w dokładnych rozmiarach

**Zalecane (2025 standards):**
- `id` - stabilny identyfikator (Chrome 96+)
- `scope` - granice aplikacji
- `purpose: "any"` w deklaracjach ikon
- `lang` - język aplikacji
- `categories` - kategoryzacja
- `screenshots` - richer install prompts

---

## 🛠️ Wykonane Naprawy

### Iteracja 1: Dodanie Service Worker (2025-11-09)

**Problem zidentyfikowany:**
- Brak service worker (krytyczny wymóg PWA)

**Akcje:**
1. ✅ Utworzono `service-worker.js` z:
   - Install event handler
   - Activate event handler
   - Fetch event handler (cache-first strategy)
   - Cache dla wszystkich 50+ zasobów gry
2. ✅ Dodano rejestrację SW w index.html (przed `</body>`)
3. ✅ Zaktualizowano manifest.json:
   - Icon sizes: 200x200 → 192x192 (fix)
   - start_url: "/" zamiast "index.html"
   - Dodano scope: "/"
   - Dodano description
   - Dodano purpose: "any maskable"

**Rezultat:** ❌ Nie zadziałało

**Analiza:**
- Zmiana icon size na 200x200 była błędem (nieprawidłowy rozmiar dla PWA)
- start_url "/" konfliktował z ścieżkami cache
- scope "/" mógł powodować problemy

### Iteracja 2: Revert do Backup Config (2025-11-09)

**Problem zidentyfikowany:**
- Icon size "200x200" jest nieprawidłowy (PWA wymaga: 192, 256, 384, 512)
- start_url mismatch z service worker cache
- Scope conflicts

**Akcje:**
1. ✅ Przywrócono manifest.json:
   - Icon sizes: 200x200 → 192x192
   - start_url: "/" → "index.html"
   - Usunięto scope: "/"
   - Usunięto purpose: "any maskable"
   - Zostawiono description (nie psuje PWA)
2. ✅ Zaktualizowano service worker ścieżki:
   - Wszystkie absolute `/path` → relative `./path`
3. ✅ Zaktualizowano rejestrację SW:
   - `/service-worker.js` → `./service-worker.js`

**Rezultat:** ❌ Nie zadziałało

### Iteracja 3: PWA 2025 Standards (2025-11-09)

**Problem zidentyfikowany:**
- Rzeczywisty plik spaceship.png ma wymiary 167x169 (nie 192x192!)
- Manifest deklaruje 192x192 i 512x512 ale dostarcza niewłaściwy plik
- Chrome waliduje rzeczywiste wymiary vs deklaracje

**Akcje:**
1. ✅ User zmienił rozmiar spaceship.png na dokładnie 192x192 px
2. ✅ User stworzył spaceship512.png o wymiarach 512x512 px
3. ✅ Zaktualizowano manifest.json:
   ```json
   {
     "id": "/",
     "scope": "/",
     "start_url": "/",
     "lang": "pl",
     "categories": ["games", "entertainment"],
     "icons": [
       {
         "src": "assets/spaceship.png",
         "sizes": "192x192",
         "purpose": "any"
       },
       {
         "src": "assets/spaceship512.png",
         "sizes": "512x512",
         "purpose": "any"
       }
     ]
   }
   ```
4. ✅ Dodano apple-touch-icon do index.html:
   ```html
   <link rel="apple-touch-icon" href="assets/spaceship.png">
   ```
5. ✅ Zaktualizowano service worker:
   - Version: 1.0.0 → 2.0.0
   - Cache name: v1 → v2
   - Dodano spaceship512.png do cache

**Rezultat:** ❌ Nie zadziałało

---

## 📊 Aktualny Stan Konfiguracji

### Pliki Zmodyfikowane

**manifest.json:**
- ✅ id: "/"
- ✅ scope: "/"
- ✅ start_url: "/"
- ✅ lang: "pl"
- ✅ categories: ["games", "entertainment"]
- ✅ icons: spaceship.png (192x192), spaceship512.png (512x512)
- ✅ purpose: "any" dla obu ikon
- ✅ display: "fullscreen"
- ✅ orientation: "landscape"

**service-worker.js:**
- ✅ Version 2.0.0
- ✅ Cache name: lodis-galaga-v2
- ✅ Relative paths (./)
- ✅ Install, activate, fetch handlers
- ✅ Cache-first strategy
- ✅ Wszystkie assety w cache (50+)

**index.html:**
- ✅ Service worker registration (./service-worker.js)
- ✅ Apple touch icon link
- ✅ Manifest link
- ✅ Theme color meta
- ✅ Viewport meta (mobile optimized)
- ✅ apple-mobile-web-app-capable

---

## 🧪 Testy Do Wykonania

### Chrome DevTools Checklist

**Application → Manifest:**
- [ ] Brak błędów w sekcji "Errors"
- [ ] Ikony preview widoczne dla 192x192 i 512x512
- [ ] Wszystkie pola poprawnie odczytane

**Application → Service Workers:**
- [ ] Status: "activated and running"
- [ ] Scope poprawny
- [ ] Update on reload OFF (dla testów)

**Application → Installability:**
- [ ] Check "Installability" w lewym menu
- [ ] Sprawdź czy pokazuje "Installable" czy błędy

**Console:**
- [ ] Sprawdź czy są błędy związane z manifestem
- [ ] Sprawdź czy SW się zarejestrowało
- [ ] Sprawdź czy są 404 dla ikon

### Mobile Testing

**Android Chrome:**
1. [ ] Otwórz chrome://inspect/#devices (remote debugging)
2. [ ] Sprawdź konsole errors na mobile
3. [ ] Sprawdź Application → Manifest na mobile
4. [ ] Menu → sprawdź dokładną nazwę opcji
5. [ ] Long press na zainstalowanej ikonie - "Uninstall" czy "Remove"?

---

## 🔍 Możliwe Przyczyny (Do Zbadania)

### 1. Konflikt Ścieżek

**Hipoteza:** Mismatch między manifest (start_url: "/") a service worker (relative paths)

**Test:**
- Zmienić wszystkie ścieżki w SW z `./` na `/`
- LUB zmienić manifest start_url z `/` na `./`
- LUB zmienić manifest start_url z `/` na `index.html`

### 2. Service Worker Scope Issue

**Hipoteza:** scope: "/" w manifeście vs actual SW scope

**Test:**
- Usunąć scope z manifestu (jak w backup)
- LUB zmienić SW registration na `/service-worker.js` z scope `/`

### 3. Icon Path Issues

**Hipoteza:** Relative paths w manifeście mogą nie działać z scope: "/"

**Test:**
- Zmienić icon paths na absolute: `/assets/spaceship.png`
- Sprawdzić w Network tab czy ikony się ładują
- Sprawdzić MIME type w headers (powinno być image/png)

### 4. PWA Already Installed

**Hipoteza:** Stara wersja PWA cached, nowa nie może się zainstalować

**Test:**
- Kompletne odinstalowanie starej wersji (jeśli istnieje)
- Clear all site data w DevTools
- Clear service workers
- Hard refresh (Ctrl+Shift+R)
- Restart Chrome

### 5. Deployment Environment

**Hipoteza:** Lokalne vs production hosting issues

**Test:**
- Sprawdzić czy na localhost działa
- Sprawdzić czy na HTTPS production działa
- Sprawdzić headers serwera (service-worker.js powinien mieć correct MIME)

### 6. Chrome Version

**Hipoteza:** Wymagania mogły się zmienić w najnowszym Chrome

**Test:**
- Sprawdzić wersję Chrome
- Przetestować na starszej wersji Chrome
- Sprawdzić changelog Chrome PWA requirements

---

## 📝 Następne Kroki

### Priorytet 1: Diagnostyka
1. [ ] Uruchomić na localhost z http-server
2. [ ] Otworzyć Chrome DevTools → Application
3. [ ] Sprawdzić WSZYSTKIE sekcje:
   - Manifest (errors?)
   - Service Workers (status?)
   - Installability (issues?)
4. [ ] Sprawdzić Console errors
5. [ ] Sprawdzić Network tab - czy wszystkie pliki się ładują?

### Priorytet 2: Path Consistency Test
1. [ ] Test A: Wszystko relative
   - manifest start_url: "./"
   - manifest icons: "./assets/..."
   - SW paths: "./..."
   - SW registration: "./service-worker.js"

2. [ ] Test B: Wszystko absolute
   - manifest start_url: "/"
   - manifest icons: "/assets/..."
   - SW paths: "/..."
   - SW registration: "/service-worker.js"

3. [ ] Test C: Hybrid (jak backup)
   - manifest start_url: "index.html"
   - manifest icons: "assets/..." (no leading dot/slash)
   - Usunąć scope z manifestu
   - SW paths: relative "./..."

### Priorytet 3: Minimal Config Test
1. [ ] Cofnąć manifest do absolute minimum (jak backup):
   - Tylko: name, short_name, icons, start_url, display, orientation, colors
   - Usunąć: id, scope, lang, categories, description, purpose
2. [ ] Sprawdzić czy to działa
3. [ ] Stopniowo dodawać pola z powrotem

### Priorytet 4: Icon Verification
1. [ ] Sprawdzić rzeczywiste wymiary plików:
   ```bash
   file assets/spaceship.png
   file assets/spaceship512.png
   ```
2. [ ] Otworzyć w edytorze graficznym - verify exact pixels
3. [ ] Sprawdzić czy PNG nie są corrupted

---

## 🐛 Known Issues

### Issue #1: Service Worker Not in Backup
- Backup działał BEZ service workera
- Dodanie SW mogło wprowadzić nowe problemy
- Chrome może wymagać SW ale też mogą być z nim konflikty

### Issue #2: Path Inconsistency
- Manifest używa absolute paths ("/")
- Service Worker używa relative paths ("./")
- To może powodować problemy z scope resolution

### Issue #3: start_url Changed
- Backup: "index.html"
- Current: "/"
- Zmiana mogła złamać navigation scope

---

## 📚 Referencje

### Chrome PWA Requirements
- https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest
- https://web.dev/learn/pwa/web-app-manifest
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable

### Service Worker
- https://web.dev/learn/pwa/service-workers
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

### Troubleshooting
- https://stackoverflow.com/questions/tagged/progressive-web-apps
- Chrome DevTools → Lighthouse → PWA audit

---

## 📅 Timeline

**2025-11-09 14:00** - Problem zgłoszony
**2025-11-09 14:15** - Analiza backup vs current
**2025-11-09 14:30** - Research PWA 2025 requirements
**2025-11-09 14:45** - Iteracja 1: Dodano service worker
**2025-11-09 15:00** - Iteracja 2: Revert manifest do backup config
**2025-11-09 15:15** - Iteracja 3: PWA 2025 standards + proper icons
**2025-11-09 15:30** - Test failed - problem persists
**2025-11-09 15:45** - Raport utworzony

---

## ⚠️ WARNING

**NIE cofać do backup commit!** Zbyt wiele zmian funkcjonalnych zostało wprowadzonych. Problem jest specyficzny dla PWA i musi być rozwiązany w current state.

---

**Status:** Problem requires further investigation. PWA installation still not working on Android Chrome despite meeting all documented 2025 requirements.
