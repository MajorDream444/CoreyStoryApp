import { pgTable, text, serial, timestamp, boolean, jsonb, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  address: text("address").unique(),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpires: timestamp("verification_token_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reputationScore: real("reputation_score").default(0),
  isMentor: boolean("is_mentor").default(false),
});

export const mentorProfiles = pgTable("mentor_profiles", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  expertise: text("expertise").notNull(),
  experience: integer("experience_years"),
  bio: text("bio"),
  preferences: jsonb("preferences"),
  availabilityStatus: boolean("availability_status").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mentorships = pgTable("mentorships", {
  id: serial("id").primaryKey(),
  mentorId: serial("mentor_id").references(() => users.id),
  menteeId: serial("mentee_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  matchScore: real("match_score"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: serial("user_id").references(() => users.id),
  videoUrl: text("video_url"),
  ipfsHash: text("ipfs_hash"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: serial("user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many, one }) => ({
  stories: many(stories),
  journals: many(journals),
  mentorProfile: one(mentorProfiles, {
    fields: [users.id],
    references: [mentorProfiles.userId],
  }),
  mentorships: many(mentorships, {
    fields: [users.id],
    references: [mentorships.mentorId],
  }),
  menteeship: many(mentorships, {
    fields: [users.id],
    references: [mentorships.menteeId],
  }),
}));

export const insertStorySchema = createInsertSchema(stories);
export const selectStorySchema = createSelectSchema(stories);

export const insertJournalSchema = createInsertSchema(journals);
export const selectJournalSchema = createSelectSchema(journals);

export const insertMentorProfileSchema = createInsertSchema(mentorProfiles);
export const selectMentorProfileSchema = createSelectSchema(mentorProfiles);

export const insertMentorshipSchema = createInsertSchema(mentorships);
export const selectMentorshipSchema = createSelectSchema(mentorships);

export type Story = typeof stories.$inferSelect;
export type Journal = typeof journals.$inferSelect;
export type User = typeof users.$inferSelect;
export type MentorProfile = typeof mentorProfiles.$inferSelect;
export type Mentorship = typeof mentorships.$inferSelect;