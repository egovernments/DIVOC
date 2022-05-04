package in.divoc.api.authenticator;

import in.divoc.api.authenticator.executor.FormExecutor;
import in.divoc.api.authenticator.executor.FormExecutorMap;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.authenticators.browser.AbstractUsernameFormAuthenticator;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

import javax.ws.rs.core.MultivaluedMap;


import static in.divoc.api.authenticator.Constants.*;

public class MobileNumberAuthenticator extends AbstractUsernameFormAuthenticator implements Authenticator {

    @Override
    public void action(AuthenticationFlowContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        String type = formData.getFirst(FORM_TYPE);
        FormExecutor executor = new FormExecutorMap().getExecutor(type);
        executor.execute(formData, context);
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