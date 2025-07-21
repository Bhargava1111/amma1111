import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SEOHead from '../components/SEO/SEOHead';
import StructuredData from '../components/SEO/StructuredData';
import { generateBlogSEOTitle, generateBreadcrumbs } from '../utils/seoUtils';
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

const categories = ['All', 'Trends', 'Security', 'Guides', 'Sustainability', 'Technology', 'Fashion'];

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filteredPosts: BlogPost[] = [];

  if (selectedPost) {
    const breadcrumbs = generateBreadcrumbs('/blog', selectedPost.title);
    
    return (
      <>
        <SEOHead
          title={generateBlogSEOTitle(selectedPost.title)}
          description={selectedPost.excerpt}
          keywords={`${selectedPost.tags.join(', ')}, food blog, MANAfoods, ${selectedPost.category.toLowerCase()}`}
          type="article"
          image={selectedPost.image}
          author={selectedPost.author}
          publishedTime={selectedPost.date}
        />
        
        <StructuredData
          article={{
            headline: selectedPost.title,
            description: selectedPost.excerpt,
            image: selectedPost.image,
            author: selectedPost.author,
            publisher: "MANAfoods",
            datePublished: selectedPost.date,
            url: window.location.href
          }}
          breadcrumb={{ items: breadcrumbs }}
        />
        
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="outline"
              onClick={() => setSelectedPost(null)}
              className="mb-6"
            >
              ← Back to Blog
            </Button>
            
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              
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
                    {selectedPost.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </>
    );
  }

  const breadcrumbs = generateBreadcrumbs('/blog');
  
  return (
    <>
      <SEOHead
        title="Food Blog - Tips, Recipes & Insights | MANAfoods"
        description="Discover food tips, recipes, and insights on the MANAfoods blog. Learn about traditional pickles, cooking techniques, and healthy eating habits from our food experts."
        keywords="food blog, recipes, cooking tips, traditional pickles, healthy eating, food insights, MANAfoods blog, gourmet food, cooking techniques"
        type="website"
      />
      
      <StructuredData
        breadcrumb={{ items: breadcrumbs }}
      />
      
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
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    className="absolute top-4 left-4 bg-white text-gray-900"
                    variant="secondary"
                  >
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
                      className="group/button"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/button:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-4">
                    {post.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No posts found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;