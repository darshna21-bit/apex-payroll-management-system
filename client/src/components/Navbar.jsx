import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Bell, ChevronDown, CheckCheck, Trash2, Calendar, 
  UserPlus, FileText, CheckCircle, Clock 
} from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Payroll Generated',
      description: 'System successfully processed payroll invoices for May 2026.',
      time: '2 hours ago',
      type: 'payroll',
      read: false,
    },
    {
      id: 2,
      title: 'Employee Registered',
      description: 'New employee registry entry EMP001123 has been created.',
      time: '1 day ago',
      type: 'employee',
      read: false,
    },
    {
      id: 3,
      title: 'Leave Request Submitted',
      description: 'John Doe submitted a sick leave request for medical reasons.',
      time: '1 day ago',
      type: 'leave',
      read: false,
    },
    {
      id: 4,
      title: 'Attendance Updated',
      description: "HR corrected attendance logs for yesterday's shift.",
      time: '2 days ago',
      type: 'attendance',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payroll':
        return (
          <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 border border-emerald-100">
            <FileText className="h-4 w-4" />
          </div>
        );
      case 'employee':
        return (
          <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 border border-blue-100">
            <UserPlus className="h-4 w-4" />
          </div>
        );
      case 'leave':
        return (
          <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600 border border-amber-100">
            <Calendar className="h-4 w-4" />
          </div>
        );
      case 'attendance':
        return (
          <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 border border-indigo-100">
            <CheckCircle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="rounded-lg bg-slate-50 p-1.5 text-slate-600 border border-slate-100">
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
      {/* Dynamic Greetings */}
      <div>
        <h1 className="text-lg font-bold text-slate-800">
          Welcome back, <span className="text-blue-600 font-semibold">{user?.name}</span>
        </h1>
        <p className="text-xs text-slate-500">Here's your corporate ledger overview</p>
      </div>

      {/* Profile Bar / Notifications */}
      <div className="flex items-center space-x-6">
        {/* Simple Notification Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`relative rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors ${isOpen ? 'bg-slate-100 text-slate-600' : ''}`}
            aria-label="Toggle notifications dropdown"
          >
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-blue-600 border border-white"></span>
            )}
            <Bell className="h-5 w-5" />
          </button>

          {/* Dropdown Card */}
          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform origin-top-right transition-all">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead} 
                    className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="rounded-full bg-slate-50 p-3 border border-slate-100">
                      <Bell className="h-6 w-6 text-slate-300 animate-pulse" />
                    </div>
                    <span className="mt-3 text-xs font-semibold text-slate-400">No notifications yet</span>
                    <p className="mt-1 text-[10px] text-slate-400 max-w-[200px]">You are fully caught up with all company logs.</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start space-x-3 p-4 transition-colors hover:bg-slate-50/80 ${!notification.read ? 'bg-blue-50/10' : ''}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold text-slate-800 ${!notification.read ? 'text-blue-900' : ''}`}>
                            {notification.title}
                          </p>
                          <span className="text-[9px] text-slate-400 flex items-center">
                            <Clock className="mr-0.5 h-2.5 w-2.5" />
                            {notification.time}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed break-words">
                          {notification.description}
                        </p>
                        {!notification.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-center">
                  <button 
                    onClick={handleClearAll}
                    className="flex items-center justify-center mx-auto text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile dropdown pill */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</span>
            <span className="text-[10px] text-slate-400 font-medium capitalize mt-1">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
