package in.divoc.api.authenticator.executor;

import in.divoc.api.authenticator.OtpService;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.util.Optional;

import static in.divoc.api.authenticator.Constants.*;

public class LoginFormExecutor implements FormExecutor{
    private final OtpService otpService = new OtpService();
    @Override
    public void execute(MultivaluedMap<String, String> formData, AuthenticationFlowContext context) {
        String mobileNumber = formData.getFirst(MOBILE_NUMBER);
        RealmModel realmModel = context.getSession().getContext().getRealm();
        Optional<UserModel> optUser = context.getSession().users()
                .searchForUserByUserAttribute(MOBILE_NUMBER, mobileNumber, realmModel)
                .stream().findFirst();
        optUser.ifPresentOrElse(user -> {
            if (context.getProtector().isTemporarilyDisabled(context.getSession(), realmModel, user)) {
                Response challengeResponse = context.form()
                        .setError(USER_TEMPORARY_DISABLED, realmModel.getMaxDeltaTimeSeconds()/TIME, UNIT)
                        .createForm(ERROR_UI);
                context.failure(AuthenticationFlowError.USER_TEMPORARILY_DISABLED, challengeResponse);
                return;
            }
            String otp = otpService.sendOtp(mobileNumber);
            context.getAuthenticationSession().setAuthNote(OTP, otp);
            context.setUser(user);
            context.challenge(context.form().createForm(VERIFY_OTP_UI));
        }, () -> context.failure(AuthenticationFlowError.INVALID_USER));
    }
}
