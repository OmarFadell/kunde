
# 🧾Kunde -- KYC Dashboard

A responsive, KYC Dashboard built with **Next.js**, **Ant Design**, and **Axios**. It allows admins and partners to manage customer data, view transactions, verify KYC statuses with secure role-based access control, and real time audit logs.


## 📦 Tech Stack

- **Frontend:** Next.js 14, React, Ant Design 5
- **Backend:** Node.js & Express.js + MongoDB
- **Redis & RabbitMQ** (Caching & Messaging)
- **Styling:** Ant Design Custom Theming + CSS
- **Auth:** JWT (via Cookies)
- **API Calls:** Axios (with `withCredentials`)
- **State Management:** React Hooks
- **Docker** for local development

## 🚀 Features

- Role-based login (Global Admin, Regional Admin, Partner)
- View all customers with detailed info
- Table row expansion with actions:
  - View Transactions
  - Create Transaction
  - Approve/Reject KYC
- Search and filter customers
- Drawer-based modal form for creating new accounts
- Dark themed UI with fully customized table and form components


## 🔐 Role-Based Access Control (RBAC)

| Role | Can Search | Can Approve KYC | Can View Logs | Can Create Transaction |
|------|------------|-----------------|----------------|------------------------|
| Global Admin | ✅ All Regions | ✅ | ✅ | ✅ |
| Regional Admin | ✅ Own Region | ✅ | ✅ Own Region | ✅ |
| Sending Partner | ✅ Own Customers | ❌ | ❌ | ✅ |
| Receiving Partner | ✅ Own Customers | ❌ | ❌ | ❌ |

---


## 🔐 Authentication Flow

- JWT is stored in cookies as `payload`.
- On page load:
  - If the cookie is missing or invalid → redirects to `/login`.
  - User roles are extracted and used to allow/deny access to dashboard features.
  - Receiving partners are redirected to `/accessDenied`.

## 🔄 API Endpoints Used

```

GET    /api/customer/**
GET    /api/transaction/**
GET   /api/auth/**



## 🎨 Custom Theme Example

The Ant Design theme is customized using `ConfigProvider` to create a modern dark UI:

```js
const customTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorText: '#e0e0e0',
    colorBgContainer: '#1e1e2f',
    colorPrimary: '#1677ff',
    colorBorderSecondary: '#3a3a4d',
  },
  components: {
    Table: {
      headerColor: '#b0b0b0',
      headerBg: '#111827',
    },
  },
};
```

## 🧪 Running Locally

### 1. Install dependencies:

```
npm install
```

### 2. Start development server:

```
npm run dev
```
### 3. RabbitMQ (with Management UI)
``` docker run -p 5672:5672 -p 15672:15672 rabbitmq:management
```


Make sure your backend is running on `http://localhost:5000`.
🧠 Architecture
Audit Logging Pipeline
arduino
Always show details

Copy
RabbitMQ → Redis Streams → MongoDB (via Cron flush every 12h)
Redis acts as a high-performance buffer.

Logs are flushed to MongoDB every 12 hours using:

js
Always show details

Copy
cron.schedule('0 */12 * * *', async () => {
    await flush();

    try {
        const cutoffTimestamp = Date.now() - (24 * 60 * 60 * 1000);
        const minId = `${cutoffTimestamp}-0`;
        await redisClient.xTrim('audit_logs', 'MINID', minId);
    } catch (error) {
        console.error('Error flushing Redis to MongoDB:', error);
    }
});
⚠️ This is not a scalable deletion method — messages may arrive during deletion.

✅ Best Practices
Rotate your JWT secret regularly.

Store logs in both Redis (short-term) and MongoDB (long-term).

Use Redis Streams instead of Lists for full-featured pub/sub + history.

Implement Redis-based rate limiting using logs if possible.

Sanitize user data in audit logs (no passwords, tokens).

Use RabbitMQ to push updates to a WebSocket server in real time.

🗂️ KYC Tiering & Document Requirements
Tier	Limits	Documents Required
Basic	Small txns	Just ID or email/phone
Standard	Medium txns	ID + address + selfie
Enhanced	High risk/volume	All above + income/source of funds

Submitted documents may be:

🔍 OCR-processed

🧠 Verified via 3rd-party APIs (e.g. Jumio, Veriff)

📛 Face-matched (selfie vs ID)

📍 Address-verified

🔎 Checked against sanctions/PEP/watchlists

🔐 KYC Flow Suggestion
Sending Partner collects and submits KYC docs.

Regional Admin verifies identity, posts verification token, approves.

No auth on search for simplicity (in reality, restrict search to:

own region

senders/receivers in past txns

global admins only)

🧰 Redis: List vs Stream
Feature	Redis List	Redis Stream
Ordered data	✅	✅
Auto ID	❌	✅
Consumer groups	❌	✅
Ack / Replay	❌	✅
Pub/Sub latency	🚫 Limited	✅ Optimized
Use case	Basic queue	Event log, real-time dashboards

🧭 RabbitMQ vs Redis for Real-Time Log Streaming
Factor	✅ RabbitMQ	✅ Redis Streams
Push-based	✅	❌
History	❌	✅
Security	Strong (auth, TLS)	Weak (unless protected)
Best for	Real-time consumer	UI polling/history

Recommended Architecture
arduino
Always show details

Copy
RabbitMQ → WebSocket Server → Frontend UI
          ↘ Redis/MongoDB (optional store)
Use RabbitMQ to emit → consume logs → broadcast via WebSocket.

💡 Enhancements (future work)
Enforce rate limiting based on logs.

Limit search visibility to region + related txns.

Encrypt logs at rest.

Add audit trail UI per user/session.

## ✨ Future Improvements

* Add unit tests for frontend logic
* Use `useSWR` or React Query for better data fetching
* Add pagination, filtering, and sorting
* Integrate audit logs and real-time updates
* Deploy on Vercel or Netlify
* Enforce rate limiting based on logs.
*Limit search visibility to region + related txns.
*Encrypt logs at rest.

---

## 👨‍💻 Author

**Omar Fadel**
Built as part of a secure FinTech dashboard challenge for a microfinance use case.



