<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
    <#if section = "title">
        ${msg("loginTitle",(realm.displayName!''))}
    <#elseif section = "header">
        <link href="https://fonts.googleapis.com/css?family=Muli" rel="stylesheet"/>
        <link href="${url.resourcesPath}/img/favicon.png" rel="icon"/>
        <script>
          window.onload = function (e) {
              if(window.location.protocol === "https:") {
                  let formField = document.getElementById("kc-form-login");
                  if (formField) {
                      formField.action = formField.action.replace("http:","https:");
                  }
              }
            var mobileNumber = sessionStorage.getItem("mobile_number");
            document.getElementById("mobile_number").value = mobileNumber;
            var obj = document.getElementById('otp');
            obj.addEventListener('keydown', stopCarret);
            obj.addEventListener('keyup', stopCarret);

            function stopCarret() {
              if (obj.value.length > 3) {
                setCaretPosition(obj, 3);
              }
            }

            function setCaretPosition(elem, caretPos) {
              if (elem != null) {
                if (elem.createTextRange) {
                  var range = elem.createTextRange();
                  range.move('character', caretPos);
                  range.select();
                } else {
                  if (elem.selectionStart) {
                    elem.focus();
                    elem.setSelectionRange(caretPos, caretPos);
                  } else
                    elem.focus();
                }
              }
            }
          };

        </script>
    <#elseif section = "form">

        <div class="box-container">
            <#if realm.password>
                <div>
                    <form id="kc-form-login" class="form" onsubmit="login.disabled = true; return true;"
                          action="${url.loginAction}" method="post">
                        <div id="divOuter">
                            <div id="divInner">
                                <input id="otp" autofocus type="password" name="otp" tabindex="1" maxlength="4"
                                       placeholder=""/>
                            </div>
                        </div>
                        <input type="hidden" id="type-hidden-input" name="form_type" value="verify_otp"/>
                        <input id="mobile_number"
                               type="hidden"
                               name="mobile_number"
                               tabindex="1"/>
                        <button class="submit" type="submit" tabindex="3">
                            <span>LOGIN</span>
                            <img class="login-arrow" src="${url.resourcesPath}/img/login-arrow.png" alt="">
                        </button>
                    </form>
                </div>
            </#if>


        </div>
    </#if>
</@layout.registrationLayout>
