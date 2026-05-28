import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { WishlistItem } from './WishlistItem'

@Entity('wishlists', { schema: 'cinema-reservation' })
export class Wishlist {
  @PrimaryGeneratedColumn({ type: 'int', name: 'wishlist_id', unsigned: true })
  wishlistId: number

  @Column('int', { name: 'user_id', unsigned: true, unique: true })
  userId: number

  @Column('datetime', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.wishlist, { cascade: true })
  items: WishlistItem[]
}
