package in.divoc.api.authenticator.executor;

import static in.divoc.api.authenticator.Constants.LOGIN_FORM;

public class FormExecutorMap {
    public FormExecutor getExecutor(String type) {
        if(type.equals(LOGIN_FORM)) {
            return new LoginFormExecutor();
        }
        return new VerifyFormExecutor();
    }
}
