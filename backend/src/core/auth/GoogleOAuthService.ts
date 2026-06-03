import { OAuth2Client } from 'google-auth-library'
import { config } from '@/config'
import { AuthenticationError } from '@/utils/errors'

export interface GoogleUserInfo {
  googleId: string
  email: string
  name: string
  avatar?: string
  emailVerified: boolean
}

export class GoogleOAuthService {
  private client: OAuth2Client

  constructor() {
    this.client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
    )
  }

  // Verify ID token from frontend (implicit flow)
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    if (!config.google.clientId) {
      throw new AuthenticationError('Google OAuth not configured')
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      })

      const payload = ticket.getPayload()
      if (!payload || !payload.email) {
        throw new AuthenticationError('Invalid Google token payload')
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        avatar: payload.picture,
        emailVerified: payload.email_verified ?? false,
      }
    } catch (err) {
      if (err instanceof AuthenticationError) throw err
      throw new AuthenticationError('Google token verification failed')
    }
  }

  // Exchange auth code for tokens (server-side flow)
  async exchangeCode(code: string, redirectUri: string): Promise<GoogleUserInfo> {
    if (!config.google.clientId || !config.google.clientSecret) {
      throw new AuthenticationError('Google OAuth not configured')
    }

    try {
      const { tokens } = await this.client.getToken({ code, redirect_uri: redirectUri })
      this.client.setCredentials(tokens)

      if (!tokens.id_token) {
        throw new AuthenticationError('No ID token returned from Google')
      }

      return this.verifyIdToken(tokens.id_token)
    } catch (err) {
      if (err instanceof AuthenticationError) throw err
      throw new AuthenticationError('Google OAuth code exchange failed')
    }
  }

  getAuthUrl(redirectUri: string, state?: string): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      redirect_uri: redirectUri,
      state,
    })
  }
}

export const googleOAuthService = new GoogleOAuthService()
