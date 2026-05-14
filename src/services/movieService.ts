import axios from 'axios'
import type { MovieDTO } from '../DTO/MovieDTO'

const client = axios.create({
  baseURL: 'https://movie.pequla.com/api',
  headers: {
    Accept: 'application/json',
  },
})

export class MovieService {
  private static mapToDTO(data: any): MovieDTO {
    return {
      id: data.movieId,
      title: data.title,
      description: data.description,
      poster: data.poster,
      runTime: data.runTime,
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

  static async getAll() {
    const response = await client.get('/movie')
    return response.data.map((movie: any) => this.mapToDTO(movie))
  }

  static async getByIds(ids: number[]) {
    const response = await client.post('/movie/list', ids)
    return response.data.map((movie: any) => this.mapToDTO(movie))
  }

  static async getById(id: number) {
    const response = await client.get(`/movie/${id}`)
    return this.mapToDTO(response.data)
  }
}
