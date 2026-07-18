

// ⚠️ REPLACE THIS URL WITH YOUR ACTUAL DEPLOYED GOOGLE APPS SCRIPT WEB APP URL:
const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-V3i55QP7PzGGEZYpqmOvWNJUkXx87FzSsWPdda6FDbUeC0YuaHKS-10bECykTixI/exec";

/**
 * Sends transaction details/events directly to the configured Google Sheet
 * @param {string} eventType Name of the event (e.g., "Unlocked Love Page", "Send Love")
 * @param {string} message Text entered by the user (optional)
 */
function sendToSheet(eventType, message = '') {
  if (!SHEET_SCRIPT_URL || SHEET_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
    console.warn("Google Sheet Script URL is not configured. Event skipped:", eventType, message);
    return;
  }

  try {
    const url = new URL(SHEET_SCRIPT_URL);
    url.searchParams.append("eventType", eventType);
    url.searchParams.append("message", message);
    url.searchParams.append("timestamp", new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    // Using keepalive: true ensures the request succeeds even if the page navigates away
    // Using mode: 'no-cors' prevents browser pre-flight errors, letting the request drop-in silently
    fetch(url.toString(), {
      method: "GET",
      mode: "no-cors",
      keepalive: true
    })
      .then(() => {
        console.log(`Successfully logged event: "${eventType}"`);
      })
      .catch(err => {
        console.error("Failed to fetch Google Sheet URL:", err);
      });
  } catch (e) {
    console.error("Error formatting logger URL:", e);
  }
}


