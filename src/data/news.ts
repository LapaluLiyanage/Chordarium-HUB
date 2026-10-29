export const COUNTRIES = ['SRI LANKA', 'INDIA', 'UK', 'USA', 'JAPAN'] as const
export type Country = (typeof COUNTRIES)[number]
export type IllustrationKey = 'mic' | 'bunting' | 'stage' | 'vinyl' | 'cassette' | 'drum' | 'guitar' | 'staff'

export interface Story {
  id: string
  country: Country
  section: string
  headline: string
  summary: string
  byline: string
  art: IllustrationKey
}

// Every story here is a SAMPLE. Do not present these as real news.
export const STORIES: Story[] = [
  { id: 's1', country: 'SRI LANKA', section: 'FOLK', headline: 'School choir premieres a new baila arrangement', summary: 'A sample story about a choir and a lively new arrangement that had the whole hall clapping on the offbeat.', byline: 'SAMPLE DESK', art: 'mic' },
  { id: 's2', country: 'INDIA', section: 'STREET', headline: 'Street musicians turn a railway platform into a stage', summary: 'A sample story about commuters stopping to listen as a trio sets up between two trains.', byline: 'SAMPLE DESK', art: 'bunting' },
  { id: 's3', country: 'UK', section: 'BRASS', headline: 'Brass band festival returns to the seaside', summary: 'A sample story about marching bands, deckchairs and a very windy afternoon concert.', byline: 'SAMPLE DESK', art: 'stage' },
  { id: 's4', country: 'USA', section: 'VINYL', headline: 'Pressing plant adds a second shift as records sell again', summary: 'A sample story about a factory where the presses never seem to stop.', byline: 'SAMPLE DESK', art: 'vinyl' },
  { id: 's5', country: 'JAPAN', section: 'RETRO', headline: 'Cassette shop draws a new generation of listeners', summary: 'A sample story about tape, tiny shelves and a queue that wraps around the block.', byline: 'SAMPLE DESK', art: 'cassette' },
  { id: 's6', country: 'SRI LANKA', section: 'RHYTHM', headline: 'Drum circle teaches rhythm to a village class', summary: 'A sample story about hand drums, counting aloud and a lesson that ended in a parade.', byline: 'SAMPLE DESK', art: 'drum' },
  { id: 's7', country: 'INDIA', section: 'STRINGS', headline: 'Workshop revives a nearly forgotten string instrument', summary: 'A sample story about a craftsman, a long neck and a waiting list of students.', byline: 'SAMPLE DESK', art: 'guitar' },
  { id: 's8', country: 'UK', section: 'EDUCATION', headline: 'Libraries start lending sheet music by the shelf', summary: 'A sample story about scores, pencils and a quiet corner that fills up on Saturdays.', byline: 'SAMPLE DESK', art: 'staff' },
  { id: 's9', country: 'USA', section: 'LIVE', headline: 'Small-town opera house reopens with a free concert', summary: 'A sample story about fresh paint, old velvet seats and a full house.', byline: 'SAMPLE DESK', art: 'stage' },
  { id: 's10', country: 'JAPAN', section: 'GUITAR', headline: 'Bedroom guitarists share chord charts for city-pop favourites', summary: 'A sample story about hand-drawn diagrams passed around between friends.', byline: 'SAMPLE DESK', art: 'guitar' },
]

export function filterStories(stories: Story[], country: Country | 'ALL'): Story[] {
  return country === 'ALL' ? stories : stories.filter((s) => s.country === country)
}
