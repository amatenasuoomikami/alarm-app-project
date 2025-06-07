// パターン管理API通信
// 仮のユーザーID・トークン
const USER_ID = "dummy-user-id";
const API_BASE = "http://localhost:8000"; // 開発用
const TOKEN = "dummy-jwt-token";

export async function fetchPatterns() {
  const res = await fetch(`${API_BASE}/users/${USER_ID}/patterns`, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error("Failed to fetch patterns");
  return res.json();
}

export async function createPattern(pattern: { name: string; color: string; times: { time: string; sound: string }[] }) {
  const res = await fetch(`${API_BASE}/users/${USER_ID}/patterns`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(pattern)
  });
  if (!res.ok) throw new Error("Failed to create pattern");
  return res.json();
} 