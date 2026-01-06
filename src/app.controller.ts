import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import {
  GetCurrentUser,
  CurrentUser,
} from './auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtected(@GetCurrentUser() user: CurrentUser) {
    return {
      message: 'This is a protected route',
      user,
    };
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminOnly(@GetCurrentUser() user: CurrentUser) {
    return {
      message: 'This is an admin-only route',
      user,
    };
  }
}
