FROM rust:1.60 AS server
WORKDIR /app
COPY . .
RUN cargo build --release
CMD ["./target/release/calc-engine"]