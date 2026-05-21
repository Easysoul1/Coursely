-- Add clerk_id column to User table
ALTER TABLE "User" ADD COLUMN "clerk_id" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_clerk_id_key" UNIQUE ("clerk_id");
