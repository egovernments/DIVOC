<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">

    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
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
        <title><#nested "title"></title>
        <#if properties.styles?has_content>
            <#list properties.styles?split(' ') as style>
                <link href="${url.resourcesPath}/${style}" rel="stylesheet"/>
            </#list>
        </#if>
    </head>

    <body>
    <nav class="navbar navbar-expand-lg navbar-light">
        <a class="navbar-brand" href="#">
            <img src="${url.resourcesPath}/img/nav-logo.png" width="200px" alt="">
        </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown"
                aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="#">MAP</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">HOME</a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown"
                       aria-haspopup="true" aria-expanded="false">
                        ENG
                    </a>

                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">HELP</a>
                </li>

            </ul>
        </div>
    </nav>
    <#nested "header">
    <div class="login-content" style="">
        <div class="box">
<#--            <#if displayMessage && message?has_content>-->
<#--                <div class="alert alert-${message.type}">-->
<#--                    <#if message.type = 'success'><span class="${properties.kcFeedbackSuccessIcon!}"></span></#if>-->
<#--                    <#if message.type = 'warning'><span class="${properties.kcFeedbackWarningIcon!}"></span></#if>-->
<#--                    <#if message.type = 'error'><span class="${properties.kcFeedbackErrorIcon!}"></span></#if>-->
<#--                    <#if message.type = 'info'><span class="${properties.kcFeedbackInfoIcon!}"></span></#if>-->
<#--                    <span class="message-text">${message.summary?no_esc}</span>-->
<#--                </div>-->
<#--            </#if>-->
            <div class="form-content">
                <div class="title-content">
                    <span class="form-title">System Admin Login</span>
                    <br/>
                    <span class="form-subtitle">Please Enter your Mobile Number and OTP</span>
                </div>
            <#nested "form">
            </div>
        </div>

        <div class="main-img-wrapper">
            <img class="main-img" src="${url.resourcesPath}/img/login-bg.png" alt="">
        </div>
    </div>
    <div class="footer-content">
        <div>
            <img class="footer-gov-logo" src="${url.resourcesPath}/img/mhfw.png" alt="">
            <img class="footer-gov-logo" src="${url.resourcesPath}/img/nha.png" alt="">
            <img class="footer-gov-logo" src="${url.resourcesPath}/img/meit.png" alt="">
            <img class="footer-gov-logo" src="${url.resourcesPath}/img/di.png" alt="">
        </div>
        <div>
            <span class="footer-link">Contact Us</span>
            <span class="footer-link">Term of use</span>
            <span class="footer-link">Privacy Policy</span>
        </div>
    </div>
    </body>
    </html>
</#macro>
