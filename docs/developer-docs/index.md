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
    * [Verify the state of containers](#docker-compose-ps). All containers should be up.

    * Some services might fail to start because the dependent service might not be ready yet. 
    [Restarting the failed service](#docker-compose-restart) should start it successfully in this case.

    * On Mac/Windows services might crash with exit code : 137, if sufficient memory is not set for docker.
    This can be changed in Docker desktop preferences, resources tab as shown [here](https://docs.docker.com/docker-for-mac/#resources).


4. Explore DIVOC
    
    Below are routes to access local apps. Remaining routes can be found in `nginx/nginx.conf`

    | Address | Application |
    |---------|-------------|
    | localhost | public app |
    | localhost/portal | portal app |
    | localhost/facility_app | facility app |

### API Documentation

1. [Admin API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/admin-portal.yaml)
2. [Vaccination API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/vaccination-api.yaml)
3. [Verification API (swagger)](https://egovernments.github.io/DIVOC/developer-docs/api/admin-api.html#/divoc-verification.yaml)

### Other Documentation

Coming soon ...

