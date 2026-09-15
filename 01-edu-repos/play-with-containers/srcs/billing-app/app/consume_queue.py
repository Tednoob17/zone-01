import os
import pika
import json

from app.orders import create_order

RABBITMQ_USER = os.getenv('RABBITMQ_USER')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD')
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST')
RABBITMQ_PORT = os.getenv('RABBITMQ_PORT')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE')


def consume_and_store_order(engine):
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            RABBITMQ_HOST,
            RABBITMQ_PORT,
            '/',
            credentials
        )
    )
    channel = connection.channel()
    channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

    def callback(
            ch: pika.channel.Channel,
            method: pika.channel.spec.Basic.Deliver,
            properties: pika.channel.spec.BasicProperties,
            body: bytes
    ):
        print(f" [.] received: {body.decode()}")
        try:
            new_order = json.loads(body.decode())
            create_order(engine, new_order)
            print(" [x] created new order")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f" [-] error: {e}")

    channel.basic_consume(
        queue=RABBITMQ_QUEUE,
        on_message_callback=callback
    )
    channel.start_consuming()
