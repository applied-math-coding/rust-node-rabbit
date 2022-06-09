extern crate dotenv;
mod hanoi;
use amiquip::{
    AmqpProperties, Connection, ConsumerMessage, ConsumerOptions, Exchange, Publish,
    QueueDeclareOptions,
};
use dotenv::dotenv;
use num_cpus;
use rayon;
use serde_json::json;
use std::env;

fn main() {
    dotenv().ok();
    let pool = setup_pool();
    setup_hanoi_queue(&pool);
}

fn setup_pool() -> rayon::ThreadPool {
    rayon::ThreadPoolBuilder::new()
        .num_threads(num_cpus::get())
        .build()
        .unwrap()
}

fn setup_connection() -> Connection {
    if let Ok(c) = Connection::insecure_open(&format!(
        "amqp://{}:{}@{}:{}",
        env::var("RABBITMQ_USER").unwrap(),
        env::var("RABBITMQ_PWD").unwrap(),
        env::var("RABBITMQ_HOST").unwrap(),
        env::var("RABBITMQ_PORT").unwrap()
    )) {
        println!("Connected to rabbitmq!");
        c
    } else {
        println!("Failed to connect to rabbitmq. Will retry in 2s.");
        std::thread::sleep(std::time::Duration::from_secs(2));
        setup_connection()
    }
}

fn setup_hanoi_queue(pool: &rayon::ThreadPool) {
    let mut connection = setup_connection();
    let channel = connection.open_channel(None).unwrap();
    let queue = channel
        .queue_declare("hanoi", QueueDeclareOptions::default())
        .unwrap();
    let consumer = queue.consume(ConsumerOptions::default()).unwrap();
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
                let channel_for_msg = connection.open_channel(None).unwrap();
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
                consumer.ack(delivery).unwrap();
            }
            other => {
                println!("Consumer ended: {:?}", other);
                println!("Will try to reset connection in 2s.");
                std::thread::sleep(std::time::Duration::from_secs(2));
                break;
            }
        }
    }
    setup_hanoi_queue(pool);
}
