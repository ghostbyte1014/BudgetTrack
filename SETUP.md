# BudgetFlow Setup Requirements

This guide outlines the necessary requirements and steps to get the BudgetFlow local environment running and integrated with Supabase.

## System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or equivalent yarn/pnpm)

## Installation Guide

### 1. Clone & Install Dependencies
Navigate to the root directory and install the necessary React, Vite, and Supabase dependencies:
```bash
npm install
```

### 2. Environment Setup
Rename `.env.example` to `.env` or create a new `.env` file in the root directory. You need to provide your Supabase API credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
*Note: You can find these keys in your Supabase Dashboard under Settings > API.*

### 3. Database Schema setup
To initialize the backend, you must apply the database schema to your Supabase instance.
1. Open the Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the entire contents of `supabase_schema.sql` (found in the root directory) and execute it. 
* This script provisions the `profiles`, `transactions`, `fixed_costs`, and `monthly_records` tables. It also enables Row Level Security (RLS) policies and establishes the Authentication Trigger used during user registration.

### 4. Running the Development Server
Once the environment variables are set and the schema is deployed, start the local Vite development server:
```bash
npm run dev
```

## Building for Production
To create a production-ready build (which also validates TypeScript mappings and Supabase integration types):
```bash
npm run build
```
The compiled output will be generated in the `/dist` folder.
