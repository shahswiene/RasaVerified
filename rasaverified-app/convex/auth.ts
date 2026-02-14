import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple hash for hackathon demo — NOT production-grade crypto
async function simpleHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "rasaverified_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { name, email, password }) => {
    console.log(`[auth] Register attempt for email=${email}`);

    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    const passwordHash = await simpleHash(password);
    const userId = await ctx.db.insert("users", {
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: Date.now(),
    });

    console.log(`[auth] User registered: id=${userId} email=${email}`);
    return { userId, name, email: email.toLowerCase() };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    console.log(`[auth] Login attempt for email=${email}`);

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordHash = await simpleHash(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Invalid email or password");
    }

    console.log(`[auth] Login success: id=${user._id} email=${email}`);
    return { userId: user._id, name: user.name, email: user.email };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    // Never return passwordHash to client
    return { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
  },
});
