import type { Story } from '../../data/news'
import Illustration from './Illustration'

interface Props {
  story: Story
  size?: 'lead' | 'side' | 'row'
}

export default function StoryCard({ story, size = 'row' }: Props) {
  return (
    <article className={`story story-${size}`}>
      <Illustration art={story.art} label={story.headline} />
      <p className="story-tags">
        <span className="story-chip">{story.section}</span>
        <span>{story.country}</span>
      </p>
      <h3 className="story-head display">{story.headline}</h3>
      <p className="story-sum">{story.summary}</p>
      <p className="story-by">{story.byline}</p>
    </article>
  )
}
