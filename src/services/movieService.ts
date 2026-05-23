import axios from 'axios'
import type { GenreDTO, MovieDTO } from '../DTO/MovieDTO'

const client = axios.create({
  baseURL: 'https://movie.pequla.com/api',
  headers: {
    Accept: 'application/json',
  },
})

export class MovieService {
  private static mapToMovieDTO(data: any): MovieDTO {
    return {
      id: data.movieId,
      title: data.title,
      description: data.description,
      poster: data.poster,
      runTime: data.runTime,
      releaseDate: new Date(data.startDate),
      director: {
        id: data.director?.directorId || 0,
        name: data.director?.name || 'Unknown',
      },
      genres:
        data.movieGenres?.map((mg: any) => ({
          id: mg.genre.genreId,
          name: mg.genre.name,
        })) || [],
      actors:
        data.movieActors?.map((ma: any) => ({
          id: ma.actor.actorId,
          name: ma.actor.name,
        })) || [],
    }
  }

  private static mapToGenreDTO(data: any): GenreDTO {
    return {
      id: data.genreId,
      name: data.name,
    }
  }

  static async getAll(): Promise<MovieDTO[]> {
    const response = await client.get('/movie')
    return response.data.map((movie: any) => this.mapToMovieDTO(movie))
  }

  static async getByIds(ids: number[]): Promise<MovieDTO[]> {
    const response = await client.post('/movie/list', ids)
    return response.data.map((movie: any) => this.mapToMovieDTO(movie))
  }

  static async getById(id: number): Promise<MovieDTO> {
    const response = await client.get(`/movie/${id}`)
    return this.mapToMovieDTO(response.data)
  }

  static async getAllGenres(): Promise<GenreDTO[]> {
    const response = await client.get('/genre')
    return response.data.map((genre: any) => this.mapToGenreDTO(genre))
  }

  static async getGenreById(id: number): Promise<GenreDTO> {
    const response = await client.get(`/genre/${id}`)
    return this.mapToGenreDTO(response.data)
  }
}
