import './App.css';
import {VerifyCertificate} from "./components/VerifyCertificate";
import {Provider} from "react-redux";
import {store} from "./redux/store";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

function App() {
    return (
        <Provider store={store}>
            <Header/>
            <div className="App">
                <VerifyCertificate />
            </div>
            <Footer/>
        </Provider>
    );
}

export default App;