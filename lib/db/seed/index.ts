import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { seedAdmin } from "./admin";
import { seedCommunities } from "./communities";
import { seedListings } from "./listings";

export async function runAllSeeds() {
  console.log("=== Starting Database Seed ===");
  try {
    await seedAdmin();
    const communityMap = await seedCommunities();
    await seedListings(communityMap);
    console.log("=== Database Seed Complete Successfully ===");
    process.exit(0);
  } catch (error) {
    console.error("=== Database Seed Failed ===", error);
    process.exit(1);
  }
}

if (require.main === module || process.argv[1]?.includes("seed/index.ts")) {
  runAllSeeds();
}
