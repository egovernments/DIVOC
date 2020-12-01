package in.divoc.api.authenticator;

import in.divoc.api.authenticator.models.UserDetails;
import in.divoc.api.authenticator.models.UserGroup;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.keycloak.models.GroupModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.UserModel;
import org.keycloak.services.managers.AppAuthManager;
import org.keycloak.services.managers.AuthenticationManager;
import org.keycloak.services.resource.RealmResourceProvider;
import org.keycloak.utils.MediaType;

import javax.ws.rs.*;
import java.util.List;
import java.util.stream.Collectors;

public class FacilityUserRestProvider implements RealmResourceProvider {
    private static final String FACILITY_CODE = "facility_code";
    private final KeycloakSession session;


    public FacilityUserRestProvider(KeycloakSession session) {
        this.session = session;

    }


    public void close() {

    }

    public Object getResource() {
        return this;
    }

    @GET
    @Path("{facility_code}/users")
    @NoCache
    @Produces({MediaType.APPLICATION_JSON})
    @Encoded
    public List<UserDetails> getUsers(@PathParam("facility_code") String facilityCode) {
        verifyToken();
        List<UserModel> userModels = session.users().searchForUserByUserAttribute(FACILITY_CODE, facilityCode, session.getContext().getRealm());
        return userModels.stream().map(this::toUserDetail).collect(Collectors.toList());
    }
    private UserDetails toUserDetail(UserModel um) {
        List<UserGroup> userGroups = um.getGroups().stream().map(this::toUserGroup).collect(Collectors.toList());
        return new UserDetails(um.getUsername(), um.getFirstName(), um.getLastName(), um.getAttributes(), userGroups);
    }
    private UserGroup toUserGroup(GroupModel groupModel) {
        return new UserGroup(groupModel.getId(), groupModel.getName());
    }
    private void verifyToken() {
        final AuthenticationManager.AuthResult auth = new AppAuthManager().authenticateBearerToken(session);
        if (auth == null) {
            throw new NotAuthorizedException("Bearer");
        }
    }

}