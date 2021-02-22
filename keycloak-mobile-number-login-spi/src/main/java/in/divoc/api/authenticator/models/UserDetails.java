package in.divoc.api.authenticator.models;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class UserDetails {
    private String id;
    private String userName;
    private String firstName;
    private String lastName;
    private Boolean enabled;
    private Map<String, List<String>> attributes;
    private List<UserGroup> groups;

    public UserDetails(String id, String userName, String firstName, String lastName,boolean enabled, Map<String, List<String>> attributes, List<UserGroup> groups) {
        this.id = id;
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.enabled = enabled;
        this.attributes = attributes;
        this.groups = groups;
    }

    public String getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getUserName() {
        return userName;
    }

    public String getLastName() {
        return lastName;
    }

    public Boolean isEnabled() {
        return enabled;
    }

    public Map<String, List<String>> getAttributes() {
        return attributes;
    }

    public List<UserGroup> getGroups() {
        return groups;
    }
}
