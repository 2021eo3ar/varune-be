CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"chat" jsonb NOT NULL,
	"user_id" integer NOT NULL,
	"public_id" varchar(8) NOT NULL,
	"parent_message_id" varchar(36),
	"message_role" varchar(16),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chats_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"profile_image" varchar(500),
	"public_id" varchar(8) NOT NULL,
	"credits" integer DEFAULT 10 NOT NULL,
	"last_credit_reset" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;