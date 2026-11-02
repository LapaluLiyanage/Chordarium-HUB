import { classify, parseFeed, toStory } from './rss'

const xml = `<rss><channel>
<item><title><![CDATA[Vinyl sales &amp; more]]></title><link>https://ex.com/a</link>
<description><![CDATA[<p>Presses are <b>busy</b>.</p>]]></description><pubDate>Mon, 02 Nov 2026 10:00:00 GMT</pubDate></item>
<item><title>No link here</title><link>javascript:alert(1)</link></item>
<item><title>Band - The Paper</title><link>https://ex.com/b</link><description>Band</description><source url="x">The Paper</source></item>
</channel></rss>`

describe('parseFeed', () => {
  const items = parseFeed(xml)
  it('keeps only items with an http(s) link', () => {
    expect(items.map((i) => i.link)).toEqual(['https://ex.com/a', 'https://ex.com/b'])
  })
  it('unwraps CDATA, strips markup and decodes entities', () => {
    expect(items[0].title).toBe('Vinyl sales & more')
    expect(items[0].description).toBe('Presses are busy .')
  })
  it('returns nothing for garbage', () => {
    expect(parseFeed('not xml')).toEqual([])
  })
})

describe('toStory', () => {
  it('builds a story with source, url and ISO date', () => {
    const s = toStory(parseFeed(xml)[0], 'UK', 'NME')
    expect(s).toMatchObject({ country: 'UK', source: 'NME', url: 'https://ex.com/a', section: 'VINYL', date: '2026-11-02T10:00:00.000Z' })
  })
  it('splits the publisher off Google News headlines', () => {
    const s = toStory(parseFeed(xml)[1], 'INDIA', 'Google News')
    expect(s.headline).toBe('Band')
    expect(s.source).toBe('The Paper')
    expect(s.summary).toBe('')
  })
  it('gives stable ids', () => {
    expect(toStory(parseFeed(xml)[0], 'UK', 'NME').id).toBe(toStory(parseFeed(xml)[0], 'USA', 'X').id)
  })
})

describe('classify', () => {
  it('falls back to MUSIC', () => {
    expect(classify('nothing relevant')).toEqual({ section: 'MUSIC', art: 'bunting' })
  })
})
