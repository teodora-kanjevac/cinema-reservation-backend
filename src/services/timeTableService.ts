import { MovieService } from './movieService'
import { TimeTable } from '../models/TimeTable'
import { dataSource } from '../config/db'
import { ErrorCodes } from '../errors/errorCodes'
import { AppError } from '../errors/AppError'

const repository = dataSource.getRepository(TimeTable)

export class TimeTableService {
  static async getAvailableMovies() {
    const data = await repository.find({
      select: {
        timeTableId: true,
        movieId: true,
      },
    })

    const arr = data.map((tt) => tt.movieId)
    const unique = [...new Set(arr)]
    const movies = await MovieService.getByIds(unique)

    if (unique.length === 0) return []

    return movies
  }

  static async getMovieDetails(id: number) {
    const movie = await MovieService.getById(id)

    if (movie === null) throw new AppError(ErrorCodes.NOT_FOUND, `Movie with id ${id} not found.`, 404)

    const data = await repository.find({
      select: {
        timeTableId: true,
        cinemaId: true,
        cinema: {
          cinemaId: true,
          name: true,
        },
        startTime: true,
        price: true,
      },
      where: {
        movieId: id,
      },
      relations: {
        cinema: true,
      },
    })

    return {
      ...movie,
      timeTables: data,
    }
  }

  static async getById(id: number) {
    const data = await repository.findOne({
      select: {
        timeTableId: true,
        movieId: true,
        cinemaId: true,
        startTime: true,
        price: true,
      },
      where: {
        timeTableId: id,
      },
    })

    if (data == null) throw new AppError(ErrorCodes.NOT_FOUND, `TimeTable with id ${id} not found.`, 404)

    return data
  }

  static async create(tt: TimeTable) {
    const data = new TimeTable()

    data.movieId = tt.movieId
    data.cinemaId = tt.cinemaId
    data.startTime = tt.startTime
    data.price = tt.price
    data.createdAt = new Date()

    return await repository.save(data)
  }

  static async update(id: number, tt: TimeTable) {
    const data = await repository.findOneBy({ timeTableId: id })

    if (data == null) throw new AppError(ErrorCodes.NOT_FOUND, `TimeTable with id ${id} not found.`, 404)

    data.movieId = tt.movieId
    data.cinemaId = tt.cinemaId
    data.startTime = tt.startTime
    data.price = tt.price
    data.updatedAt = new Date()

    return await repository.save(data)
  }

  static async remove(id: number) {
    const timeTable = await this.getById(id)

    if (timeTable === null) throw new AppError(ErrorCodes.NOT_FOUND, `TimeTable with id ${id} not found.`, 404)

    await repository.delete(timeTable.timeTableId)
  }
}
