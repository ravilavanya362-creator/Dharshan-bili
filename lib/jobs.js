// In-memory job store, shared across API routes via the global object so
// it survives Next.js module re-evaluation within the same server process.
if (!global.__biliJobs) {
  global.__biliJobs = new Map();
}
export const jobs = global.__biliJobs;


