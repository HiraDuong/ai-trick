// Luvina
// Vu Huy Hoang - Dev2
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NotificationDto } from "@/lib/api-types";
import { fetchAuthenticatedApi, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";
import { formatArticleDate } from "@/lib/format";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      const token = getStoredAccessToken();
      setHasToken(Boolean(token));

      if (!token) {
        setNotifications([]);
        setIsOpen(false);
        return;
      }

      const result = await fetchAuthenticatedApi<NotificationDto[]>("/notifications");
      if (result.ok) {
        setNotifications(result.data);
      }
    }

    void loadNotifications();
    return subscribeToAuthTokenChanges(() => {
      void loadNotifications();
    });
  }, []);

  async function handleMarkAsRead(notificationId: string) {
    const result = await fetchAuthenticatedApi<NotificationDto>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });

    if (!result.ok) {
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? result.data : notification
      )
    );
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  if (!hasToken) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        aria-label="Open notifications"
      >
        Bell
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-3 w-[22rem] rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_24px_80px_rgba(33,37,41,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Notifications</p>
              <h2 className="mt-1 text-xl text-[var(--color-foreground)] [font-family:var(--font-display)]">Activity feed</h2>
            </div>
            <span className="text-xs text-[var(--color-muted)]">{unreadCount} unread</span>
          </div>

          <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`rounded-[1.25rem] border p-4 ${
                    notification.isRead
                      ? "border-[var(--color-line)] bg-white"
                      : "border-[color:color-mix(in_srgb,var(--color-accent)_30%,white)] bg-[color:color-mix(in_srgb,var(--color-accent)_9%,white)]"
                  }`}
                >
                  <Link href={`/articles/${notification.entityId}`} className="block">
                    <p className="text-sm leading-6 text-[var(--color-foreground)]">{notification.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      {formatArticleDate(notification.createdAt)}
                    </p>
                  </Link>
                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => void handleMarkAsRead(notification.id)}
                      className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]"
                    >
                      Mark as read
                    </button>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}