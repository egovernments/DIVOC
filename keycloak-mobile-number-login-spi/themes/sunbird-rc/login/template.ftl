<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">

    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex, nofollow">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
              integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
              crossorigin="anonymous">
        <link rel="stylesheet" href=""/>
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
                integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
                crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
                integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
                crossorigin="anonymous"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
                integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
                crossorigin="anonymous"></script>
        <script>
            window.onload = function (e) {
                var errorElement = document.getElementById("kc-error-message");
                if (errorElement) {
                    if (errorElement.innerText.toLowerCase().includes("invalid username")) {
                        document.getElementsByTagName("body")[0].innerHTML = "Redirecting to " +"${properties.signupLink!}"
                        window.location = "${properties.signupLink!}"
                    }
                }
            }
        </script>
        <title><#nested "title"></title>
        <#if properties.styles?has_content>
            <#list properties.styles?split(' ') as style>
                <link href="${url.resourcesPath}/${style}" rel="stylesheet"/>
            </#list>
        </#if>
    </head>

    <body>
    <#if properties.showBanner = "true">
    <div class="banner">
        <span></span>
        
    </div>
    </#if>
    <nav class="navbar navbar-expand-lg navbar-light">
        <a class="navbar-brand" href="#">
            <#if properties.keycloakLogo = "NA">
                <img src="${url.resourcesPath}/img/ndearLogo.svg" alt="">
            <#else>
                <img src="${properties.keycloakLogo!}" alt="">
            </#if>


        </a>

    </nav>
<#--    <#nested "header">-->
    <div class="container-fluid ndear-wrapper">
        <div class="form-wrapper">
            <#if properties.keycloakBackgroundImage = "NA">
            <div class="container-wrapper title-wrapper" style="background-image: url(${url.resourcesPath}/img/bg.svg)">
            <#else>
            <div class="container-wrapper title-wrapper" style="background-image: url(${properties.keycloakBackgroundImage})">
            </#if>
                <h3>Login to ${properties.portalTitle!} </h3>
                <span>${properties.portalSubTitle!}</span>
            </div>
            <div class="ndear-login-wrapper container-wrapper">
                <#nested "form">
                <div class="text-center mt-3 d-none">
                    <a href="" class="register-link">Not registered? Register</a>
                </div>
            </div>
        </div>
    </div>
    <#if properties.showFooter = "true">
    <footer class="footer">
        
       
    </footer>
    </#if>
    </body>
    </html>
</#macro>
