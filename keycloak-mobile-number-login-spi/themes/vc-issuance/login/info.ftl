<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <#if messageHeader??>
        ${messageHeader}
        <#else>
        ${message.summary}
        </#if>
    <#elseif section = "form">
    <div class="ndear-login-card-wrapper">
        <div class="success-response">
            <img src="${url.resourcesPath}/img/check_circle_outline.png">
            <h3> Password Updated Successfully!</h3>
        </div>
        <div id="kc-info-message">
            <p class="instruction">Your password has been updated successfully</p>
        </div>
        <div id="kc-form-buttons" class="${properties.kcFormGroupClass!}">
            <button  class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"><a href="${url.loginUrl}">Back to Login</a></button>
        </div>
    </div>
    <div class="container-wrapper title-wrapper">
                <img class="" src="${url.resourcesPath}/img/reset-password-success.png" alt="">
    </div>
</#if>
</@layout.registrationLayout>