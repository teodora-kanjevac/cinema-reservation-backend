import { dataSource } from '../config/db'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'
import { Invoice } from '../models/Invoice'
import { User } from '../models/User'
import bcrypt from 'bcrypt'
import { Wishlist } from '../models/Wishlist'
import type { UserStatsDTO } from '../DTO/UserDTO'

const repository = dataSource.getRepository(User)
const invoiceRepository = dataSource.getRepository(Invoice)
const wishlistRepository = dataSource.getRepository(Wishlist)

export class UserService {
  static async getUserInfo(userId: number) {
    const data = await repository.findOne({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        gender: true,
        email: true,
        dateOfBirth: true,
        verifiedAt: true,
      },
    })

    if (!data) throw new AppError(ErrorCodes.NOT_FOUND, `User with id ${userId} not found.`, 404)

    return data
  }

  static async getUserStats(userId: number): Promise<UserStatsDTO> {
    const invoiceStats = await invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.invoiceItems', 'item')
      .leftJoin('item.timeTable', 'timeTable')
      .select('COUNT(DISTINCT timeTable.movieId)', 'moviesWatched')
      .addSelect('SUM(item.price_per_item * item.count)', 'totalMoneySpent')
      .where('invoice.userId = :userId', { userId })
      .getRawOne()

    const wishlist = await wishlistRepository.findOne({
      where: { userId },
      relations: { items: true },
    })

    return {
      userId,
      moviesWatched: parseInt(invoiceStats.moviesWatched, 10) ?? 0,
      totalMoneySpent: parseInt(invoiceStats.totalMoneySpent, 10) ?? 0,
      wishlistItemCount: wishlist?.items?.length ?? 0,
    }
  }

  static async update(userId: number, user: User) {
    const oldUser = await repository.findOne({ where: { userId } })

    if (!oldUser) throw new AppError(ErrorCodes.UNAUTHORIZED, `User with id ${userId} not found.`, 404)

    oldUser.firstName = user.firstName
    oldUser.lastName = user.lastName
    oldUser.gender = user.gender
    oldUser.dateOfBirth = user.dateOfBirth

    return await repository.save(oldUser)
  }

  static async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await repository.findOne({
      where: { userId },
      select: { userId: true, password: true },
    })

    if (!user) throw new AppError(ErrorCodes.USER_NOT_FOUND, 'User not found.', 404)

    const isMatch = await bcrypt.compare(oldPassword, user.password)

    if (!isMatch) throw new AppError(ErrorCodes.INVALID_CREDENTIALS, 'Your current password is incorrect.', 400)

    const isSamePassword = await bcrypt.compare(newPassword, user.password)

    if (isSamePassword)
      throw new AppError(ErrorCodes.CANNOT_MODIFY, 'New password cannot be identical to your old password.', 400)

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)

    await repository.save(user)
  }
}
