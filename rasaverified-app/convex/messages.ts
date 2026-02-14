import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async ({ db }) => {
  const messages = await db
    .query("messages")
    .withIndex("by_createdAt")
    .order("desc")
    .take(25);

  console.log(`[convex] messages.list returned ${messages.length} rows`);
  return messages;
});

export const send = mutation({
  args: { text: v.string() },
  handler: async ({ db }, { text }) => {
    const payload = {
      text,
      createdAt: Date.now(),
    };

    const id = await db.insert("messages", payload);
    console.log(`[convex] messages.send inserted id=${id}`);
    return id;
  },
});
