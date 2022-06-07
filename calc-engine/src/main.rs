mod hanoi;
use amiquip::{
    AmqpProperties, Connection, ConsumerMessage, ConsumerOptions, Exchange, Publish,
    QueueDeclareOptions, Result,
};
use serde_json::json;

fn main() -> Result<()> {
    //TODO take url from env
    let mut connection = Connection::insecure_open("amqp://guest:guest@localhost:5672")?;
    let channel = connection.open_channel(None)?;
    let exchange = Exchange::direct(&channel);
    let queue = channel.queue_declare("hanoi", QueueDeclareOptions::default())?;
    let consumer = queue.consume(ConsumerOptions::default())?;
    for (i, message) in consumer.receiver().iter().enumerate() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                let body = String::from_utf8(delivery.body.clone()).unwrap();
                let (reply_to, correlation_id) = match (
                    delivery.properties.reply_to(),
                    delivery.properties.correlation_id(),
                ) {
                    (Some(r), Some(c)) => (r.clone(), c.clone()),
                    _ => {
                        panic!("received delivery without reply_to or correlation_id");
                    }
                };
                exchange.publish(Publish::with_properties(
                    json!(hanoi::hanoi(body.parse().unwrap(), 0, 2))
                        .to_string()
                        .as_bytes(),
                    reply_to,
                    AmqpProperties::default().with_correlation_id(correlation_id),
                ))?;
                consumer.ack(delivery)?;
            }
            other => {
                println!("Consumer ended: {:?}", other);
                break;
            }
        }
    }
    connection.close()
}