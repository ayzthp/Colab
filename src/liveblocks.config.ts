
import { createClient } from "@liveblocks/client";

// Create a client with your public API key
// Get your key from https://liveblocks.io/dashboard
export const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_REPLACE_WITH_YOUR_PUBLIC_KEY",
});

