import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Identity and Access (Auth)')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

@Get('health')
@ApiOperation({ summary: 'Verify the health of the microservice (Target Group AWS)' })
checkHealth() {
  return {
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  };
}

  @ApiOperation({ summary: 'Register a new user in the system' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      statusCode: 201,
      message: 'User registered successfully',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Login and obtain access tokens' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      statusCode: 200,
      message: 'User logged in successfully',
      data: result,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the profile of the authenticated user' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      statusCode: 200,
      message: 'User profile retrieved',
      data: req.user,
    };
  }

  // ==========================================================
  // NUEVO ENDPOINT INTERNO (Para comunicación con Enrollment)
  // ==========================================================
  @ApiOperation({
    summary: 'Internal use: Get user profile by ID for other microservices',
  })
  @Get('profile/:id')
  async getUserProfileById(@Param('id') id: string) {
    // IMPORTANTE: Asegúrate de tener un método 'findById' en tu auth.service.ts
    // Si tu método se llama distinto (como 'findOne' o 'getUserById'), cámbialo aquí.
    const user = await this.authService.findById(id);

    // Lo retornamos directamente (sin el wrapper de statusCode/data)
    // para que el desestructurado de Axios en enrollment.service.ts funcione perfecto
    return user;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return {
      statusCode: 200,
      message: 'User logged out successfully',
    };
  }

  @ApiOperation({ summary: 'Validate if a JWT token is still valid' })
  @Post('validate-token')
  async validateToken(@Body() data: { token: string }) {
    const isValid = await this.authService.validateToken(data.token);
    return {
      statusCode: 200,
      message: 'Token validation completed',
      data: { isValid },
    };
  }

  @ApiOperation({
    summary: 'Refresh the access token using the Refresh Token',
  })
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
