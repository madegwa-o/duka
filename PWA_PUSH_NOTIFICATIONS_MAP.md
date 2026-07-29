# Duka PWA & Push Notifications Feature Map

## Overview
This project (Duka - a modern marketplace) has a fully implemented **Progressive Web App (PWA)** with **Web Push Notifications**. The app can be installed on devices and send real-time notifications to users.

---

## 📱 PWA Features

### 1. **PWA Configuration**
**Location:** `next.config.ts`
```typescript
const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    reloadOnOnline: true,
    workboxOptions: {
        disableDevLogs: true,
    },
});
```
- **Package:** `@ducanh2912/next-pwa` v10.2.9
- **Features:**
  - Service workers are registered automatically
  - App reloads when connection is restored
  - Workbox for offline caching
  - Disabled in development mode (can be changed)

### 2. **Web Manifest**
**Location:** `public/manifest.json`
- **App Name:** "Duka — Shop Smart, Sell Fast"
- **Short Name:** "Duka"
- **Display Mode:** `standalone` (fullscreen app-like experience)
- **Theme Color:** `#0A0A0A` (dark)
- **Background Color:** `#F5F5F5` (light)
- **Icons:** 
  - 192x192px (Android chrome)
  - 512x512px (Android chrome)
  - 180x180px (Apple touch)
  - 32x32px & 16x16px (favicons)
- **Shortcuts:**
  - Explore browsing
  - My Shop (manage listings)
  - Sell Item (list new items)
- **Categories:** shopping, marketplace, e-commerce, business

### 3. **Fallback Manifest**
**Location:** `public/site.webmanifest`
- Backup manifest with basic PWA config

### 4. **Viewport & Metadata**
**Location:** `src/app/layout.tsx`
```typescript
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#F5F5F5" },
        { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    ],
    colorScheme: "light dark",
};

export const metadata: Metadata = {
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        title: "Duka",
        statusBarStyle: "black-translucent",
    },
    // ... full SEO metadata
};
```
- Responsive viewport configuration
- Apple web app support
- Theme color adaptation for light/dark modes

---

## 🔔 Push Notifications System

### Architecture Flow
```
User Permission → Subscribe (API) → Store in DB → Send Notifications
     ↓
  Browser         Service Worker         MongoDB         Web-Push
```

### 1. **Core Dependencies**
- `web-push` v3.6.7 - Server-side notification sending
- `mongoose` v8.18.1 - Database (stores subscriptions)
- Service Worker API - Browser-side handling

### 2. **VAPID Configuration**
**Required Environment Variables:**
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY  (frontend - exposed)
VAPID_PRIVATE_KEY             (backend - secret)
VAPID_EMAIL                   (email for certificate)
```
- VAPID (Voluntary Application Server Identification) secures push notifications
- Implemented in `src/lib/push-notifications.ts`

### 3. **Database Model**
**Location:** `src/models/Subscription.ts`

```typescript
interface ISubscription extends Document {
    userId: ObjectId;              // User who subscribed
    endpoint: string;              // Push service endpoint (unique)
    keys: {
        p256dh: string;           // ECDH public key
        auth: string;             // Authentication secret
    };
    createdAt: Date;
    updatedAt: Date;
}
```
- **Indexes:** 
  - `userId` (lookup user's subscriptions)
  - `userId + endpoint` (compound index)
  - `endpoint` (unique - prevents duplicates)
- **Storage:** MongoDB

### 4. **Client-Side Hook**
**Location:** `src/hooks/use-push-notifications.ts`

**Exports:**
```typescript
const {
    isSupported,           // boolean - browser supports push
    isSubscribed,          // boolean - user subscribed?
    subscription,          // PushSubscription object
    subscribeToPush,       // () => Promise - ask permission & subscribe
    unsubscribeFromPush,   // () => Promise - unsubscribe
} = usePushNotifications();
```

**Flow:**
1. **Check Support:** Verifies `serviceWorker` & `PushManager` support
2. **Check Subscription:** On mount, checks if already subscribed
3. **Subscribe Process:**
   - Requests `Notification.permission` from user
   - Waits for service worker to be ready
   - Fetches VAPID public key from `/api/push/vapid-public-key`
   - Converts key to Uint8Array (Base64 → binary)
   - Creates push subscription via `pushManager.subscribe()`
   - Sends subscription to backend via `/api/push/subscribe`
4. **Unsubscribe Process:**
   - Calls `subscription.unsubscribe()`
   - Removes from database via `/api/push/unsubscribe`

### 5. **API Routes**

#### **GET `/api/push/vapid-public-key`**
- **Purpose:** Provide public VAPID key to frontend
- **Returns:** `{ publicKey: string }`
- **Auth:** None required (public key is meant to be public)

#### **POST `/api/push/subscribe`**
- **Purpose:** Store user's push subscription in database
- **Auth:** Required (NextAuth session)
- **Input:** Push subscription object
  ```json
  {
      "endpoint": "https://fcm.googleapis.com/...",
      "keys": { "p256dh": "...", "auth": "..." }
  }
  ```
- **Output:** `{ success: true, subscriptionId: string }`
- **Behavior:** 
  - Upserts subscription (updates if exists, creates if new)
  - Links to current user's ID
  - Prevents duplicate subscriptions

#### **POST `/api/push/unsubscribe`**
- **Purpose:** Remove subscription from database
- **Auth:** Required
- **Input:** Subscription object
- **Output:** `{ success: true }`
- **Behavior:** Deletes subscription from database

#### **POST `/api/push/send` (Private)**
- **Purpose:** Send notifications to specific user
- **Auth:** Required (NextAuth session)
- **Input:**
  ```json
  {
      "title": "New message",
      "body": "You have a new order",
      "url": "/orders/123",
      "userId": "user_id_optional"
  }
  ```
- **Output:**
  ```json
  {
      "success": true,
      "sent": 5,
      "failed": 0
  }
  ```
- **Behavior:**
  - Gets all subscriptions for user
  - Sends notification via web-push to each endpoint
  - **Does NOT remove invalid subscriptions** (unlike send-public)

#### **POST `/api/push/send-public` (Public)**
- **Purpose:** Send notifications to multiple users or all users
- **Auth:** None required
- **Input:**
  ```json
  {
      "title": "System alert",
      "body": "Scheduled maintenance",
      "userId": "user_id_optional",
      "url": "/info"
  }
  ```
- **Output:**
  ```json
  {
      "success": true,
      "sent": 100,
      "failed": 2,
      "total": 102
  }
  ```
- **Special Behavior:**
  - Automatically **removes failed subscriptions** from database
  - Cleans up expired/invalid endpoints
  - Returns total vs sent vs failed counts

#### **POST `/api/push/test`**
- **Purpose:** Send test notification to verify setup
- **Auth:** None required in code, but checks userId
- **Input:**
  ```json
  {
      "userId": "user_id",
      "title": "Custom title",
      "body": "Custom message",
      "url": "/test"
  }
  ```
- **Output:** 
  ```json
  {
      "success": true,
      "sent": 3,
      "failed": 0,
      "message": "Test notification sent successfully..."
  }
  ```
- **Features:**
  - Detailed error tracking
  - Lists which endpoints failed
  - Includes timestamp in notification data

### 6. **Service Worker**
**Location:** `worker/index.js`

**Push Event Handler:**
```javascript
self.addEventListener("push", (event) => {
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/android-chrome-192x192.png",
            data: { url: data.url || "/" },
        })
    );
});
```
- Listens for push events from server
- Shows notification with title, body, icon
- Stores URL in notification data

**Click Handler:**
```javascript
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || "/";
    event.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                // Check if window already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === new URL(urlToOpen, self.location.origin).href 
                        && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window if needed
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});
```
- On notification click:
  - Closes notification
  - Focuses existing window if already open
  - Opens new window/tab if not open
  - Navigates to URL stored in notification data

### 7. **UI Components**

#### **InstallPrompt Component**
**Location:** `src/components/InstallPrompt.tsx`
- **Purpose:** Guide users through PWA installation & push notification opt-in
- **Two-Stage Flow:**
  1. **Install Prompt** (shows when PWA is installable)
     - Only shows once per session (uses sessionStorage)
     - Shows when `beforeinstallprompt` event fires
     - Users can "Install App" or "Not Now"
     - After install, auto-shows notification prompt
  2. **Notification Prompt** (shows after installation)
     - Only shows on standalone/installed PWA
     - Waits 2 seconds after install
     - Users can "Enable" or "Skip"
     - Tracks dismissal in sessionStorage
- **Detection Logic:**
  - Checks `display-mode: standalone` media query
  - Checks `navigator.standalone` property
  - Checks Android app referrer
- **Visual Features:**
  - Duka logo from manifest
  - Bell icon for notifications
  - Slide-in animation from bottom
  - Responsive positioning

#### **PushNotificationToggle Component**
**Location:** `src/components/push-notification-toggle.tsx`
- **Purpose:** Manual notification subscribe/unsubscribe button
- **Icon:** Bell (enabled) / BellOff (disabled)
- **Placement:** Usually in header or settings
- **Behavior:**
  - Hidden if browser doesn't support push
  - Text changes based on subscription state
  - Triggers subscribe/unsubscribe from hook

#### **PushNotificationInitializer Component**
**Location:** `src/components/push-notification-initializer.tsx`
- **Purpose:** Setup push event listeners in service worker
- **Renders:** Nothing (invisible)
- **On Mount:** 
  - Registers service worker message listener
  - Listens for `PUSH_NOTIFICATION` type events
  - Logs received notifications for debugging
- **Used in:** Root layout for app-wide initialization

### 8. **Helper Functions**
**Location:** `src/lib/push-notifications.ts`

```typescript
// Configure VAPID
webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
);

// Send to single subscription
async function sendPushNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
): Promise<{ success: boolean; error?: any }>;

// Send to multiple subscriptions
async function sendBulkPushNotifications(
    subscriptions: PushSubscription[],
    payload: NotificationPayload
): Promise<{ successful: number; failed: number; total: number }>;
```

---

## 🔄 How It All Works Together

### User Installation Flow
```
1. User opens app → beforeinstallprompt event fires
2. InstallPrompt shows "Install Duka" banner
3. User clicks "Install App" → browser installs PWA
4. App installed → service worker registered
5. InstallPrompt auto-shows notification prompt
6. User clicks "Enable" → asks browser permission
7. Browser shows "Allow notifications?" dialog
8. User allows → subscription saved to DB
9. Server can now send notifications anytime
```

### Notification Sending Flow
```
1. Backend calls /api/push/send or /api/push/send-public
2. Queries DB for all subscriptions for user(s)
3. web-push library sends to each endpoint
4. Browser receives push event
5. Service worker's push event listener fires
6. Notification displayed in system notification center
7. User clicks notification
8. Service worker notificationclick listener fires
9. Opens/focuses app window or new tab
10. App navigates to URL in notification data
```

---

## 📊 Key Statistics

| Component | Count | Location |
|-----------|-------|----------|
| API Routes | 5 | `src/app/api/push/*` |
| Components | 3 | `src/components/*` |
| Hooks | 1 | `src/hooks/use-push-notifications.ts` |
| Models | 1 | `src/models/Subscription.ts` |
| Service Workers | 1 | `worker/index.js` |
| Config Files | 2 | `next.config.ts`, `public/manifest.json` |
| NPM Dependencies | 2 | `@ducanh2912/next-pwa`, `web-push` |

---

## 🔐 Security Considerations

1. **VAPID Keys:** Private key must never be exposed (server-side only)
2. **Authentication:** Most endpoints require NextAuth session
3. **Public Endpoint:** `/api/push/send-public` is public (useful for announcements)
4. **Subscription Cleanup:** Invalid/expired subscriptions auto-removed
5. **CORS:** Service workers enforce same-origin policy

---

## 🚀 Deployment Requirements

To make PWA & push notifications work in production:

1. **HTTPS Only:** PWA requires HTTPS (not HTTP)
2. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY
   VAPID_PRIVATE_KEY
   VAPID_EMAIL
   ```
3. **Generate VAPID Keys** (if not done):
   ```bash
   npx web-push generate-vapid-keys
   ```
4. **MongoDB Connection:** Database URL for storing subscriptions
5. **NextAuth Session:** Configure session for authentication

---

## 🧪 Testing Notifications

1. **Subscribe to notifications:**
   - Install the PWA
   - Click "Enable Notifications"
   - Grant permission when prompted

2. **Send test notification:**
   ```bash
   curl -X POST http://localhost:3000/api/push/test \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "your_user_id",
       "title": "Test Title",
       "body": "Test Body"
     }'
   ```

3. **Send via frontend:**
   - Call `/api/push/send` with title, body, url
   - Include userId to send to specific user

---

## 📝 Notes

- The `disable: process.env.NODE_ENV === 'development'` in `next.config.ts` can be changed to enable PWA in dev mode for testing
- Push notifications only work on HTTPS in production
- Android Chrome supports PWA installation from any HTTPS site
- iOS has limited PWA support (no install banner)
- Notifications persist even if app is closed
- Service workers work offline or with poor connectivity
