## Developer Documentation

### Getting Started

In this section, we'll walk you through how to run DIVOC project on a local machine.

1. Install Docker Compose. Instructions can be found [here](https://docs.docker.com/compose/install/)

    #### Basic Docker Compose Commands    
    * <a name="docker-compose-up"></a> 
    Staring services [`docker-compose up`](https://docs.docker.com/compose/reference/up/)

    * <a name="docker-compose-restart"></a> 
    Restarting services [`docker-compose restart`](https://docs.docker.com/compose/reference/restart/)

    * <a name="docker-compose-ps"></a> 
    Checking Status of services [`docker-compose ps`](https://docs.docker.com/compose/reference/ps/)

    * <a name="docker-compose-logs"></a> 
    Monitoring service logs [`docker-compose logs`](https://docs.docker.com/compose/reference/logs/)

2. Clone DIVOC repository onto your local machine and navigate to `DIVOC` directory

    ```
    git clone git@github.com:egovernments/DIVOC.git && cd DIVOC
    ```

3. Start all services in detached mode
    ```
    docker-compose up -d
    ```
   * Verify the state of containers [`docker-compose ps`]. All containers should be up.
   * Some services might fail to start because the dependent service might not be ready yet. 
    Restarting the failed service [`docker-compose restart <service>`] should start it successfully in this case.
   * If there are multiple service failures then restart below services
     ```
     docker-compose restart certificate_processor certificate_signer digilocker_support_api notification-service portal_api vaccination_api registry
     ```
   * If going to `localhost` returns status 502, restart nginx. `docker-compose restart nginx` 
   * On Mac/Windows services might crash with exit code : 137, if sufficient memory is not set for docker.
    This can be changed in Docker desktop preferences, resources tab as shown [here](https://docs.docker.com/docker-for-mac/#resources).


4. Explore DIVOC
    
    Below are routes to access local apps. Remaining routes can be found in `nginx/nginx.conf`

    | Address | Application |
    |---------|-------------|
    | localhost | public app |
    | localhost/portal | portal app |
    | localhost/facility_app | facility app |
    | localhost/auth | keycloak |
    <p>&nbsp;</p>
    
    #### DIVOC Walkthrough

    In this section we will go through the steps involved in a typical flow. Starting from
    setting up facilities to generating a certificate after vaccination.
   
   * Set up CLIENT_SECRET for `admin-api`
      * Login to Keycloak console (`localhost/auth/admin`) as `admin` (password : `admin`)
      * Click on `Clients` in Configure section on the left pane and click on `admin-api`
      * Go to Credentials tab, click on `Regenerate Secret` and copy the new secret
      * Change the `ADMIN_API_CLIENT_SECRET` to the copied secret in `docker-compose.yml`
      * Rebuild and restart the services that use `ADMIN_API_CLIENT_SECRET`.
        ```
         docker-compose up -d --build --no-deps <service1> <service2>...
         docker-compose restart nginx
        ```
    
   * Create `admin` and `controller` users in Keycloak
   
     * Login to Keycloak console (`localhost/auth/admin`) as `admin` (password : `admin`)
     * Click on `Users` in Manage section on the left pane and click on `Add User`
     * Give the username as 0000000000 and click on save
     * In the `Attributes` section, Add new key as `mobile_number` and value as 0000000000. Click on Add and save
     * Go to Groups section, select `system admin` in the available groups and click on Join.
     * Similarly create another user with `username` and `mobile_number` as 0000000001 and join `controller` group
   
   * System Admin Activities
      * Login to portal as `system admin` [Mobile Number : 0000000000, OTP : 1234]
      * Upload Facilities.csv
        * Click on Facilities tab and click on `Download Template .csv`
        * Click on `Upload CSV` button and upload the downloaded csv
        * You should see the success message for at least facility
      * Create a Vaccine
        * Click on Vaccines tab. Fill in all the fields on the form, mark status as Active and click on save
        * You should see the new vaccine on the right pane in the list of registered medicines/vaccines
      * Create a Vaccination Program
        * Click on Vaccine Program tab. Fill in all the fields on the form, mark status as Active and click on save
        * You should see the new vaccine program on the right pane in the list of registered vaccine programs
      * Pre-Enroll Recipients
         * Click on Pre-Enrollment tab and click on `Downloaf Template .csv`
         * Click on `Upload CSV` and upload a CSV file containing all the fields given in the template
         * You should see the number of recipients successfully enrolled and errors if there are any.
      
   * Controller Activities
      * Login to portal as `controller` `[Mobile Number : 0000000001, OTP : 1234]`
      * Activate Facilities for Vaccination program
        * In the Facility Activation tab, select vaccination program added in the previous step, select type of facility as Govt and status as active.
        * You should be able to see at least one facility in the search results.
        * Click on the checkbox for the relevant facility (make note of facility code) and click on `MAKE ACTIVE`
        * The activated facility should disappear from the search results
   
   * Facility Admin Activities
      * Get admin mobile number for the facility code (noted in the previous step), from the `facilities.csv` uploaded.
      * Login to Facility Admin portal (`localhost/portal/facility_admin`) using the mobile number and OTP: 1234
      * Add facility_staff user
        * Click on Role Setup tab and click on add role icon
        * Create a role with type `facility staff` and mobile number `1111111111`. Set status as enabled and set rate of 50 
          for the vaccination program
      * Add Vaccinators
         * Click on `Vaccinator Details` tab and Click `Add Vaccinator`
         * Fill all the details. Select the vaccination program previously created in the certification dropdown.
         * Click on Add and click Back
         * Click on `Make Active` button to activate vaccinator
      * Bulk Certification
         * Certificates can also be issued in bulk by facility admin by uploading a CSV file
         * Go to Upload Vaccination details tab and click on the download CSV template button
         * Now upload a CSV file, containing all the fields in the template
         * The generated Certificates and view on the public app (`localhost`)
   
   * Facility Staff Activities
     * Login to Facility app (`localhost/facility_app`) `[Mobile Number : 1111111111, OTP : 1234]`
     * Enrolling & Certifying Recipients
        * Click on enroll recipient, fill all the details and proceed
        * Click on Recipient Queue, to proceed for certification
     * Certifying pre-enrolled recipients
        * Recipients pre-enrolled by Facility Admin can be certified by Facility staff
        * Go to App home and click on `Verify Recipient` to proceed for vaccination
     
   * Recipient Activities
     * In Public App (`localhost`), recipients can :
       * `Download`/ vaccination certificates
       * `Verify` certificates by scanning a QR code
       * `Report` any side effects/symptoms after vaccination 
     * For above operations, you would need the recipient mobile number (given during pre-enrollment/vaccination).
       Use OTP : 1234 for all logins.

### API Documentation

1. [Admin API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/admin-portal.yaml)
2. [Vaccination API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/vaccination-api.yaml)
3. [Verification API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/divoc-verification.yaml)

### Other Documentation

Coming soon ...

