package in.divoc.api.authenticator;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

public class KafkaService {
    private static KafkaProducer producer;
    private static KafkaService kafkaService;

    private KafkaService() {
        Map<String, String> map = new HashMap<>();
        map.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, System.getenv("KAFKA_BOOTSTRAP_SERVERS"));
        producer = new KafkaProducer(map, new StringSerializer(), new StringSerializer());
    }

    public static KafkaService createKafkaService() {
        if(kafkaService == null) {
            kafkaService = new KafkaService();
        }
        return kafkaService;
    }

    public void sendMessage(String notificationMessage) throws UnsupportedEncodingException {
        final String OTP_TOPIC = "notify";
        producer.send(new ProducerRecord<>(OTP_TOPIC, null, notificationMessage));
    }
}
