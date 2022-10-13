import App from "./services/app.js";
import "./helpers/utils.js";

App.init(3000, function(){
    console.log('Server listening on port 3000');
});