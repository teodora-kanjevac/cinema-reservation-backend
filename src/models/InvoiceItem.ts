import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Invoice } from './Invoice.js'
import { TimeTable } from './TimeTable'

@Index('fk_invoice_item_invoice_idx', ['invoiceId'], {})
@Index('fk_invoice_item_time_table_idx', ['timeTableId'], {})
@Entity('invoice_item', { schema: 'cinema-reservation' })
export class InvoiceItem {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'invoice_item_id',
    unsigned: true,
  })
  invoiceItemId: number

  @Column('int', { name: 'invoice_id', unsigned: true })
  invoiceId: number

  @Column('int', { name: 'time_table_id', unsigned: true })
  timeTableId: number

  @Column('int', { name: 'price_per_item', unsigned: true })
  pricePerItem: number

  @Column('int', { name: 'count', unsigned: true })
  count: number

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column('datetime', { name: 'updated_at', nullable: true })
  updatedAt: Date | null

  @ManyToOne(() => Invoice, (invoice) => invoice.invoiceItems, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'invoice_id', referencedColumnName: 'invoiceId' }])
  invoice: Relation<Invoice>

  @ManyToOne(() => TimeTable, (timeTable) => timeTable.invoiceItems, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'time_table_id', referencedColumnName: 'timeTableId' }])
  timeTable: Relation<TimeTable>
}
