<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <#if messageHeader??>
        ${messageHeader}
        <#else>
        ${message.summary}
        </#if>
    <#elseif section = "form">
        <div class="form-wrapper">
            <div class="ndear-login-wrapper">
                <div class="ndear-login-card-wrapper">
                    <div class="keycloak-form">
                        <div class="success-response">
                            <img src="${url.resourcesPath}/img/check_circle_outline.png">
                            <p> ${message.summary}</p>
                        </div>
                        <div id="kc-info-message">
                            <p class="instruction"><#if requiredActions??><#list requiredActions>: <b><#items as reqActionItem>${msg("requiredAction.${reqActionItem}")}<#sep>, </#items></b></#list><#else></#if></p>
                                <#if pageRedirectUri?has_content>
                                    <div class="${properties.kcFormOptionsWrapperClass!}">
                                        <span><a href="${pageRedirectUri}">${kcSanitize(msg("backToApplication"))?no_esc}</a></span>
                                    </div>
                                <#elseif actionUri?has_content>
                                    <div class="${properties.kcFormOptionsWrapperClass!}">
                                        <span><a href="${actionUri}">${kcSanitize(msg("proceedWithAction"))?no_esc}</a></span>
                                    </div>
                                <#else>
                                    <div id="kc-form-buttons" class="${properties.kcFormGroupClass!} w-50">
                                        <form>
                                            <button  class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" formaction="${client.baseUrl}">Back to Login</button>
                                        </form>
                                    </div>
                                </#if>
                        </div>
                    </div>
                </div>
                <div class="image-wrapper">
                    <img src="${url.resourcesPath}/img/reset-password-success.png" alt="">
                </div>
            </div>
        </div>
    
    </#if>
</@layout.registrationLayout>