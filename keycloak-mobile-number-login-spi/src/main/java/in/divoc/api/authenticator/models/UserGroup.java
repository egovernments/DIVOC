package in.divoc.api.authenticator.models;

public class UserGroup {
    private String id;
    private String name;

    public UserGroup(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
