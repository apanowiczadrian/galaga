// LODIS - GALAGA Service Worker
// Version 2.0.0

const CACHE_NAME = 'lodis-galaga-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/sketch.js',
  '/js/Game.js',
  '/js/core/constants.js',
  '/js/core/viewport.js',
  '/js/core/input.js',
  '/js/core/GameStates.js',
  '/js/entities/Player.js',
  '/js/entities/Enemy.js',
  '/js/entities/Projectile.js',
  '/js/entities/PowerUp.js',
  '/js/entities/Comet.js',
  '/js/systems/PowerUpManager.js',
  '/js/systems/CometManager.js',
  '/js/systems/ScoreManager.js',
  '/js/systems/WeaponHeatSystem.js',
  '/js/systems/SpatialGrid.js',
  '/js/systems/EnemyBatchRenderer.js',
  '/js/systems/TextCache.js',
  '/js/ui/StartMenu.js',
  '/js/ui/GameOverScreen.js',
  '/js/ui/DevOverlay.js',
  '/js/ui/PerformanceMonitor.js',
  '/js/ui/TouchStrip.js',
  '/js/ui/CanvasButton.js',
  '/js/ui/WeaponHeatBar.js',
  '/js/utils/leaderboardAPI.js',
  '/js/utils/analytics.js',
  '/js/config/wavePatterns.js',
  '/assets/spaceship.png',
  '/assets/spaceship512.png',
  '/assets/boss.png',
  '/assets/penguin/1.png',
  '/assets/penguin/2.png',
  '/assets/penguin/3.png',
  '/assets/penguin/4.png',
  '/assets/penguin/5.png',
  '/assets/penguin/6.png',
  '/assets/penguin/7.png',
  '/assets/penguin/8.png',
  '/assets/penguin/9.png',
  '/assets/comet.png',
  '/assets/heart.png',
  '/assets/shield.png',
  '/assets/autofire.png',
  '/assets/tripleshot.png',
  '/assets/rocket.png',
  '/assets/PressStart2P-Regular.ttf'
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip cross-origin requests (Google Fonts, Google Sheets API, etc.)
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return cached response
        if (response) {
          return response;
        }

        // Cache miss - fetch from network
        return fetch(request)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response (can only be consumed once)
            const responseToCache = response.clone();

            // Cache the new resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            throw error;
          });
      })
  );
});

// Message event - handle commands from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
