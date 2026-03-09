import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const greetings = pgTable("greetings", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
});

export const insertGreetingSchema = createInsertSchema(greetings).omit({ id: true });

export type InsertGreeting = z.infer<typeof insertGreetingSchema>;
export type Greeting = typeof greetings.$inferSelect;
