/**
 * WasteAppContext - State Management, Offline IndexedDB Queue, and Real-Time Notifications
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  ResidentProfile,
  CollectorProfile,
  WasteRequest,
  DumpingReport,
  Complaint,
  ActivityLog,
  WasteCategory,
  RequestStatus,
  SubZone,
  CollectionPoint
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_RESIDENTS,
  INITIAL_COLLECTORS,
  INITIAL_REQUESTS,
  INITIAL_DUMPING_REPORTS,
  INITIAL_COMPLAINTS,
  INITIAL_LOGS,
  INITIAL_COLLECTION_POINTS
} from '../data/initialData';
import {
  saveOfflineTaskUpdate,
  getPendingOfflineUpdates,
  deletePendingOfflineUpdate,
  clearAllPendingOfflineUpdates,
  cacheTasksInIndexedDB,
  getCachedTasksFromIndexedDB,
  OfflineTaskUpdate
} from '../utils/indexedDB';
import {
  dispatchWebNotification,
  requestWebNotificationPermission,
  AppNotification
} from '../utils/notifications';

interface WasteAppContextType {
  currentUser: User | null;
  currentResident: ResidentProfile | null;
  currentCollector: CollectorProfile | null;
  users: User[];
  residents: ResidentProfile[];
  collectors: CollectorProfile[];
  requests: WasteRequest[];
  dumpingReports: DumpingReport[];
  complaints: Complaint[];
  activityLogs: ActivityLog[];
  collectionPoints: CollectionPoint[];

  // Connectivity & Offline Sync
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  toggleSimulateOffline: (simulate?: boolean) => void;
  pendingOfflineUpdates: OfflineTaskUpdate[];
  syncOfflineTasks: () => Promise<void>;
  isSyncing: boolean;

  // Real-Time Notifications
  notifications: AppNotification[];
  activeToast: AppNotification | null;
  dismissToast: () => void;
  notificationPermission: NotificationPermission;
  requestPermission: () => Promise<void>;
  markAllNotificationsRead: () => void;
  
  // Actions
  loginAsUser: (userId: number) => void;
  attemptAccessDashboard: (targetRole: UserRole) => boolean;
  switchRole: (role: UserRole | null) => void;
  logout: () => void;
  submitRequest: (data: {
    waste_type: WasteCategory;
    description: string;
    latitude: number;
    longitude: number;
    address_landmark: string;
    scheduled_date: string;
    photo_path?: string;
  }) => void;
  cancelRequest: (requestId: number, reason?: string) => void;
  reportDumping: (data: {
    location_desc: string;
    latitude: number;
    longitude: number;
    photo_path?: string;
  }) => void;
  lodgeComplaint: (data: {
    request_id?: number;
    complaint_text: string;
  }) => void;
  assignRequest: (requestId: number, collectorId: number) => void;
  updateTaskStatus: (requestId: number, status: RequestStatus, notes?: string, proofPhoto?: string) => Promise<void>;
  resolveComplaint: (complaintId: number, status: 'Resolved' | 'Under_Review', response: string) => void;
  toggleCollectorAvailability: (collectorId: number) => void;
  updateUserStatus: (userId: number, status: 'active' | 'suspended' | 'closed') => void;
  updateUserZone: (userId: number, zone: SubZone) => void;
  resetUserPassword: (userId: number) => string;
  resetDatabase: () => void;
}

const WasteAppContext = createContext<WasteAppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'nabutiti_waste_users',
  RESIDENTS: 'nabutiti_waste_residents',
  COLLECTORS: 'nabutiti_waste_collectors',
  REQUESTS: 'nabutiti_waste_requests',
  DUMPING: 'nabutiti_waste_dumping',
  COMPLAINTS: 'nabutiti_waste_complaints',
  LOGS: 'nabutiti_waste_logs',
  NOTIFICATIONS: 'nabutiti_waste_notifications',
  CURRENT_USER_ID: 'nabutiti_waste_current_user_id',
  COLLECTION_POINTS: 'nabutiti_waste_collection_points'
};

export const WasteAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [residents, setResidents] = useState<ResidentProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
    return saved ? JSON.parse(saved) : INITIAL_RESIDENTS;
  });

  const [collectors, setCollectors] = useState<CollectorProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COLLECTORS);
    return saved ? JSON.parse(saved) : INITIAL_COLLECTORS;
  });

  const [requests, setRequests] = useState<WasteRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COLLECTION_POINTS);
    return saved ? JSON.parse(saved) : INITIAL_COLLECTION_POINTS;
  });

  const [dumpingReports, setDumpingReports] = useState<DumpingReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DUMPING);
    return saved ? JSON.parse(saved) : INITIAL_DUMPING_REPORTS;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'init-1',
        title: 'Nabutiti WasteGuard Active',
        message: 'Real-time alert system initialized for Kansanga Parish.',
        type: 'status_change',
        roleTarget: 'all',
        timestamp: 'Just now',
        read: false
      }
    ];
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });

  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved ? JSON.parse(saved) : 5; // Default to Resident Brenda
  });

  // Real & Simulated Network Connectivity
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingOfflineUpdates, setPendingOfflineUpdates] = useState<OfflineTaskUpdate[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  // Current logged in user object
  const currentUser = users.find(u => u.id === currentUserId) || null;
  const currentResident = currentUser && currentUser.role === 'resident'
    ? residents.find(r => r.user_id === currentUser.id) || null
    : null;
  const currentCollector = currentUser && currentUser.role === 'collector'
    ? collectors.find(c => c.user_id === currentUser.id) || null
    : null;

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(collectors));
  }, [collectors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    // Cache tasks in IndexedDB for offline access
    cacheTasksInIndexedDB(requests).catch((err) => console.warn('Cache error:', err));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DUMPING, JSON.stringify(dumpingReports));
  }, [dumpingReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(currentUserId));
  }, [currentUserId]);

  // Load pending offline updates from IndexedDB on start
  const refreshPendingUpdates = useCallback(async () => {
    try {
      const updates = await getPendingOfflineUpdates();
      setPendingOfflineUpdates(updates);
    } catch (e) {
      console.warn('Failed to load pending updates from IndexedDB:', e);
    }
  }, []);

  useEffect(() => {
    refreshPendingUpdates();
  }, [refreshPendingUpdates]);

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration warning:', error);
        });

      // Listen for message from service worker
      const handleWorkerMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
          console.log('[PWA] Service worker triggered sync');
          syncOfflineTasks();
        }
      };

      navigator.serviceWorker.addEventListener('message', handleWorkerMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleWorkerMessage);
      };
    }
  }, []);

  // Window Online / Offline Handlers
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isSimulatedOffline) {
        syncOfflineTasks();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline]);

  // Activity logger helper
  const addLog = (action: string) => {
    const newLog: ActivityLog = {
      id: Date.now(),
      user_id: currentUser?.id,
      user_name: currentUser?.name,
      action,
      ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Push an alert notification (Web Notifications API + In-App Toast)
  const pushNotification = (
    title: string,
    message: string,
    type: 'status_change' | 'assignment' | 'sync' | 'alert',
    roleTarget: 'resident' | 'collector' | 'admin' | 'leader' | 'all'
  ) => {
    const notifItem: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      roleTarget,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setNotifications(prev => [notifItem, ...prev]);
    setActiveToast(notifItem);

    // Trigger Web Notifications API (native browser notification)
    dispatchWebNotification(title, message, {
      tag: `waste-${type}-${Date.now()}`,
      data: { id: notifItem.id, roleTarget }
    });

    // Auto-dismiss in-app toast after 6 seconds
    setTimeout(() => {
      setActiveToast(current => (current?.id === notifItem.id ? null : current));
    }, 6000);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const requestPermission = async () => {
    const perm = await requestWebNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      pushNotification(
        'Notifications Enabled',
        'You will now receive instant desktop & mobile alerts for collection updates.',
        'alert',
        'all'
      );
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleSimulateOffline = (simulate?: boolean) => {
    const willBeOffline = simulate !== undefined ? simulate : !isSimulatedOffline;
    setIsSimulatedOffline(willBeOffline);

    if (willBeOffline) {
      pushNotification(
        'Offline Mode Activated',
        'Collector entered Nabutiti Valley signal dead zone. Task updates will queue in IndexedDB.',
        'alert',
        'collector'
      );
    } else {
      pushNotification(
        'Online Connection Restored',
        'Cellular signal reconnected. Flushing IndexedDB offline queue...',
        'sync',
        'collector'
      );
      // Auto-trigger sync
      setTimeout(() => {
        syncOfflineTasks();
      }, 500);
    }
  };

  // Synchronize IndexedDB Offline Updates with the main database
  const syncOfflineTasks = async () => {
    const pending = await getPendingOfflineUpdates();
    if (pending.length === 0) return;

    setIsSyncing(true);
    let syncedCount = 0;

    for (const update of pending) {
      setRequests(prev =>
        prev.map(r => {
          if (r.id === update.requestId) {
            return {
              ...r,
              status: update.newStatus,
              collector_notes: update.collectorNotes || r.collector_notes,
              proof_photo: update.proofPhoto || r.proof_photo,
              completion_time: update.newStatus === 'Completed' ? update.timestamp : r.completion_time
            };
          }
          return r;
        })
      );

      if (update.id) {
        await deletePendingOfflineUpdate(update.id);
        syncedCount++;
      }
    }

    await refreshPendingUpdates();
    setIsSyncing(false);

    pushNotification(
      'Offline Sync Successful',
      `Synchronized ${syncedCount} queued task update(s) to central database.`,
      'sync',
      'collector'
    );

    addLog(`Service Worker synchronized ${syncedCount} offline task update(s) from IndexedDB`);
  };

  const loginAsUser = (userId: number) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      addLog(`Authenticated as individual account [${targetUser.name}] (Role: ${targetUser.role})`);
      pushNotification(
        'Session Authenticated',
        `Logged in as ${targetUser.name} (${targetUser.role.toUpperCase()}). Authority granted to designated dashboard.`,
        'alert',
        targetUser.role
      );
    }
  };

  const attemptAccessDashboard = (targetRole: UserRole): boolean => {
    if (!currentUser) {
      pushNotification(
        'Authentication Required',
        'Please log in to an authorized account to access that dashboard.',
        'alert',
        'all'
      );
      return false;
    }

    if (currentUser.role !== targetRole) {
      addLog(`SECURITY ALERT: Blocked unauthorized dashboard access attempt to [${targetRole}] by user [${currentUser.name}] (Role: ${currentUser.role})`);
      pushNotification(
        'Access Denied (RBAC)',
        `Unauthorized: You are authenticated as "${currentUser.name}" (${currentUser.role}). Access to the ${targetRole} workspace is prohibited.`,
        'alert',
        currentUser.role
      );
      return false;
    }

    return true;
  };

  const switchRole = (role: UserRole | null) => {
    if (!role) {
      setCurrentUserId(null);
      return;
    }
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      addLog(`Switched session to role [${role}] (${targetUser.name})`);
    }
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const submitRequest = (data: {
    waste_type: WasteCategory;
    description: string;
    latitude: number;
    longitude: number;
    address_landmark: string;
    scheduled_date: string;
    photo_path?: string;
  }) => {
    if (!currentUser || !currentResident) return;

    const newReq: WasteRequest = {
      id: requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1,
      resident_id: currentResident.id,
      resident_name: currentUser.name,
      household_no: currentResident.household_no,
      zone_name: currentResident.zone_name,
      phone: currentUser.phone,
      waste_type: data.waste_type,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      address_landmark: data.address_landmark,
      photo_path: data.photo_path || 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=400&q=80',
      scheduled_date: data.scheduled_date,
      status: 'Pending',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setRequests(prev => [newReq, ...prev]);
    addLog(`Resident ${currentUser.name} submitted ${data.waste_type} collection order #${newReq.id}`);

    // Alert resident of order submission
    pushNotification(
      'Collection Request Received',
      `Your request #WR-${String(newReq.id).padStart(4, '0')} (${data.waste_type}) is logged and queued for dispatch.`,
      'status_change',
      'resident'
    );
  };

  const cancelRequest = (requestId: number, reason?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'Cancelled',
            collector_notes: reason ? `Cancelled by resident: ${reason}` : 'Cancelled by resident'
          };
        }
        return r;
      })
    );

    addLog(`Resident ${currentUser?.name || 'User'} cancelled collection request #${requestId}`);

    pushNotification(
      'Order Cancelled',
      `Collection request #WR-${String(requestId).padStart(4, '0')} has been marked as Cancelled.`,
      'status_change',
      'resident'
    );
  };

  const reportDumping = (data: {
    location_desc: string;
    latitude: number;
    longitude: number;
    photo_path?: string;
  }) => {
    const newReport: DumpingReport = {
      id: dumpingReports.length > 0 ? Math.max(...dumpingReports.map(d => d.id)) + 1 : 1,
      reporter_id: currentUser?.id || 5,
      reporter_name: currentUser?.name || 'Concerned Citizen',
      location_desc: data.location_desc,
      latitude: data.latitude,
      longitude: data.longitude,
      photo_path: data.photo_path || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80',
      status: 'Reported',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setDumpingReports(prev => [newReport, ...prev]);
    addLog(`Illegal dumping reported at "${data.location_desc}" by ${currentUser?.name || 'Citizen'}`);

    pushNotification(
      'Illegal Dumping Alert Logged',
      `Surveillance pin placed at "${data.location_desc}". Monitoring officer notified.`,
      'alert',
      'all'
    );
  };

  const lodgeComplaint = (data: {
    request_id?: number;
    complaint_text: string;
  }) => {
    if (!currentUser || !currentResident) return;

    const newComplaint: Complaint = {
      id: complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1,
      resident_id: currentResident.id,
      resident_name: currentUser.name,
      household_no: currentResident.household_no,
      zone_name: currentResident.zone_name,
      request_id: data.request_id,
      complaint_text: data.complaint_text,
      status: 'Open',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setComplaints(prev => [newComplaint, ...prev]);
    addLog(`Resident ${currentUser.name} lodged complaint #${newComplaint.id}`);

    pushNotification(
      'Complaint Registered',
      `Feedback #CMP-${newComplaint.id} submitted. Sanitation supervisor has been notified.`,
      'alert',
      'resident'
    );
  };

  // Admin Dispatch -> Alerts BOTH Collector and Resident!
  const assignRequest = (requestId: number, collectorId: number) => {
    const targetCollector = collectors.find(c => c.id === collectorId);
    const collectorUser = users.find(u => u.id === targetCollector?.user_id);
    const req = requests.find(r => r.id === requestId);

    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'Assigned',
            collector_id: collectorId,
            collector_name: collectorUser?.name,
            vehicle_reg_no: targetCollector?.vehicle_reg_no,
            assigned_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
          };
        }
        return r;
      })
    );

    addLog(`Admin dispatched Request #WR-${requestId} to Collector ${collectorUser?.name || 'Vehicle ' + collectorId}`);

    // Alert 1: Collector receives assignment push notification
    pushNotification(
      'New Task Dispatched',
      `Order #WR-${String(requestId).padStart(4, '0')} (${req?.waste_type || 'Waste'}) assigned to ${targetCollector?.vehicle_reg_no} in ${req?.zone_name || 'Nabutiti'}.`,
      'assignment',
      'collector'
    );

    // Alert 2: Resident receives status change notification
    pushNotification(
      'Pickup Vehicle Assigned',
      `Your waste order #WR-${String(requestId).padStart(4, '0')} has been assigned to hauler ${collectorUser?.name} (${targetCollector?.vehicle_reg_no}).`,
      'status_change',
      'resident'
    );
  };

  // Collector Updates Status (Online direct update OR Offline IndexedDB queue)
  const updateTaskStatus = async (
    requestId: number,
    status: RequestStatus,
    notes?: string,
    proofPhoto?: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const req = requests.find(r => r.id === requestId);

    // Case A: OFFLINE (Poor connectivity in Valley / drainage routes)
    if (!effectiveOnline) {
      await saveOfflineTaskUpdate({
        requestId,
        assignmentId: req?.id,
        newStatus: status,
        collectorNotes: notes || '',
        proofPhoto: proofPhoto || '',
        timestamp: nowStr,
        synced: false
      });

      await refreshPendingUpdates();

      pushNotification(
        'Offline Update Stored in IndexedDB',
        `Task #WR-${String(requestId).padStart(4, '0')} marked as ${status}. Queued for auto-sync when connection returns.`,
        'sync',
        'collector'
      );

      addLog(`Collector queued task #WR-${requestId} status [${status}] to IndexedDB while offline`);
      return;
    }

    // Case B: ONLINE -> Direct state & database update
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            collector_notes: notes || r.collector_notes,
            proof_photo: proofPhoto || r.proof_photo,
            completion_time: status === 'Completed' ? nowStr : r.completion_time
          };
        }
        return r;
      })
    );

    addLog(`Collector updated Request #WR-${requestId} status to [${status}]`);

    // Alert Resident of the updated status!
    const statusMessages: Record<string, string> = {
      In_Progress: `Hauler is on site at ${req?.address_landmark || 'your landmark'} loading your ${req?.waste_type || ''} waste.`,
      Completed: `Collection Completed! Verified with photo proof. Thank you for keeping Nabutiti clean.`,
      Inaccessible: `Hauler was unable to access compound (locked gate or flooded lane). Rescheduling.`,
      Overdue: `Order delayed due to logistical bottlenecks. Priority escalated.`
    };

    pushNotification(
      `Waste Collection ${status.replace('_', ' ')}`,
      statusMessages[status] || `Order #WR-${String(requestId).padStart(4, '0')} status updated to ${status}.`,
      'status_change',
      'resident'
    );
  };

  const resolveComplaint = (
    complaintId: number,
    status: 'Resolved' | 'Under_Review',
    response: string
  ) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            admin_response: response,
            resolved_at: status === 'Resolved' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : undefined
          };
        }
        return c;
      })
    );

    addLog(`Admin resolved complaint #CMP-${complaintId} as [${status}]`);

    pushNotification(
      'Complaint Resolved by Officer',
      `Response to #CMP-${complaintId}: "${response}"`,
      'alert',
      'resident'
    );
  };

  const toggleCollectorAvailability = (collectorId: number) => {
    setCollectors(prev =>
      prev.map(c => {
        if (c.id === collectorId) {
          return { ...c, is_available: !c.is_available };
        }
        return c;
      })
    );
    addLog(`Admin toggled availability for Collector #${collectorId}`);
  };

  const updateUserStatus = (userId: number, status: 'active' | 'suspended' | 'closed') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    addLog(`Admin updated status for User #${userId} to [${status}]`);
  };

  const updateUserZone = (userId: number, zone: SubZone) => {
    setResidents(prev => prev.map(r => r.user_id === userId ? { ...r, zone_name: zone } : r));
    addLog(`Admin updated sub-zone for User #${userId} to [${zone}]`);
  };

  const resetUserPassword = (userId: number): string => {
    const tempPass = 'Nabutiti#' + Math.floor(1000 + Math.random() * 9000);
    addLog(`Admin generated temporary password reset token for User #${userId}`);
    return tempPass;
  };

  const resetDatabase = async () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.RESIDENTS);
    localStorage.removeItem(STORAGE_KEYS.COLLECTORS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.DUMPING);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);

    await clearAllPendingOfflineUpdates();

    setUsers(INITIAL_USERS);
    setResidents(INITIAL_RESIDENTS);
    setCollectors(INITIAL_COLLECTORS);
    setRequests(INITIAL_REQUESTS);
    setDumpingReports(INITIAL_DUMPING_REPORTS);
    setComplaints(INITIAL_COMPLAINTS);
    setActivityLogs(INITIAL_LOGS);
    setPendingOfflineUpdates([]);
    setNotifications([
      {
        id: 'reset-1',
        title: 'Database Reset Complete',
        message: 'Loaded realistic seed data for Nabutiti Village, Kansanga.',
        type: 'alert',
        roleTarget: 'all',
        timestamp: 'Just now',
        read: false
      }
    ]);
    setCurrentUserId(5);
  };

  return (
    <WasteAppContext.Provider
      value={{
        currentUser,
        currentResident,
        currentCollector,
        users,
        residents,
        collectors,
        requests,
        dumpingReports,
        complaints,
        activityLogs,
        collectionPoints,

        // Connectivity & Offline Sync
        isOnline,
        isSimulatedOffline,
        effectiveOnline,
        toggleSimulateOffline,
        pendingOfflineUpdates,
        syncOfflineTasks,
        isSyncing,

        // Real-Time Notifications
        notifications,
        activeToast,
        dismissToast,
        notificationPermission,
        requestPermission,
        markAllNotificationsRead,

        // Workflows
        loginAsUser,
        attemptAccessDashboard,
        switchRole,
        logout,
        submitRequest,
        cancelRequest,
        reportDumping,
        lodgeComplaint,
        assignRequest,
        updateTaskStatus,
        resolveComplaint,
        toggleCollectorAvailability,
        updateUserStatus,
        updateUserZone,
        resetUserPassword,
        resetDatabase
      }}
    >
      {children}
    </WasteAppContext.Provider>
  );
};

export const useWasteApp = () => {
  const context = useContext(WasteAppContext);
  if (!context) {
    throw new Error('useWasteApp must be used within WasteAppProvider');
  }
  return context;
};
