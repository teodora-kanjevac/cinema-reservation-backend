import { MovieService } from './movieService'
import { TimeTable } from '../models/TimeTable'
import { dataSource } from '../config/db'
import { ErrorCodes } from '../errors/errorCodes'
import { AppError } from '../errors/AppError'
import type {
  CinemaScreeningsDTO,
  ScreeningDateDTO,
  ScreeningSlotDTO,
  SeatInfoDTO,
  SeatMapResponseDTO,
} from '../DTO/SeatDTO'

const repository = dataSource.getRepository(TimeTable)

function formatDateLabel(dateStr: string): { label: string; dayNum: string } {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const dayNum = date.getDate().toString().padStart(2, '0')

  if (diffDays === 0) return { label: 'TODAY', dayNum }

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  return { label: weekdays[date.getDay()] ?? 'UNK', dayNum }
}

function formatTime(time: string): string {
  return time.slice(0, 5)
}

export class TimeTableService {
  static async getAvailableMovies() {
    const data = await repository.find({
      select: { timeTableId: true, movieId: true },
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
        cinema: { cinemaId: true, name: true },
        screeningDate: true,
        startTime: true,
        screenType: true,
        price: true,
        totalCapacity: true,
      },
      where: { movieId: id },
      relations: { cinema: true, invoiceItems: true },
    })

    return { ...movie, timeTables: data }
  }

  static async getById(id: number) {
    const data = await repository.findOne({
      select: {
        timeTableId: true,
        movieId: true,
        cinemaId: true,
        startTime: true,
        price: true,
        totalCapacity: true,
        screenType: true,
        screeningDate: true,
      },
      where: { timeTableId: id },
    })

    if (data === null) throw new AppError(ErrorCodes.NOT_FOUND, `TimeTable with id ${id} not found.`, 404)

    return data
  }

  static async create(tt: TimeTable) {
    const data = new TimeTable()
    data.movieId = tt.movieId
    data.cinemaId = tt.cinemaId
    data.startTime = tt.startTime
    data.screeningDate = tt.screeningDate
    data.screenType = tt.screenType ?? '2D'
    data.totalCapacity = tt.totalCapacity ?? 128
    data.price = tt.price
    data.createdAt = new Date()
    return await repository.save(data)
  }

  static async update(id: number, tt: TimeTable) {
    const data = await repository.findOneBy({ timeTableId: id })
    if (data === null) throw new AppError(ErrorCodes.NOT_FOUND, `TimeTable with id ${id} not found.`, 404)

    data.movieId = tt.movieId
    data.cinemaId = tt.cinemaId
    data.startTime = tt.startTime
    data.screeningDate = tt.screeningDate
    data.screenType = tt.screenType ?? data.screenType
    data.totalCapacity = tt.totalCapacity ?? data.totalCapacity
    data.price = tt.price
    data.updatedAt = new Date()
    return await repository.save(data)
  }

  static async remove(id: number) {
    const timeTable = await this.getById(id)
    await repository.delete(timeTable.timeTableId)
  }

  static async getScreeningsForMovie(movieId: number): Promise<ScreeningDateDTO[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const rows = await repository.find({
      where: { movieId },
      relations: { cinema: true, invoiceItems: true },
      order: { screeningDate: 'ASC', startTime: 'ASC' },
    })

    const upcoming = rows.filter((tt) => {
      const d = new Date(tt.screeningDate)
      d.setHours(0, 0, 0, 0)
      return d >= today
    })

    const byDate = new Map<string, TimeTable[]>()
    for (const tt of upcoming) {
      const key = tt.screeningDate
      if (!byDate.has(key)) byDate.set(key, [])
      byDate.get(key)!.push(tt)
    }

    const result: ScreeningDateDTO[] = []

    for (const [dateStr, tts] of byDate.entries()) {
      const { label, dayNum } = formatDateLabel(dateStr)

      const byCinema = new Map<number, { cinema: TimeTable['cinema']; tts: TimeTable[] }>()
      for (const tt of tts) {
        if (!byCinema.has(tt.cinemaId)) {
          byCinema.set(tt.cinemaId, { cinema: tt.cinema, tts: [] })
        }
        byCinema.get(tt.cinemaId)!.tts.push(tt)
      }

      const cinemas: CinemaScreeningsDTO[] = []

      for (const { cinema, tts: cinemaTts } of byCinema.values()) {
        const slots: ScreeningSlotDTO[] = cinemaTts.map((tt) => {
          const bookedSeats = tt.invoiceItems?.length ?? 0
          const seatsLeft = Math.max(0, tt.totalCapacity - bookedSeats)

          return {
            timeTableId: tt.timeTableId,
            time: formatTime(tt.startTime),
            type: tt.screenType,
            seatsLeft,
            price: tt.price,
          }
        })

        cinemas.push({
          cinemaId: cinema.cinemaId,
          name: cinema.name,
          address: cinema.address,
          slots,
        })
      }

      result.push({ date: dateStr, label, dayNum, cinemas })
    }

    return result
  }

  static async getSeatMap(timeTableId: number): Promise<SeatMapResponseDTO> {
    const tt = await repository.findOne({
      where: { timeTableId },
      relations: { invoiceItems: true },
    })

    if (!tt) throw new AppError(ErrorCodes.NOT_FOUND, `TimeTable ${timeTableId} not found.`, 404)

    const rows = 8
    const cols = 16

    const takenIndices = new Set<number>((tt.invoiceItems ?? []).map((item) => item.seatNumber))

    const seats: SeatInfoDTO[] = []

    for (let ri = 0; ri < rows; ri++) {
      for (let ci = 0; ci < cols; ci++) {
        const flatIndex = ri * cols + ci
        seats.push({
          row: ri,
          col: ci,
          taken: takenIndices.has(flatIndex),
          premium: ri < 2,
        })
      }
    }

    return { timeTableId, rows, cols, seats }
  }
}
