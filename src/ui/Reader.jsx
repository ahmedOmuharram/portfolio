import { useEffect, useMemo, useRef } from 'react'
import { formatDate, getPost, renderPost } from '../lib/posts'
import { navigate } from '../lib/router'

export default function Reader({ slug, onClose }) {
  const post = getPost(slug)
  const html = useMemo(() => (post ? renderPost(post) : ''), [post])
  const ref = useRef()
  useEffect(() => {
    const prev = document.title
    document.title = post ? `${post.title} · Ahmed Muharram` : 'Not found · Ahmed Muharram'
    ref.current?.focus({ preventScroll: true })
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => {
      document.title = prev
      window.removeEventListener('keydown', esc)
    }
  }, [post, onClose])
  return (
    <div className="reader" role="dialog" aria-modal="true" aria-label={post?.title || 'Post'}>
      <div className="reader-backdrop" onClick={onClose} />
      <article className="reader-sheet" ref={ref} tabIndex={-1}>
        <button type="button" className="reader-back" onClick={onClose}>
          ← back to the room
        </button>
        {post ? (
          <>
            <header>
              <p className="eyebrow">
                {formatDate(post.date).toLowerCase()} · {post.minutes} min read{post.draft ? ' · draft' : ''}
              </p>
              <h1>{post.title}</h1>
              {post.summary && <p className="reader-summary">{post.summary}</p>}
              {post.tags.length > 0 && (
                <div className="tags">
                  {post.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </header>
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
            <footer className="reader-foot">
              <button type="button" className="text-btn" onClick={onClose}>
                ← more writing
              </button>
            </footer>
          </>
        ) : (
          <div className="empty">
            <h1>this post doesn&apos;t exist (yet)</h1>
            <p className="muted">it might have moved, or i haven&apos;t written it.</p>
            <button type="button" className="btn" onClick={() => navigate('/#writing')}>
              see all writing
            </button>
          </div>
        )}
      </article>
    </div>
  )
}
