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

  const triggerClassName = isOpen
    ? "group relative inline-flex min-h-12 min-w-12 items-center overflow-hidden rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 text-[var(--color-accent-contrast)] shadow-[0_12px_32px_rgba(17,107,99,0.2)] transition-all duration-200 hover:border-[var(--color-accent-strong)] hover:bg-[var(--color-accent-strong)]"
    : "group relative inline-flex min-h-12 min-w-12 items-center overflow-hidden rounded-full border border-[var(--color-line)] bg-white px-3 text-[var(--color-foreground)] transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:border-[var(--color-accent)] focus-visible:text-[var(--color-accent)]";
  const labelClassName = isOpen
    ? "ml-3 max-w-[8rem] overflow-hidden whitespace-nowrap text-sm font-semibold opacity-100 transition-all duration-200"
    : "ml-0 max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-200 group-hover:ml-3 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100";

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
        className={triggerClassName}
        aria-label="Notifications"
        title="Notifications"
        aria-pressed={isOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
          <path d="M6.5 16.5h11l-1.5-2.25V10a4 4 0 1 0-8 0v4.25L6.5 16.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={labelClassName}>Bell</span>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-[70] mt-3 w-[22rem] rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_24px_80px_rgba(33,37,41,0.14)]">
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