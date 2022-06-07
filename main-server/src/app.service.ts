import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib/callback_api';
import { MessageService } from './message.service';

@Injectable()
export class AppService {

  constructor(private messageService: MessageService) { }

  makeHanoi(n: number): Promise<string> {
    return this.messageService.sendMessage(n);
  }
}
