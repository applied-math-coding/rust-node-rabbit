import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Channel, connect, Message } from 'amqplib/callback_api';
import { BehaviorSubject, filter, first, lastValueFrom, map } from "rxjs";

@Injectable()
export class MessageService {
    private readonly HANOI_QUEUE = 'hanoi';
    private channel: Channel;
    private responseQueue: string;
    private queueResponse = new BehaviorSubject<Message>(null);
    private creatingChannel = new BehaviorSubject<boolean>(false);
    private creatingResponseQueue = new BehaviorSubject<boolean>(false);

    constructor(private configService: ConfigService) { }

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
        return this.responseQueue ?? this.creatingResponseQueue.value ?
            lastValueFrom(this.creatingResponseQueue.pipe(filter(v => !v), first(), map(() => this.responseQueue))) :
            new Promise(
                (res, rej) => {
                    this.creatingResponseQueue.next(true);
                    channel.assertQueue('', {
                        exclusive: true
                    }, (e, q) => {
                        if (e) {
                            this.channel = null;
                            rej(e);
                        } else {
                            this.responseQueue = q.queue;
                            channel.consume(
                                this.responseQueue,
                                msg => this.queueResponse.next(msg),
                                { noAck: true }
                            );
                            res(this.responseQueue);
                        }
                        this.creatingResponseQueue.next(false);
                    });
                }
            );
    }

    private async ensureChannel(): Promise<Channel> {
        return this.channel ?? this.creatingChannel.value ?
            lastValueFrom(this.creatingChannel.pipe(filter(v => !v), first(), map(() => this.channel))) :
            new Promise((res, rej) => {
                this.creatingChannel.next(true);
                const [host, user, pwd, port] = [
                    this.configService.get<string>('RABBITMQ_HOST'),
                    this.configService.get<string>('RABBITMQ_USER'),
                    this.configService.get<string>('RABBITMQ_PWD'),
                    this.configService.get<string>('RABBITMQ_PORT')
                ];
                connect(`amqp://${user}:${pwd}@${host}:${port}`, (error0, connection) => {
                    if (error0) {
                        rej(error0);
                    } else {
                        connection.on('close', () => {
                            this.channel = null;
                            this.responseQueue = null;
                        });
                        connection.createChannel((error1, channel) => {
                            if (error1) {
                                rej(error1);
                            } else {
                                channel.assertQueue(this.HANOI_QUEUE, {
                                    durable: false
                                });
                                this.channel = channel;
                                res(this.channel);
                            }
                        });
                    }
                    this.creatingChannel.next(false);
                });
            });
    }

    private generateUuid(): string {
        return Math.random().toString() +
            Math.random().toString() +
            Math.random().toString();
    }

}