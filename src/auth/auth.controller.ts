import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { GithubOAuthGuard } from './guards/github-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ── Google OAuth2 ──────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  googleAuth() {
    // Guard redirects to Google; nothing to return
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.handleOAuthLogin(req.user as any);
    return res.json(tokens);
  }

  // ── GitHub OAuth2 ──────────────────────────────────────────────────────────

  @Get('github')
  @UseGuards(GithubOAuthGuard)
  githubAuth() {
    // Guard redirects to GitHub; nothing to return
  }

  @Get('github/callback')
  @UseGuards(GithubOAuthGuard)
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.handleOAuthLogin(req.user as any);
    return res.json(tokens);
  }
}