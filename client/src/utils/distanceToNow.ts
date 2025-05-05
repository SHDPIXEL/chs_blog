import { formatDistanceToNow } from "date-fns";

/**
 * Formats a datetime (assumed to be IST stored as UTC) to a relative string.
 * Accepts either a Date object or an ISO datetime string.
 */
export function getFormatDistanceToNow(dateTime: string | Date): string {
  try {
    if (!dateTime) {
      console.error("Invalid dateTime input:", dateTime);
      return "Invalid date";
    }

    const original =
      typeof dateTime === "string" ? new Date(dateTime) : dateTime;

    if (isNaN(original.getTime())) {
      console.error("Failed to parse datetime:", dateTime);
      return "Invalid date";
    }

    // The input datetime is in IST but treated as UTC — subtract 5.5 hours to get the correct moment in UTC
    const corrected = new Date(original.getTime() - 5.5 * 60 * 60 * 1000);

    return formatDistanceToNow(corrected, { addSuffix: true });
  } catch (error) {
    console.error("Unexpected error formatting datetime:", error);
    return "Invalid date";
  }
}
