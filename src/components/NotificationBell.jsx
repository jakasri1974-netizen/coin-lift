import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Loader2, Circle, AlertCircle } from 'lucide-react';
import { notificationsService } from '../services/api';
import {
  connectSocket,
  subscribeSocketStatus,
  onSocketEvent,
} from '../services/socket';

export default function NotificationBell({ isOverHero, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const popoverRef = useRef(null);

  // Subscribe to socket connection status
  useEffect(() => {
    connectSocket();
    const unsubscribeStatus = subscribeSocketStatus(setSocketStatus);
    return () => unsubscribeStatus();
  }, []);

  // Fetch initial notifications and unread count
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifRes, countRes] = await Promise.all([
        notificationsService.getAll({ page: 1, limit: 15 }),
        notificationsService.getUnreadCount(),
      ]);

      if (notifRes.success && Array.isArray(notifRes.data)) {
        setNotifications(notifRes.data);
      }
      if (countRes.success && countRes.unreadCount !== undefined) {
        setUnreadCount(countRes.unreadCount);
      }
    } catch (err) {
      console.warn('[Notification] Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time socket notification events
  useEffect(() => {
    const handleNewNotification = (newNotif) => {
      console.log('[Realtime Socket] Received new notification:', newNotif);
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
      setUnreadCount((prev) => prev + 1);
    };

    const cleanupNew = onSocketEvent('notification:new', handleNewNotification);
    const cleanupAppNew = onSocketEvent('application:new', handleNewNotification);
    const cleanupAppAcc = onSocketEvent('application:accepted', handleNewNotification);
    const cleanupAppRej = onSocketEvent('application:rejected', handleNewNotification);
    const cleanupCollabCre = onSocketEvent('collaboration:created', handleNewNotification);
    const cleanupCollabUpd = onSocketEvent('collaboration:updated', handleNewNotification);

    return () => {
      cleanupNew();
      cleanupAppNew();
      cleanupAppAcc();
      cleanupAppRej();
      cleanupCollabCre();
      cleanupCollabUpd();
    };
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all read:', err.message);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    setIsOpen(false);

    // Route navigation based on notification type
    if (onNavigate) {
      if (notification.type === 'application:new') {
        onNavigate('/dashboard');
      } else if (notification.type === 'application:accepted' || notification.type === 'collaboration:created' || notification.type === 'collaboration:updated') {
        onNavigate('/dashboard');
      } else if (notification.type === 'application:rejected') {
        onNavigate('/dashboard');
      } else {
        onNavigate('/dashboard');
      }
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border transition-all flex items-center justify-center ${
          isOverHero
            ? 'bg-white/10 border-white/20 text-purple-200 hover:text-white hover:bg-white/20'
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-purple-600 hover:bg-purple-50'
        }`}
        title="Notifications"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-[10px] font-black leading-none text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-purple-100 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-[#FAF9FF]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 font-sans">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Socket Status Indicator */}
            <div className="flex items-center gap-1.5">
              <Circle
                className={`w-2 h-2 fill-current ${
                  socketStatus === 'connected'
                    ? 'text-emerald-500'
                    : socketStatus === 'connecting'
                    ? 'text-amber-500 animate-ping'
                    : 'text-slate-400'
                }`}
              />
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {socketStatus === 'connected' ? 'Live' : socketStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Action Row */}
          {unreadCount > 0 && (
            <div className="px-4 py-2 bg-purple-50/50 border-b border-purple-100/60 flex items-center justify-end">
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            </div>
          )}

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-purple-50">
            {loading ? (
              <div className="py-8 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell className="w-8 h-8 text-purple-200 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400">Events and updates will appear here in real-time.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-purple-50/60 flex items-start justify-between gap-3 ${
                    !n.isRead ? 'bg-purple-50/30' : 'bg-white'
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${!n.isRead ? 'bg-purple-600' : 'bg-transparent'}`} />
                      <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{n.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal pl-4">{n.message}</p>
                    <span className="text-[10px] font-mono text-slate-400 pl-4 block">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n._id, e)}
                      className="p-1 rounded-lg hover:bg-purple-100 text-slate-400 hover:text-purple-700 transition-colors shrink-0"
                      title="Mark read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#FAF9FF] border-t border-purple-100 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate && onNavigate('/dashboard');
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900"
            >
              View Dashboard Updates →
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
