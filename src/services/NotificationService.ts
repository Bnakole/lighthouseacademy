/**
 * NotificationService.ts
 * Handles push notifications using OneSignal
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://onesignal.com and create a free account
 * 2. Create a new app called "Light House Academy"
 * 3. Choose "Web" as your platform
 * 4. Copy your App ID and paste it below
 */

// ========================================
// REPLACE THIS WITH YOUR ONESIGNAL APP ID
// ========================================
const ONESIGNAL_APP_ID = '15897ccf-351e-4d66-bb2c-5d77a0c40ff0';

// Check if OneSignal is configured
const isConfigured = () => {
  return ONESIGNAL_APP_ID.length > 10;
};

// Initialize OneSignal
export const initializeNotifications = async (): Promise<boolean> => {
  if (!isConfigured()) {
    console.log('OneSignal not configured. Push notifications disabled.');
    return false;
  }

  try {
    // Load OneSignal SDK
    if (typeof window !== 'undefined' && !window.OneSignal) {
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    // Initialize OneSignal
    if (window.OneSignal) {
      await window.OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true,
          size: 'medium',
          position: 'bottom-right',
          showCredit: false,
          text: {
            'tip.state.unsubscribed': 'Subscribe to notifications',
            'tip.state.subscribed': 'You are subscribed',
            'tip.state.blocked': 'Notifications blocked',
            'message.prenotify': 'Click to subscribe to notifications',
            'message.action.subscribed': 'Thanks for subscribing!',
            'message.action.resubscribed': 'You are subscribed!',
            'message.action.unsubscribed': 'You will not receive notifications',
            'dialog.main.title': 'Manage Notifications',
            'dialog.main.button.subscribe': 'SUBSCRIBE',
            'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
            'dialog.blocked.title': 'Unblock Notifications',
            'dialog.blocked.message': 'Follow these instructions to allow notifications:'
          }
        },
        welcomeNotification: {
          title: 'Welcome to Light House Academy!',
          message: 'Thanks for subscribing. You will receive updates about your training.'
        }
      });

      console.log('OneSignal initialized successfully');
      return true;
    }
  } catch (error) {
    console.error('Error initializing OneSignal:', error);
  }

  return false;
};

// Request notification permission
export const requestPermission = async (): Promise<boolean> => {
  if (!isConfigured()) {
    console.log('OneSignal not configured');
    return false;
  }

  try {
    if (window.OneSignal) {
      const permission = await window.OneSignal.Notifications.requestPermission();
      return permission;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }

  return false;
};

// Check if user is subscribed
export const isSubscribed = async (): Promise<boolean> => {
  if (!isConfigured() || !window.OneSignal) {
    return false;
  }

  try {
    const subscribed = await window.OneSignal.User.PushSubscription.optedIn;
    return subscribed || false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

// Subscribe user to notifications
export const subscribeUser = async (userId: string, email?: string): Promise<boolean> => {
  if (!isConfigured() || !window.OneSignal) {
    return false;
  }

  try {
    // Set external user ID for targeting
    await window.OneSignal.login(userId);

    // Set email if provided
    if (email) {
      await window.OneSignal.User.addEmail(email);
    }

    // Opt in to push
    await window.OneSignal.User.PushSubscription.optIn();

    return true;
  } catch (error) {
    console.error('Error subscribing user:', error);
    return false;
  }
};

// Unsubscribe user from notifications
export const unsubscribeUser = async (): Promise<boolean> => {
  if (!isConfigured() || !window.OneSignal) {
    return false;
  }

  try {
    await window.OneSignal.User.PushSubscription.optOut();
    return true;
  } catch (error) {
    console.error('Error unsubscribing user:', error);
    return false;
  }
};

// Add tags for targeted notifications
export const setUserTags = async (tags: Record<string, string>): Promise<void> => {
  if (!isConfigured() || !window.OneSignal) {
    return;
  }

  try {
    await window.OneSignal.User.addTags(tags);
  } catch (error) {
    console.error('Error setting user tags:', error);
  }
};

// Send notification via OneSignal REST API (requires backend or Supabase Edge Function)
// For now, this is a placeholder - notifications should be sent from admin portal via OneSignal dashboard
export const sendNotification = async (
  title: string,
  message: string,
  targetUserIds?: string[]
): Promise<boolean> => {
  console.log('Notification queued:', { title, message, targetUserIds });
  
  // In production, you would:
  // 1. Call a Supabase Edge Function, OR
  // 2. Use OneSignal dashboard to send notifications, OR
  // 3. Set up a backend server
  
  // For now, we'll use browser notification as fallback
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/lha-logo.png',
      badge: '/lha-logo.png',
      tag: 'lha-notification',
      requireInteraction: true
    });
    return true;
  }
  
  return false;
};

// Show local browser notification (fallback)
export const showLocalNotification = (title: string, message: string): void => {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

  // Check permission
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/lha-logo.png',
      tag: 'lha-notification'
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/lha-logo.png',
          tag: 'lha-notification'
        });
      }
    });
  }
};

// Request browser notification permission (fallback when OneSignal is not configured)
export const requestBrowserPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Declare OneSignal on window
declare global {
  interface Window {
    OneSignal: any;
  }
}

export default {
  initializeNotifications,
  requestPermission,
  isSubscribed,
  subscribeUser,
  unsubscribeUser,
  setUserTags,
  sendNotification,
  showLocalNotification,
  requestBrowserPermission
};
