Poniżej znajduje się precyzyjna, bezkompromisowa lista TODO, która ma na celu systematyczne wyeliminowanie każdego potencjalnego błędu. Proszę postępować zgodnie z kolejnością.

### Lista TODO: Plan Naprawczy PWA

#### Etap 1: Krytyczne Poprawki Ścieżek i Konfiguracji (Priorytet Najwyższy)

To są absolutnie kluczowe zmiany. Bez nich dalsza diagnostyka nie ma sensu. Problem leży w fundamentalnej niespójności między ścieżkami relatywnymi i absolutnymi.

*   **Zadanie 1: Ujednolicenie `start_url` i `scope` w `manifest.json`.**[1]
    *   **Problem:** Obecnie `start_url` i `scope` są ustawione na `"/"`, co jest prawidłowe i oznacza root domeny. Jednak reszta aplikacji używa ścieżek relatywnych (`./`).
    *   **Akcja:** Pozostaw `"start_url": "/"` i `"scope": "/"` bez zmian. To jest nasz punkt odniesienia.

*   **Zadanie 2: Modyfikacja rejestracji Service Workera w `index.html`.**[2]
    *   **Problem:** Service Worker jest rejestrowany ze ścieżką relatywną: `navigator.serviceWorker.register('./service-worker.js')`. Przeglądarka może mieć problem z ustaleniem, czy jego zakres pokrywa się z zakresem manifestu (`/`).
    *   **Akcja:** Zmień ścieżkę na absolutną. To krytyczna zmiana.
        ```javascript
        // ZMIEŃ TO:
        navigator.serviceWorker.register('./service-worker.js')
        // NA TO:
        navigator.serviceWorker.register('/service-worker.js') 
        ```

*   **Zadanie 3: Poprawa ścieżek w `service-worker.js`.**[3]
    *   **Problem:** Lista `urlsToCache` używa ścieżek relatywnych z kropką (`./`, `./index.html`, `./assets/spaceship.png` itd.). Service Worker musi cache'ować zasoby używając ścieżek absolutnych, aby Chrome uznał, że kontroluje on zasoby zadeklarowane w `scope`.
    *   **Akcja:** Przerób **wszystkie** ścieżki w `urlsToCache`, aby były absolutne od roota domeny.
        ```javascript
        // ZMIEŃ TO:
        const urlsToCache = [
          './',
          './index.html',
          './manifest.json',
          './css/style.css',
          './assets/spaceship.png',
          // ... i tak dalej
        ];

        // NA TO:
        const urlsToCache = [
          '/',
          '/index.html',
          '/manifest.json',
          '/css/style.css',
          '/assets/spaceship.png',
          // ... i tak dalej dla KAŻDEGO pliku
        ];
        ```

*   **Zadanie 4: Poprawa linku do manifestu w `index.html`.**[2]
    *   **Problem:** Link do manifestu jest relatywny (`href="manifest.json"`). Chociaż przeglądarki są tu często pobłażliwe, dla pełnej spójności należy użyć ścieżki absolutnej.
    *   **Akcja:** Zmień ścieżkę na absolutną.
        ```html
        <!-- ZMIEŃ TO: -->
        <link rel="manifest" href="manifest.json">
        <!-- NA TO: -->
        <link rel="manifest" href="/manifest.json">
        ```

#### Etap 2: Weryfikacja i Czyste Testowanie

Po wprowadzeniu powyższych zmian, musimy mieć pewność, że testujemy na "świeżo".

*   **Zadanie 5: Całkowite wyczyszczenie danych witryny.**
    *   **Akcja (PC):** Otwórz DevTools (`F12`), idź do `Application` -> `Storage`, zaznacz **wszystko** i kliknij `Clear site data`.
    *   **Akcja (Android):** Podłącz telefon do komputera, użyj `chrome://inspect/#devices` i zrób to samo w zdalnych DevTools. Alternatywnie, w telefonie: `Ustawienia` -> `Aplikacje` -> `Chrome` -> `Pamięć` -> `Zarządzaj miejscem` -> `Wyczyść wszystkie dane` (bardziej drastyczne) lub `Ustawienia` -> `Ustawienia witryn` i wyczyść dane dla Twojej konkretnej domeny.

*   **Zadanie 6: Ponowna, metodyczna weryfikacja w DevTools.**
    *   **Akcja:** Użyj zdalnego debugowania. Skup się na zakładce `Application`.
        1.  **`Manifest`:** Sprawdź, czy nie ma żadnych błędów. Upewnij się, że wszystkie ikony ładują się poprawnie, a `start_url` to `/`.
        2.  **`Service Workers`:** Zweryfikuj, czy nowy Service Worker (z `/service-worker.js`) jest **aktywny i uruchomiony**.
        3.  **`Installability`:** To Twoje centrum dowodzenia. Chrome **musi** tu pokazać listę spełnionych kryteriów. Jeśli coś jest nie tak, wskaże dokładnie co.

#### Etap 3: Działania Opcjonalne (Dobre Praktyki i Dalsza Diagnostyka)

Jeśli problem wciąż występuje, co jest mało prawdopodobne po Etapie 1 i 2, oto kolejne kroki.

*   **Zadanie 7: Dodanie ikony `maskable`.**
    *   **Problem:** Android często nakłada maski na ikony. Ikona bez zadeklarowanego `purpose: "maskable"` może być niepoprawnie przycięta. Nie blokuje to instalacji, ale psuje estetykę.
    *   **Akcja:** Stwórz wariant ikony 512x512 z bezpiecznym marginesem, przetestuj go np. na `maskable.app`, i dodaj do manifestu:
        ```json
        {
          "src": "/assets/spaceship512_maskable.png",
          "type": "image/png",
          "sizes": "512x512",
          "purpose": "maskable"
        }
        ```
*   **Zadanie 8: Weryfikacja logiki `fetch` w `service-worker.js`.**[3]
    *   **Problem:** Twój obecny handler `fetch` jest standardowy (cache-first, network fallback) i powinien działać. Jednak upewnij się, że nie ma żadnych warunków, które mogłyby przerwać obsługę żądania offline dla kluczowych zasobów (jak `index.html`).
    *   **Akcja:** Przetestuj tryb offline w DevTools (`Application` -> `Service Workers` -> `Offline`). Aplikacja musi się załadować. Jeśli nie, handler `fetch` ma błąd.

Wykonaj zadania z Etapu 1 skrupulatnie. Gwarantuję, że problem leży w niespójności ścieżek. Po ich naprawieniu i wyczyszczeniu cache'u, monit instalacyjny powinien się pojawić. Powodzenia.

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/51420046/86c269b1-2293-4d3d-9bc5-b1cf571d80e0/manifest.json)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/51420046/582cc958-1ec1-415d-b364-504845c4af0c/index.html)
[3](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/51420046/f718bac5-4021-4f10-8878-6cc48f872256/service-worker.js)