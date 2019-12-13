import { makeGreeting} from "./greeter";

var message = makeGreeting('John', 'Smith');

document.body.innerHTML = message;
