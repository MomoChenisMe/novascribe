import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getRelatedPosts } from '@/lib/services/public-post.service'
import { renderMarkdown, extractToc } from '@/lib/markdown'
import ArticleHeader from '@/components/public/article/ArticleHeader'
import ArticleContent from '@/components/public/article/ArticleContent'
import ArticleToc from '@/components/public/article/ArticleToc'
import RelatedPosts from '@/components/public/article/RelatedPosts'
import ShareButtons from '@/components/public/article/ShareButtons'
import Breadcrumb from '@/components/public/common/Breadcrumb'
import CommentSection from '@/components/public/comment/CommentSection'

export const revalidate = 60 // 每 60 秒重新驗證

interface PostPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post || post.status !== 'PUBLISHED') {
    return {
      title: '文章未找到',
      description: '您要找的文章不存在或尚未發佈。'
    }
  }

  const seo = post.seoMetadata

  return {
    title: seo?.metaTitle || post.title,
    description: seo?.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || post.title,
      description: seo?.ogDescription || seo?.metaDescription || post.excerpt || undefined,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : post.featuredImage ? [{ url: post.featuredImage }] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: seo?.twitterCard || 'summary_large_image',
      title: seo?.ogTitle || seo?.metaTitle || post.title,
      description: seo?.ogDescription || seo?.metaDescription || post.excerpt || undefined,
      images: seo?.ogImage ? [seo.ogImage] : post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
    robots: {
      index: !seo?.noIndex,
      follow: !seo?.noFollow,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug)

  // 文章不存在或未發佈，返回 404
  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }

  // 渲染 Markdown
  const html = await renderMarkdown(post.content)
  const toc = extractToc(post.content)

  // 載入相關文章
  const relatedPosts = await getRelatedPosts(post.id, 3)

  // 麵包屑
  const breadcrumbItems = [
    { label: '首頁', href: '/' },
    ...(post.category ? [{ label: post.category.name, href: `/categories/${post.category.slug}` }] : []),
    { label: post.title, href: `/posts/${post.slug}` }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Main Content */}
        <article className="lg:col-span-3">
          {/* Article Header */}
          <ArticleHeader post={post} />

          {/* Article Content */}
          <div className="mt-8">
            <ArticleContent html={html} />
          </div>

          {/* Share Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <ShareButtons
              url={`https://novascribe.dev/posts/${post.slug}`}
              title={post.title}
            />
          </div>

          {/* Comment Section */}
          <div className="mt-12">
            <CommentSection postId={post.id} />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <RelatedPosts posts={relatedPosts} />
            </div>
          )}
        </article>

        {/* Sidebar: Table of Contents */}
        {toc.length > 0 && (
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <ArticleToc toc={toc} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
