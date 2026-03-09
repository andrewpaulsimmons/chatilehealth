import { type Greeting, type InsertGreeting } from "@shared/schema";

export interface IStorage {
  // Add methods here when you need to store data
}

export class MemStorage implements IStorage {
  // Empty storage for Hello World
}

export const storage = new MemStorage();
