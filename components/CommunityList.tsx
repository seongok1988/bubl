"use client";
import { useEffect, useState } from "react";
import { fetchCommunities } from "../lib/api/community";

interface Community {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function CommunityList() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunities()
      .then((data) => setCommunities(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div>
      <h2>커뮤니티 목록</h2>
      <ul>
        {communities.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong>
            <div>{c.description}</div>
            <small>{new Date(c.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
