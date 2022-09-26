<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        ${msg("updatePasswordTitle")}
    <#elseif section = "form">
        <div class="${properties.kcLabelWrapperClass!}">
            <h3 class="d-flex align-items-center"><a onclick="window.history.back()"><img src="${url.resourcesPath}/img/next-btn.svg" alt="" class="pr-3"></a> Update Password</h3>
        </div>

        <form id="kc-passwd-update-form" class="${properties.kcFormClass!} ndear-login-card-wrapper w-100"
              action="${url.loginAction}" method="post">
            <input type="text" id="username" name="username" value="${username}" autocomplete="username"
                   readonly="readonly" style="display:none;"/>
            <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;"/>
            
             <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="password-new" class="${properties.kcLabelClass!}">${msg("passwordNew")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <div class="input-wrapper">
                        <div class="input-field mobile">
                            <input type="password" id="password-new" name="password-new"
                                   class="${properties.kcInputClass!}"
                                   autofocus autocomplete="new-password"
                                   aria-invalid="<#if messagesPerField.existsError('password-new')>true</#if>"
                            />

                        </div>
                    </div>
                    <div>
                            <label for="password-new" id="pass-new-message" class="${properties.kcPasswordStrengthmessage!}">${msg("passwordStrengthMessage")}</label>
                     </div>
                     <#if messagesPerField.existsError('password-new')>
                        
                             <span id="input-error-password" class="${properties.kcInputErrorMessageClass!}"
                              aria-live="polite">
                                ${kcSanitize(messagesPerField.get('password-new'))?no_esc}
                            
                        </div>
                    </#if>
                </div>
            </div>
           
            

            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="password-confirm" class="${properties.kcLabelClass!}">${msg("passwordConfirm")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <div class="input-wrapper">
                        <div class="input-field mobile">
                            <input type="password" id="password-confirm" name="password-confirm"
                                   class="${properties.kcInputClass!}"
                                   autocomplete="new-password"
                                   aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                            />
                        </div>
                    </div>

                    <#if messagesPerField.existsError('password-confirm')>
                        <span id="input-error-password-confirm" class="${properties.kcInputErrorMessageClass!}"
                              aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                        </span>
                    </#if>

                </div>
            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
                        <#if isAppInitiatedAction??>
                            <div class="checkbox">
                                <label><input type="checkbox" id="logout-sessions" name="logout-sessions" value="on"
                                              checked> ${msg("logoutOtherSessions")}</label>
                            </div>
                        </#if>
                    </div>
                </div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <#if isAppInitiatedAction??>
                        <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}"
                               type="submit" value="${msg("doUpdate")}"/>
                        <button
                        class="${properties.kcButtonClass!} ${properties.kcButtonDefaultClass!} ${properties.kcButtonLargeClass!}"
                        type="submit" name="cancel-aia" value="true" />${msg("doCancel")}</button>
                    <#else>
                        <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                               type="submit" value="${msg("doUpdate")}"/>
                    </#if>
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>