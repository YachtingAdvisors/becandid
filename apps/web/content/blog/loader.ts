// ============================================================
// Blog Post Loader — auto-discovers all post files in this dir
// + pulls published SEO content from database
// ============================================================

import type { BlogPost } from './posts';
import fs from 'fs';
import path from 'path';

/**
 * Load all blog posts from .ts files in the content/blog/posts/ directory
 * plus the legacy posts.ts array. Returns sorted newest-first.
 */
export function getAllBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  // 1. Load from individual post files in posts/ directory
  const postsDir = path.join(process.cwd(), 'content', 'blog', 'posts');
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8');
        const post: BlogPost = JSON.parse(raw);
        if (post.slug && post.title && post.content) {
          posts.push(post);
        }
      } catch {
        // skip invalid files
      }
    }
  }

  // 2. Also include the legacy hardcoded posts
  try {
    const { BLOG_POSTS } = require('./posts');
    for (const post of BLOG_POSTS) {
      // Avoid duplicates by slug
      if (!posts.some(p => p.slug === post.slug)) {
        posts.push(post);
      }
    }
  } catch {
    // legacy file missing
  }

  // Sort newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Load published SEO content from database (called at build time or in API routes).
 * Returns BlogPost[] format for compatibility with the blog pages.
 */
export async function getSeoPublishedPosts(): Promise<BlogPost[]> {
  try {
    const { createServiceClient } = await import('@/lib/supabase');
    const db = createServiceClient();
    const { data } = await db
      .from('seo_content')
      .select('slug, title, content, generated_at, metadata')
      .eq('status', 'published')
      .order('generated_at', { ascending: false });

    if (!data) return [];

    return data.map(row => ({
      slug: row.slug,
      title: row.title,
      description: row.metadata?.description ?? '',
      date: row.generated_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      author: 'Be Candid Team',
      readTime: row.metadata?.readTime ?? '5 min read',
      tags: row.metadata?.tags ?? [],
      content: row.content,
    }));
  } catch {
    return [];
  }
}
