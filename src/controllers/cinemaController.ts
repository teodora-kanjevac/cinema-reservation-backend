import type { NextFunction, Request, Response } from 'express'
import { CinemaService } from '../services/cinemaService'

export const getCinemas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cinemas = await CinemaService.getAll()

    res.status(200).json(cinemas)
  } catch (error) {
    next(error)
  }
}

export const getCinemaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cinemaId = parseInt(req.params.id as string)

    const cinema = await CinemaService.getById(cinemaId)

    res.status(200).json(cinema)
  } catch (error) {
    next(error)
  }
}

export const createCinema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newCinema = req.body

    const cinema = await CinemaService.create(newCinema)

    res.status(200).json(cinema)
  } catch (error) {
    next(error)
  }
}

export const editCinema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cinemaId = parseInt(req.params.id as string)
    const newCinema = req.body

    const cinema = await CinemaService.update(cinemaId, newCinema)

    res.status(200).json(cinema)
  } catch (error) {
    next(error)
  }
}

export const removeCinema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cinemaId = parseInt(req.params.id as string)

    await CinemaService.remove(cinemaId)

    res.status(200).json({ message: `Cinema removed successfully.` })
  } catch (error) {
    next(error)
  }
}
