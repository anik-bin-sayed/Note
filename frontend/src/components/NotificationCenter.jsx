import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiLoader } from "react-icons/fi";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from "../lib/features/noteApi";

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading } = useGetNotificationsQuery(
    undefined,
    { pollingInterval: 30_000, refetchOnFocus: true },
  );
  const [markRead, { isLoading: marking }] = useMarkNotificationReadMutation();
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      try {
        await markRead(notification.id).unwrap();
      } catch (error) {
        console.error("Could not mark notification as read:", error);
      }
    }

    setOpen(false);
    navigate(`/notes/${notification.note_id}`);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden border border-slate-200 bg-white shadow-xl"
        >
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
            {isLoading && <FiLoader className="animate-spin text-slate-400" />}
          </header>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No notifications
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    disabled={marking}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${notification.read_at ? "" : "bg-sky-50/60"}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      {notification.read_at ? <FiCheck /> : <FiBell />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-5 text-slate-800">
                        {notification.message}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {notification.role} ·{" "}
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </span>
                    {!notification.read_at && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-600" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default NotificationCenter;
