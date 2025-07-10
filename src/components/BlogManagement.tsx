import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  Clock,
  Tag,
  FileText,
  Image as ImageIcon,
  Settings,
  Globe,
  Bookmark
} from 'lucide-react';
import { format } from 'date-fns';

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

const BlogManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(false);
  
  // Blog Posts State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Categories State
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Authors State
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<BlogAuthor | null>(null);
  const [isAuthorDialogOpen, setIsAuthorDialogOpen] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock categories
    const mockCategories: BlogCategory[] = [
      { id: '1', name: 'Trends', slug: 'trends', description: 'Latest trends in technology and business', color: '#3B82F6', postCount: 1 },
      { id: '2', name: 'Security', slug: 'security', description: 'Security tips and best practices', color: '#EF4444', postCount: 1 },
      { id: '3', name: 'Guides', slug: 'guides', description: 'How-to guides and tutorials', color: '#10B981', postCount: 1 },
      { id: '4', name: 'Technology', slug: 'technology', description: 'Technology news and insights', color: '#8B5CF6', postCount: 1 },
      { id: '5', name: 'Sustainability', slug: 'sustainability', description: 'Sustainable practices and eco-friendly choices', color: '#059669', postCount: 1 },
      { id: '6', name: 'Fashion', slug: 'fashion', description: 'Fashion trends and style guides', color: '#DC2626', postCount: 1 },
    ];

    // Mock authors
    const mockAuthors: BlogAuthor[] = [
      { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', bio: 'Tech writer and analyst', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', postCount: 1 },
      { id: '2', name: 'Mike Chen', email: 'mike@example.com', bio: 'Security expert', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', postCount: 1 },
      { id: '3', name: 'Alex Rivera', email: 'alex@example.com', bio: 'Product specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', postCount: 1 },
      { id: '4', name: 'Emma Green', email: 'emma@example.com', bio: 'Sustainability advocate and writer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', postCount: 1 },
      { id: '5', name: 'David Kim', email: 'david@example.com', bio: 'Smart home technology specialist', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', postCount: 1 },
      { id: '6', name: 'Lisa Thompson', email: 'lisa@example.com', bio: 'Fashion and style expert', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', postCount: 1 },
    ];

    // Mock posts - All 6 posts from BlogPage
    const mockPosts: BlogPost[] = [
      {
        id: '1',
        title: 'The Future of E-commerce: Trends to Watch in 2024',
        slug: 'future-ecommerce-trends-2024',
        excerpt: 'Discover the latest trends shaping the e-commerce landscape and how they will impact online shopping experiences.',
        content: 'E-commerce continues to evolve at a rapid pace, driven by technological advancements and changing consumer behaviors. In this comprehensive guide, we explore the key trends that will define the e-commerce landscape in 2024 and beyond.',
        author: 'Sarah Johnson',
        authorId: '1',
        date: '2024-01-15',
        publishedDate: '2024-01-15',
        readTime: '5 min read',
        category: 'Trends',
        categoryId: '1',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format',
        tags: ['E-commerce', 'Technology', 'Future'],
        status: 'published',
        seo: {
          metaTitle: 'E-commerce Trends 2024: Future of Online Shopping',
          metaDescription: 'Explore the top e-commerce trends for 2024 that will reshape online shopping experiences and drive business growth.',
          keywords: ['ecommerce', 'trends', '2024', 'online shopping', 'digital commerce']
        },
        featured: true,
        commentsEnabled: true,
        views: 1250
      },
      {
        id: '2',
        title: 'Best Practices for Secure Online Shopping',
        slug: 'secure-online-shopping-practices',
        excerpt: 'Learn essential tips to protect your personal information and ensure safe online shopping experiences.',
        content: 'Online security is more important than ever. This guide covers essential security practices for safe online shopping.',
        author: 'Mike Chen',
        authorId: '2',
        date: '2024-01-12',
        publishedDate: '2024-01-12',
        readTime: '7 min read',
        category: 'Security',
        categoryId: '2',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&auto=format',
        tags: ['Security', 'Shopping', 'Tips'],
        status: 'published',
        seo: {
          metaTitle: 'Online Shopping Security: Best Practices Guide',
          metaDescription: 'Essential security tips for safe online shopping. Protect your personal information and shop with confidence.',
          keywords: ['online security', 'shopping safety', 'privacy', 'cybersecurity']
        },
        featured: false,
        commentsEnabled: true,
        views: 890
      },
      {
        id: '3',
        title: 'How to Choose the Perfect Electronics for Your Needs',
        slug: 'choose-perfect-electronics',
        excerpt: 'A comprehensive guide to selecting electronics that match your requirements and budget.',
        content: 'Choosing the right electronics can be overwhelming with so many options available. This comprehensive guide will help you make informed decisions when selecting electronics for your personal or professional needs.',
        author: 'Alex Rivera',
        authorId: '3',
        date: '2024-01-10',
        publishedDate: '2024-01-10',
        readTime: '6 min read',
        category: 'Guides',
        categoryId: '3',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop&auto=format',
        tags: ['Electronics', 'Guide', 'Shopping'],
        status: 'published',
        seo: {
          metaTitle: 'How to Choose Electronics: Complete Buying Guide',
          metaDescription: 'Learn how to select the perfect electronics for your needs with our comprehensive buying guide.',
          keywords: ['electronics', 'buying guide', 'technology', 'gadgets']
        },
        featured: false,
        commentsEnabled: true,
        views: 675
      },
      {
        id: '4',
        title: 'Sustainable Shopping: Making Eco-Friendly Choices',
        slug: 'sustainable-shopping-eco-friendly',
        excerpt: 'Explore ways to make more sustainable shopping decisions and reduce your environmental impact.',
        content: 'Sustainability is becoming increasingly important in our daily lives. This guide explores practical ways to make more eco-friendly shopping decisions.',
        author: 'Emma Green',
        authorId: '4',
        date: '2024-01-08',
        publishedDate: '2024-01-08',
        readTime: '4 min read',
        category: 'Sustainability',
        categoryId: '5',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop&auto=format',
        tags: ['Sustainability', 'Environment', 'Shopping'],
        status: 'published',
        seo: {
          metaTitle: 'Sustainable Shopping: Eco-Friendly Consumer Guide',
          metaDescription: 'Discover how to make sustainable shopping choices that benefit both you and the environment.',
          keywords: ['sustainable shopping', 'eco-friendly', 'environment', 'green living']
        },
        featured: false,
        commentsEnabled: true,
        views: 542
      },
      {
        id: '5',
        title: 'Smart Home Technology: Transform Your Living Space',
        slug: 'smart-home-technology-transform',
        excerpt: 'Discover the latest smart home devices and how they can enhance your daily life.',
        content: 'Smart home technology is revolutionizing the way we live, offering convenience, security, and energy efficiency like never before.',
        author: 'David Kim',
        authorId: '5',
        date: '2024-01-05',
        publishedDate: '2024-01-05',
        readTime: '8 min read',
        category: 'Technology',
        categoryId: '4',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format',
        tags: ['Smart Home', 'Technology', 'Innovation'],
        status: 'published',
        seo: {
          metaTitle: 'Smart Home Technology: Complete Guide 2024',
          metaDescription: 'Transform your living space with the latest smart home technology and devices.',
          keywords: ['smart home', 'home automation', 'technology', 'IoT']
        },
        featured: true,
        commentsEnabled: true,
        views: 1120
      },
      {
        id: '6',
        title: 'Fashion Trends for the Modern Professional',
        slug: 'fashion-trends-modern-professional',
        excerpt: 'Stay ahead of the curve with these professional fashion trends that blend style and functionality.',
        content: 'Professional fashion is evolving rapidly, with new trends that combine style, comfort, and functionality for the modern workplace.',
        author: 'Lisa Thompson',
        authorId: '6',
        date: '2024-01-03',
        publishedDate: '2024-01-03',
        readTime: '5 min read',
        category: 'Fashion',
        categoryId: '6',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&auto=format',
        tags: ['Fashion', 'Professional', 'Style'],
        status: 'published',
        seo: {
          metaTitle: 'Professional Fashion Trends 2024: Style Guide',
          metaDescription: 'Discover the latest professional fashion trends that combine style and functionality.',
          keywords: ['professional fashion', 'workplace style', 'business attire', 'fashion trends']
        },
        featured: false,
        commentsEnabled: true,
        views: 789
      }
    ];

    setCategories(mockCategories);
    setAuthors(mockAuthors);
    setPosts(mockPosts);
  };

  // Post Management Functions
  const handleSavePost = () => {
    if (!selectedPost) return;

    if (selectedPost.id) {
      // Update existing post
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? selectedPost : p));
      toast({ title: 'Success', description: 'Post updated successfully' });
    } else {
      // Create new post
      const newPost = { ...selectedPost, id: Date.now().toString() };
      setPosts(prev => [...prev, newPost]);
      toast({ title: 'Success', description: 'Post created successfully' });
    }

    setIsPostDialogOpen(false);
    setSelectedPost(null);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast({ title: 'Success', description: 'Post deleted successfully' });
  };

  const handlePublishPost = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, status: 'published' as const, publishedDate: new Date().toISOString() }
        : p
    ));
    toast({ title: 'Success', description: 'Post published successfully' });
  };

  // Category Management Functions
  const handleSaveCategory = () => {
    if (!selectedCategory) return;

    if (selectedCategory.id) {
      setCategories(prev => prev.map(c => c.id === selectedCategory.id ? selectedCategory : c));
      toast({ title: 'Success', description: 'Category updated successfully' });
    } else {
      const newCategory = { ...selectedCategory, id: Date.now().toString(), postCount: 0 };
      setCategories(prev => [...prev, newCategory]);
      toast({ title: 'Success', description: 'Category created successfully' });
    }

    setIsCategoryDialogOpen(false);
    setSelectedCategory(null);
  };

  // Author Management Functions
  const handleSaveAuthor = () => {
    if (!selectedAuthor) return;

    if (selectedAuthor.id) {
      setAuthors(prev => prev.map(a => a.id === selectedAuthor.id ? selectedAuthor : a));
      toast({ title: 'Success', description: 'Author updated successfully' });
    } else {
      const newAuthor = { ...selectedAuthor, id: Date.now().toString(), postCount: 0 };
      setAuthors(prev => [...prev, newAuthor]);
      toast({ title: 'Success', description: 'Author created successfully' });
    }

    setIsAuthorDialogOpen(false);
    setSelectedAuthor(null);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || post.categoryId === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-gray-600">Manage your blog posts, categories, and authors</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="authors">Authors ({authors.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Posts Management */}
        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Blog Posts</CardTitle>
                  <CardDescription>Manage your blog posts and content</CardDescription>
                </div>
                <Button onClick={() => {
                  setSelectedPost({
                    id: '',
                    title: '',
                    slug: '',
                    excerpt: '',
                    content: '',
                    author: authors[0]?.name || '',
                    authorId: authors[0]?.id || '',
                    date: new Date().toISOString(),
                    readTime: '5 min read',
                    category: categories[0]?.name || '',
                    categoryId: categories[0]?.id || '',
                    image: '',
                    tags: [],
                    status: 'draft',
                    seo: {
                      metaTitle: '',
                      metaDescription: '',
                      keywords: []
                    },
                    featured: false,
                    commentsEnabled: true,
                    views: 0
                  });
                  setIsPostDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Posts Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</div>
                            {post.featured && <Badge variant="secondary">Featured</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                              {post.author.charAt(0)}
                            </div>
                            <span className="text-sm">{post.author}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge style={{ backgroundColor: categories.find(c => c.id === post.categoryId)?.color }}>
                            {post.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            post.status === 'published' ? 'default' :
                            post.status === 'draft' ? 'secondary' :
                            post.status === 'scheduled' ? 'outline' : 'destructive'
                          }>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.views.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(post.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPost(post);
                                setIsPostDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {post.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublishPost(post.id)}
                              >
                                <Globe className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Management */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Organize your blog posts with categories</CardDescription>
                </div>
                <Button onClick={() => {
                  setSelectedCategory({
                    id: '',
                    name: '',
                    slug: '',
                    description: '',
                    color: '#3B82F6',
                    postCount: 0
                  });
                  setIsCategoryDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <h3 className="font-medium">{category.name}</h3>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsCategoryDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <Badge variant="outline">{category.postCount} posts</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authors Management */}
        <TabsContent value="authors" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Authors</CardTitle>
                  <CardDescription>Manage blog authors and contributors</CardDescription>
                </div>
                <Button onClick={() => {
                  setSelectedAuthor({
                    id: '',
                    name: '',
                    email: '',
                    bio: '',
                    avatar: '',
                    postCount: 0
                  });
                  setIsAuthorDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Author
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {authors.map((author) => (
                  <Card key={author.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={author.avatar} 
                          alt={author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium">{author.name}</h3>
                          <p className="text-sm text-gray-600">{author.email}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{author.bio}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{author.postCount} posts</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAuthor(author);
                            setIsAuthorDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
              <CardDescription>Configure global blog settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Blog Title</Label>
                    <Input defaultValue="MANAfoods Blog" />
                  </div>
                  <div>
                    <Label>Blog Description</Label>
                    <Textarea defaultValue="Stay updated with the latest trends, tips, and insights in e-commerce and technology." />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>Enable comments by default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>Require approval for comments</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Posts per page</Label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div>
                    <Label>Default author</Label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map(author => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>Enable RSS feed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>Show reading time</Label>
                  </div>
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Post Editor Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost?.id ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-6">
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={selectedPost.title}
                        onChange={(e) => setSelectedPost({
                          ...selectedPost,
                          title: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        })}
                        placeholder="Enter post title..."
                      />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input
                        value={selectedPost.slug}
                        onChange={(e) => setSelectedPost({
                          ...selectedPost,
                          slug: e.target.value
                        })}
                        placeholder="post-url-slug"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Excerpt</Label>
                    <Textarea
                      value={selectedPost.excerpt}
                      onChange={(e) => setSelectedPost({
                        ...selectedPost,
                        excerpt: e.target.value
                      })}
                      placeholder="Brief description of the post..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={selectedPost.content}
                      onChange={(e) => setSelectedPost({
                        ...selectedPost,
                        content: e.target.value
                      })}
                      placeholder="Write your post content..."
                      rows={10}
                    />
                  </div>

                  <div>
                    <Label>Featured Image URL</Label>
                    <Input
                      value={selectedPost.image}
                      onChange={(e) => setSelectedPost({
                        ...selectedPost,
                        image: e.target.value
                      })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Author</Label>
                      <Select
                        value={selectedPost.authorId}
                        onValueChange={(value) => {
                          const author = authors.find(a => a.id === value);
                          setSelectedPost({
                            ...selectedPost,
                            authorId: value,
                            author: author?.name || ''
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map(author => (
                            <SelectItem key={author.id} value={author.id}>
                              {author.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={selectedPost.categoryId}
                        onValueChange={(value) => {
                          const category = categories.find(c => c.id === value);
                          setSelectedPost({
                            ...selectedPost,
                            categoryId: value,
                            category: category?.name || ''
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={selectedPost.status}
                        onValueChange={(value: 'draft' | 'published' | 'scheduled' | 'archived') => 
                          setSelectedPost({ ...selectedPost, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Reading Time</Label>
                      <Input
                        value={selectedPost.readTime}
                        onChange={(e) => setSelectedPost({
                          ...selectedPost,
                          readTime: e.target.value
                        })}
                        placeholder="5 min read"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={selectedPost.tags.join(', ')}
                      onChange={(e) => setSelectedPost({
                        ...selectedPost,
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      placeholder="technology, trends, ecommerce"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedPost.featured}
                        onCheckedChange={(checked) => setSelectedPost({
                          ...selectedPost,
                          featured: checked
                        })}
                      />
                      <Label>Featured Post</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedPost.commentsEnabled}
                        onCheckedChange={(checked) => setSelectedPost({
                          ...selectedPost,
                          commentsEnabled: checked
                        })}
                      />
                      <Label>Enable Comments</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label>Meta Title</Label>
                    <Input
                      value={selectedPost.seo.metaTitle}
                      onChange={(e) => setSelectedPost({
                        ...selectedPost,
                        seo: { ...selectedPost.seo, metaTitle: e.target.value }
                      })}
                      placeholder="SEO optimized title..."
                    />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={selectedPost.seo.metaDescription}
                      onChange={(e) => setSelectedPost({
                        ...selectedPost,
                        seo: { ...selectedPost.seo, metaDescription: e.target.value }
                      })}
                      placeholder="SEO description for search engines..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Keywords (comma-separated)</Label>
                    <Input
                      value={selectedPost.seo.keywords.join(', ')}
                      onChange={(e) => setSelectedPost({
                        ...selectedPost,
                        seo: {
                          ...selectedPost.seo,
                          keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                        }
                      })}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePost}>
              <Save className="w-4 h-4 mr-2" />
              Save Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory?.id ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                  })}
                  placeholder="Category name..."
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={selectedCategory.slug}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    slug: e.target.value
                  })}
                  placeholder="category-slug"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    description: e.target.value
                  })}
                  placeholder="Category description..."
                />
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedCategory.color}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    color: e.target.value
                  })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              Save Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Author Dialog */}
      <Dialog open={isAuthorDialogOpen} onOpenChange={setIsAuthorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAuthor?.id ? 'Edit Author' : 'Create New Author'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAuthor && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={selectedAuthor.name}
                  onChange={(e) => setSelectedAuthor({
                    ...selectedAuthor,
                    name: e.target.value
                  })}
                  placeholder="Author name..."
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={selectedAuthor.email}
                  onChange={(e) => setSelectedAuthor({
                    ...selectedAuthor,
                    email: e.target.value
                  })}
                  placeholder="author@example.com"
                />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea
                  value={selectedAuthor.bio}
                  onChange={(e) => setSelectedAuthor({
                    ...selectedAuthor,
                    bio: e.target.value
                  })}
                  placeholder="Author biography..."
                />
              </div>
              <div>
                <Label>Avatar URL</Label>
                <Input
                  value={selectedAuthor.avatar}
                  onChange={(e) => setSelectedAuthor({
                    ...selectedAuthor,
                    avatar: e.target.value
                  })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuthorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAuthor}>
              Save Author
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement; 