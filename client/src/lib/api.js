const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function parseJson(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append("pdf", file);

  const response = await fetch(`${API_BASE_URL}/api/ingest`, {
    method: "POST",
    body: formData,
  });

  return parseJson(response);
}

export async function askQuestion(question) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  return parseJson(response);
}

export async function listDocuments() {
  const response = await fetch(`${API_BASE_URL}/api/documents`);
  return parseJson(response);
}

export async function getDocument(documentId) {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`);
  return parseJson(response);
}
