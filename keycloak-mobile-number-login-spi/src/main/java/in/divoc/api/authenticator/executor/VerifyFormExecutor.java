package in.divoc.api.authenticator.executor;

import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

import java.util.Optional;

import static in.divoc.api.authenticator.Constants.*;

public class VerifyFormExecutor implements FormExecutor{
    @Override
    public void execute(MultivaluedMap<String, String> formData, AuthenticationFlowContext context) {
        Optional<String> optSessionKey = Optional.ofNullable(context.getAuthenticationSession().getAuthNote(OTP));
        optSessionKey
                .ifPresentOrElse(sessionKey -> this.verifyOTP(sessionKey, formData, context),
                        () -> context.challenge(context.form().createForm(MOBILE_LOGIN_UI))
                );
    }

    private void verifyOTP(String sessionKey, MultivaluedMap<String, String> formData, AuthenticationFlowContext context) {
        Optional<String> optSecret = Optional.ofNullable(formData.getFirst(OTP));
        optSecret.ifPresentOrElse(secret -> {
            if(secret.equals(sessionKey)) {
                context.success();
                return;
            }
            Response invalidCredentialResponse = context.form()
                                                    .setError(INVALID_OTP_ERROR)
                                                    .createForm(ERROR_UI);
            context.failure(AuthenticationFlowError.INVALID_CREDENTIALS, invalidCredentialResponse);
        }, () -> context.failure(AuthenticationFlowError.INVALID_CREDENTIALS));
    }
}
