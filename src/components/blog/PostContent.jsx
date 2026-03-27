import ReactMarkdown from 'react-markdown'

export function PostContent({ content }) {
  return (
    <article className="prose prose-neutral max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  )
}
