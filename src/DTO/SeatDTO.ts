export interface ScreeningSlotDTO {
  timeTableId: number
  time: string
  type: string
  seatsLeft: number
  price: number
}

export interface CinemaScreeningsDTO {
  cinemaId: number
  name: string
  address: string
  slots: ScreeningSlotDTO[]
}

export interface ScreeningDateDTO {
  date: string
  label: string
  dayNum: string
  cinemas: CinemaScreeningsDTO[]
}

export interface SeatInfoDTO {
  row: number
  col: number
  taken: boolean
  premium: boolean
}

export interface SeatMapResponseDTO {
  timeTableId: number
  rows: number
  cols: number
  seats: SeatInfoDTO[]
}
