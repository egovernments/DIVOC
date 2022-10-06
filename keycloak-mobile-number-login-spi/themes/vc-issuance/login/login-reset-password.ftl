<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true; section>
    <#if section = "title">
        ${msg("doForgotPassword")}
    <#elseif section = "header">
        ${msg("doForgotPassword")}
    <#elseif section = "form">
        <form id="kc-reset-password-form" class="form reset-password ${properties.kcFormClass!}" action="${url.loginAction}" method="post">
            <div class="reset-password-field ${properties.kcFormGroupClass!}">

                <div class="${properties.kcLabelClass!}">
                    <i tabindex="-1" role="button">person</i>
                    <input required id="username" class="mdc-text-field__input ${properties.kcInputClass!}" name="username" type="text" autofocus>
                    <div class="${properties.kcLabelWrapperClass!}">
                        <label for="username" class="mdc-floating-label ${properties.kcLabelClass!}">${msg("username")?no_esc}</label>
                    </div>
                    <div class="mdc-notched-outline">
                        <svg>
                            <path class="mdc-notched-outline__path"/>
                        </svg>
                    </div>
                    <div class="mdc-notched-outline__idle"></div>
                </div>

            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
                        <span>
                            <#--  <a class="btn btn-default btn-flat btn-block" href="${url.loginUrl}"><i class="fa fa-caret-left"></i>&nbsp;&nbsp;${msg("backToLogin")}</a>  -->
                            <button class="mdc-button" onclick="window.location.href = ${url.loginUrl}" formnovalidate>
                                <i class="material-icons mdc-button__icon" aria-hidden="true">arrow_back</i>
                                ${msg("backToLogin")?no_esc}
                            </button>
                        </span>
                    </div>
                </div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <#--  <input class="btn btn-primary btn-flat btn-block ${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}" type="submit" value="${msg("doSubmit")}"/>  -->
                    <button class="mdc-button mdc-button--raised ${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}" type="submit">
                        ${msg("doSubmit")?no_esc}
                    </button>
                </div>
            </div>
            <div class="clearfix"></div>
        </form>
    <#elseif section = "info" >
        <hr />
        ${msg("emailInstruction")?no_esc}
    </#if>
</@layout.registrationLayout>