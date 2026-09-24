import { BlockingProfile } from '../types';
import { storage } from './storage';

export type PlatformType = 'web_extension' | 'android' | 'ios' | 'web_sandbox';

export type PermissionState = 
  | 'extension_not_installed'
  | 'extension_ready'
  | 'mobile_permission_required'
  | 'mobile_ready'
  | 'active'
  | 'locked';

export interface BlockingStatus {
  isActive: boolean;
  activeProfile: BlockingProfile | null;
  sessionId: string | null;
  blockedSites: string[];
  allowedSites: string[];
  isLocked: boolean;
  platform: PlatformType;
  permissionState: PermissionState;
}

export interface IBlockingProvider {
  platform: PlatformType;
  checkPermission(): Promise<PermissionState>;
  activateBlocking(profile: BlockingProfile, sessionId: string): Promise<boolean>;
  deactivateBlocking(): Promise<boolean>;
}

/**
 * Web Extension Provider
 * Communicates with the Focus Buddy Manifest V3 Chrome/Edge extension.
 * Dispatches declarativeNetRequest rules to block tabs & redirects to cozy focus block page.
 */
class WebExtensionProvider implements IBlockingProvider {
  public platform: PlatformType = 'web_extension';
  private extensionId: string | null = null;
  private isExtensionConnected: boolean = false;

  constructor() {
    this.detectExtension();
    window.addEventListener('message', this.handleExtensionMessage.bind(this));
  }

  private detectExtension() {
    // Ping for Chrome / Edge Focus Buddy extension
    if (typeof window !== 'undefined') {
      window.postMessage({ type: 'FOCUS_BUDDY_PING' }, '*');
    }
  }

  private handleExtensionMessage(event: MessageEvent) {
    if (event.data && event.data.type === 'FOCUS_BUDDY_PONG') {
      this.isExtensionConnected = true;
      this.extensionId = event.data.extensionId || 'focus-buddy-ext';
    }
  }

  public async checkPermission(): Promise<PermissionState> {
    if (this.isExtensionConnected) {
      return 'extension_ready';
    }
    return 'extension_not_installed';
  }

  public async activateBlocking(profile: BlockingProfile, sessionId: string): Promise<boolean> {
    // Send declarative rules to extension bridge
    window.postMessage({
      type: 'FOCUS_BUDDY_ACTIVATE_BLOCKING',
      payload: {
        sessionId,
        profileName: profile.name,
        blockedDomains: profile.blockedSites,
        allowedDomains: profile.allowedSites,
      }
    }, '*');
    return true;
  }

  public async deactivateBlocking(): Promise<boolean> {
    window.postMessage({
      type: 'FOCUS_BUDDY_DEACTIVATE_BLOCKING'
    }, '*');
    return true;
  }
}

/**
 * Android Provider Specification
 * Implements OS-level accessibility / UsageStatsManager bridge architecture.
 */
class AndroidBlockingProvider implements IBlockingProvider {
  public platform: PlatformType = 'android';

  public async checkPermission(): Promise<PermissionState> {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) return 'extension_not_installed';
    // Native bridge check e.g. window.AndroidFocusBridge
    if ((window as any).AndroidFocusBridge) {
      return 'mobile_ready';
    }
    return 'mobile_permission_required';
  }

  public async activateBlocking(profile: BlockingProfile, sessionId: string): Promise<boolean> {
    if ((window as any).AndroidFocusBridge?.startAccessibilityBlocker) {
      (window as any).AndroidFocusBridge.startAccessibilityBlocker(JSON.stringify(profile.blockedApps));
      return true;
    }
    return true;
  }

  public async deactivateBlocking(): Promise<boolean> {
    if ((window as any).AndroidFocusBridge?.stopAccessibilityBlocker) {
      (window as any).AndroidFocusBridge.stopAccessibilityBlocker();
      return true;
    }
    return true;
  }
}

/**
 * iOS Provider Specification
 * Implements Apple FamilyControls / ManagedSettings / DeviceActivity authorization model.
 */
class IOSBlockingProvider implements IBlockingProvider {
  public platform: PlatformType = 'ios';

  public async checkPermission(): Promise<PermissionState> {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isIOS) return 'extension_not_installed';
    if ((window as any).webkit?.messageHandlers?.FamilyControlsBridge) {
      return 'mobile_ready';
    }
    return 'mobile_permission_required';
  }

  public async activateBlocking(profile: BlockingProfile, sessionId: string): Promise<boolean> {
    if ((window as any).webkit?.messageHandlers?.FamilyControlsBridge) {
      (window as any).webkit.messageHandlers.FamilyControlsBridge.postMessage({
        action: 'shieldApplications',
        blockedItems: profile.blockedApps,
      });
      return true;
    }
    return true;
  }

  public async deactivateBlocking(): Promise<boolean> {
    if ((window as any).webkit?.messageHandlers?.FamilyControlsBridge) {
      (window as any).webkit.messageHandlers.FamilyControlsBridge.postMessage({
        action: 'clearShields'
      });
      return true;
    }
    return true;
  }
}

/**
 * Master Blocking Service Subsystem
 */
export class BlockingService {
  private static instance: BlockingService;
  private webProvider = new WebExtensionProvider();
  private androidProvider = new AndroidBlockingProvider();
  private iosProvider = new IOSBlockingProvider();

  private activeSessionId: string | null = null;
  private activeProfile: BlockingProfile | null = null;
  private isBlockingActiveState: boolean = false;

  public static getInstance(): BlockingService {
    if (!BlockingService.instance) {
      BlockingService.instance = new BlockingService();
    }
    return BlockingService.instance;
  }

  public async getStatus(): Promise<BlockingStatus> {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    let platform: PlatformType = 'web_extension';
    let permissionState: PermissionState = 'extension_not_installed';

    if (isAndroid) {
      platform = 'android';
      permissionState = await this.androidProvider.checkPermission();
    } else if (isIOS) {
      platform = 'ios';
      permissionState = await this.iosProvider.checkPermission();
    } else {
      permissionState = await this.webProvider.checkPermission();
    }

    if (this.isBlockingActiveState) {
      permissionState = 'active';
    }

    return {
      isActive: this.isBlockingActiveState,
      activeProfile: this.activeProfile,
      sessionId: this.activeSessionId,
      blockedSites: this.activeProfile?.blockedSites || [],
      allowedSites: this.activeProfile?.allowedSites || [],
      isLocked: this.isBlockingActiveState, // Hard Lock during active session!
      platform,
      permissionState,
    };
  }

  public async startBlocking(profile: BlockingProfile, sessionId: string): Promise<boolean> {
    this.activeProfile = profile;
    this.activeSessionId = sessionId;
    this.isBlockingActiveState = true;

    // Dispatch to providers
    await this.webProvider.activateBlocking(profile, sessionId);
    await this.androidProvider.activateBlocking(profile, sessionId);
    await this.iosProvider.activateBlocking(profile, sessionId);

    // Save state in localStorage so tab refresh or restore knows blocking is locked
    localStorage.setItem('focus_buddy_active_blocking', JSON.stringify({
      sessionId,
      profileId: profile.id,
      startedAt: Date.now(),
    }));

    return true;
  }

  public async stopBlocking(): Promise<boolean> {
    this.isBlockingActiveState = false;
    this.activeSessionId = null;
    this.activeProfile = null;

    await this.webProvider.deactivateBlocking();
    await this.androidProvider.deactivateBlocking();
    await this.iosProvider.deactivateBlocking();

    localStorage.removeItem('focus_buddy_active_blocking');
    return true;
  }

  public isListLocked(): boolean {
    return this.isBlockingActiveState;
  }
}

export const blockingService = BlockingService.getInstance();
