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
    * Verify the state of containers. All containers should be up.

    * Some services might fail to start because the dependent service might not be ready yet. 
    Restarting the failed service should start it successfully in this case.

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

    #### DIVOC Walkthrough
    
    In this section we will go through the steps involved in a typical flow. Starting from
    setting up facilities to generating a certificate after vaccination.
    
    * Create `admin` and `controller` users in Keycloak
    
        * Login to Keycloak console (`localhost/auth/admin`) as `admin` (password : `admin`)
        * Click on `Users` in Manage section on the left pane and click on `Add User`
        * Give username as 0000000000 and click on save
        * In the `Attributes` section, Add new key as `mobile_number` and value as 0000000000. Click on Add and save
        * Go to Role Mappings section and select `facility-admin-portal`. Add `admin` and `controller` roles.
        * Visit `localhost/portal` and login with mobile number `0000000000` and OTP `1234`
        * You should be able to access `localhost/portal/admin` and `localhost/portal/facility_admin`
    
    * Upload Facilities.csv
    
        * Go to Admin portal (`localhost/portal/admin`)
        * Click on Facilities tab and click on `Download Template .csv`
        * Click on `Upload CSV` button and upload the downloaded csv
        * You should see the success message for at least facility
    
    * Create a Vaccine
    
        * Click on Vaccines tab. Fill in all the fields on the form, mark status as Active and click on save
        * You should see the new vaccine on the right pane in the list of registered medicines/vaccines
    
    * Create a Vaccination Program
    
        * Click on Vaccine Program tab. Fill in all the fields on the form, mark status as Active and click on save
         * You should see the new vaccine program on the right pane in the list of registered vaccine programs
        
    * Activate Facilities for Vaccination program
    
        * Visit Controller portal (`localhost/portal/facility_controller`)
        * In the Facility Activation tab, select vaccination program added in the previous step, select type of facility as Govt and status as active.
        * You should be able to see at least one facility in the search results.
        * Click on the checkbox for the relevant facility (make note of facility code) and click on `MAKE ACTIVE`
        * The activated facility should disappear from the search results
        
    * Add facility_staff user
    
        * Get admin mobile number for the facility code (noted in the previous step), from the `facilities.csv` uploaded.
        * Login to Facility Admin portal (`localhost/portal/facility_admin`) using the mobile number and OTP: 1234
        * Click on Role Setup tab and click on add role icon
        * Create a role with type `facility staff` and mobile number `1111111111`. Set status as enabled and set rate of 50 
          for the vaccination program
        * Logout and login to Facility app (`localhost/facility_app`) using the mobile number of role created
    
    * Enrolling & Certifying Recipients
    
        * In the facility app click on enroll recipient, fill all the details and proceed
        * Click on Recipient Queue, to proceed for certification
        
    * Bulk Certification
    
        * Certificates can also be issued in bulk by facility admin by uploading a CSV file on Facility Admin Portal
        * Login to portal as Facility Admin, go to Upload Vaccination details tab and click on the download CSV template button
        * Now upload a CSV file, containing all the fields in the template
        
    * Pre-Enroll & Certify
    
        * Recipients can be pre-enrolled on Admin portal. Login as Admin on Portal, Click on Pre-Enrollment
        * Upload a CSV file containing all the fields given in the template (view by clicking on DOWNLOAD TEMPLATE CSV)
        * Login to facility app and click on `Verify Recipient` to proceed for vaccination
        
    * Public App
      
        * Visit `localhost`. Click on `Download` to view/download certificate.
        * On Public App, you can verify the certificate by scanning a QR code and report any symptoms after vaccination.

### API Documentation

1. [Admin API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/admin-portal.yaml)
2. [Vaccination API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/vaccination-api.yaml)
3. [Verification API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/divoc-verification.yaml)

### Other Documentation

Coming soon ...

