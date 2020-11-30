package in.divoc.api.authenticator;

import java.util.List;
import java.util.Map;

public class UserDetails {
    private String userName;
    private String firstName;
    private String lastName;
    private Map<String, List<String>> attributes;

    public UserDetails(String userName, String firstName, String lastName, Map<String, List<String>> attributes) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.attributes = attributes;
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

    public Map<String, List<String>> getAttributes() {
        return attributes;
    }
}