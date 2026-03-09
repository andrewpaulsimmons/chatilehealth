import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Hello World greeting route
  app.get(api.greeting.get.path, async (req, res) => {
    res.json({
      message: "Hello World!",
      appName: "ChatileHealth"
    });
  });

  return httpServer;
}
