"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface PendingDraftItem {
  id: string;
  collegeName: string;
  location?: string;
  status: string;
  reviewUrl: string;
  updatedAt: string;
}

interface NotificationContextType {
  permission: NotificationPermission | "unsupported";
  pendingReviewCount: number;
  recentPendingDrafts: PendingDraftItem[];
  requestPermission: () => Promise<NotificationPermission | "unsupported">;
  triggerDesktopNotification: (collegeName: string, reviewUrl: string, id?: string) => void;
  sendTestNotification: () => void;
  showBulkModal: boolean;
  setShowBulkModal: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  permission: "default",
  pendingReviewCount: 0,
  recentPendingDrafts: [],
  requestPermission: async () => "default",
  triggerDesktopNotification: () => {},
  sendTestNotification: () => {},
  showBulkModal: false,
  setShowBulkModal: () => {},
});

const NOTIFIED_STORAGE_KEY = "c2talents_notified_review_ids_v1";

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [recentPendingDrafts, setRecentPendingDrafts] = useState<PendingDraftItem[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Set of draft IDs we have already displayed notifications for in this browser
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Initialize permission and Service Worker
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }

    // Load previously notified IDs from localStorage
    try {
      const stored = localStorage.getItem(NOTIFIED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          notifiedIdsRef.current = new Set(parsed);
        }
      }
    } catch (e) {}

    // Register Service Worker for background notification handling
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          swRegistrationRef.current = reg;
        })
        .catch((err) => {
          console.warn("[SERVICE WORKER REGISTRATION NOTICE]:", err);
        });
    }

    // Refresh permission when window regains focus (e.g. if user changed it in browser settings)
    function onFocus() {
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(Notification.permission);
      }
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Persist notified IDs
  const rememberNotifiedId = useCallback((id: string) => {
    notifiedIdsRef.current.add(id);
    try {
      const arr = Array.from(notifiedIdsRef.current).slice(-200); // keep last 200
      localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {}
  }, []);

  // Request Notification Permission on explicit user interaction
  const requestPermission = useCallback(async (): Promise<NotificationPermission | "unsupported"> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported";
    }

    try {
      let result: NotificationPermission;
      // Handle both Promise and callback versions of requestPermission
      const reqPromise = Notification.requestPermission();
      if (reqPromise && typeof reqPromise.then === "function") {
        result = await reqPromise;
      } else {
        result = await new Promise((resolve) => {
          (Notification as any).requestPermission(resolve);
        });
      }

      setPermission(result);

      if (result === "granted") {
        try {
          new Notification("C2 Talents — Notifications Enabled", {
            body: "You will receive desktop alerts whenever a college draft is ready for review.",
            icon: "/logo.png",
          });
        } catch (e) {}
      }

      return result;
    } catch (e) {
      console.error("[NOTIFICATION PERMISSION REQUEST ERROR]:", e);
      return "default";
    }
  }, []);

  // Trigger a desktop notification
  const triggerDesktopNotification = useCallback(
    (collegeName: string, reviewUrl: string, id?: string) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const title = collegeName;
      const options: NotificationOptions = {
        body: "College data is ready for review.",
        icon: "/logo.png",
        badge: "/logo.png",
        tag: id ? `review-${id}` : `review-${Date.now()}`,
        data: { url: reviewUrl },
      };

      // Prefer ServiceWorker showNotification if available, fallback to new Notification()
      if (swRegistrationRef.current && "showNotification" in swRegistrationRef.current) {
        swRegistrationRef.current.showNotification(title, options).catch(() => {
          fallbackNativeNotification(title, options, reviewUrl, router);
        });
      } else {
        fallbackNativeNotification(title, options, reviewUrl, router);
      }
    },
    [router]
  );

  // Polling loop across all admin pages
  useEffect(() => {
    let isMounted = true;
    let pollTimer: NodeJS.Timeout;

    async function pollNotifications() {
      try {
        const res = await fetch("/api/admin/research/notifications", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted || !data.success) return;

        // Update counts and pending list
        setPendingReviewCount(data.totalPendingCount || 0);
        if (Array.isArray(data.recentPendingDrafts)) {
          setRecentPendingDrafts(data.recentPendingDrafts);
        }

        // Process any unnotified research items
        const unnotified: Array<{
          id: string;
          collegeName: string;
          reviewUrl: string;
        }> = data.unnotifiedItems || [];

        const newlyCompletedIds: string[] = [];

        for (const item of unnotified) {
          if (!notifiedIdsRef.current.has(item.id)) {
            rememberNotifiedId(item.id);
            newlyCompletedIds.push(item.id);

            // Display desktop notification
            triggerDesktopNotification(item.collegeName, item.reviewUrl, item.id);
          }
        }

        // Acknowledge back to server
        if (newlyCompletedIds.length > 0) {
          fetch("/api/admin/research/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemIds: newlyCompletedIds }),
          }).catch(() => {});
        }
      } catch (err) {
        // Silent fail on transient poll errors
      } finally {
        if (isMounted) {
          // Poll every 4s when tab is visible, 10s when hidden
          const delay = typeof document !== "undefined" && document.hidden ? 10000 : 4000;
          pollTimer = setTimeout(pollNotifications, delay);
        }
      }
    }

    pollNotifications();

    return () => {
      isMounted = false;
      clearTimeout(pollTimer);
    };
  }, [rememberNotifiedId, triggerDesktopNotification]);

  // Send a test desktop alert
  const sendTestNotification = useCallback(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      requestPermission();
      return;
    }
    triggerDesktopNotification(
      "PSG College of Technology (Demo)",
      "/manager/submitted-colleges",
      "test-alert-" + Date.now()
    );
  }, [requestPermission, triggerDesktopNotification]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        pendingReviewCount,
        recentPendingDrafts,
        requestPermission,
        triggerDesktopNotification,
        sendTestNotification,
        showBulkModal,
        setShowBulkModal,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

function fallbackNativeNotification(
  title: string,
  options: NotificationOptions,
  reviewUrl: string,
  router: any
) {
  try {
    const notification = new Notification(title, options);
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      if (reviewUrl) {
        router.push(reviewUrl);
      }
    };
  } catch (e) {
    console.warn("[NATIVE NOTIFICATION FALLBACK ERROR]:", e);
  }
}

export function useAdminNotifications() {
  return useContext(NotificationContext);
}
