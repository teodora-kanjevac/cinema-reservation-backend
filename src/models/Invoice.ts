import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { User } from './User'
import { InvoiceItem } from './InvoiceItem.js'

@Index('fk_user_invoice_idx', ['userId'], {})
@Entity('invoice', { schema: 'cinema-reservation' })
export class Invoice {
  @PrimaryGeneratedColumn({ type: 'int', name: 'invoice_id', unsigned: true })
  invoiceId: number

  @Column('int', { name: 'user_id', unsigned: true })
  userId: number

  @Column('varchar', { name: 'purs_id', nullable: true, length: 255 })
  pursId: string | null

  @Column('datetime', { name: 'purs_time', nullable: true })
  pursTime: Date | null

  @Column('varchar', { name: 'purs_counter', nullable: true, length: 255 })
  pursCounter: string | null

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @ManyToOne(() => User, (user) => user.invoices, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: Relation<User>

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice)
  invoiceItems: InvoiceItem[]
}
