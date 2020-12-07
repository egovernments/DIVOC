<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
    <#if section = "form">
        <#if realm.password>
            <form id="kc-form-login" class="${properties.kcFormClass!}" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                <div class="${properties.kcFormGroupClass!}">
                    <div class="${properties.kcLabelWrapperClass!}">
                        <label for="mobile_number" class="${properties.kcLabelClass!}">${msg("Mobile Number")}</label>
                    </div>

                    <div class="${properties.kcInputWrapperClass!}">
                        <input tabindex="1" id="mobile_number" class="${properties.kcInputClass!}" name="mobile_number"  type="text" autofocus autocomplete="off" />
                    </div>
                </div>

                <div class="${properties.kcFormGroupClass!}">
                    <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    </div>

                    <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                        <div class="${properties.kcFormButtonsWrapperClass!}">
                            <input type="hidden" id="type-hidden-input" name="form_type" value="login"/>
                            <input tabindex="4" class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}"/>
                        </div>
                    </div>
                </div>
            </form>
        </#if>
    </#if>
</@layout.registrationLayout>