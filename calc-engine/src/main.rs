mod hanoi;
use amiquip::{
    AmqpProperties, Connection, ConsumerMessage, ConsumerOptions, Exchange, Publish,
    QueueDeclareOptions, Result,
};
use num_cpus;
use serde_json::json;

fn main() -> Result<()> {
    let pool = rayon::ThreadPoolBuilder::new()
        .num_threads(num_cpus::get())
        .build()
        .unwrap();

    //TODO take url from env
    //TODO handle the error, wait 2 secs and then try to reconnect
    //TODO when connection is closed, do break from loop below and re-run this method
    let mut connection = Connection::insecure_open("amqp://guest:guest@localhost:5672")?;
    let channel = connection.open_channel(None)?;
    let queue = channel.queue_declare("hanoi", QueueDeclareOptions::default())?;
    let consumer = queue.consume(ConsumerOptions::default())?;
    for message in consumer.receiver().iter() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                let body = String::from_utf8(delivery.body.clone()).unwrap();
                let (reply_to, correlation_id) = match (
                    delivery.properties.reply_to(),
                    delivery.properties.correlation_id(),
                ) {
                    (Some(r), Some(c)) => (r.clone(), c.clone()),
                    _ => {
                        println!("received delivery without reply_to or correlation_id");
                        continue;
                    }
                };
                let channel_for_msg = connection.open_channel(None)?;
                pool.spawn(move || {
                    let exchange = Exchange::direct(&channel_for_msg);
                    exchange
                        .publish(Publish::with_properties(
                            json!(hanoi::hanoi(body.parse().unwrap(), 0, 2))
                                .to_string()
                                .as_bytes(),
                            reply_to,
                            AmqpProperties::default().with_correlation_id(correlation_id),
                        ))
                        .unwrap();
                });
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
