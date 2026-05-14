import type { NextFunction, Request, Response } from 'express'
import { MovieService } from '../services/movieService'
import { TimeTableService } from '../services/timeTableService'

export const getMovies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const movies = await MovieService.getAll()

    res.status(200).json(movies)
  } catch (error) {
    next(error)
  }
}

export const getMovieDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const movieId = parseInt(req.params.id as string)

    const movie = await TimeTableService.getMovieDetails(movieId)

    res.status(200).json(movie)
  } catch (error) {
    next(error)
  }
}

export const getMovieById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const movieId = parseInt(req.params.id as string)

    const movie = await MovieService.getById(movieId)

    res.status(200).json(movie)
  } catch (error) {
    next(error)
  }
}

export const getMoviesById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const movieIds = req.body as number[]

    const movies = await MovieService.getByIds(movieIds)

    res.status(200).json(movies)
  } catch (error) {
    next(error)
  }
}
