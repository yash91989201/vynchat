import { cuid2 } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";

export const blog = pgTable(
  "blog",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    tldr: text("tldr"),
    body: text("body").notNull(),
    excerpt: text("excerpt"),
    imageUrl: text("image_url"),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id),
    categoryId: cuid2("category_id")
      .references(() => category.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("blog_slug_idx").on(table.slug),
    index("blog_author_idx").on(table.authorId),
    index("blog_title_body_idx").on(table.title, table.body, table.excerpt),
    index("blog_created_at_idx").on(table.createdAt),
  ]
);

export const tag = pgTable("tag", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 128 }).unique().notNull(),
});

export const category = pgTable("category", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 128 }).unique().notNull(),
});

export const blogTag = pgTable(
  "blog_tag",
  {
    blogId: cuid2("blog_id")
      .notNull()
      .references(() => blog.id, { onDelete: "cascade" }),
    tagId: cuid2("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.blogId, table.tagId] }),
    index("blog_tag_blog_idx").on(table.blogId),
    index("blog_tag_tag_idx").on(table.tagId),
  ]
);

export const comment = pgTable(
  "comment",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    blogId: cuid2("blog_id")
      .notNull()
      .references(() => blog.id),
    text: text("text").notNull(),
    approved: boolean("approved").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("comment_blog_idx").on(table.blogId)]
);

export const room = pgTable(
  "room",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    isDM: boolean("isDM").notNull().default(false),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("room_owner_idx").on(table.ownerId)]
);

export const roomMember = pgTable(
  "room_member",
  {
    roomId: cuid2("room_id")
      .notNull()
      .references(() => room.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },

  (table) => [primaryKey({ columns: [table.roomId, table.userId] })]
);

export const message = pgTable(
  "message",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    roomId: cuid2("room_id")
      .notNull()
      .references(() => room.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("message_room_idx").on(table.roomId, table.createdAt)]
);

export const reaction = pgTable(
  "reaction",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    messageId: cuid2("message_id")
      .notNull()
      .references(() => message.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    emoji: text("emoji").notNull(),
  },
  (table) => [index("reaction_message_idx").on(table.messageId)]
);

export const userFollowers = pgTable(
  "user_followers",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.followerId] })]
);

export const userFollowing = pgTable(
  "user_following",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.followingId] })]
);

export const skippedPair = pgTable(
  "skipped_pair",
  {
    userAId: text("user_a_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    userBId: text("user_b_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userAId, table.userBId] }),
    index("skipped_pair_created_at_idx").on(table.createdAt),
  ]
);

export const blogRelations = relations(blog, ({ one, many }) => ({
  author: one(user, {
    fields: [blog.authorId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [blog.categoryId],
    references: [category.id],
  }),
  blogTags: many(blogTag),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  blogTags: many(blogTag),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  blogs: many(blog),
}));

export const blogTagRelations = relations(blogTag, ({ one }) => ({
  blog: one(blog, {
    fields: [blogTag.blogId],
    references: [blog.id],
  }),
  tag: one(tag, {
    fields: [blogTag.tagId],
    references: [tag.id],
  }),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  author: one(user, { fields: [comment.userId], references: [user.id] }),
  blog: one(blog, { fields: [comment.blogId], references: [blog.id] }),
}));

export const messageRelations = relations(message, ({ one, many }) => ({
  room: one(room, { fields: [message.roomId], references: [room.id] }),
  sender: one(user, { fields: [message.senderId], references: [user.id] }),
  reactions: many(reaction),
}));

export const roomRelations = relations(room, ({ one, many }) => ({
  owner: one(user, { fields: [room.ownerId], references: [user.id] }),
  messages: many(message),
  members: many(roomMember),
}));

export const roomMembersRelations = relations(roomMember, ({ one }) => ({
  room: one(room, { fields: [roomMember.roomId], references: [room.id] }),
  user: one(user, { fields: [roomMember.userId], references: [user.id] }),
}));

export const userFollowersRelations = relations(userFollowers, ({ one }) => ({
  user: one(user, { fields: [userFollowers.userId], references: [user.id] }),
  follower: one(user, {
    fields: [userFollowers.followerId],
    references: [user.id],
  }),
}));

export const userFollowingRelations = relations(userFollowing, ({ one }) => ({
  user: one(user, { fields: [userFollowing.userId], references: [user.id] }),
  following: one(user, {
    fields: [userFollowing.followingId],
    references: [user.id],
  }),
}));

export const reactionRelations = relations(reaction, ({ one }) => ({
  message: one(message, {
    fields: [reaction.messageId],
    references: [message.id],
  }),
  user: one(user, { fields: [reaction.userId], references: [user.id] }),
}));
