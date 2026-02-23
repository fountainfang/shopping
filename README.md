# Make Money - Shopping E-Commerce & Ticketing Platform

A modern e-commerce and ticketing web application built with Next.js. This platform enables users to purchase various types of products, including attraction tickets, theater tickets, virtual goods, and general merchandise using cryptocurrency (USDT/USDC).

## 🌟 Features

- **Crypto Payments**: Integrated with Binance Smart Chain (BEP20) for USDT/USDC deposits. Each user is assigned a unique generated deposit wallet, and balances pull seamlessly from the blockchain.
- **Multilingual Support (i18n)**: Fully supports English, Russian, and Chinese interfaces, along with multilingual product and attraction descriptions.
- **Diverse Product Types**:
  - `ATTRACTION`: Integrated with location mapping (Google Maps/Yandex Maps) and configurable time slots.
  - `THEATER`: Integrated syncing for major theaters like Mariinsky and Bolshoi (events, dates, halls).
  - `CONCIERGE`: Provides a "Purchasing Service" with dynamic pricing calculating Rubles to USDT/USD based on real-time API integrations.
  - `VIRTUAL`: Digital downloadable or hidden content revealed post-purchase.
- **Comprehensive Admin Panel**: Allows administrators to manage products, attractions, approve/return orders, view user balances, and trigger theater data synchronization.
- **User Dashboard**: Real-time wallet balance refreshing, order history tracking, and personal profile management.
- **Email Notifications**: Automated registration, messaging, and order status emails delivered using Nodemailer to users. 

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) (shadcn/ui-inspired components), Framer Motion
- **Database & ORM**: PostgreSQL (via [Supabase](https://supabase.com/)), [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials & Wallet-based)
- **Web3**: [ethers.js](https://docs.ethers.org/v6/) v6 (HD Wallet generation, Blockchain queries, Transactions)
- **Data Fetching**: [SWR](https://swr.vercel.app/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm
- Access to a PostgreSQL database (e.g., Supabase)

### Installation

1. **Clone the repository** (if you haven't already and cd into the project):
   ```bash
   cd shopping
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or yarn / pnpm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and configure the necessary variables. An example configuration:
   ```env
   # Database (Supabase or other Postgres provider)
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   DIRECT_URL="postgresql://user:password@host:5432/dbname"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_random_secret_string"

   # Wallet Generation (CRITICAL: Do not expose this)
   MASTER_MNEMONIC="word word word word word word word word word word word word"
   WALLET_SECRET="your_wallet_encryption_secret"

   # Blockchain (BSC node)
   BSC_RPC_URL="https://bsc-dataseed.binance.org/"

   # SMTP Configuration (Emails)
   SMTP_HOST="smtp-relay.example.com"
   SMTP_PORT=587
   SMTP_USER="your-email@example.com"
   SMTP_PASSWORD="your-smtp-password"
   SMTP_FROM_EMAIL="noreply@example.com"
   ```

4. **Initialize Database Models**:
   Run Prisma migrations to set up the database schema.
   ```bash
   npx prisma generate
   npx prisma db push
   # or npx prisma migrate dev
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   # or yarn dev / pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Directory Structure

- `/app`: Next.js App Router (Pages, Layouts, API routes).
  - `/app/admin`: Admin dashboard for products, categories, attractions, and orders.
  - `/app/api`: Server-side API endpoints (Authentication, Checkout, Syncing, Web3 calls).
  - `/app/dashboard`: Client user dashboard for wallet state and orders.
- `/lib`: Helper functions and shared logic.
  - `/lib/i18n`: Internationalization dictionaries and context.
  - `/lib/tickets`: Custom scraping/API ingestion logic for theater tickets (e.g., Mariinsky).
- `/prisma`: Prisma schema defining the database `User`, `Wallet`, `Product`, `Attraction`, `Order`, and `Transaction` models.

## 📝 License

This project is licensed under the MIT License.

