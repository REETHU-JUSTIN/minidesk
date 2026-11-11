import { formatDateTime } from '../../utils/formatDate'

export function CommentList({ comments }) {
  if (comments.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-slate-500">No comments yet.</p>
  }

  return (
    <ul className="divide-y divide-slate-200">
      {comments.map((comment) => (
        <li key={comment.id} className="px-5 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <p className="text-sm font-medium">{comment.authorName}</p>
            <p className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</p>
          </div>
          {/* whitespace-pre-line keeps the line breaks the author typed */}
          <p className="mt-1 text-sm leading-6 whitespace-pre-line text-slate-700">{comment.message}</p>
        </li>
      ))}
    </ul>
  )
}
