<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password-new','password-confirm'); section>
    <#if section = "header">
        ${msg("updatePasswordTitle")}
    <#elseif section = "form">
        <div class="form-wrapper">
            <div class="${properties.kcFormOptionsWrapperClass!}">
                    <button type="submit" form="kc-passwd-update-form" name="cancel-aia" value="true" style="background:none; border:none; color:#5976D2"/>
                    <img src="${url.resourcesPath}/img/vector-arrow.png" alt=""> 
                    ${kcSanitize(msg("backToLogin"))?no_esc}</button>
            </div>
            <div class="ndear-login-wrapper">
                <div class="ndear-login-card-wrapper">
                    <div class="keycloak-form">
                    <#if isAppInitiatedAction??>
                        <p class="login-title">Change Password</p>
                    <#else>
                        <p class="login-title">Reset Password</p>
                    </#if>
                        <form id="kc-passwd-update-form" class="${properties.kcFormClass!} "
                              action="${url.loginAction}" method="post">
                            <input type="text" id="username" name="username" value="${username}" autocomplete="username"
                                   readonly="readonly" style="display:none;"/>
                            <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;"/>

                             <div class="${properties.kcFormGroupClass!}">
                                <div class="${properties.kcLabelWrapperClass!}">
                                    <label for="password-new-label" class="${properties.kcLabelClass!}">${msg("passwordNew")}</label>
                                </div>
                                <div class="${properties.kcInputWrapperClass!}">
                                    <div class="input-wrapper">
                                        <div class="input-field mobile">
                                              <input type="password" id="password-new" name="password-new"
                                                   class="${properties.kcInputClassPassword!}"
                                                   autofocus autocomplete="password-new"
                                                   aria-invalid="<#if messagesPerField.existsError('password-new')>true</#if>"
                                               />

                                        </div>
                                    </div>
                                    <div>
                                            <label for="password-new-message"
                                             id="pass-new-message"
                                             class="${properties.kcPasswordStrengthmessage!}"
                                              aria-invalid="<#if messagesPerField.existsError('password-new')>true</#if>">
                                             </label>
                                     </div>

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
                                                   class="${properties.kcInputClassConfirm!}"
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
                                        <#-- <button
                                        class="${properties.kcButtonClass!} ${properties.kcButtonDefaultClass!} ${properties.kcButtonLargeClass!}"
                                        type="submit" name="cancel-aia" value="true" />${msg("doCancel")}</button> -->
                                    <#else>
                                        <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                                               type="submit" value="${msg("doReset")}"/>
                                    </#if>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="image-wrapper">
                <#if isAppInitiatedAction??>
                        <img class="auth-flow-images" src="${url.resourcesPath}/img/vc-tenant-login-image.png" alt="">
                <#else>
                        <img class="auth-flow-images" src="${url.resourcesPath}/img/forgot_password.png" alt="">
                </#if>        
                </div>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>