<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','email','firstName','lastName'); section>
    <#if section = "header">
        ${msg("loginProfileTitle")}
    <#elseif section = "form">
        <div class="${properties.kcLabelWrapperClass!}">
            <h3 class="d-flex align-items-center"><a onclick="window.history.back()"><img
                            src="${url.resourcesPath}/img/next-btn.svg" alt="" class="pr-3"></a> Update Profile</h3>
        </div>
        <form id="kc-update-profile-form" class="${properties.kcFormClass!} ndear-login-card-wrapper w-100"
              action="${url.loginAction}" method="post">
            <#if user.editUsernameAllowed>
                <div class="${properties.kcFormGroupClass!}">
                    <div class="${properties.kcLabelWrapperClass!}">
                        <label for="username" class="${properties.kcLabelClass!}">${msg("username")}</label>
                    </div>
                    <div class="${properties.kcInputWrapperClass!}">
                        <div class="input-wrapper">
                            <div class="input-field mobile">
                                <input type="text" id="username" name="username" value="${(user.username!'')}"
                                       class="${properties.kcInputClass!}"
                                       aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                                />
                            </div>
                        </div>
                        <#if messagesPerField.existsError('username')>
                            <span id="input-error-username" class="${properties.kcInputErrorMessageClass!}"
                                  aria-live="polite">
                                ${kcSanitize(messagesPerField.get('username'))?no_esc}
                            </span>
                        </#if>
                    </div>
                </div>
            </#if>
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="email" class="${properties.kcLabelClass!}">${msg("email")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <div class="input-wrapper">
                        <div class="input-field mobile">
                            <input type="text" id="email" name="email" value="${(user.email!'')}"
                                   class="${properties.kcInputClass!}"
                                   aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                            />
                        </div>
                    </div>
                    <#if messagesPerField.existsError('email')>
                        <span id="input-error-email" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('email'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="firstName" class="${properties.kcLabelClass!}">${msg("firstName")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <div class="input-wrapper">
                        <div class="input-field mobile">
                            <input type="text" id="firstName" name="firstName" value="${(user.firstName!'')}"
                                   class="${properties.kcInputClass!}"
                                   aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                            />
                        </div>
                    </div>
                    <#if messagesPerField.existsError('firstName')>
                        <span id="input-error-firstname" class="${properties.kcInputErrorMessageClass!}"
                              aria-live="polite">
                            ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="lastName" class="${properties.kcLabelClass!}">${msg("lastName")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <div class="input-wrapper">
                        <div class="input-field mobile">
                            <input type="text" id="lastName" name="lastName" value="${(user.lastName!'')}"
                                   class="${properties.kcInputClass!}"
                                   aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>"
                            />
                        </div>
                    </div>
                    <#if messagesPerField.existsError('lastName')>
                        <span id="input-error-lastname" class="${properties.kcInputErrorMessageClass!}"
                              aria-live="polite">
                            ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
                    </div>
                </div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <#if isAppInitiatedAction??>
                        <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}"
                               type="submit" value="${msg("doSubmit")}"/>
                        <button
                        class="${properties.kcButtonClass!} ${properties.kcButtonDefaultClass!} ${properties.kcButtonLargeClass!}"
                        type="submit" name="cancel-aia" value="true" />${msg("doCancel")}</button>
                    <#else>
                        <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                               type="submit" value="${msg("doSubmit")}"/>
                    </#if>
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
