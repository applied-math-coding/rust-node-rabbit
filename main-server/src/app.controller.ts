import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/hanoi')
  getHello(@Query('n') n: number): Promise<string> {
    return this.appService.makeHanoi(n);
  }
}
