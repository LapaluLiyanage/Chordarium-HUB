import { useState } from 'react'
import type { Story } from '../../data/news'
import Illustration from './Illustration'

interface Props {
  story: Story
  size?: 'lead' | 'side' | 'row'
}

export default function StoryCard({ story, size = 'row' }: Props) {
  const [broken, setBroken] = useState(false)
  return (
    <article className={`story story-${size}`}>
      {story.image && !broken ? (
        <div className="news-pic">
          <img src={story.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
        </div>
      ) : (
        <Illustration art={story.art} label={story.headline} />
      )}
      <p className="story-tags">
        <span className="story-chip">{story.section}</span>
        <span>{story.country}</span>
      </p>
      <h3 className="story-head display">{story.headline}</h3>
      <p className="story-sum">{story.summary}</p>
      <p className="story-by">
        {story.byline}
        {story.url && (
          <>
            {story.date && ` · ${new Date(story.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
            {' · '}
            <a href={story.url} target="_blank" rel="noopener noreferrer">READ AT SOURCE</a>
          </>
        )}
      </p>
    </article>
  )
}
