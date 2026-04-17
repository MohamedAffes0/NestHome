import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { PermissionsGuard } from './auth/guards/permissions.guard';

@Controller()
@UseGuards(PermissionsGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('private')
  getPrivate(): string {
    return 'Secret area 🕵️‍♂️';
  }
}
