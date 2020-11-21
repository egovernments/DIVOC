package in.divoc.api.authenticator;

import org.jboss.logging.Logger;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.authenticators.browser.AbstractUsernameFormAuthenticator;
import org.keycloak.common.util.KeycloakUriBuilder;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.utils.KeycloakModelUtils;

import javax.ws.rs.core.MultivaluedMap;

import java.util.List;

import static in.divoc.api.authenticator.Constants.*;

public class MobileNumberAuthenticator extends AbstractUsernameFormAuthenticator implements Authenticator {
    private OtpService otpService = new OtpService();

    @Override
    public void action(AuthenticationFlowContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        String type = formData.getFirst(FORM_TYPE);
        if (type.equals(LOGIN_FORM)) {
            String mobileNumber = formData.getFirst(MOBILE_NUMBER);
            List<UserModel> users = context.getSession().users()
                    .searchForUserByUserAttribute(MOBILE_NUMBER, mobileNumber, context.getSession().getContext().getRealm());
            if(users.size() > 0) {
                UserModel user = users.get(0);
                String otp = otpService.sendOtp(mobileNumber);
                context.getAuthenticationSession().setAuthNote(OTP, otp);
                context.setUser(user);
                context.challenge(context.form().createForm(VERIFY_OTP_UI));
            } else {
                // Uncomment the following line to require user to register
                //user = context.getSession().users().addUser(context.getRealm(), email);
                //user.setEnabled(true);
                //user.setEmail(email);
                // user.addRequiredAction(UserModel.RequiredAction.UPDATE_PROFILE);
                context.failure(AuthenticationFlowError.INVALID_USER);
            }
        } else if (type.equals(VERIFY_OTP_FORM)) {
            String sessionKey = context.getAuthenticationSession().getAuthNote(OTP);
            if (sessionKey != null) {
                String secret = formData.getFirst(OTP);
                if (secret != null) {
                    if (secret.equals(sessionKey)) {
                        context.success();
                    } else {
                        context.failure(AuthenticationFlowError.INVALID_CREDENTIALS);
                    }
                } else {
                    context.failure(AuthenticationFlowError.INVALID_CREDENTIALS);
                }
            } else {
                context.challenge(context.form().createForm(MOBILE_LOGIN_UI));
            }
        }
    }

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        context.challenge(context.form().createForm(MOBILE_LOGIN_UI));
    }

    @Override
    public boolean requiresUser() {
        return false;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return true;
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
    }

    @Override
    public void close() {
    }

}