"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FacebookPostData {
  id: string;
  fbPostId: string;
  message: string | null;
  permalink: string;
  imageUrl: string | null;
  createdTime: string;
  likesCount: number;
  commentsCount: number;
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncateMessage(message: string | null, maxLength: number = 140): string {
  if (!message) return "";
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength).trim() + "…";
}

export function FacebookFeed() {
  const [posts, setPosts] = useState<FacebookPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/facebook/posts");
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <FacebookIcon size={20} />
            <span className="text-sm">Loading latest posts…</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-slate-500">Unable to load Facebook posts right now.</p>
          <Link
            href="https://www.facebook.com/TheDTC"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-strong)] transition"
          >
            <FacebookIcon size={16} />
            Visit our Facebook page
          </Link>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-slate-500">No recent posts to display.</p>
          <Link
            href="https://www.facebook.com/TheDTC"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-strong)] transition"
          >
            <FacebookIcon size={16} />
            Follow us on Facebook
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Latest from Facebook</h2>
            <p className="mt-1 text-sm text-slate-500">
              Stay up to date with news, tips and offers from MoveMyTest
            </p>
          </div>
          <Link
            href="https://www.facebook.com/TheDTC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#166fe5]"
          >
            <FacebookIcon size={16} />
            Follow on Facebook
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition hover:shadow-md hover:border-[var(--brand)]/30"
            >
              {/* Image */}
              {post.imageUrl && (
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={post.imageUrl}
                    alt="Facebook post image"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                {post.message && (
                  <p className="flex-1 text-sm leading-relaxed text-[var(--foreground)]">
                    {truncateMessage(post.message)}
                  </p>
                )}

                {/* Meta */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>{formatDate(post.createdTime)}</span>
                  <div className="flex items-center gap-3">
                    {post.likesCount > 0 && (
                      <span className="flex items-center gap-1">
                        <HeartIcon />
                        {post.likesCount}
                      </span>
                    )}
                    {post.commentsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageIcon />
                        {post.commentsCount}
                      </span>
                    )}
                    <ExternalLinkIcon />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
