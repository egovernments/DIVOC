package in.divoc.api.authenticator;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;

import java.io.UnsupportedEncodingException;

public class KafkaService {
    private final KafkaProducer producer;
    private final String OTP_TOPIC = "notify";

    public KafkaService(KafkaProducer producer) {
        this.producer = producer;
    }

    public void sendMessage(String notificationMessage) throws UnsupportedEncodingException {
        producer.send(new ProducerRecord<>(OTP_TOPIC, null, notificationMessage));
    }
}
