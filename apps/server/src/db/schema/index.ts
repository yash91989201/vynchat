import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const post = pgTable(
  "post",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull(),
    cover: text("cover"),
    category: text("category").notNull().default("Uncategorized"),
    authorId: integer("author_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("post_slug_idx").on(table.slug),
    index("post_author_idx").on(table.authorId),
    index("post_title_body_idx").on(table.title, table.body, table.excerpt),
    index("post_created_at_idx").on(table.createdAt),
  ]
);

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, { fields: [post.authorId], references: [user.id] }),
  comments: many(comment),
  likes: many(like),
}));

export const comment = pgTable(
  "comment",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    postId: integer("post_id")
      .notNull()
      .references(() => post.id),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("comment_post_idx").on(table.postId)]
);

export const commentRelations = relations(comment, ({ one }) => ({
  author: one(user, { fields: [comment.userId], references: [user.id] }),
  post: one(post, { fields: [comment.postId], references: [post.id] }),
}));

export const message = pgTable(
  "message",
  {
    id: serial("id").primaryKey(),
    roomId: integer("room_id")
      .notNull()
      .references(() => room.id),
    senderId: integer("sender_id")
      .notNull()
      .references(() => user.id),
    type: text("type").notNull().default("text"),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("message_room_idx").on(table.roomId, table.createdAt)]
);

export const messageRelations = relations(message, ({ one }) => ({
  room: one(room, { fields: [message.roomId], references: [room.id] }),
  sender: one(user, { fields: [message.senderId], references: [user.id] }),
}));

export const room = pgTable(
  "room",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    isPrivate: boolean("is_private").notNull().default(false),
    isDM: boolean("is_dm").notNull().default(false),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("room_owner_idx").on(table.ownerId)]
);

export const roomRelations = relations(room, ({ one, many }) => ({
  owner: one(user, { fields: [room.ownerId], references: [user.id] }),
  messages: many(message),
  members: many(roomMembers),
  moderators: many(roomModerators),
  banneduser: many(roomBanned),
}));

export const roomMembers = pgTable(
  "room_members",
  {
    roomId: integer("room_id")
      .notNull()
      .references(() => room.id),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [primaryKey({ columns: [table.roomId, table.userId] })]
);
export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(room, { fields: [roomMembers.roomId], references: [room.id] }),
  user: one(user, { fields: [roomMembers.userId], references: [user.id] }),
}));

// Similar for moderators
export const roomModerators = pgTable(
  "room_moderators",
  {
    roomId: integer("room_id")
      .notNull()
      .references(() => room.id),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [primaryKey({ columns: [table.roomId, table.userId] })]
);

export const roomModeratorsRelations = relations(roomModerators, ({ one }) => ({
  room: one(room, { fields: [roomModerators.roomId], references: [room.id] }),
  user: one(user, { fields: [roomModerators.userId], references: [user.id] }),
}));

// Banned user
export const roomBanned = pgTable(
  "room_banned",
  {
    roomId: integer("room_id")
      .notNull()
      .references(() => room.id),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [primaryKey({ columns: [table.roomId, table.userId] })]
);

export const roomBannedRelations = relations(roomBanned, ({ one }) => ({
  room: one(room, { fields: [roomBanned.roomId], references: [room.id] }),
  user: one(user, { fields: [roomBanned.userId], references: [user.id] }),
}));

export const like = pgTable(
  "like",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    postId: integer("post_id")
      .notNull()
      .references(() => post.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("like_user_idx").on(table.userId)]
);

export const likeRelations = relations(like, ({ one }) => ({
  user: one(user, { fields: [like.userId], references: [user.id] }),
  post: one(post, { fields: [like.postId], references: [post.id] }),
}));

export const userFollowers = pgTable(
  "user_followers",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    followerId: integer("follower_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.followerId] })]
);
export const userFollowersRelations = relations(userFollowers, ({ one }) => ({
  user: one(user, { fields: [userFollowers.userId], references: [user.id] }),
  follower: one(user, {
    fields: [userFollowers.followerId],
    references: [user.id],
  }),
}));

// And reverse listing following
export const userFollowing = pgTable(
  "user_following",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    followingId: integer("following_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.followingId] })]
);

export const userFollowingRelations = relations(userFollowing, ({ one }) => ({
  user: one(user, { fields: [userFollowing.userId], references: [user.id] }),
  following: one(user, {
    fields: [userFollowing.followingId],
    references: [user.id],
  }),
}));
