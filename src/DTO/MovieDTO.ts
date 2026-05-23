export interface ActorDTO {
  id: number
  name: string
}

export interface DirectorDTO {
  id: number
  name: string
}

export interface GenreDTO {
  id: number
  name: string
}

export interface MovieDTO {
  id: number
  title: string
  description: string
  poster: string
  releaseDate: Date
  runTime: number
  director: DirectorDTO
  genres: GenreDTO[]
  actors: ActorDTO[]
}
