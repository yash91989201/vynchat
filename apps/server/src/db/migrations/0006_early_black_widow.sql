CREATE TABLE "bot_analytics" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"bot_id" text NOT NULL,
	"conversation_id" varchar(24) NOT NULL,
	"messages_exchanged" integer NOT NULL,
	"conversation_duration" integer NOT NULL,
	"human_skipped" boolean NOT NULL,
	"bot_skipped" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_bot" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bot_profile" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_active" timestamp;--> statement-breakpoint
ALTER TABLE "bot_analytics" ADD CONSTRAINT "bot_analytics_bot_id_user_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_analytics" ADD CONSTRAINT "bot_analytics_conversation_id_room_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bot_analytics_bot_idx" ON "bot_analytics" USING btree ("bot_id");--> statement-breakpoint
CREATE INDEX "bot_analytics_created_at_idx" ON "bot_analytics" USING btree ("created_at");