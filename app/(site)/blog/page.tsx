import Link from "next/link";
import { getPosts } from "@/lib/data/public";

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">field notes & recaps</p>
          <h1 className="display">
            blog & dispatches<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          event recaps, technical postmortems, founder notes, and dispatches
          from the team behind e-cell kccemsr.
        </p>
      </div>

      <ul className="card-list mt-8">
        {posts.map((post, i) => (
          <li key={post.slug} className="card-row">
            <div className="row-inner">
              <span className="index-num">0{i + 1}</span>
              <h3>
                {post.body ? (
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                ) : (
                  post.title
                )}
              </h3>
              <span className="arrow" aria-hidden="true">
                →
              </span>
              <p>{post.summary}</p>
              <div className="meta">
                <span className="tag t-hackathon">
                  <span className="dot" />
                  {post.tag}
                </span>
                <span>by {post.author}</span>
                <span>{post.date}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
