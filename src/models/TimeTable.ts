import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Cinema } from './Cinema'
import { InvoiceItem } from './InvoiceItem'

@Index('fk_time_table_cinema_idx', ['cinemaId'], {})
@Entity('time_table', { schema: 'cinema-reservation' })
export class TimeTable {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'time_table_id',
    unsigned: true,
  })
  timeTableId: number

  @Column('int', { name: 'movie_id', unsigned: true })
  movieId: number

  @Column('int', { name: 'cinema_id', unsigned: true })
  cinemaId: number

  @Column('time', { name: 'start_time' })
  startTime: string

  @Column('date', { name: 'screening_date' })
  screeningDate: string

  @Column('varchar', { name: 'screen_type', length: 50, default: '2D' })
  screenType: string

  @Column('int', { name: 'total_capacity', default: 128 })
  totalCapacity: number

  @Column('int', { name: 'price', unsigned: true })
  price: number

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column('datetime', { name: 'updated_at', nullable: true })
  updatedAt: Date | null

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.timeTable)
  invoiceItems: InvoiceItem[]

  @ManyToOne(() => Cinema, (cinema) => cinema.timeTables, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'cinema_id', referencedColumnName: 'cinemaId' }])
  cinema: Relation<Cinema>
}
