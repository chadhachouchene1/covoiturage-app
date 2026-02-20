export const baseUrl = "http://localhost:5000/api";

export const postRequest = async (url, body) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: true, message: data.message || "Something went wrong" };
    }

    return data;

  } catch (err) {
    return { error: true, message: err.message };
  }
};
