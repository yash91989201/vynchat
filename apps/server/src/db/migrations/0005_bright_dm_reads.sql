ALTER TABLE "room_member" ADD COLUMN "last_read_at" timestamp with time zone DEFAULT now() NOT NULL;
