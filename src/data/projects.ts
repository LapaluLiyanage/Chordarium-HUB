export interface Project {
  id: 'chorder' | 'studio' | 'songbooks'
  title: string
  eyebrow: string
  status: string
  cta: string
  href: string
  blurb: string
  tags: string[]
  dark?: boolean
}

// Links are placeholders until Lapalu supplies the real URLs.
export const PROJECTS: Project[] = [
  {
    id: 'chorder',
    title: 'CHORDER',
    eyebrow: 'CHORDARIUM',
    status: 'WORKING',
    cta: 'OPEN CHORDER',
    href: '#projects',
    blurb: "Paste a YouTube link and get the song's chords, synced to the video. Edit them, loop a verse, and print the sheet.",
    tags: ['YouTube → chords', 'PDF · MIDI · ChordPro'],
    dark: true,
  },
  {
    id: 'studio',
    title: 'STUDIO',
    eyebrow: 'CHORDARIUM',
    status: 'PLANNED',
    cta: 'FOLLOW THE BUILD',
    href: '#projects',
    blurb: 'Paste a chord sheet, describe the arrangement in plain words, and get editable MIDI on your Cubase tracks.',
    tags: ['Cubase', 'VST3 plugin'],
  },
  {
    // Assumption: confirm with Lapalu before launch.
    id: 'songbooks',
    title: 'SONGBOOKS',
    eyebrow: 'MORE TO COME',
    status: 'IN PROGRESS',
    cta: 'SEE THE SONGS',
    href: '#projects',
    blurb: 'Sinhala songs with their chords, organised so a band can pick one up and play.',
    tags: ['Sinhala', 'Chord sheets'],
  },
]

export const DOORS = [
  { n: '01', title: 'LEARN', desc: 'Notes, chords and rhythm, one small step at a time.', to: '/learn' },
  { n: '02', title: 'ARTICLES', desc: 'Short reads on how chords and songs fit together.', to: '/articles' },
  { n: '03', title: 'MUSIC NEWS', desc: 'Headlines from the music world, country by country.', to: '/news' },
]

export const WIRE = [
  ['SRI LANKA', 'School choir premieres a new baila arrangement'],
  ['INDIA', 'Street musicians turn a railway platform into a stage'],
  ['UK', 'Brass band festival returns to the seaside'],
  ['USA', 'Pressing plant adds a second shift as records sell again'],
  ['JAPAN', 'Cassette shop draws a new generation of listeners'],
  ['SRI LANKA', 'Drum circle teaches rhythm to a village class'],
]
