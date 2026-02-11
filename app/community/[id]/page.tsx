"use client"
import PostDetail from "@/components/PostDetail";
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CommunityPostPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        setCurrentUserId(data?.user?.id ?? '')
      } catch (e) {
        setCurrentUserId('')
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">게시글 상세</h1>
      {/* `PostDetail` is a client component; pass the id and current user */}
      <PostDetail postId={id} currentUserId={currentUserId} />
    </main>
  );
}
