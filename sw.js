/**
 * ETEAS Energy - Service Worker
 * Progressive Web App functionality for offline access and caching
 */

const CACHE_NAME = "eteas-energy-v1.0.0";
const OFFLINE_CACHE_NAME = "eteas-offline-v1.0.0";

// Assets to cache immediately when service worker installs
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/services.html",
  "/products.html",
  "/projects.html",
  "/contact.html",
  "/404.html",
  "/assets/css/main.css",
  "/assets/css/responsive.css",
  "/assets/css/forms.css",
  "/assets/js/main.js",
  "/assets/js/contact.js",
  "/manifest.json",
];

// Assets to cache on first visit
const CACHE_ON_NAVIGATE = [
  "/assets/images/logo/eteas-logo.svg",
  "/assets/images/logo/eteas-logo-white.svg",
  "/assets/images/logo/ryse-energy-logo.svg",
  "/assets/images/favicon.svg",
  "/assets/images/favicon.png",
];

// Network-first resources (always try network first)
const NETWORK_FIRST = ["/contact.html", "/api/", "/_netlify/"];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install event");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching core assets");
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[Service Worker] Failed to cache core assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate event");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME) {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (request.method === "GET") {
    event.respondWith(handleGetRequest(request));
  }
});

/**
 * Handle GET requests with different caching strategies
 */
async function handleGetRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Network-first strategy for dynamic content
    if (shouldUseNetworkFirst(pathname)) {
      return await networkFirst(request);
    }

    // Cache-first strategy for static assets
    if (isStaticAsset(pathname)) {
      return await cacheFirst(request);
    }

    // Stale-while-revalidate for HTML pages
    return await staleWhileRevalidate(request);
  } catch (error) {
    console.error("[Service Worker] Fetch error:", error);
    return await handleOffline(request);
  }
}

/**
 * Network-first strategy: Try network, fall back to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Cache-first strategy: Try cache, fall back to network
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  // Not in cache, fetch from network and cache
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    throw error;
  }
}

/**
 * Stale-while-revalidate: Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch from network in background to update cache
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network error, but we might have cache
      return cachedResponse;
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // No cached version, wait for network
  return networkResponsePromise;
}

/**
 * Handle offline scenarios
 */
async function handleOffline(request) {
  const url = new URL(request.url);

  // Try to match exact request
  let cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // For HTML pages, try to find a similar cached page
  if (request.headers.get("Accept")?.includes("text/html")) {
    // Try index.html as fallback
    cachedResponse = await caches.match("/index.html");
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try 404 page
    cachedResponse = await caches.match("/404.html");
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // Return a custom offline page
  return new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - ETEAS Energy</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          text-align: center;
          padding: 20px;
        }
        .offline-content {
          max-width: 500px;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        .btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-block;
          margin: 10px;
          transition: all 0.3s ease;
        }
        .btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="offline-content">
        <h1>You're Offline</h1>
        <p>It looks like you're not connected to the internet. Some content may not be available, but you can still browse cached pages.</p>
        <a href="/" class="btn">Try Again</a>
        <a href="/index.html" class="btn">Go Home</a>
      </div>
    </body>
    </html>
    `,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  );
}

/**
 * Determine if pathname should use network-first strategy
 */
function shouldUseNetworkFirst(pathname) {
  return NETWORK_FIRST.some((pattern) => pathname.startsWith(pattern));
}

/**
 * Determine if pathname is a static asset
 */
function isStaticAsset(pathname) {
  return /\.(css|js|jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|ico)$/.test(
    pathname
  );
}

// Background sync for form submissions when offline
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "contact-form-sync") {
    event.waitUntil(syncContactForms());
  }
});

/**
 * Sync contact form submissions when back online
 */
async function syncContactForms() {
  try {
    // Get pending form submissions from IndexedDB or localStorage
    // This would integrate with the contact form JavaScript
    const pendingForms = await getPendingFormSubmissions();

    for (const form of pendingForms) {
      try {
        const response = await fetch("/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form.data,
        });

        if (response.ok) {
          // Remove from pending submissions
          await removePendingFormSubmission(form.id);
          console.log("[Service Worker] Form synced successfully");
        }
      } catch (error) {
        console.error("[Service Worker] Failed to sync form:", error);
      }
    }
  } catch (error) {
    console.error("[Service Worker] Background sync error:", error);
  }
}

// Placeholder functions for form sync (would be implemented based on storage strategy)
async function getPendingFormSubmissions() {
  return [];
}

async function removePendingFormSubmission(id) {
  // Remove from storage
}

// Push notification handling (if needed in the future)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New update from ETEAS Energy",
    icon: "/assets/images/icons/icon-192x192.png",
    badge: "/assets/images/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/assets/images/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/assets/images/icons/icon-72x72.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("ETEAS Energy", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    // Open the app to a specific page
    event.waitUntil(clients.openWindow("/"));
  }
});

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "content-sync") {
    event.waitUntil(updateContent());
  }
});

/**
 * Update content in background
 */
async function updateContent() {
  try {
    // Pre-cache important pages and assets
    const cache = await caches.open(CACHE_NAME);
    const urls = ["/", "/products.html", "/services.html"];

    await cache.addAll(urls);
    console.log("[Service Worker] Content updated in background");
  } catch (error) {
    console.error("[Service Worker] Background content update failed:", error);
  }
}

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;
    case "GET_VERSION":
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case "CLEAN_CACHE":
      cleanOldCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    default:
      console.log("[Service Worker] Unknown message type:", type);
  }
});

/**
 * Clean old caches manually
 */
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(
    (name) => name !== CACHE_NAME && name !== OFFLINE_CACHE_NAME
  );

  return Promise.all(oldCaches.map((name) => caches.delete(name)));
}

console.log("[Service Worker] Service Worker loaded successfully");
