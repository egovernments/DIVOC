# keycloak-mobile-number-login

Setup:
* Build the app
  * `$ ./mvnw clean install`
* Add the jar to the Keycloak server:
  * `$ cp target/keycloak-mobile-number-login-spi-1.0-SNAPSHOT.jar _KEYCLOAK_HOME_/providers/`

* Add custom theme to the Keycloak server:
  * `$ cp themes/* _KEYCLOAK_HOME_/themes/divoc`

Configure your REALM to use the provider.
First create a new REALM (or select a previously created REALM).

Under Authentication > Flows:
* Copy 'Browse' flow to 'Mobile Number Login' flow
* Click on 'Actions > Add execution on the 'Mobile Number Login Forms' line and add the 'Mobile OTP Login'
* Set 'Mobile OTP Login' to 'REQUIRED'

Under Authentication > Bindings:
* Select 'Mobile Number Login' as the 'Browser Flow' for the REALM.
