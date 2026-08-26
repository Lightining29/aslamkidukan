import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User, ChevronRight } from 'lucide-react';
import { fetchBlog } from '../../api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './BlogDetail.css';

// A simple parser to render basic markdown (headers, bold, links, lists, paragraphs)
function parseMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  let insideList = false;
  const renderedElements = [];
  let listItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (insideList) {
        renderedElements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        insideList = false;
      }
      continue;
    }

    // Process lists
    if (line.startsWith('* ') || line.startsWith('- ') || /^\d+\.\s/.test(line)) {
      if (!insideList) {
        insideList = true;
      }
      const itemText = line.replace(/^(\*\s|-\s|\d+\.\s)/, '');
      listItems.push(<li key={`li-${i}`}>{parseInline(itemText)}</li>);
      continue;
    } else {
      if (insideList) {
        renderedElements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
        insideList = false;
      }
    }

    // Process headers
    if (line.startsWith('### ')) {
      renderedElements.push(<h3 key={i}>{parseInline(line.substring(4))}</h3>);
    } else if (line.startsWith('## ')) {
      renderedElements.push(<h2 key={i}>{parseInline(line.substring(3))}</h2>);
    } else if (line.startsWith('# ')) {
      renderedElements.push(<h1 key={i}>{parseInline(line.substring(2))}</h1>);
    } else {
      // Regular paragraph
      renderedElements.push(<p key={i}>{parseInline(line)}</p>);
    }
  }

  if (insideList && listItems.length > 0) {
    renderedElements.push(<ul key={`ul-end`}>{listItems}</ul>);
  }

  return renderedElements;
}

// Process bold text and links within a line
function parseInline(text) {
  // Bold match: **text**
  // Link match: [text](url)
  const parts = [];
  let index = 0;

  // We will parse iteratively
  while (index < text.length) {
    const boldStart = text.indexOf('**', index);
    const linkStart = text.indexOf('[', index);

    if (boldStart === -1 && linkStart === -1) {
      parts.push(text.substring(index));
      break;
    }

    // Process whichever comes first
    if (boldStart !== -1 && (linkStart === -1 || boldStart < linkStart)) {
      // Add text before bold
      if (boldStart > index) {
        parts.push(text.substring(index, boldStart));
      }
      const boldEnd = text.indexOf('**', boldStart + 2);
      if (boldEnd !== -1) {
        parts.push(
          <strong key={`strong-${boldStart}`}>
            {text.substring(boldStart + 2, boldEnd)}
          </strong>
        );
        index = boldEnd + 2;
      } else {
        parts.push('**');
        index = boldStart + 2;
      }
    } else {
      // Add text before link
      if (linkStart > index) {
        parts.push(text.substring(index, linkStart));
      }
      const linkTextEnd = text.indexOf(']', linkStart);
      const urlStart = text.indexOf('(', linkTextEnd);
      const urlEnd = text.indexOf(')', urlStart);

      if (linkTextEnd !== -1 && urlStart !== -1 && urlEnd !== -1 && urlStart === linkTextEnd + 1) {
        const linkText = text.substring(linkStart + 1, linkTextEnd);
        const url = text.substring(urlStart + 1, urlEnd);

        // Check if internal link
        if (url.startsWith('/')) {
          parts.push(
            <Link key={`link-${linkStart}`} to={url} className="blog-internal-link">
              {linkText}
            </Link>
          );
        } else {
          parts.push(
            <a key={`link-${linkStart}`} href={url} target="_blank" rel="noopener noreferrer">
              {linkText}
            </a>
          );
        }
        index = urlEnd + 1;
      } else {
        parts.push('[');
        index = linkStart + 1;
      }
    }
  }

  return parts;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchBlog(slug)
      .then((data) => {
        if (mounted) {
          setBlog(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="blog-detail-loading">
          <div className="loading-spinner" />
        </div>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="blog-detail-not-found container text-center">
          <h2>Article Not Found</h2>
          <p>The wellness guide you are looking for does not exist.</p>
          <Link to="/blogs" className="btn btn-sky">← Back to Blog</Link>
        </div>
        <Footer />
      </>
    );
  }

  // Schema generation
  const articleUrl = `https://aaancart.com/blog/${blog.slug}`;
  const publishDate = new Date(blog.publishedAt).toISOString();
  const modifiedDate = new Date(blog.updatedAt || blog.publishedAt).toISOString();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': blog.title,
    'description': blog.metaDescription,
    'image': [
      blog.image ? `https://aaancart.com${blog.image}` : 'https://aaancart.com/favicon.svg'
    ],
    'datePublished': publishDate,
    'dateModified': modifiedDate,
    'author': {
      '@type': 'Organization',
      'name': 'AAAN Cart',
      'url': 'https://aaancart.com/'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'AAAN Cart',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://aaancart.com/favicon.svg'
      }
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://aaancart.com/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://aaancart.com/blogs'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': blog.title,
        'item': articleUrl
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{blog.title} | AAAN Cart</title>
        <meta name="description" content={blog.metaDescription} />
        <link rel="canonical" href={articleUrl} />
        {/* Open Graph */}
        <meta property="og:title" content={`${blog.title} | AAAN Cart`} />
        <meta property="og:description" content={blog.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:image" content={blog.image ? `https://aaancart.com${blog.image}` : 'https://aaancart.com/favicon.svg'} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${blog.title} | AAAN Cart`} />
        <meta name="twitter:description" content={blog.metaDescription} />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <Navbar />

      <div className="blog-detail-page">
        <div className="container">
          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb" aria-label="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/blogs">Blog</Link>
            <ChevronRight size={14} />
            <span className="current">{blog.title}</span>
          </nav>

          <Link to="/blogs" className="back-to-blogs">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <article className="blog-post">
            <header className="blog-post-header">
              <h1 className="blog-post-title">{blog.title}</h1>
              <div className="blog-post-meta">
                <span className="blog-meta-item">
                  <Calendar size={16} />
                  {new Date(blog.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="blog-meta-item">
                  <User size={16} />
                  By {blog.author}
                </span>
              </div>
            </header>

            {blog.image && (
              <div className="blog-post-image">
                <img src={blog.image} alt={blog.title} />
              </div>
            )}

            <div className="blog-post-body">
              {parseMarkdown(blog.content)}
            </div>

            <footer className="blog-post-footer">
              <div className="blog-tags">
                {blog.tags && blog.tags.map((tag) => (
                  <span key={tag} className="blog-tag">#{tag}</span>
                ))}
              </div>
            </footer>
          </article>
        </div>
      </div>

      <Footer />
    </>
  );
}
