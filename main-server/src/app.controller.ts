import { Controller, Get, HttpException, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/hanoi')
  getHello(@Query('n', ParseIntPipe) n: number): Promise<string> {
    if (n < 1) {
      throw new HttpException(`Value for n must be positive: ${n}`, HttpStatus.BAD_REQUEST);
    }
    if (n > 13) {
      throw new HttpException(`Value for n too large: ${n}`, HttpStatus.BAD_REQUEST);
    }
    return this.appService.makeHanoi(n);
  }
}
