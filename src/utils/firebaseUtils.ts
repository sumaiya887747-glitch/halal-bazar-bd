import { auth } from '../lib/firebase';
import { StoreSettings } from '../types/admin';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuotaExceeded = errMsg.includes('resource-exhausted') || errMsg.includes('Quota limit exceeded');

  if (isQuotaExceeded) {
    console.warn(`[Firestore Safe Fallback] Quota reached for ${operationType} on ${path}. Storing changes locally.`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Warning/Fallback: ', JSON.stringify(errInfo));
}

/**
 * Sanitizes an object for Firestore by removing 'undefined' values recursively.
 */
export function sanitizeForFirestore(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  
  const sanitized: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      sanitized[key] = sanitizeForFirestore(obj[key]);
    }
  }
  return sanitized;
}

/**
 * Prepares settings for Firestore by removing oversized strings and ensuring
 * the document NEVER exceeds Firestore's 1,048,576 bytes (1MB) limit.
 */
export function splitSettingsForFirestore(settings: StoreSettings): Record<string, any> {
  // Pruning logic to ensure each part is small
  const prune = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined;
    if (typeof obj === 'string') {
        if (obj.startsWith('data:') || obj.length > 512) return undefined;
        return obj;
    }
    if (Array.isArray(obj)) return obj.map(prune).filter(v => v !== undefined);
    if (typeof obj === 'object') {
        const res: any = {};
        for (const k in obj) {
            const val = prune(obj[k]);
            if (val !== undefined) res[k] = val;
        }
        return res;
    }
    return obj;
  };

  const sanitized = sanitizeForFirestore(settings);
  const pruned = prune(sanitized);

  return {
    general: {
      storeName: pruned.storeName,
      storeTagline: pruned.storeTagline,
      phone: pruned.phone,
      email: pruned.email,
      address: pruned.address,
      whatsappNumber: pruned.whatsappNumber,
      facebookUrl: pruned.facebookUrl,
    },
    appearance: {
      primaryColor: pruned.primaryColor,
      secondaryColor: pruned.secondaryColor,
      themeId: pruned.themeId,
      logoLetter: pruned.logoLetter,
      // logoImage: pruned.logoImage // Removed due to size
    },
    homepage: {
      heroTitle: pruned.heroTitle,
      heroSubtitle: pruned.heroSubtitle,
      heroCtaText: pruned.heroCtaText,
      heroBadge: pruned.heroBadge,
      announcementText: pruned.announcementText,
      isAnnouncementActive: pruned.isAnnouncementActive,
      clothingHeroTitle: pruned.clothingHeroTitle,
    },
    payments: {
      deliveryFeeDhaka: pruned.deliveryFeeDhaka,
      deliveryFeeOutside: pruned.deliveryFeeOutside,
      bkashNumber: pruned.bkashNumber,
      nagadNumber: pruned.nagadNumber,
      nextInvoiceNumber: pruned.nextInvoiceNumber,
      invoicePrefix: pruned.invoicePrefix,
    },
    content: {
      navItems: pruned.navItems,
      // customServices: pruned.customServices, // Might be too large, need to handle separately
      // customFaqs: pruned.customFaqs,
      // customTestimonials: pruned.customTestimonials,
    }
  };
}
