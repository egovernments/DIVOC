<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true; section>
    <#if section = "header">
        ${msg("emailVerifyTitle")}
    <#elseif section = "form">
    <div class="form-wrapper">
        <div class="ndear-login-wrapper">
            <div class="ndear-login-card-wrapper w-100">
            <div class="success-response">
                <img src="${url.resourcesPath}/img/check_circle_outline.png">
                <p class="instruction">${msg("emailVerifyInstruction1")}</p>
            </div>
            <div id="kc-form-buttons" class="${properties.kcFormGroupClass!} w-50">
                <form>
                    <button  class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" formaction="${client.baseUrl}">Back to Login</button>
                </form>
            </div>
            </div>
        </div>
    </div>
    <#elseif section = "info">
        <p class="instruction">
            ${msg("emailVerifyInstruction2")}
            <br/>
            <a href="${url.loginAction}">${msg("doClickHere")}</a> ${msg("emailVerifyInstruction3")}
        </p>
    </#if>
</@layout.registrationLayout>