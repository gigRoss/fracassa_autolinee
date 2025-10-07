# 🚌 Fracassa Autolinee - Sistema Gestione Orari

Sistema web ottimizzato per uso mobile per la consultazione degli orari e la gestione delle corse per Fracassa Autolinee.
Si consiglia l'apertura da smartphone

## 📋 Caratteristiche

- 🔍 Ricerca corse per partenza/destinazione e orario
- 📱 Interfaccia responsive per mobile e desktop
- 🔐 Dashboard amministratore per gestione corse e fermate
- 📊 Sistema di audit per tracciare modifiche
- 🗄️ Database SQLite (sviluppo) / Turso (produzione)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Turso (SQLite distribuito)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Deployment**: Vercel (raccomandato)

## 🚀 Quick Start

### Prerequisiti
- Node.js 20+ 
- npm

### Installazione

```bash
# Clona il repository
git clone [url-repository]
cd fracassa_autolinee

# Installa le dipendenze
npm install

# Setup database locale
npm run db:migrate
npm run db:seed

# Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📝 Script Disponibili

```bash
npm run dev          # Avvia il server di sviluppo
npm run build        # Build per produzione
npm run start        # Avvia il server di produzione
npm run db:migrate   # Esegue le migrations
npm run db:seed      # Popola il database con dati di test
npm run db:reset     # Reset completo del database locale
```

## 🗄️ Database

Il progetto supporta due modalità:
- **Locale**: SQLite (`local.db`) per sviluppo
- **Produzione**: Turso per deployment

Configurazione tramite variabile d'ambiente `DATABASE_MODE`:
- `local`: usa `file:./local.db`
- `production`: usa Turso con `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`

### Quick Deploy

```bash
# 1. Crea database Turso
turso db create fracassa-autolinee-prod
turso db show fracassa-autolinee-prod --url
turso db tokens create fracassa-autolinee-prod

# 2. Esegui migrations su produzione
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="..."
./scripts/migrate-production.sh

# 3. Deploy su Vercel
# Vai su vercel.com, importa il repo e configura le env variables
```

## 📁 Struttura Progetto

```
fracassa_autolinee/
├── app/
│   ├── components/         # Componenti React riutilizzabili
│   ├── lib/               # Logica business e utilità
│   │   ├── db.ts          # Configurazione database
│   │   ├── schema.ts      # Schema Drizzle
│   │   ├── auth.ts        # Autenticazione admin
│   │   └── ...
│   ├── admin/             # Dashboard amministratore
│   ├── ride/[id]/         # Dettaglio corsa
│   └── page.tsx           # Homepage
├── drizzle/
│   └── migrations/        # Migrations database
├── scripts/               # Script di utilità
└── public/                # Asset statici
```

## 🔐 Amministrazione

Accedi alla dashboard admin su `/admin/login`.

**Default credentials** (solo sviluppo):
- Username: `admin`
- Password: `password123`

⚠️ **IMPORTANTE**: Cambia le credenziali di default prima del deployment in produzione!

## 📚 Documentazione

- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) - Guida completa al deployment
- [`docs/`](./docs/) - Documentazione architetturale e requisiti
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Turso Docs](https://docs.turso.tech)

## 🤝 Contribuire

1. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
2. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
3. Push al branch (`git push origin feature/AmazingFeature`)
4. Apri una Pull Request

## 📄 License

Questo progetto è proprietario di Fracassa Autolinee.

## 📞 Supporto

Per assistenza, contatta il team di sviluppo.
