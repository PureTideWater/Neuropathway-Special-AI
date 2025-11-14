/**
 * Passport.js Configuration
 * OAuth strategies for Google and Microsoft
 */

import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { logger } from '../utils/logger';

export function configurePassport(passport: PassportStatic): void {
  // JWT Strategy
  const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key',
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
      try {
        // In production, verify user exists in database
        // const user = await User.findByPk(jwtPayload.id);
        // if (user) {
        //   return done(null, user);
        // }
        // return done(null, false);

        // For MVP, just return the payload
        return done(null, jwtPayload);
      } catch (error) {
        logger.error('JWT Strategy error', error as Error);
        return done(error, false);
      }
    })
  );

  // Google OAuth Strategy
  if (process.env.OAUTH_GOOGLE_CLIENT_ID && process.env.OAUTH_GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
          clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // In production, find or create user in database
            // const [user, created] = await User.findOrCreate({
            //   where: { oauthSub: profile.id },
            //   defaults: {
            //     email: profile.emails?.[0]?.value,
            //     firstName: profile.name?.givenName,
            //     lastName: profile.name?.familyName,
            //   },
            // });

            const user = {
              id: profile.id,
              email: profile.emails?.[0]?.value,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              provider: 'google',
            };

            return done(null, user);
          } catch (error) {
            logger.error('Google OAuth error', error as Error);
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  // Microsoft OAuth Strategy
  if (process.env.OAUTH_MICROSOFT_CLIENT_ID && process.env.OAUTH_MICROSOFT_CLIENT_SECRET) {
    passport.use(
      new MicrosoftStrategy(
        {
          clientID: process.env.OAUTH_MICROSOFT_CLIENT_ID,
          clientSecret: process.env.OAUTH_MICROSOFT_CLIENT_SECRET,
          callbackURL: '/api/auth/microsoft/callback',
          scope: ['user.read'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = {
              id: profile.id,
              email: profile.emails?.[0]?.value,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              provider: 'microsoft',
            };

            return done(null, user);
          } catch (error) {
            logger.error('Microsoft OAuth error', error as Error);
            return done(error as Error, undefined);
          }
        }
      )
    );
  }
}
