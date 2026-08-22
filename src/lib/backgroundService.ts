// Background Services Suite for EduZam AI Studio
// Implements: Silent Push, VoIP Audio, Geofencing, Resumable Transfers, Power Throttling & Persistent Cache

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
}

export interface BackgroundTransferItem {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  transferredBytes: number;
  type: 'upload' | 'download';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed';
  speed: string; // e.g. "1.4 MB/s"
  progress: number; // 0 to 100
  category: 'curriculum' | 'exam_media' | 'markbook_archive' | 'student_portfolios';
  resumableToken: string;
  createdAt: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  category: 'campus' | 'exam_centre' | 'inspectorate' | 'provincial_hq';
  latitude: number;
  longitude: number;
  radiusMeters: number;
  status: 'inside' | 'outside';
  autoAction: string;
  lastEntered?: number;
  lastExited?: number;
}

export interface BackgroundVoIPCall {
  callId: string;
  callerName: string;
  callerRole: string;
  callerAvatar: string;
  channel: string;
  status: 'idle' | 'ringing' | 'connected' | 'on_hold' | 'ended';
  isMuted: boolean;
  isSpeakerOn: boolean;
  isWalkieTalkieActive: boolean;
  durationSeconds: number;
  quality: 'HD Voice' | 'Low-Energy VoIP' | 'Bandwidth-Throttled';
}

export interface BackgroundSyncConfig {
  silentPushEnabled: boolean;
  backgroundVoIPEnabled: boolean;
  backgroundLocationEnabled: boolean;
  locationMode: 'significant_change' | 'visits' | 'high_precision';
  resumableTransfersEnabled: boolean;
  intelligentHabitRefresh: boolean;
  lowPowerModeThrottling: boolean;
  doNotDisturb: boolean;
  lastSyncTimestamp: number;
  cachedEntriesCount: number;
}

const STORAGE_KEY_CONFIG = 'eduzam_bg_config';
const STORAGE_KEY_TRANSFERS = 'eduzam_bg_transfers';
const STORAGE_KEY_CACHE = 'eduzam_persistent_cache_';
const STORAGE_KEY_ZONES = 'eduzam_geofence_zones';

// Default Geofence Zones across Zambia Educational Districts
export const DEFAULT_GEOFENCE_ZONES: GeofenceZone[] = [
  {
    id: 'zone-1',
    name: 'Ministry of Education HQ (Lusaka)',
    category: 'provincial_hq',
    latitude: -15.4167,
    longitude: 28.2833,
    radiusMeters: 400,
    status: 'inside',
    autoAction: 'Automatic Headquarters Staff Check-In & Sync Circulars',
    lastEntered: Date.now() - 3600000,
  },
  {
    id: 'zone-2',
    name: 'National Examination Command Center',
    category: 'exam_centre',
    latitude: -15.4200,
    longitude: 28.2900,
    radiusMeters: 250,
    status: 'outside',
    autoAction: 'SBA Security Seal Verification Mode',
    lastExited: Date.now() - 86400000,
  },
  {
    id: 'zone-3',
    name: 'Copperbelt Regional Inspection Hub (Ndola)',
    category: 'inspectorate',
    latitude: -12.9667,
    longitude: 28.6333,
    radiusMeters: 600,
    status: 'outside',
    autoAction: 'Provincial Audit Checklist Auto-Prefetch',
  },
  {
    id: 'zone-4',
    name: 'Munali STEM Academy Campus',
    category: 'campus',
    latitude: -15.3900,
    longitude: 28.3400,
    radiusMeters: 500,
    status: 'outside',
    autoAction: 'Live Classroom Attendance & Lesson Plan Sync',
  },
];

// Initial Transfer Items Demo
export const INITIAL_TRANSFERS: BackgroundTransferItem[] = [
  {
    id: 'tx-1',
    fileName: 'Zambian_National_Curriculum_Framework_2026.pdf',
    fileSize: 48500000, // 48.5 MB
    transferredBytes: 48500000,
    type: 'download',
    status: 'completed',
    speed: '0 KB/s',
    progress: 100,
    category: 'curriculum',
    resumableToken: 'tok_res_curriculum_01',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'tx-2',
    fileName: 'Senior_STEM_Biology_Practical_AudioGuides.zip',
    fileSize: 124000000, // 124 MB
    transferredBytes: 86800000,
    type: 'download',
    status: 'active',
    speed: '2.8 MB/s',
    progress: 70,
    category: 'exam_media',
    resumableToken: 'tok_res_bio_media_02',
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'tx-3',
    fileName: 'Grade12_National_Markbook_Archive_Backup.eduzam',
    fileSize: 32000000, // 32 MB
    transferredBytes: 12800000,
    type: 'upload',
    status: 'active',
    speed: '1.2 MB/s',
    progress: 40,
    category: 'markbook_archive',
    resumableToken: 'tok_res_markbook_03',
    createdAt: Date.now() - 900000,
  }
];

class BackgroundServiceManager {
  private config: BackgroundSyncConfig;
  private transfers: BackgroundTransferItem[] = [];
  private geofences: GeofenceZone[] = [];
  private voipCall: BackgroundVoIPCall = {
    callId: '',
    callerName: '',
    callerRole: '',
    callerAvatar: '',
    channel: '',
    status: 'idle',
    isMuted: false,
    isSpeakerOn: true,
    isWalkieTalkieActive: false,
    durationSeconds: 0,
    quality: 'Low-Energy VoIP',
  };
  private listeners: Set<() => void> = new Set();
  private callTimer: ReturnType<typeof setInterval> | null = null;
  private transferInterval: ReturnType<typeof setInterval> | null = null;
  private batteryLevel: number = 0.85;
  private isCharging: boolean = true;
  private silentPushLog: Array<{ id: string; title: string; time: number; type: string }> = [];

  constructor() {
    // Load config
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      try {
        this.config = { ...this.getDefaultConfig(), ...JSON.parse(savedConfig) };
      } catch {
        this.config = this.getDefaultConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
    }

    // Load transfers
    const savedTransfers = localStorage.getItem(STORAGE_KEY_TRANSFERS);
    if (savedTransfers) {
      try {
        this.transfers = JSON.parse(savedTransfers);
      } catch {
        this.transfers = INITIAL_TRANSFERS;
      }
    } else {
      this.transfers = INITIAL_TRANSFERS;
    }

    // Load geofences
    const savedZones = localStorage.getItem(STORAGE_KEY_ZONES);
    if (savedZones) {
      try {
        this.geofences = JSON.parse(savedZones);
      } catch {
        this.geofences = DEFAULT_GEOFENCE_ZONES;
      }
    } else {
      this.geofences = DEFAULT_GEOFENCE_ZONES;
    }

    this.initLifecycleHandlers();
    this.initBatteryMonitoring();
    this.startBackgroundTransferWorker();
  }

  private getDefaultConfig(): BackgroundSyncConfig {
    return {
      silentPushEnabled: true,
      backgroundVoIPEnabled: true,
      backgroundLocationEnabled: true,
      locationMode: 'significant_change',
      resumableTransfersEnabled: true,
      intelligentHabitRefresh: true,
      lowPowerModeThrottling: true,
      doNotDisturb: false,
      lastSyncTimestamp: Date.now() - 300000,
      cachedEntriesCount: 14,
    };
  }

  // --- PERSISTENT LOCAL CACHE (Stale-While-Revalidate Engine) ---
  public setCache<T>(key: string, data: T, ttlMinutes = 60): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };
    try {
      localStorage.setItem(`${STORAGE_KEY_CACHE}${key}`, JSON.stringify(entry));
      this.notify();
    } catch (e) {
      console.warn('Persistent cache write failed:', e);
    }
  }

  public getCache<T>(key: string): { data: T | null; isStale: boolean } {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_CACHE}${key}`);
      if (!raw) return { data: null, isStale: true };
      const entry: CacheEntry<T> = JSON.parse(raw);
      const isStale = Date.now() > entry.expiresAt;
      return { data: entry.data, isStale };
    } catch {
      return { data: null, isStale: true };
    }
  }

  // --- SILENT PUSH DATA REFRESH ---
  public async triggerSilentPushRefresh(source = 'Cloud Push Notification'): Promise<{ success: boolean; itemsUpdated: number }> {
    if (!this.config.silentPushEnabled) return { success: false, itemsUpdated: 0 };

    // Check battery & throttling
    if (this.config.lowPowerModeThrottling && this.batteryLevel < 0.20 && !this.isCharging) {
      console.log('[BackgroundService] Silent push delayed: Low Power Mode active');
      return { success: false, itemsUpdated: 0 };
    }

    // Prefetch fresh data silently
    const itemsUpdated = Math.floor(Math.random() * 4) + 2;
    this.config.lastSyncTimestamp = Date.now();
    this.saveConfig();

    const pushItem = {
      id: `sp-${Date.now()}`,
      title: `Silent Push Prefetched ${itemsUpdated} Updates (${source})`,
      time: Date.now(),
      type: 'content_refresh',
    };
    this.silentPushLog.unshift(pushItem);
    if (this.silentPushLog.length > 10) this.silentPushLog.pop();

    this.notify();
    return { success: true, itemsUpdated };
  }

  public getSilentPushLog() {
    return this.silentPushLog;
  }

  // --- BACKGROUND AUDIO / VoIP SERVICE ---
  public startIncomingCallSimulation(callerName = 'Director Kangwa Mwewa', callerRole = 'Ministry Inspectorate Lead') {
    if (!this.config.backgroundVoIPEnabled) return;
    this.voipCall = {
      callId: `call-${Date.now()}`,
      callerName,
      callerRole,
      callerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      channel: 'Inspectors Secure Voice Grid (Low-Energy VoIP)',
      status: 'ringing',
      isMuted: false,
      isSpeakerOn: true,
      isWalkieTalkieActive: false,
      durationSeconds: 0,
      quality: 'Low-Energy VoIP',
    };
    this.notify();
  }

  public answerCall() {
    if (this.voipCall.status !== 'ringing') return;
    this.voipCall.status = 'connected';
    this.voipCall.durationSeconds = 0;
    if (this.callTimer) clearInterval(this.callTimer);
    this.callTimer = setInterval(() => {
      this.voipCall.durationSeconds += 1;
      this.notify();
    }, 1000);
    this.notify();
  }

  public endCall() {
    this.voipCall.status = 'ended';
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
    this.notify();
    setTimeout(() => {
      this.voipCall.status = 'idle';
      this.notify();
    }, 1200);
  }

  public toggleMute() {
    this.voipCall.isMuted = !this.voipCall.isMuted;
    this.notify();
  }

  public toggleSpeaker() {
    this.voipCall.isSpeakerOn = !this.voipCall.isSpeakerOn;
    this.notify();
  }

  public toggleWalkieTalkie(active?: boolean) {
    this.voipCall.isWalkieTalkieActive = active !== undefined ? active : !this.voipCall.isWalkieTalkieActive;
    this.notify();
  }

  public getVoIPState(): BackgroundVoIPCall {
    return this.voipCall;
  }

  // --- BACKGROUND LOCATION & GEOFENCING ---
  public toggleGeofenceStatus(zoneId: string) {
    this.geofences = this.geofences.map(z => {
      if (z.id === zoneId) {
        const nextStatus = z.status === 'inside' ? 'outside' : 'inside';
        return {
          ...z,
          status: nextStatus,
          lastEntered: nextStatus === 'inside' ? Date.now() : z.lastEntered,
          lastExited: nextStatus === 'outside' ? Date.now() : z.lastExited,
        };
      }
      return z;
    });
    localStorage.setItem(STORAGE_KEY_ZONES, JSON.stringify(this.geofences));
    this.notify();
  }

  public getGeofences(): GeofenceZone[] {
    return this.geofences;
  }

  // --- BACKGROUND RESUMABLE UPLOAD / DOWNLOAD (URLSession) ---
  public toggleTransferPause(id: string) {
    this.transfers = this.transfers.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'active' ? 'paused' : 'active';
        return { ...t, status: nextStatus, speed: nextStatus === 'paused' ? 'Paused (Resumable)' : '2.4 MB/s' };
      }
      return t;
    });
    this.saveTransfers();
    this.notify();
  }

  public addTransfer(item: Omit<BackgroundTransferItem, 'id' | 'createdAt' | 'resumableToken'>) {
    const newItem: BackgroundTransferItem = {
      ...item,
      id: `tx-${Date.now()}`,
      resumableToken: `tok_res_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    };
    this.transfers.unshift(newItem);
    this.saveTransfers();
    this.notify();
  }

  public removeTransfer(id: string) {
    this.transfers = this.transfers.filter(t => t.id !== id);
    this.saveTransfers();
    this.notify();
  }

  public getTransfers(): BackgroundTransferItem[] {
    return this.transfers;
  }

  private startBackgroundTransferWorker() {
    if (this.transferInterval) clearInterval(this.transferInterval);
    this.transferInterval = setInterval(() => {
      let changed = false;
      this.transfers = this.transfers.map(t => {
        if (t.status === 'active') {
          // Increment progress simulating chunks
          const chunk = Math.min(t.fileSize - t.transferredBytes, 1500000 + Math.random() * 800000);
          const nextTransferred = t.transferredBytes + chunk;
          const nextProgress = Math.min(100, Math.round((nextTransferred / t.fileSize) * 100));
          changed = true;

          if (nextProgress >= 100) {
            return {
              ...t,
              transferredBytes: t.fileSize,
              progress: 100,
              status: 'completed',
              speed: '0 KB/s',
            };
          }
          return {
            ...t,
            transferredBytes: nextTransferred,
            progress: nextProgress,
            speed: `${(1.8 + Math.random() * 1.5).toFixed(1)} MB/s`,
          };
        }
        return t;
      });

      if (changed) {
        this.saveTransfers();
        this.notify();
      }
    }, 1800);
  }

  // --- BATTERY & POWER-AWARE THROTTLING ---
  private initBatteryMonitoring() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((battery: { level: number; charging: boolean; addEventListener: (type: string, fn: () => void) => void }) => {
        this.batteryLevel = battery.level;
        this.isCharging = battery.charging;
        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level;
          this.notify();
        });
        battery.addEventListener('chargingchange', () => {
          this.isCharging = battery.charging;
          this.notify();
        });
      }).catch(() => {
        this.batteryLevel = 0.88;
        this.isCharging = true;
      });
    }
  }

  public getPowerStatus() {
    return {
      batteryLevel: Math.round(this.batteryLevel * 100),
      isCharging: this.isCharging,
      isThrottled: this.config.lowPowerModeThrottling && this.batteryLevel < 0.20 && !this.isCharging,
    };
  }

  // --- TASK EXPIRATION & LIFECYCLE STATE PRESERVATION ---
  private initLifecycleHandlers() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          console.log('[BackgroundService] App transitioned to background. Saving checkpoint...');
          this.saveCheckpoint();
        } else {
          console.log('[BackgroundService] App returned to foreground. Performing stale revalidation...');
          this.triggerSilentPushRefresh('Foreground Resume');
        }
      });

      window.addEventListener('beforeunload', () => {
        this.saveCheckpoint();
      });
    }
  }

  private saveCheckpoint() {
    try {
      this.saveConfig();
      this.saveTransfers();
      localStorage.setItem('eduzam_last_checkpoint', JSON.stringify({
        time: Date.now(),
        voipDuration: this.voipCall.durationSeconds,
        activeTransfers: this.transfers.filter(t => t.status === 'active').length,
      }));
    } catch (e) {
      console.warn('Failed to save background checkpoint:', e);
    }
  }

  // --- CONFIG & PERSISTENCE ---
  public getConfig(): BackgroundSyncConfig {
    return this.config;
  }

  public updateConfig(partial: Partial<BackgroundSyncConfig>) {
    this.config = { ...this.config, ...partial };
    this.saveConfig();
    this.notify();
  }

  private saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save config:', e);
    }
  }

  private saveTransfers() {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(this.transfers));
    } catch (e) {
      console.warn('Failed to save transfers:', e);
    }
  }

  // --- SUBSCRIBERS ---
  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }
}

export const backgroundService = new BackgroundServiceManager();
