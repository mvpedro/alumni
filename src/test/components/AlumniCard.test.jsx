import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AlumniCard } from '@/components/alumni/AlumniCard'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const baseAlumni = {
  id: 'a1',
  full_name: 'João Silva',
  job_title: 'Engenheiro de Software',
  city: 'Florianópolis',
  state: 'SC',
  entry_class: '2018.1',
  avatar_url: null,
  company: { id: 'c1', name: 'ACME Corp', logo_url: null },
  is_hiring: false,
  open_to_mentoring: false,
  is_graduando: false,
  alumni_badges: [],
}

function renderCard(props) {
  return render(
    <MemoryRouter>
      <AlumniCard {...props} />
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('AlumniCard', () => {
  it('renders the alumni name', () => {
    renderCard({ alumni: baseAlumni })
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('renders company name', () => {
    renderCard({ alumni: baseAlumni })
    expect(screen.getByText('ACME Corp')).toBeInTheDocument()
  })

  it('renders city and state as location', () => {
    renderCard({ alumni: baseAlumni })
    expect(screen.getByText('Florianópolis, SC')).toBeInTheDocument()
  })

  it('renders entry class', () => {
    renderCard({ alumni: baseAlumni })
    expect(screen.getByText('Turma 2018.1')).toBeInTheDocument()
  })

  it('renders job title', () => {
    renderCard({ alumni: baseAlumni })
    expect(screen.getByText('Engenheiro de Software')).toBeInTheDocument()
  })

  it('shows "Alumni Automação" instead of real name in anonymous mode', () => {
    renderCard({ alumni: baseAlumni, anonymous: true })
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument()
    expect(screen.getByText('Alumni Automação')).toBeInTheDocument()
  })

  it('wraps card in a link when not anonymous', () => {
    const { container } = renderCard({ alumni: baseAlumni })
    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link.getAttribute('href')).toBe('/perfil/a1')
  })

  it('does not wrap card in a link when anonymous', () => {
    const { container } = renderCard({ alumni: baseAlumni, anonymous: true })
    expect(container.querySelector('a')).toBeNull()
  })

  it('shows "Contratando" badge when is_hiring=true', () => {
    renderCard({ alumni: { ...baseAlumni, is_hiring: true } })
    expect(screen.getByText('Contratando')).toBeInTheDocument()
  })

  it('does not show "Contratando" badge when is_hiring=false', () => {
    renderCard({ alumni: baseAlumni })
    expect(screen.queryByText('Contratando')).not.toBeInTheDocument()
  })

  it('shows "Mentor disponível" badge when open_to_mentoring=true', () => {
    renderCard({ alumni: { ...baseAlumni, open_to_mentoring: true } })
    expect(screen.getByText('Mentor disponível')).toBeInTheDocument()
  })

  it('renders alumni_badges as pills with badge names', () => {
    const alumni = {
      ...baseAlumni,
      alumni_badges: [
        { badge: { slug: 'early-bird', name: 'Early Bird', color: '#e5a500' } },
        { badge: { slug: 'mentor', name: 'Mentor', color: '#0d9488' } },
      ],
    }
    renderCard({ alumni })
    expect(screen.getByText('Early Bird')).toBeInTheDocument()
    expect(screen.getByText('Mentor')).toBeInTheDocument()
  })

  it('renders at most 3 badges', () => {
    const alumni = {
      ...baseAlumni,
      alumni_badges: [
        { badge: { slug: 'a', name: 'Badge A', color: '#111' } },
        { badge: { slug: 'b', name: 'Badge B', color: '#222' } },
        { badge: { slug: 'c', name: 'Badge C', color: '#333' } },
        { badge: { slug: 'd', name: 'Badge D', color: '#444' } },
      ],
    }
    renderCard({ alumni })
    expect(screen.queryByText('Badge D')).not.toBeInTheDocument()
  })

  it('shows "Graduando" badge for is_graduando profiles (non-anonymous)', () => {
    renderCard({ alumni: { ...baseAlumni, is_graduando: true } })
    expect(screen.getByText('Graduando')).toBeInTheDocument()
  })

  it('does not show "Graduando" badge in anonymous mode', () => {
    renderCard({ alumni: { ...baseAlumni, is_graduando: true }, anonymous: true })
    expect(screen.queryByText('Graduando')).not.toBeInTheDocument()
  })
})
