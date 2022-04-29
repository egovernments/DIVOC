package in.divoc.api.authenticator;

import com.fasterxml.jackson.core.JsonProcessingException;
import in.divoc.api.authenticator.models.NotificationMessage;
import org.jboss.logging.Logger;

import java.io.UnsupportedEncodingException;
import java.util.Random;

public class OtpService {
    private static final Logger logger = Logger.getLogger(OtpService.class);
    private static KafkaService kafkaService;
    private static OtpService otpService;

    private OtpService() { }

    public static OtpService createOtpService() {
        if(otpService == null) {
            otpService = new OtpService();
        }
        return otpService;
    }

    public void sendOtp(String recipient, String message) throws UnsupportedEncodingException, JsonProcessingException {
        NotificationMessage notificationMessage = new NotificationMessage(recipient, message, message);
        kafkaService = KafkaService.createKafkaService();
        kafkaService.sendMessage(notificationMessage.convertToJsonString());
    }

    public String createOtp(String mobileNumber) {
        if(System.getenv("ENABLE_SEND_OTP").equalsIgnoreCase("true")) {
            Random rand = new Random();
            String otp = String.format("%04d", rand.nextInt(10000));
            logger.infov("OTP {0} is sent for mobile number {1}", otp, mobileNumber);
            return otp;
        }
        return "1234";
    }
}
