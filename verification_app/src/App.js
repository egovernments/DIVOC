import './App.css';
import {VerifyCertificate} from "./components/VerifyCertificate";
import {Provider} from "react-redux";
import {store} from "./redux/store";

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <VerifyCertificate />
            </div>
        </Provider>
    );
}

export default App;