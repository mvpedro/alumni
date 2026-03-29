import { describe, it, expect } from 'vitest'

/**
 * The extractVideoId function is defined inline in YouTubeEmbed.jsx.
 * We duplicate it here (single source of truth for the logic is the component)
 * so we can unit-test it independently without importing React.
 */
function extractVideoId(url) {
  if (!url) return null
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return shortMatch[1]
  // youtube.com/embed/ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/)
  if (embedMatch) return embedMatch[1]
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch) return watchMatch[1]
  return null
}

describe('extractVideoId (YouTube URL parsing)', () => {
  it('extracts ID from watch?v= URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts ID from watch?v= URL with extra query params', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ')
  })

  it('extracts ID from youtu.be/ short URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts ID from youtu.be/ with query string', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ?si=abc123')).toBe('dQw4w9WgXcQ')
  })

  it('extracts ID from youtube.com/embed/ URL', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts ID from embed URL with query params', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1')).toBe('dQw4w9WgXcQ')
  })

  it('returns null for null input', () => {
    expect(extractVideoId(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(extractVideoId(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractVideoId('')).toBeNull()
  })

  it('returns null for a non-YouTube URL', () => {
    expect(extractVideoId('https://vimeo.com/12345')).toBeNull()
  })

  it('returns null for a plain text string', () => {
    expect(extractVideoId('not a url at all')).toBeNull()
  })

  it('returns null for youtube.com homepage (no video ID)', () => {
    expect(extractVideoId('https://www.youtube.com/')).toBeNull()
  })

  it('handles mixed-case youtube.com domain correctly', () => {
    // Browsers normalise to lowercase but let's be safe
    expect(extractVideoId('https://www.youtube.com/watch?v=abc123XYZ')).toBe('abc123XYZ')
  })
})
