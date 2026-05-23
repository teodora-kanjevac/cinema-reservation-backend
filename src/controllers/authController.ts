import type { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/authService'
import { MailService } from '../services/mailService'
import { User } from '../models/User'

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

    res.status(200).json({
      token: result.accessToken,
      user: result.user,
    })
  } catch (error) {
    next(error)
  }
}

export const resendCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body
    const { user, verificationCode } = await AuthService.refreshCode(email)

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

    res.status(200).json({
      token: result.accessToken,
      user: result.user,
    })
  } catch (error) {
    next(error)
  }
}

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken
    const accessToken = await AuthService.refresh(refreshToken)

    res.status(200).json({ token: accessToken })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('refreshToken')
    res.status(200).json({ message: 'Logged out successfully.' })
  } catch (error) {
    next(error)
  }
}
