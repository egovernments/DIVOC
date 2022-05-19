package in.divoc.api.authenticator.executor;

import com.fasterxml.jackson.core.JsonProcessingException;
import in.divoc.api.authenticator.OtpService;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.util.Optional;

import static in.divoc.api.authenticator.Constants.*;

public class LoginFormExecutor implements FormExecutor{
    private final OtpService otpService;

    public LoginFormExecutor(OtpService otpService) {
        this.otpService = otpService;
    }

    @Override
    public void execute(MultivaluedMap<String, String> formData, AuthenticationFlowContext context) {
        String countryCode = Optional.ofNullable(formData.getFirst("country_code"))
                                .orElseGet(() -> "");
        String mobileNumber = formData.getFirst(MOBILE_NUMBER);
        RealmModel realmModel = context.getSession().getContext().getRealm();
        Optional<UserModel> optUser = context.getSession().users()
                .searchForUserByUserAttributeStream(realmModel, MOBILE_NUMBER, mobileNumber)
                .findFirst();
        if(System.getenv("IS_JAMAICA").equalsIgnoreCase("true")) {
            optUser = context.getSession().users()
                    .searchForUserByUserAttributeStream(realmModel, MOBILE_NUMBER, countryCode + mobileNumber)
                    .findFirst();
        }
        optUser.ifPresentOrElse(user -> {
            if (context.getProtector().isTemporarilyDisabled(context.getSession(), realmModel, user)) {
                Response challengeResponse = context.form()
                        .setError(USER_TEMPORARY_DISABLED, realmModel.getWaitIncrementSeconds()/TIME, UNIT)
                        .createForm(ERROR_UI);
                context.failure(AuthenticationFlowError.USER_TEMPORARILY_DISABLED, challengeResponse);
                return;
            }
            String otp = otpService.createOtp(mobileNumber);
            if(System.getenv("ENABLE_SEND_OTP").equalsIgnoreCase("true")) {
                String recipient = "tel:"+ countryCode + mobileNumber;
                String otpMessage = "Your otp is : " + otp;
                try {
                    otpService.sendOtp(recipient, otpMessage);
                } catch (UnsupportedEncodingException | JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
            context.getAuthenticationSession().setAuthNote(OTP, otp);
            context.setUser(user);
            context.challenge(context.form().createForm(VERIFY_OTP_UI));
        }, () -> context.failure(AuthenticationFlowError.INVALID_USER));
    }
}
