import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { HeroNav } from '../components/SiteNav'
import WordMark from '../components/WordMark'
import LogoDisc from '../components/LogoDisc'
import Ticker from '../components/Ticker'
import ProjectCard from '../components/ProjectCard'
import DoorRow from '../components/DoorRow'
import Wire from '../components/Wire'
import Footer from '../components/Footer'
import { DOORS, PROJECTS } from '../data/projects'

// Three.js lives in its own chunks, loaded after first paint.
const HeroLattice = lazy(() => import('../components/HeroLattice'))
const RingSection = lazy(() => import('../components/RingSection'))

export default function Home() {
  return (
    <>
      <header className="hero" id="hero">
        <HeroNav />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-row">
              <span>A MUSIC LAB</span>
              <i aria-hidden="true" />
              <span>BY LAPALU LIYANAGE</span>
            </p>
            <WordMark />
            <p className="lede">
              Chord tools for people who play. From a YouTube link to a written chord sheet, with arranging tools on the way.
            </p>
            <div className="btn-row">
              <Link to={{ pathname: '/', hash: '#projects' }} className="btn btn-ink">SEE THE TOOLS ↓</Link>
              <Link to={{ pathname: '/', hash: '#ring' }} className="btn btn-outline">MEET THE RING</Link>
            </div>
          </div>
          <Suspense fallback={<div className="lattice lattice-canvas" />}>
            <HeroLattice />
          </Suspense>
        </div>
        <LogoDisc />
      </header>

      <main id="main">
        <Ticker />

        <section className="section" id="projects">
          <p className="eyebrow" data-reveal>THE TOOLS</p>
          <h2 className="display section-title" data-reveal>EVERYTHING UNDER ONE RING.</h2>
          <div className="cards">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
        </section>

        <section className="section" id="soon">
          <p className="eyebrow" data-reveal>NEW PAGES</p>
          <h2 className="display section-title" data-reveal>THREE DOORS ARE OPENING.</h2>
          <div className="doors">
            {DOORS.map((d) => (
              <DoorRow key={d.n} {...d} />
            ))}
          </div>
          <Wire />
        </section>

        <section className="section section-dark" id="ring" aria-label="The Chordarium ring">
          <p className="eyebrow">THE RING</p>
          <h2 className="display section-title">EVERY CHORD, ON ONE CIRCLE.</h2>
          <Suspense fallback={<div className="ring-canvas" aria-hidden="true" />}>
            <RingSection />
          </Suspense>
        </section>

        <section className="section about" id="about">
          <p className="eyebrow" data-reveal>ABOUT</p>
          <div className="about-grid">
            <p className="about-copy" data-reveal>
              I’m Lapalu Liyanage. I play rhythm guitar, I study software engineering, and Chordarium is where my chord tools live. They are built for the songs my band plays, Sinhala songs included.
            </p>
            <dl className="facts" data-reveal>
              <div><dt>Studying</dt><dd>Software Engineering, 3rd year, Rajarata University of Sri Lanka</dd></div>
              <div><dt>Leading</dt><dd>President, Fastunes Music Society</dd></div>
              <div><dt>Playing</dt><dd>Rhythm guitar with the Fastunes band</dd></div>
            </dl>
          </div>
          <ul className="social" data-reveal>
            <li><a className="btn btn-outline" href="https://github.com/LapaluLiyanage" rel="noopener">GITHUB</a></li>
            <li><a className="btn btn-outline" href="https://www.linkedin.com/in/lapalu-liyanage" rel="noopener">LINKEDIN</a></li>
            <li><a className="btn btn-outline" href="https://lapalu.me" rel="noopener">PORTFOLIO</a></li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  )
}
