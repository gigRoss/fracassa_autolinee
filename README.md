# 🚌 Fracassa Autolinee - Schedule Management System

Mobile-optimized web system for schedule consultation and ride management for Fracassa Autolinee.
Best viewed on smartphone

## 📋 Features

- 🔍 Search rides by departure/destination and time
- 📱 Responsive interface for mobile and desktop
- 💾 Installable as Progressive Web App (PWA)
- 🔐 Administrator dashboard for ride and stop management
- 📊 Audit system to track changes
- 🗄️ SQLite database (development) / Turso (production)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Turso (distributed SQLite)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm

### Installation

```bash
# Clone the repository
git clone [url-repository]
cd fracassa_autolinee

# Install dependencies
npm install

# Setup local database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Installazione PWA

L'applicazione può essere installata come Progressive Web App per un accesso rapido e un'esperienza simile a un'app native.

### 🍎 Su Mac

#### Safari (metodo consigliato)
1. Apri il sito in Safari
2. Clicca su **"Condividi"** nella barra degli strumenti (o premi `⌘ + Shift + I`)
3. Scorri e seleziona **"Aggiungi al Dock"**
4. Conferma il nome dell'app e clicca **"Aggiungi"**

L'app apparirà nel tuo Dock e potrà essere aperta come una normale applicazione Mac.

#### Chrome/Edge
1. Apri il sito in Chrome o Edge
2. Clicca sul menu **⋮** (tre puntini in alto a destra)
3. Seleziona **"Installa Fracassa Autolinee..."**
4. Conferma cliccando **"Installa"**

### 📱 Su iPhone/iPad

1. Apri il sito in Safari
2. Tocca il pulsante **Condividi** ⎙ (in basso al centro)
3. Scorri verso il basso e seleziona **"Aggiungi a Home"**
4. Modifica il nome se necessario e tocca **"Aggiungi"**

L'icona apparirà sulla tua home screen.

### 🤖 Su Android

1. Apri il sito in Chrome
2. Tocca il menu **⋮** (tre puntini in alto a destra)
3. Seleziona **"Installa app"** o **"Aggiungi a schermata Home"**
4. Conferma l'installazione

In alternativa, l'app mostrerà automaticamente un banner di installazione dopo qualche secondo.

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run migrations
npm run db:seed      # Populate database with test data
npm run db:reset     # Complete reset of local database
```

## 🗄️ Database

The project supports two modes:
- **Local**: SQLite (`local.db`) for development
- **Production**: Turso for deployment

Configuration via `DATABASE_MODE` environment variable:
- `local`: uses `file:./local.db`
- `production`: uses Turso with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`

### Quick Deploy

```bash
# 1. Create Turso database
turso db create fracassa-autolinee-prod
turso db show fracassa-autolinee-prod --url
turso db tokens create fracassa-autolinee-prod

# 2. Run migrations on production
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="..."
./scripts/migrate-production.sh


## 📁 Project Structure

```
fracassa_autolinee/
├── app/
│   ├── components/         # Reusable React components
│   ├── lib/               # Business logic and utilities
│   │   ├── db.ts          # Database configuration
│   │   ├── schema.ts      # Drizzle schema
│   │   ├── auth.ts        # Admin authentication
│   │   └── ...
│   ├── admin/             # Administrator dashboard
│   ├── ride/[id]/         # Ride detail
│   └── page.tsx           # Homepage
├── drizzle/
│   └── migrations/        # Database migrations
├── scripts/               # Utility scripts
└── public/                # Static assets
```




## 📚 Documentation

- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [`docs/`](./docs/) - Architectural documentation and requirements
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Turso Docs](https://docs.turso.tech)

## 🤝 Contributing

1. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License

This project is proprietary to Fracassa Autolinee.

## 📞 Support

For assistance, contact the development team.
