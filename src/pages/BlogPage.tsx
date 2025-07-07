import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, User, Clock, Search, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

const mockBlogPosts: BlogPost[] = [
{
  id: '1',
  title: 'The Future of E-commerce: Trends to Watch in 2024',
  excerpt: 'Discover the latest trends shaping the e-commerce landscape and how they will impact online shopping experiences.',
  content: 'E-commerce continues to evolve at a rapid pace...',
  author: 'Sarah Johnson',
  date: '2024-01-15',
  readTime: '5 min read',
  category: 'Trends',
  image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
  tags: ['E-commerce', 'Technology', 'Future']
},
{
  id: '2',
  title: 'Best Practices for Secure Online Shopping',
  excerpt: 'Learn essential tips to protect your personal information and ensure safe online shopping experiences.',
  content: 'Online security is more important than ever...',
  author: 'Mike Chen',
  date: '2024-01-12',
  readTime: '7 min read',
  category: 'Security',
  image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
  tags: ['Security', 'Shopping', 'Tips']
},
{
  id: '3',
  title: 'How to Choose the Perfect Electronics for Your Needs',
  excerpt: 'A comprehensive guide to selecting electronics that match your requirements and budget.',
  content: 'Choosing the right electronics can be overwhelming...',
  author: 'Alex Rivera',
  date: '2024-01-10',
  readTime: '6 min read',
  category: 'Guides',
  image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
  tags: ['Electronics', 'Guide', 'Shopping']
},
{
  id: '4',
  title: 'Sustainable Shopping: Making Eco-Friendly Choices',
  excerpt: 'Explore ways to make more sustainable shopping decisions and reduce your environmental impact.',
  content: 'Sustainability is becoming increasingly important...',
  author: 'Emma Green',
  date: '2024-01-08',
  readTime: '4 min read',
  category: 'Sustainability',
  image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop',
  tags: ['Sustainability', 'Environment', 'Shopping']
},
{
  id: '5',
  title: 'Smart Home Technology: Transform Your Living Space',
  excerpt: 'Discover the latest smart home devices and how they can enhance your daily life.',
  content: 'Smart home technology is revolutionizing...',
  author: 'David Kim',
  date: '2024-01-05',
  readTime: '8 min read',
  category: 'Technology',
  image: 'https://images.unsplash.com/photo-1476357471311-43c0db9fb2b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxBJTIwcGhvdG9ncmFwaCUyMHNob3djYXNpbmclMjBhJTIwbW9kZXJuJTIwYW5kJTIwc3R5bGlzaCUyMGludGVyaW9yJTIwZGVzaWduJTJDJTIwZW1waGFzaXppbmclMjBjbGVhbiUyMGxpbmVzJTIwYW5kJTIwY29udGVtcG9yYXJ5JTIwYWVzdGhldGljcy58ZW58MHx8fHwxNzQ4Mzc0MTU2fDA&ixlib=rb-4.1.0&q=80&w=200$w=600',
  tags: ['Smart Home', 'Technology', 'Innovation']
},
{
  id: '6',
  title: 'Fashion Trends for the Modern Professional',
  excerpt: 'Stay ahead of the curve with these professional fashion trends that blend style and functionality.',
  content: 'Professional fashion is evolving...',
  author: 'Lisa Thompson',
  date: '2024-01-03',
  readTime: '5 min read',
  category: 'Fashion',
  image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
  tags: ['Fashion', 'Professional', 'Style']
}];


const categories = ['All', 'Trends', 'Security', 'Guides', 'Sustainability', 'Technology', 'Fashion'];

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filteredPosts = mockBlogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            onClick={() => setSelectedPost(null)}
            className="mb-6">

            ← Back to Blog
          </Button>
          
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-64 md:h-96 object-cover" />

            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">{selectedPost.category}</Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  {selectedPost.author}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(selectedPost.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedPost.readTime}
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {selectedPost.title}
              </h1>
              
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-6">
                  {selectedPost.excerpt}
                </p>
                <p className="text-gray-700">
                  {selectedPost.content} Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad 
                  minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea 
                  commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit 
                  esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag) =>
                  <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, tips, and insights in e-commerce and technology.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />

            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) =>
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}>

                {category}
              </Button>
            )}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) =>
          <Card key={post.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />

                <Badge
                className="absolute top-4 left-4 bg-white text-gray-900"
                variant="secondary">

                  {post.category}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime}
                  </div>
                  
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPost(post)}
                  className="group/button">

                    Read More
                    <ArrowRight className="w-4 h-4 ml-1 group-hover/button:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-4">
                  {post.tags.slice(0, 3).map((tag) =>
                <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {filteredPosts.length === 0 &&
        <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No posts found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        }
      </div>
    </div>);

};

export default BlogPage;
