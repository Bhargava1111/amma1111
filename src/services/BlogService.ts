interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  date: string;
  publishedDate?: string;
  readTime: string;
  category: string;
  categoryId: string;
  image: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  featured: boolean;
  commentsEnabled: boolean;
  views: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
}

interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  postCount: number;
}

interface BlogComment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  date: string;
  approved: boolean;
  parentId?: string;
}

import { env } from '@/config/env';

export class BlogService {
  // Table IDs - These are configured from environment variables
  private static readonly POSTS_TABLE_ID = env.TABLES.BLOG_POSTS;
  private static readonly CATEGORIES_TABLE_ID = env.TABLES.BLOG_CATEGORIES;
  private static readonly AUTHORS_TABLE_ID = env.TABLES.BLOG_AUTHORS;
  private static readonly COMMENTS_TABLE_ID = env.TABLES.BLOG_COMMENTS;

  // Blog Posts Management
  static async getPosts(filters?: {
    status?: string;
    category?: string;
    author?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: BlogPost[]; total: number }> {
    try {
      const apiFilters = [];
      
      if (filters?.status && filters.status !== 'all') {
        apiFilters.push({ name: 'status', op: 'Equal', value: filters.status });
      }
      
      if (filters?.category && filters.category !== 'all') {
        apiFilters.push({ name: 'categoryId', op: 'Equal', value: filters.category });
      }
      
      if (filters?.author && filters.author !== 'all') {
        apiFilters.push({ name: 'authorId', op: 'Equal', value: filters.author });
      }
      
      if (filters?.search) {
        apiFilters.push({ name: 'title', op: 'Contains', value: filters.search });
      }
      
      if (filters?.featured !== undefined) {
        apiFilters.push({ name: 'featured', op: 'Equal', value: filters.featured });
      }

      const { data, error } = await window.ezsite.apis.tablePage(this.POSTS_TABLE_ID, {
        PageNo: Math.floor((filters?.offset || 0) / (filters?.limit || 10)) + 1,
        PageSize: filters?.limit || 10,
        Filters: apiFilters,
        OrderBy: 'date DESC'
      });

      if (error) {
        throw new Error(error);
      }

      return {
        posts: data?.List || [],
        total: data?.TotalRecords || 0
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  }

  static async getPost(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(this.POSTS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: id }]
      });

      if (error) {
        throw new Error(error);
      }

      return data?.List?.[0] || null;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  }

  static async createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    try {
      const { data, error } = await window.ezsite.apis.tableInsert(this.POSTS_TABLE_ID, {
        ...post,
        date: new Date().toISOString(),
        views: 0
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  static async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const { data, error } = await window.ezsite.apis.tableUpdate(this.POSTS_TABLE_ID, {
        id,
        ...updates
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  static async deletePost(id: string): Promise<void> {
    try {
      const { error } = await window.ezsite.apis.tableDelete(this.POSTS_TABLE_ID, id);

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  static async publishPost(id: string): Promise<BlogPost> {
    try {
      const { data, error } = await window.ezsite.apis.tableUpdate(this.POSTS_TABLE_ID, {
        id,
        status: 'published',
        publishedDate: new Date().toISOString()
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error publishing blog post:', error);
      throw error;
    }
  }

  static async incrementViews(id: string): Promise<void> {
    try {
      // First get current views
      const post = await this.getPost(id);
      if (!post) return;

      // Increment views
      await this.updatePost(id, { views: post.views + 1 });
    } catch (error) {
      console.error('Error incrementing post views:', error);
      // Don't throw error for view counting
    }
  }

  // Blog Categories Management
  static async getCategories(): Promise<BlogCategory[]> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(this.CATEGORIES_TABLE_ID, {
        PageNo: 1,
        PageSize: 100,
        OrderBy: 'name ASC'
      });

      if (error) {
        throw new Error(error);
      }

      return data?.List || [];
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      throw error;
    }
  }

  static async createCategory(category: Omit<BlogCategory, 'id' | 'postCount'>): Promise<BlogCategory> {
    try {
      const { data, error } = await window.ezsite.apis.tableInsert(this.CATEGORIES_TABLE_ID, {
        ...category,
        postCount: 0
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error creating blog category:', error);
      throw error;
    }
  }

  static async updateCategory(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory> {
    try {
      const { data, error } = await window.ezsite.apis.tableUpdate(this.CATEGORIES_TABLE_ID, {
        id,
        ...updates
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error updating blog category:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await window.ezsite.apis.tableDelete(this.CATEGORIES_TABLE_ID, id);

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      console.error('Error deleting blog category:', error);
      throw error;
    }
  }

  // Blog Authors Management
  static async getAuthors(): Promise<BlogAuthor[]> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(this.AUTHORS_TABLE_ID, {
        PageNo: 1,
        PageSize: 100,
        OrderBy: 'name ASC'
      });

      if (error) {
        throw new Error(error);
      }

      return data?.List || [];
    } catch (error) {
      console.error('Error fetching blog authors:', error);
      throw error;
    }
  }

  static async createAuthor(author: Omit<BlogAuthor, 'id' | 'postCount'>): Promise<BlogAuthor> {
    try {
      const { data, error } = await window.ezsite.apis.tableInsert(this.AUTHORS_TABLE_ID, {
        ...author,
        postCount: 0
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error creating blog author:', error);
      throw error;
    }
  }

  static async updateAuthor(id: string, updates: Partial<BlogAuthor>): Promise<BlogAuthor> {
    try {
      const { data, error } = await window.ezsite.apis.tableUpdate(this.AUTHORS_TABLE_ID, {
        id,
        ...updates
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error updating blog author:', error);
      throw error;
    }
  }

  static async deleteAuthor(id: string): Promise<void> {
    try {
      const { error } = await window.ezsite.apis.tableDelete(this.AUTHORS_TABLE_ID, id);

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      console.error('Error deleting blog author:', error);
      throw error;
    }
  }

  // Blog Comments Management
  static async getComments(postId?: string, filters?: {
    approved?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ comments: BlogComment[]; total: number }> {
    try {
      const apiFilters = [];
      
      if (postId) {
        apiFilters.push({ name: 'postId', op: 'Equal', value: postId });
      }
      
      if (filters?.approved !== undefined) {
        apiFilters.push({ name: 'approved', op: 'Equal', value: filters.approved });
      }

      const { data, error } = await window.ezsite.apis.tablePage(this.COMMENTS_TABLE_ID, {
        PageNo: Math.floor((filters?.offset || 0) / (filters?.limit || 10)) + 1,
        PageSize: filters?.limit || 10,
        Filters: apiFilters,
        OrderBy: 'date DESC'
      });

      if (error) {
        throw new Error(error);
      }

      return {
        comments: data?.List || [],
        total: data?.TotalRecords || 0
      };
    } catch (error) {
      console.error('Error fetching blog comments:', error);
      throw error;
    }
  }

  static async createComment(comment: Omit<BlogComment, 'id' | 'date' | 'approved'>): Promise<BlogComment> {
    try {
      const { data, error } = await window.ezsite.apis.tableInsert(this.COMMENTS_TABLE_ID, {
        ...comment,
        date: new Date().toISOString(),
        approved: false // Comments require approval by default
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error creating blog comment:', error);
      throw error;
    }
  }

  static async approveComment(id: string): Promise<BlogComment> {
    try {
      const { data, error } = await window.ezsite.apis.tableUpdate(this.COMMENTS_TABLE_ID, {
        id,
        approved: true
      });

      if (error) {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error('Error approving blog comment:', error);
      throw error;
    }
  }

  static async deleteComment(id: string): Promise<void> {
    try {
      const { error } = await window.ezsite.apis.tableDelete(this.COMMENTS_TABLE_ID, id);

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      console.error('Error deleting blog comment:', error);
      throw error;
    }
  }

  // Utility Functions
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
  }

  static validatePost(post: Partial<BlogPost>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!post.title?.trim()) {
      errors.push('Title is required');
    }

    if (!post.content?.trim()) {
      errors.push('Content is required');
    }

    if (!post.excerpt?.trim()) {
      errors.push('Excerpt is required');
    }

    if (!post.authorId?.trim()) {
      errors.push('Author is required');
    }

    if (!post.categoryId?.trim()) {
      errors.push('Category is required');
    }

    if (!post.slug?.trim()) {
      errors.push('Slug is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Search and Analytics
  static async searchPosts(query: string, filters?: {
    category?: string;
    author?: string;
    status?: string;
    limit?: number;
  }): Promise<BlogPost[]> {
    try {
      const apiFilters = [
        { name: 'title', op: 'Contains', value: query }
      ];

      if (filters?.category && filters.category !== 'all') {
        apiFilters.push({ name: 'categoryId', op: 'Equal', value: filters.category });
      }

      if (filters?.author && filters.author !== 'all') {
        apiFilters.push({ name: 'authorId', op: 'Equal', value: filters.author });
      }

      if (filters?.status && filters.status !== 'all') {
        apiFilters.push({ name: 'status', op: 'Equal', value: filters.status });
      }

      const { data, error } = await window.ezsite.apis.tablePage(this.POSTS_TABLE_ID, {
        PageNo: 1,
        PageSize: filters?.limit || 10,
        Filters: apiFilters,
        OrderBy: 'date DESC'
      });

      if (error) {
        throw new Error(error);
      }

      return data?.List || [];
    } catch (error) {
      console.error('Error searching blog posts:', error);
      throw error;
    }
  }

  static async getPopularPosts(limit: number = 10): Promise<BlogPost[]> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(this.POSTS_TABLE_ID, {
        PageNo: 1,
        PageSize: limit,
        Filters: [{ name: 'status', op: 'Equal', value: 'published' }],
        OrderBy: 'views DESC'
      });

      if (error) {
        throw new Error(error);
      }

      return data?.List || [];
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      throw error;
    }
  }

  static async getRecentPosts(limit: number = 10): Promise<BlogPost[]> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(this.POSTS_TABLE_ID, {
        PageNo: 1,
        PageSize: limit,
        Filters: [{ name: 'status', op: 'Equal', value: 'published' }],
        OrderBy: 'publishedDate DESC'
      });

      if (error) {
        throw new Error(error);
      }

      return data?.List || [];
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      throw error;
    }
  }

  static async getFeaturedPosts(limit: number = 5): Promise<BlogPost[]> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(this.POSTS_TABLE_ID, {
        PageNo: 1,
        PageSize: limit,
        Filters: [
          { name: 'status', op: 'Equal', value: 'published' },
          { name: 'featured', op: 'Equal', value: true }
        ],
        OrderBy: 'publishedDate DESC'
      });

      if (error) {
        throw new Error(error);
      }

      return data?.List || [];
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      throw error;
    }
  }

  // Analytics
  static async getBlogStats(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalComments: number;
    totalCategories: number;
    totalAuthors: number;
  }> {
    try {
      const [
        postsResult,
        categoriesResult,
        authorsResult,
        commentsResult
      ] = await Promise.all([
        this.getPosts({ limit: 1000 }),
        this.getCategories(),
        this.getAuthors(),
        this.getComments(undefined, { limit: 1000 })
      ]);

      const posts = postsResult.posts;
      const publishedPosts = posts.filter(p => p.status === 'published');
      const draftPosts = posts.filter(p => p.status === 'draft');
      const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

      return {
        totalPosts: posts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalViews,
        totalComments: commentsResult.total,
        totalCategories: categoriesResult.length,
        totalAuthors: authorsResult.length
      };
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      throw error;
    }
  }
}

export default BlogService; 