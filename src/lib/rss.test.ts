import { classify, isRecent, parseFeed, pickImage, toStory } from './rss'

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
  it('carries the image through', () => {
    expect(toStory({ ...parseFeed(xml)[0], image: 'https://i.ex/x.jpg' }, 'UK', 'NME').image).toBe('https://i.ex/x.jpg')
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

describe('pickImage', () => {
  it('prefers the widest https media:content', () => {
    const b = `<media:content width="140" url="https://i.ex/s.jpg?a=1&amp;b=2"></media:content><media:content width="460" url="https://i.ex/l.jpg?a=1&amp;b=2"></media:content>`
    expect(pickImage(b)).toBe('https://i.ex/l.jpg?a=1&b=2')
  })
  it('uses an image enclosure, then the first <img>, preferring lazy-loaded urls', () => {
    expect(pickImage('<enclosure url="https://i.ex/e.jpg" type="image/jpeg"/>')).toBe('https://i.ex/e.jpg')
    expect(pickImage('<enclosure url="https://i.ex/a.mp3" type="audio/mpeg"/>')).toBeUndefined()
    expect(pickImage('<description><![CDATA[<img src="" data-lazy-src="https://i.ex/z.jpg?w=1&#038;h=2">]]></description>')).toBe('https://i.ex/z.jpg?w=1&h=2')
    expect(pickImage('<description>&lt;img src="https://i.ex/q.png" /&gt;</description>')).toBe('https://i.ex/q.png')
  })
  it('rejects non-https and non-image media', () => {
    expect(pickImage('<media:content url="http://i.ex/a.jpg"/>')).toBeUndefined()
    expect(pickImage('<media:content medium="video" url="https://i.ex/v.mp4"/>')).toBeUndefined()
    expect(pickImage('<img src="javascript:alert(1)">')).toBeUndefined()
  })
})

describe('classify types', () => {
  it.each([
    ['Taylor Swift announces new album for March', 'NEW RELEASE'],
    ['Beyoncé wins big at the Grammys', 'AWARDS'],
    ['Song hits No. 1 on the Hot 100', 'CHARTS'],
    ['Coldplay add tour dates in Asia', 'TOURS & LIVE'],
  ])('%s -> %s', (text, section) => expect(classify(text).section).toBe(section))
})

describe('isRecent', () => {
  const now = Date.parse('2026-11-02T12:00:00Z')
  it('keeps stories from the last week and drops older or undated ones', () => {
    expect(isRecent('2026-11-02T10:00:00Z', 7, now)).toBe(true)
    expect(isRecent('2026-10-27T12:00:00Z', 7, now)).toBe(true)
    expect(isRecent('2026-10-20T12:00:00Z', 7, now)).toBe(false)
    expect(isRecent('2026-05-06T07:00:00Z', 7, now)).toBe(false)
    expect(isRecent(undefined, 7, now)).toBe(false)
    expect(isRecent('not a date', 7, now)).toBe(false)
  })
  it('drops dates far in the future', () => {
    expect(isRecent('2026-12-01T00:00:00Z', 7, now)).toBe(false)
  })
})
