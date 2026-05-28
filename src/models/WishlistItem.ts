import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Wishlist } from './Wishlist'

@Index('fk_wishlist_items_wishlist_idx', ['wishlistId'], {})
@Entity('wishlist_item', { schema: 'cinema-reservation' })
export class WishlistItem {
  @PrimaryGeneratedColumn({ type: 'int', name: 'wishlist_item_id', unsigned: true })
  wishlistItemId: number

  @Column('int', { name: 'wishlist_id', unsigned: true })
  wishlistId: number

  @Column('int', { name: 'movie_id', unsigned: true })
  movieId: number

  @Column('datetime', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'wishlist_id', referencedColumnName: 'wishlistId' }])
  wishlist: Relation<Wishlist>
}
