import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

// Enhanced logging function
function dbLog(message: string, type: "info" | "success" | "error" | "warning" = "info") {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  
  const icons = {
    info: "ℹ️",
    success: "✅",
    error: "❌", 
    warning: "⚠️"
  };
  
  console.log(`[${timestamp}] ${icons[type]} ${message}`);
}

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://umblyjvtzjsokvjyhzyb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmx5anZ0empzb2t2anloenliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjI1MTUsImV4cCI6MjA3MDg5ODUxNX0.hhYNko-4PF14iXMJpkReSWsLfW6JghN_Yf_4k0whu8w';

// Create Supabase client for auth and realtime features
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database connection for Drizzle ORM
let connectionString: string;

if (process.env.NODE_ENV === 'production') {
  // Use transaction pooler for serverless functions (Vercel)
  connectionString = process.env.DATABASE_URL || 
    'postgresql://postgres.umblyjvtzjsokvjyhzyb:Yf7OOTKTbTzMnTQF@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
  dbLog("Using Supabase Transaction Pooler for production", "info");
} else {
  // Use direct connection for development
  connectionString = process.env.DATABASE_URL || 
    'postgresql://postgres:Yf7OOTKTbTzMnTQF@db.umblyjvtzjsokvjyhzyb.supabase.co:5432/postgres';
  dbLog("Using Supabase Direct Connection for development", "info");
}

if (!connectionString.includes('mock')) {
  // Mask the password in the URL for logging
  const maskedUrl = connectionString.replace(/:[^:@]*@/, ':****@');
  dbLog(`Connecting to: ${maskedUrl}`, "info");
}

// Create postgres client with optimized settings for Supabase
const client = postgres(connectionString, {
  prepare: false, // Required for transaction pooler
  max: process.env.NODE_ENV === 'production' ? 1 : 10, // Lower connection count for serverless
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// For backwards compatibility
export const pool = {
  query: (text: string, params?: any[]) => client.unsafe(text, params)
};

dbLog("Supabase database client initialized successfully", "success");
