
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('email') displayInfo=realm.resetPasswordAllowed; section>
    <#if section = "header">
        ${msg("loginAccountTitle")}
    <#elseif section = "form">
        <h3>Forgot Password?</h3>
        <div id="kc-form" class="ndear-login-card-wrapper w-100">
            <div id="kc-form-wrapper">
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}"  onclick="window.location.reload()" method="post">
                        <div class="${properties.kcFormGroupClass!}">
                            <label for="email"
                                   class="${properties.kcLabelClass!}">${msg("registeredEmail")}</label>

                                <div class="input-wrapper">
                                    <div class="input-field mobile">
                                        <input tabindex="1" id="email" class="${properties.kcInputClass!}"
                                               name="email" value="${(login.email!'')}" type="text" autofocus
                                               autocomplete="off"
                                               aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                                        />
                                    </div>

                                </div>

                                <#if messagesPerField.existsError('email')>
                                    <span id="input-error" class="${properties.kcInputErrorMessageClass!}"
                                          aria-live="polite">
                                          ${kcSanitize(messagesPerField.getFirstError('email'))?no_esc}
                                    </span>
                                </#if>
                        </div>

                        <div id="kc-form-buttons" class="${properties.kcFormGroupClass!}">
                            <input type="hidden" id="id-hidden-input" name="credentialId"
                                   <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                            <input tabindex="2"
                                   class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                                   name="submit" id="kc-submit" type="submit" value="${msg("doSubmit")}"/>
                        </div>
                    </form>
            </div>

        </div>

    </#if>

</@layout.registrationLayout>
