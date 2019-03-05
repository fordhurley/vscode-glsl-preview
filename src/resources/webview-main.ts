import { greet } from "./test-submodule";

const h1 = document.createElement("h1");
h1.textContent = greet();
document.body.appendChild(h1);
