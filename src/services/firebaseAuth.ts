import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';

// Read Firebase configuration from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization error, using local auth provider:', err);
  }
}

export interface AuthUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isGoogle: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUserProfile | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    // Check saved session
    const saved = localStorage.getItem('pix_pals_auth_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        // Ignored
      }
    }

    if (auth) {
      onAuthStateChanged(auth, (user: FirebaseUser | null) => {
        if (user) {
          const authUser: AuthUserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'Pal Scholar',
            email: user.email || '',
            photoURL: user.photoURL || undefined,
            isGoogle: true,
          };
          this.currentUser = authUser;
          localStorage.setItem('pix_pals_auth_user', JSON.stringify(authUser));
        }
      });
    }
  }

  public getCurrentUser(): AuthUserProfile | null {
    return this.currentUser;
  }

  public async signInWithGoogle(): Promise<{ user: AuthUserProfile | null; error?: string }> {
    // 1. If real Firebase credentials are provided, use real Google popup
    if (auth) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const profile: AuthUserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Google Scholar',
          email: user.email || '',
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
          isGoogle: true,
        };
        this.currentUser = profile;
        localStorage.setItem('pix_pals_auth_user', JSON.stringify(profile));
        return { user: profile };
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          return { user: null, error: 'Google sign-in was cancelled.' };
        }
        if (err.code === 'auth/popup-blocked') {
          return { user: null, error: 'Popup was blocked by your browser. Please allow popups for this site.' };
        }
        if (err.code === 'auth/network-request-failed') {
          return { user: null, error: 'Network error. Please check your internet connection and try again.' };
        }
        return { user: null, error: err.message || 'We could not sign you in with Google right now. Please try again.' };
      }
    }

    // 2. Client-side local OAuth provider fallback (for instant dev without needing cloud API keys)
    return new Promise((resolve) => {
      setTimeout(() => {
        const fallbackProfile: AuthUserProfile = {
          uid: `g_${Date.now()}`,
          displayName: 'Sekhar',
          email: 'sekhar.pixpals@gmail.com',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
          isGoogle: true,
        };
        this.currentUser = fallbackProfile;
        localStorage.setItem('pix_pals_auth_user', JSON.stringify(fallbackProfile));
        resolve({ user: fallbackProfile });
      }, 700);
    });
  }

  public async signInWithEmail(name: string, email: string): Promise<AuthUserProfile> {
    const profile: AuthUserProfile = {
      uid: `email_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      displayName: name.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      isGoogle: false,
    };
    this.currentUser = profile;
    localStorage.setItem('pix_pals_auth_user', JSON.stringify(profile));
    return profile;
  }

  public async signOut(): Promise<void> {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        // Ignored
      }
    }
    this.currentUser = null;
    localStorage.removeItem('pix_pals_auth_user');
  }
}

export const authService = AuthService.getInstance();
