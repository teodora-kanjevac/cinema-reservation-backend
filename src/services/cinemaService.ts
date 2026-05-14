import { dataSource } from '../config/db'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'
import { Cinema } from '../models/Cinema'

const repository = dataSource.getRepository(Cinema)

export class CinemaService {
  static async getAll() {
    const data = await repository.find({
      select: {
        cinemaId: true,
        name: true,
        address: true,
      },
    })

    return data
  }

  static async getById(id: number) {
    const data = await repository.findOne({
      select: {
        cinemaId: true,
        name: true,
        address: true,
      },
      where: { cinemaId: id },
    })

    if (data === null) throw new AppError(ErrorCodes.NOT_FOUND, `Cinema with id ${id} not found.`, 404)

    return data
  }

  static async create(cinema: Cinema) {
    const newCinema = new Cinema()

    newCinema.name = cinema.name
    newCinema.address = cinema.address
    newCinema.createdAt = new Date()

    return await repository.save(newCinema)
  }

  static async update(id: number, cinema: Cinema) {
    const oldCinema = await this.getById(id)

    if (cinema === null) throw new AppError(ErrorCodes.NOT_FOUND, `Cinema with id ${id} not found.`, 404)

    oldCinema.name = cinema.name
    oldCinema.address = cinema.address
    oldCinema.updatedAt = new Date()

    return await repository.save(oldCinema)
  }

  static async remove(id: number) {
    const cinema = await this.getById(id)

    if (cinema === null) throw new AppError(ErrorCodes.NOT_FOUND, `Cinema with id ${id} not found.`, 404)

    await repository.delete(cinema.cinemaId)
  }
}
