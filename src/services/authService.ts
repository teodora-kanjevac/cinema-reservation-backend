import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { dataSource } from '../config/db'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'
import { User } from '../models/User'
import crypto from 'crypto'

const repository = dataSource.getRepository(User)

export class AuthService {
  private static generateAccessToken(userId: number, email: string): string {
    return jwt.sign({ userId, email }, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any,
    })
  }

  private static generateRefreshToken(userId: number): string {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    })
  }

  private static generateSecureCode(): string {
    const code = crypto.randomInt(0, 1000000)
    return code.toString().padStart(6, '0')
  }

  static async register(userData: User): Promise<string> {
    const existingUser = await repository.findOne({ where: { email: userData.email } })
    if (existingUser) throw new AppError(ErrorCodes.EMAIL_IN_USE, 'Email already registered.', 400)

    const verificationCode = this.generateSecureCode()

    const newUser = new User()
    newUser.firstName = userData.firstName
    newUser.lastName = userData.lastName
    newUser.gender = userData.gender
    newUser.email = userData.email
    newUser.password = await bcrypt.hash(userData.password, 10)
    newUser.emailCode = verificationCode
    newUser.emailCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000)
    newUser.createdAt = new Date()

    await repository.save(newUser)
    return verificationCode
  }

  static async verifyCode(email: string, code: string): Promise<any> {
    const user = await repository.findOne({ where: { email } })
    if (!user) throw new AppError(ErrorCodes.USER_NOT_FOUND, 'User not registered.', 404)

    if (!user.emailCode || user.emailCode !== code)
      throw new AppError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid verification code.', 400)

    if (!user.emailCodeExpiresAt || new Date() > user.emailCodeExpiresAt)
      throw new AppError(ErrorCodes.VALIDATION_FAILED, 'Verification code expired.', 400)

    user.verifiedAt = new Date()
    user.emailCode = null
    user.emailCodeExpiresAt = null
    await repository.save(user)

    const accessToken = this.generateAccessToken(user.userId, user.email)
    const refreshToken = this.generateRefreshToken(user.userId)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    }
  }

  static async refreshCode(email: string): Promise<any> {
    const user = await repository.findOne({ where: { email } })
    if (!user) throw new AppError(ErrorCodes.USER_NOT_FOUND, 'User not registered.', 404)

    const verificationCode = this.generateSecureCode()

    user.emailCode = verificationCode
    user.emailCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000)
    await repository.save(user)

    return {
      user,
      verificationCode,
    }
  }

  static async login(email: string, password: string): Promise<any> {
    const user = await repository.findOne({ where: { email } })
    if (!user) throw new AppError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid credentials.', 401)

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new AppError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid credentials.', 401)

    const accessToken = this.generateAccessToken(user.userId, user.email)
    const refreshToken = this.generateRefreshToken(user.userId)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    }
  }

  static async refresh(refreshToken: string | undefined): Promise<string> {
    if (!refreshToken) throw new AppError(ErrorCodes.UNAUTHORIZED, 'Refresh token missing.', 401)

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: number }

      const user = await repository.findOne({ where: { userId: decoded.userId } })
      if (!user) throw new AppError(ErrorCodes.USER_NOT_FOUND, 'User not found.', 404)

      return this.generateAccessToken(user.userId, user.email)
    } catch (error) {
      throw new AppError(ErrorCodes.TOKEN_EXPIRED, 'Invalid or expired refresh token.', 403)
    }
  }
}
