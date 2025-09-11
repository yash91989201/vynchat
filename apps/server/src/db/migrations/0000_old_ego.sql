CREATE TYPE "public"."role" AS ENUM('admin', 'guest', 'user');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"bio" text,
	"role" text DEFAULT 'user',
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	"is_anonymous" boolean,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "blog" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"tldr" text,
	"body" text NOT NULL,
	"excerpt" text,
	"image_url" text,
	"author_id" text NOT NULL,
	"category_id" varchar(24) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_tag" (
	"blog_id" varchar(24) NOT NULL,
	"tag_id" varchar(24) NOT NULL,
	CONSTRAINT "blog_tag_blog_id_tag_id_pk" PRIMARY KEY("blog_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"blog_id" varchar(24) NOT NULL,
	"text" text NOT NULL,
	"approved" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"room_id" varchar(24) NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reaction" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"message_id" varchar(24) NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"isDM" boolean DEFAULT false NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_member" (
	"room_id" varchar(24) NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_member_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_followers" (
	"user_id" text NOT NULL,
	"follower_id" text NOT NULL,
	CONSTRAINT "user_followers_user_id_follower_id_pk" PRIMARY KEY("user_id","follower_id")
);
--> statement-breakpoint
CREATE TABLE "user_following" (
	"user_id" text NOT NULL,
	"following_id" text NOT NULL,
	CONSTRAINT "user_following_user_id_following_id_pk" PRIMARY KEY("user_id","following_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog" ADD CONSTRAINT "blog_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog" ADD CONSTRAINT "blog_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tag" ADD CONSTRAINT "blog_tag_blog_id_blog_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tag" ADD CONSTRAINT "blog_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_blog_id_blog_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction" ADD CONSTRAINT "reaction_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction" ADD CONSTRAINT "reaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_member" ADD CONSTRAINT "room_member_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_member" ADD CONSTRAINT "room_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_followers" ADD CONSTRAINT "user_followers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_followers" ADD CONSTRAINT "user_followers_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_following" ADD CONSTRAINT "user_following_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_following" ADD CONSTRAINT "user_following_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_slug_idx" ON "blog" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_author_idx" ON "blog" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "blog_title_body_idx" ON "blog" USING btree ("title","body","excerpt");--> statement-breakpoint
CREATE INDEX "blog_created_at_idx" ON "blog" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blog_tag_blog_idx" ON "blog_tag" USING btree ("blog_id");--> statement-breakpoint
CREATE INDEX "blog_tag_tag_idx" ON "blog_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "comment_blog_idx" ON "comment" USING btree ("blog_id");--> statement-breakpoint
CREATE INDEX "message_room_idx" ON "message" USING btree ("room_id","created_at");--> statement-breakpoint
CREATE INDEX "reaction_message_idx" ON "reaction" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "room_owner_idx" ON "room" USING btree ("owner_id");