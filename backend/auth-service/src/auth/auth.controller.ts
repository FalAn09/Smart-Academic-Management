import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      statusCode: 201,
      message: 'User registered successfully',
      data: user,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      statusCode: 200,
      message: 'User logged in successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      statusCode: 200,
      message: 'User profile retrieved',
      data: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return {
      statusCode: 200,
      message: 'User logged out successfully',
    };
  }

  @Post('validate-token')
  async validateToken(@Body() data: { token: string }) {
    const isValid = await this.authService.validateToken(data.token);
    return {
      statusCode: 200,
      message: 'Token validation completed',
      data: { isValid },
    };
  }

  @Post('refresh-token')
  async refreshToken(@Body() data: { refreshToken: string }) {
    const tokens = await this.authService.refreshToken(data.refreshToken);
    return {
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }
}
