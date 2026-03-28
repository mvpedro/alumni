import ReactMarkdown from 'react-markdown'

const components = {
  // Section titles (# Na Universidade, # O Mercado, etc) — teal accent
  h1: ({ children }) => (
    <h2 className="mt-10 mb-4 flex items-center gap-3 text-xl font-bold text-primary">
      <span className="h-6 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  ),
  // Questions (## Por que escolheu automação?) — bold, slightly larger
  h2: ({ children }) => (
    <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
      {children}
    </h3>
  ),
  // Horizontal rules (--- section dividers)
  hr: () => <hr className="my-8 border-border/50" />,
  // Paragraphs — answer text
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-muted-foreground">
      {children}
    </p>
  ),
  // Strong — keep it prominent
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
}

export function PostContent({ content }) {
  return (
    <article className="max-w-none">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </article>
  )
}
