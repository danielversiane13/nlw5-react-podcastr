import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { GetStaticProps } from 'next'
import { api } from '../services/api'
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString'

interface Episode {
  id: string
  title: string
  thumbnail: string
  members: string
  publishedAt: string
  duration: number
  durationAsString: string
  description: string
  url: string
}

interface HomeProps {
  episodes: Episode[]
}

export default function Home(props: HomeProps) {
  return (
    <div>
      <h1>Index</h1>
      <span>{JSON.stringify(props.episodes)}</span>
    </div>
  )
}

interface ResponseEpisode {
  id: string
  title: string
  thumbnail: string
  members: string
  published_at: string
  description: string
  file: {
    duration: string
    type: string
    url: string
  }
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get<ResponseEpisode[]>('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes: Episode[] = data.map((episode: ResponseEpisode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      description: episode.description,
      url: episode.file.url
    }
  })

  return {
    props: {
      episodes
    },
    revalidate: 60 * 60 * 8
  }
}
