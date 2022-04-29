package in.divoc.api.authenticator;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.divoc.api.authenticator.models.NotificationMessage;
import org.jboss.logging.Logger;

import java.io.UnsupportedEncodingException;
import java.util.Random;

public class OtpService {
    private static final Logger logger = Logger.getLogger(OtpService.class);
    private final KafkaService kafkaService;

    public OtpService(KafkaService kafkaService) {
        this.kafkaService = kafkaService;
    }

    public void sendOtp(String recipient, String message) throws UnsupportedEncodingException, JsonProcessingException {
        NotificationMessage notificationMessage = new NotificationMessage(recipient, message, message);
        System.out.println(notificationMessage.convertToJsonString());
        this.kafkaService.sendMessage(notificationMessage.convertToJsonString());
    }

    public String createOtp(String mobileNumber) {
        if(System.getenv("ENABLE_KAFKA").equalsIgnoreCase("true")) {
            Random rand = new Random();
            String otp = String.format("%04d", rand.nextInt(10000));
            logger.infov("OTP {0} is sent for mobile number {1}", otp, mobileNumber);
            return otp;
        }
        return "1234";
    }
}
