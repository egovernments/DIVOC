package in.divoc.api.authenticator;

import com.fasterxml.jackson.databind.JsonSerializer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static in.divoc.api.authenticator.Constants.PROVIDER_DISPLAY_TEXT;
import static in.divoc.api.authenticator.Constants.PROVIDER_ID;

public class MobileNumberAuthenticatorFactory implements AuthenticatorFactory {

    private static final AuthenticationExecutionModel.Requirement[] REQUIREMENT_CHOICES = {
        AuthenticationExecutionModel.Requirement.REQUIRED,
        AuthenticationExecutionModel.Requirement.CONDITIONAL,
        AuthenticationExecutionModel.Requirement.DISABLED
    };

    @Override
    public Authenticator create(KeycloakSession session) {
        Map<String, String> map = new HashMap<>();
        map.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, System.getenv("KAFKA_BOOTSTRAP_SERVERS"));
        map.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringSerializer");
        map.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringSerializer");

        Thread.currentThread().setContextClassLoader(null);
        KafkaProducer<String, String> producer = new KafkaProducer(map);
        KafkaService kafkaService = new KafkaService(producer);
        OtpService otpService = new OtpService(kafkaService);
        return new MobileNumberAuthenticator(otpService);
    }

    @Override
    public String getId() {
        return PROVIDER_ID;
    }

    @Override
    public String getReferenceCategory() {
        return PROVIDER_ID;
    }

    @Override
    public boolean isConfigurable() {
        return false;
    }

    @Override
    public boolean isUserSetupAllowed() {
        return true;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return REQUIREMENT_CHOICES;
    }

    @Override
    public String getDisplayType() {
        return PROVIDER_DISPLAY_TEXT;
    }

    @Override
    public String getHelpText() {
        return PROVIDER_DISPLAY_TEXT;
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return null;
    }

    @Override
    public void init(Config.Scope config) {
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
    }

    @Override
    public void close() {
    }

}