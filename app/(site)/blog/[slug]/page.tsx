import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/data/public";

type Props = { params: Promise<{ slug: string }> };

// Must not be empty; a post added later still renders on request
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.length > 0
    ? posts.map((post) => ({ slug: post.slug }))
    : [{ slug: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? { title: post.title, description: post.summary } : {};
}

async function Article({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post?.body) notFound();

  return (
    <article className="narrow">
      <p className="eyebrow mb-2">
        {post.tag} · by {post.author} · {post.date}
      </p>
      <h1 className="display">{post.title}</h1>
      <div className="text-ink-2 mt-8 space-y-4 text-lg leading-relaxed">
        {post.body.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}

export default function PostPage({ params }: Props) {
  return (
    <div className="wrap pt-16 pb-28">
      <Link
        href="/blog"
        className="text-ink-2 hover:text-ink mb-8 block text-sm"
      >
        ← all posts
      </Link>
      <Suspense fallback={<p className="eyebrow">loading post…</p>}>
        <Article params={params} />
      </Suspense>
    </div>
  );
}
