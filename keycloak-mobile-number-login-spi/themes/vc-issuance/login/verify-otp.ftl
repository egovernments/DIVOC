<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
    <#if section = "title">
        ${msg("loginTitle",(realm.displayName!''))}
    <#elseif section = "header">
        <link href="https://fonts.googleapis.com/css?family=Muli" rel="stylesheet"/>
        <link href="${url.resourcesPath}/img/favicon.png" rel="icon"/>
        <script>
            window.onload = function (e) {
                var mobileNumber = sessionStorage.getItem("mobile_number");
                document.getElementById("mobile_number").value = mobileNumber;
                document.getElementById("mobile-label").innerText = "Enter the code sent to " + mobileNumber;
                if(window.location.protocol === "https:") {
                    let formField = document.getElementById("kc-form-login");
                    if (formField) {
                        formField.action = formField.action.replace("http:","https:");
                    }
                }
                var timer = document.getElementById("resend-timer");
                var resentCom = document.getElementById("resend-msg");
                var timerCount = 100;

                function setTime() {
                    timer.className = "mt-2";
                    let minutes = timerCount / 60;
                    let seconds = timerCount % 60;
                    timer.innerHTML = "Resend OTP in " + (minutes < 10 ? "0" + parseInt(minutes) : parseInt(minutes)) + ":" + (seconds < 10 ? "0" + seconds : seconds)
                    timerCount--;
                }
                setTime()
                let intervalId = setInterval(() => {
                    setTime();
                }, 1000);
                setTimeout(() => {
                    clearInterval(intervalId)
                    timer.className = "mt-2 d-none";
                    resentCom.className = "mt-2";
                }, 1000 * timerCount + 1000)
            }
        </script>
    <#elseif section = "form">
        <h3 class="d-flex align-items-center"><a onclick="window.location.reload()"><img src="${url.resourcesPath}/img/next-btn.svg" alt="" class="pr-3"></a> Confirm OTP</h3>
        <div class="ndear-login-card-wrapper">
            <span id="mobile-label">Enter the code sent to </span>
            <div class="box-container">
                <#if realm.password>
                    <div>
                        <form id="kc-form-login" class="form" onsubmit="login.disabled = true; return true;"
                              action="${url.loginAction}" method="post">
                            <b class="mt-4 d-block">Enter OTP</b>
                            <div class="input-wrapper">
                                <div class="input-field mobile d-none">
                                    <label for="mobile_number" class="mobile-prefix">+91</label>
                                    <input id="mobile_number" class="login-field" placeholder="XXXXXXXXXX"
                                           type="text"
                                           name="mobile_number"
                                           tabindex="1"/>
                                </div>

                                <div class="input-field mobile">
                                    <input id="otp" class="login-field" placeholder="XXXX"
                                           type="password"
                                           name="otp" tabindex="2">
                                </div>
                            </div>
                            <div class="mt-2" id="resend-timer"></div>
                            <div class="mt-2 d-none" id="resend-msg">Didn’t receive code? <a class="register-link" onclick="window.location.reload()">Send again</a></div>
                            <input type="hidden" id="type-hidden-input" name="form_type" value="verify_otp"/>
                            <button class="submit" type="submit" tabindex="3">
                                <span>Verify</span>
                            </button>
                        </form>
                    </div>
                </#if>


            </div>
        </div>
    </#if>
</@layout.registrationLayout>
