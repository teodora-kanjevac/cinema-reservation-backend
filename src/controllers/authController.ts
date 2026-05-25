import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AuthService } from '../services/authService'
import { MailService } from '../services/mailService'
import { User } from '../models/User'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, gender, email, password } = req.body

    const newUser = new User()
    newUser.firstName = firstName
    newUser.lastName = lastName
    newUser.gender = gender
    newUser.email = email
    newUser.password = password

    const verificationCode = await AuthService.register(newUser)

    await MailService.sendVerificationCode(email, firstName, verificationCode)

    const signupToken = jwt.sign({ email: newUser.email }, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: '15m',
    })

    res.cookie('signupContext', signupToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })

    res.status(201).json({ message: 'Registration successful. Verification code sent.' })
  } catch (error) {
    next(error)
  }
}

export const verifyCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, code } = req.body
    const result = await AuthService.verifyCode(email, code)

    await MailService.sendWelcomeEmail(email, result.user.firstName)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })

    res.clearCookie('signupContext')

    res.status(200).json({
      user: result.user,
    })
  } catch (error) {
    next(error)
  }
}

export const resendCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { signupContext } = req.cookies

    if (!signupContext)
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Verification session expired. Please sign up again.', 401)

    const decoded = jwt.verify(signupContext, process.env.JWT_ACCESS_SECRET as string) as { email: string }

    const { user, verificationCode } = await AuthService.refreshCode(decoded.email)

    await MailService.sendVerificationCode(user.email, user.firstName, verificationCode)

    res.status(201).json({ message: 'Verification code sent.' })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body
    const result = await AuthService.login(email, password)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })

    res.status(200).json({
      user: result.user,
    })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(200).json({ message: 'Logged out successfully.' })
  } catch (error) {
    next(error)
  }
}
