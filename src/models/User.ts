import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Invoice } from './Invoice'

@Index('uq_user_email', ['email'], { unique: true })
@Entity('user', { schema: 'cinema-reservation' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'user_id', unsigned: true })
  userId: number

  @Column('varchar', { name: 'first_name', length: 255 })
  firstName: string

  @Column('varchar', { name: 'last_name', length: 255 })
  lastName: string

  @Column('enum', { name: 'gender', enum: ['m', 'f'] })
  gender: 'm' | 'f'

  @Column('varchar', { name: 'email', unique: true, length: 255 })
  email: string

  @Column('varchar', { name: 'password', length: 255 })
  password: string

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date | null

  @Column('varchar', { name: 'email_code', length: 6, nullable: true })
  emailCode: string | null

  @Column('datetime', { name: 'email_code_expires_at', nullable: true })
  emailCodeExpiresAt: Date | null

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column('datetime', { name: 'verified_at', nullable: true })
  verifiedAt: Date | null

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[]
}
