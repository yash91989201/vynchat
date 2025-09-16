CREATE TABLE "banned_user" (
	"room_id" varchar(24) NOT NULL,
	"user_id" text NOT NULL,
	"banned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"banned_by" text NOT NULL,
	CONSTRAINT "banned_user_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "banned_user" ADD CONSTRAINT "banned_user_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banned_user" ADD CONSTRAINT "banned_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banned_user" ADD CONSTRAINT "banned_user_banned_by_user_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banned_user_room_idx" ON "banned_user" USING btree ("room_id");