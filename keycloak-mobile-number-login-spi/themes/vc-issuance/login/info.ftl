<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <#if messageHeader??>
        ${messageHeader}
        <#else>
        ${message.summary}
        </#if>
    <#elseif section = "form">
    <div class="ndear-login-card-wrapper col-8">
        <div class="success-response">
            <img src="${url.resourcesPath}/img/check_circle_outline.png">
            <p> Password Updated Successfully!</p>
        </div>
        <div id="kc-info-message">
            <p class="instruction">Your password has been updated successfully</p>
        </div>
        <div id="kc-form-buttons" class="${properties.kcFormGroupClass!} w-50">
            <form>
                <button  class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" formaction="${client.baseUrl}">Back to Login</button>
            </form>
        </div>

    </div>
    <div class="container-wrapper title-wrapper col-4">
                <img class="w-100" src="${url.resourcesPath}/img/reset-password-success.png" alt="">
    </div>
</#if>
</@layout.registrationLayout>