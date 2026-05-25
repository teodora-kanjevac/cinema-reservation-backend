import type { NextFunction, Request, Response } from 'express'
import { TimeTableService } from '../services/timeTableService'

export const getAvailableMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const movies = await TimeTableService.getAvailableMovies()

    res.status(200).json(movies)
  } catch (error) {
    next(error)
  }
}

export const getTimeTableById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const timeTableId = parseInt(req.params.id as string)

    const timeTable = await TimeTableService.getById(timeTableId)

    res.status(200).json(timeTable)
  } catch (error) {
    next(error)
  }
}

export const createTimeTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newTimeTable = req.body

    const timeTable = await TimeTableService.create(newTimeTable)

    res.status(200).json(timeTable)
  } catch (error) {
    next(error)
  }
}

export const editTimeTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const timeTableId = parseInt(req.params.id as string)
    const newTimeTable = req.body

    const timeTable = await TimeTableService.update(timeTableId, newTimeTable)

    res.status(200).json(timeTable)
  } catch (error) {
    next(error)
  }
}

export const removeTimeTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const timeTableId = parseInt(req.params.id as string)

    await TimeTableService.remove(timeTableId)

    res.status(200).json({ message: `Time Table removed successfully.` })
  } catch (error) {
    next(error)
  }
}

export const getScreeningsForMovie = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const movieId = Number(req.params.movieId)

    const data = await TimeTableService.getScreeningsForMovie(movieId)

    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

export const getSeatMap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id)

    const data = await TimeTableService.getSeatMap(id)

    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}
