import { POSTS, formatDate } from '../../lib/posts'
import { navigate } from '../../lib/router'

export default function Writing() {
  return (
    <div className="content writing-content">
      <h2>writing</h2>
      {POSTS.length === 0 ? (
        <div className="empty">
          <p>nothing here yet. i&apos;ll start posting soon.</p>
        </div>
      ) : (
        <ul className="posts">
          {POSTS.map((p) => (
            <li key={p.slug}>
              <a
                href={`/writing/${p.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey) return
                  e.preventDefault()
                  navigate(`/writing/${p.slug}`)
                }}
              >
                <span className="post-meta mono">
                  {formatDate(p.date).toLowerCase()} · {p.minutes} min{p.draft ? ' · draft' : ''}
                </span>
                <span className="post-title">{p.title}</span>
                {p.summary && <span className="post-summary">{p.summary}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
