// C2 Talents Service Worker for Background Desktop Notifications
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Notification Clicks (Desktop Notifications)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/manager/submitted-colleges";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open on this origin, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Optional Web Push event handler if push subscription configured
self.addEventListener("push", (event) => {
  let data = {
    title: "C2 Talents Review Alert",
    body: "College data is ready for review.",
    url: "/manager/submitted-colleges",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: "/logo.png",
    badge: "/logo.png",
    data: { url: data.url },
    tag: data.tag || `college-review-${Date.now()}`,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
