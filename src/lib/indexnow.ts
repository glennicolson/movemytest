const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";
const INDEXNOW_HOST = "www.thedtc.co.uk";
const INDEXNOW_KEY = "39be1df7f9124be5b2c5b1b9a832faf0";
const INDEXNOW_KEY_LOCATION = `https://www.thedtc.co.uk/${INDEXNOW_KEY}.txt`;

interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/**
 * Submit one or more URLs to IndexNow for immediate indexing by Bing and other participating search engines.
 * Call this after publishing/updating content.
 */
export async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; message: string }> {
  if (!urls.length) {
    return { success: false, message: "No URLs provided" };
  }

// Ensure all URLs use the canonical domain
  const normalizedUrls = urls.map((url) => {
    if (url.startsWith("http")) return url;
    return `https://${INDEXNOW_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
  });

  const payload: IndexNowPayload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: normalizedUrls,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { success: true, message: `Submitted ${normalizedUrls.length} URL(s) to IndexNow` };
    }

    const errorText = await response.text();
    return {
      success: false,
      message: `IndexNow returned ${response.status}: ${errorText}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "IndexNow submission failed",
    };
  }
}
