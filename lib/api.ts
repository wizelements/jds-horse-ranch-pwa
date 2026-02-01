export async function logContact(type: "call" | "email", source: string) {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, source }),
    });

    if (!response.ok) throw new Error("Failed to log contact");
    return await response.json();
  } catch (error) {
    console.error("Error logging contact:", error);
    throw error;
  }
}
