export default function Login() {


    function login() {
        console.log('logging in');
    }

    return (
        <div>
            <div>
                <label>Mobile</label><input type="text"/>
                <label>OTP</label> <input type="number"/>
                <button onClick={login}>Login</button>
            </div>
        </div>
    );
}