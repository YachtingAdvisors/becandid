// ============================================================
// Blog Post Loader — auto-discovers all post files in this dir
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
