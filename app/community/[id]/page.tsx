"use client"
import PostDetail from "@/components/PostDetail";

export default function CommunityPostPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">게시글 상세</h1>
      {/* `PostDetail` is a client component; pass the id. */}
      <PostDetail postId={id} currentUserId={""} />
    </main>
  );
}
