<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
    <#if section = "title">
        ${msg("loginTitle",(realm.displayName!''))}
    <#elseif section = "header">
        <link href="https://fonts.googleapis.com/css?family=Muli" rel="stylesheet"/>
        <link href="${url.resourcesPath}/img/favicon.png" rel="icon"/>
        <script>
            window.onload = function(e){
                var mobileNumber = sessionStorage.getItem("mobile_number");
                document.getElementById("mobile_number").value= mobileNumber;
                if(window.location.protocol === "https:") {
                    let formField = document.getElementById("kc-form-login");
                    if (formField) {
                        formField.action = formField.action.replace("http","https");
                    }
                }
            }
        </script>
    <#elseif section = "form">

        <div class="box-container">
            <#if realm.password>
                <div>
                    <form id="kc-form-login" class="form" onsubmit="login.disabled = true; return true;"
                          action="${url.loginAction}" method="post">
                        <div class="input-wrapper">
                            <div class="input-field mobile">
<#--                                <label for="mobile_number" class="mobile-prefix">+251</label>-->
                                <input id="mobile_number" class="login-field" placeholder="XXXXXXXXXX"
                                       type="text"
                                       name="mobile_number"
                                       tabindex="1"/>
                            </div>

                            <div class="input-field otp">
                                <label for="otp" class="otp-prefix">OTP</label>
                                <input id="otp" class="login-field" placeholder="XX XX"
                                       type="password" autofocus
                                       name="otp" tabindex="2">
                            </div>
                        </div>
                        <input type="hidden" id="type-hidden-input" name="form_type" value="verify_otp"/>
                        <button class="submit" type="submit" tabindex="3">
                            <span>Login to Portal</span>
                            <img class="login-arrow" src="${url.resourcesPath}/img/login-arrow.png" alt="">
                        </button>
                    </form>
                </div>
            </#if>


        </div>
    </#if>
</@layout.registrationLayout>
