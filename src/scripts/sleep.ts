/**
 * Pause the execution for the specified amount of time.
 * @param ms 
 * @returns `Promise<void>`
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}