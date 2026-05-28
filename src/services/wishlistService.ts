import { dataSource } from '../config/db'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'
import { Wishlist } from '../models/Wishlist'
import { WishlistItem } from '../models/WishlistItem'
import { MovieService } from './movieService'

const repository = dataSource.getRepository(Wishlist)
const itemRepository = dataSource.getRepository(WishlistItem)

export class WishlistService {
  static async getOrCreateWishlist(userId: number): Promise<Wishlist> {
    let wishlist = await repository.findOne({
      where: { userId },
      relations: { items: true },
    })

    if (!wishlist) {
      wishlist = repository.create({ userId, items: [] })
      await repository.save(wishlist)
    }

    const items = wishlist.items || []

    if (items.length === 0) return { ...wishlist, items: [] }

    const mappedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const externalMovie = await MovieService.getById(item.movieId)

          return {
            wishlistItemId: item.wishlistItemId,
            wishlistId: item.wishlistId,
            movieId: item.movieId,
            createdAt: item.createdAt,
            wishlist: item.wishlist,
            movie: {
              title: externalMovie?.title || '',
              poster: externalMovie?.poster || '',
              genres: externalMovie?.genres || [],
              runtime: externalMovie?.runTime || null,
            },
          }
        } catch (err) {
          console.error(`Backend failed to fetch external movie metadata for ID ${item.movieId}:`, err)

          return {
            ...item,
            movie: {
              title: '',
              poster: '',
              genres: [],
              runtime: null,
            },
          }
        }
      }),
    )

    return {
      ...wishlist,
      items: mappedItems,
    }
  }

  static async addItem(userId: number, movieId: number): Promise<void> {
    const wishlist = await this.getOrCreateWishlist(userId)

    const exists = wishlist.items.some((item) => item.movieId === movieId)
    if (exists) return

    const newItem = itemRepository.create({ wishlistId: wishlist.wishlistId, movieId })
    await itemRepository.save(newItem)
  }

  static async removeItem(userId: number, movieId: number): Promise<void> {
    const wishlist = await repository.findOne({ where: { userId } })

    if (!wishlist) throw new AppError(ErrorCodes.NOT_FOUND, 'Wishlist not found.', 404)

    await itemRepository.delete({ wishlistId: wishlist.wishlistId, movieId })
  }
}
