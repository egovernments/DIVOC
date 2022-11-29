<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        ${msg("loginAccountTitle")}
<#elseif section = "form">
    <script>
        function validateForm()
            {
                const email = document.forms["form"]["username"].value;
                const emailformat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(email.match(emailformat)){
                    return true;
                }else{
                    document.getElementById("invalidForm").innerHTML = '<div class="alert-box error-alert"><div class="alert-heading"><img src="${url.resourcesPath}/img/vector-alert.png" alt="">Alert!</div><div class="alert-message fst-italic">Please enter a valid email address!</div></div>';
                    return false;
                }              
            }
    </script>
    <div class="form-wrapper">
        <div class="ndear-login-wrapper">
        <div id="kc-form" class="ndear-login-card-wrapper">
            <div class="keycloak-form">
                <p class="login-title">Login to Administrator Portal</p>
                <div id="kc-form-wrapper">
                    <#if realm.password>
                        <form id="kc-form-login" onsubmit="return validateForm();" name="form" action="${url.loginAction}"
                              method="post" >
                            <div class="${properties.kcFormGroupClass!}">
                                <label for="username"
                                       class="${properties.kcLabelClass!}">${msg("email")}</label>

                                <#if usernameEditDisabled??>
                                    <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username"
                                           value="${(login.username!'')}" type="text" disabled/>
                                <#else>

                                    <div class="input-wrapper">
                                        <div class="input-field mobile">
                                            <input tabindex="1" id="username" class="${properties.kcInputClass!}"
                                                   name="username" value="${(login.username!'')}" type="text" autofocus
                                                   autocomplete="off"
                                            />
                                        </div>

                                    </div>
                                </#if>
                            </div>

                            <div class="${properties.kcFormGroupClass!}">
                                <label for="password" class="${properties.kcLabelClass!}">${msg("password")}</label>
                                <div class="input-wrapper">
                                    <div class="input-field mobile">
                                        <input tabindex="2" id="password" class="${properties.kcInputClass!}"
                                               name="password" type="password" autocomplete="off"
                                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="${properties.kcFormGroupClass!} ${properties.kcFormSettingClass!}">
                                <div id="kc-form-options">
                                    <#if realm.rememberMe && !usernameEditDisabled??>
                                        <div class="checkbox">
                                            <label>
                                                <#if login.rememberMe??>
                                                    <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"
                                                           checked> ${msg("rememberMe")}
                                                <#else>
                                                    <input tabindex="3" id="rememberMe" name="rememberMe"
                                                           type="checkbox"> ${msg("rememberMe")}
                                                </#if>
                                            </label>
                                        </div>
                                    </#if>
                                </div>

                            </div>

                            <div id="kc-form-buttons" class="${properties.kcFormGroupClass!}">
                                <input type="hidden" id="id-hidden-input" name="credentialId"
                                       <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                                <input tabindex="4"
                                       class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                                       name="login" id="kc-login" type="submit" value="${msg("doLogIn")}"/>
                            </div>
                            <div class="${properties.kcFormOptionsWrapperClass!} text-center">
                                <#if realm.resetPasswordAllowed>
                                    <span><a tabindex="5"
                                            href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a></span>
                                </#if>
                            </div>
                        </form>
                        <div id="invalidForm"></div>
                    </#if>
                    <#if  message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                        <div class="pf-c-alert__icon">
                            <#if message.type = 'success'>
                                <div class = "alert-box success-alert">
                                    <div class="alert-heading"><img src="${url.resourcesPath}/img/vector-check-circle.png" alt=""> Email Sent</div>
                                    <div class="alert-message p-1">
                                        <div>An email has been sent to "${(login.username!'')}" with instructions for resetting the password. Please check your inbox.</div>
                                        <div class="fw-bolder fst-italic p-1">Didn’t get a reset link?</div>
                                        <div class="fw-lighter p-1">
                                            <ol>
                                                <li>Check your spam folder</li>
                                                <li>Check the spelling</li>
                                                <li>Wait few minutes before trying again.</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </#if>
                            <#if message.type = 'warning'>
                                <div class = "alert-box warning-alert">
                                    <span class="${properties.kcFeedbackWarningIcon!}"></span>
                                    <span >${kcSanitize(message.summary)?no_esc}</span>
                                </div>
                            </#if>
                            <#if messagesPerField.existsError('username','password')>
                                <div class = "alert-box error-alert">
                                    <div class="alert-heading"><img src="${url.resourcesPath}/img/vector-alert.png" alt=""> Alert!</div>
                                    <div class="alert-message">${kcSanitize(message.summary)?no_esc}</div>
                                </div>
                            </#if>
                            <#if message.type = 'info'>
                                <div class = "alert-box info-alert">
                                    <span class="${properties.kcFeedbackInfoIcon!}"></span>
                                    <span>${kcSanitize(message.summary)?no_esc}</span>
                                </div>
                            </#if>
                        </div>

                    </#if>
                </div>
            </div>
            
            <#if realm.password && social.providers??>
                <div id="kc-social-providers" class="${properties.kcFormSocialAccountSectionClass!}">
                    <hr/>
                    <h4>${msg("identity-provider-login-label")}</h4>

                    <ul class="${properties.kcFormSocialAccountListClass!} <#if social.providers?size gt 3>${properties.kcFormSocialAccountListGridClass!}</#if>">
                        <#list social.providers as p>
                            <a id="social-${p.alias}"
                               class="${properties.kcFormSocialAccountListButtonClass!} <#if social.providers?size gt 3>${properties.kcFormSocialAccountGridItem!}</#if>"
                               type="button" href="${p.loginUrl}">
                                <#if p.iconClasses?has_content>
                                    <i class="${properties.kcCommonLogoIdP!} ${p.iconClasses!}" aria-hidden="true"></i>
                                    <span class="${properties.kcFormSocialAccountNameClass!} kc-social-icon-text">${p.displayName!}</span>
                                <#else>
                                    <span class="${properties.kcFormSocialAccountNameClass!}">${p.displayName!}</span>
                                </#if>
                            </a>
                        </#list>
                    </ul>
                </div>
            </#if>
            
        </div>
        <div class="image-wrapper ">
                <img class="auth-flow-images" src="${url.resourcesPath}/img/vc-tenant-login-image.png" alt="">
        </div>
        </div>
            </div>
    <#elseif section = "info" >
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-registration-container">
                <div id="kc-registration">
                    <span>${msg("noAccount")} <a tabindex="6"
                                                 href="${url.registrationUrl}">${msg("doRegister")}</a></span>
                </div>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
