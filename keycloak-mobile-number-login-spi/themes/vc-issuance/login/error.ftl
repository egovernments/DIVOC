<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "form">
        <div class="form-wrapper">
            <div class="ndear-login-wrapper">
                <div id="kc-error-message">
                    <p class="instruction">${message.summary?no_esc}</p>
                    <#if client?? && client.baseUrl?has_content>
                        <div class="${properties.kcFormOptionsWrapperClass!}">
                            <span><a id="backToApplication" href="${client.baseUrl}">${kcSanitize(msg("backToApplication"))?no_esc}</a></span>
                        </div>
                    </#if>
                </div>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>