package in.divoc.api.authenticator.executor;

import in.divoc.api.authenticator.OtpService;

import static in.divoc.api.authenticator.Constants.LOGIN_FORM;

public class FormExecutorMap {
    public FormExecutor getExecutor(String type) {
        if(type.equals(LOGIN_FORM)) {
            OtpService otpService = OtpService.createOtpService();
            return new LoginFormExecutor(otpService);
        }
        return new VerifyFormExecutor();
    }
}
