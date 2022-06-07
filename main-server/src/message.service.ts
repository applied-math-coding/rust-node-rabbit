import { Injectable } from "@nestjs/common";
import { Channel, connect, Message } from 'amqplib/callback_api';
import { BehaviorSubject, filter, first, lastValueFrom, map } from "rxjs";

@Injectable()
export class MessageService {
    private readonly HANOI_QUEUE = 'hanoi';
    private channel: Channel;
    private responseQueue: string;
    private queueResponse = new BehaviorSubject<Message>(null);

    async sendMessage(n: number): Promise<string> {
        const channel = await this.ensureChannel();
        const replyTo = await this.ensureResponseQueue(channel);
        const correlationId = this.generateUuid();
        channel.sendToQueue(
            this.HANOI_QUEUE,
            Buffer.from(`${n}`),
            {
                correlationId,
                replyTo
            });
        return lastValueFrom(
            this.queueResponse.pipe(
                filter(m => m?.properties.correlationId === correlationId),
                first(),
                map(m => m.content.toString())
            )
        );
    }

    private async ensureResponseQueue(channel: Channel): Promise<string> {
        return this.responseQueue ?? new Promise(
            (res, rej) => channel.assertQueue('', {
                exclusive: true
            }, (e, q) => {
                if (e) {
                    rej(e);
                } else {
                    if (!this.responseQueue) { // another req. could have init. it in the meantime
                        this.responseQueue = q.queue;
                        channel.consume(
                            this.responseQueue,
                            msg => this.queueResponse.next(msg),
                            { noAck: true }
                        );
                    }
                    res(this.responseQueue);
                }
            })
        );
    }

    private async ensureChannel(): Promise<Channel> {
        return this.channel ?? new Promise((res, rej) => { //TODO take host from env
            connect('amqp://localhost', (error0, connection) => {
                if (error0) {
                    rej(error0);
                }
                connection.on('close', () => {
                    this.channel = null;
                    this.responseQueue = null;
                });
                connection.createChannel((error1, channel) => {
                    if (error1) {
                        rej(error1);
                    } else {
                        if (!this.channel) { // another req. could have init. it in the meantime
                            channel.assertQueue(this.HANOI_QUEUE, {
                                durable: false
                            });
                            this.channel = channel;
                        }
                        res(this.channel);
                    }
                });
            });
        });
    }

    private generateUuid(): string {
        return Math.random().toString() +
            Math.random().toString() +
            Math.random().toString();
    }

}