package in.divoc.api.authenticator.executor;

import org.keycloak.authentication.AuthenticationFlowContext;

import javax.ws.rs.core.MultivaluedMap;

public interface FormExecutor {
    void execute(MultivaluedMap<String, String> formData, AuthenticationFlowContext context);
}
