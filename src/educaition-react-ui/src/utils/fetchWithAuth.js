const fetchWithAuth = async (url, options = {}) => {
  // Retrieve the access token from local storage
  const accessToken = localStorage.getItem("access_token");

  // Set default method to GET if not specified
  const method = options.method || "GET";

  // Prepare headers to include Authorization and optionally set 'Content-Type' for POST requests
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": options.body
      ? "application/json"
      : options.headers?.["Content-Type"],
  };

  const body =
    options.body && method === "POST"
      ? JSON.stringify(options.body)
      : options.body;

  try {
    const response = await fetch(url, { ...options, method, headers, body });

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    return response;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export default fetchWithAuth;
