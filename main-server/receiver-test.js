var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(
        function (error1, channel) {
            if (error1) {
                throw error1;
            }
            var queue = 'hanoi';
            channel.assertQueue(queue, {
                durable: false
            });
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
            channel.consume(queue, function (msg) {
                console.log(" [x] Received %s", msg.content.toString());
                channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from('test response'),
                    {
                        correlationId: msg.properties.correlationId
                    });
                channel.ack(msg);
            });
        },
        {
            noAck: true
        }
    );
});