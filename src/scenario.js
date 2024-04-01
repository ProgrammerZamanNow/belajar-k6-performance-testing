import {loginUser, registerUser} from "./helper/user.js";
import {createContact} from "./helper/contact.js";
import execution from "k6/execution";
import {Counter} from "k6/metrics";

export const options = {
    thresholds: {
        user_registration_counter_success: ['count>190'],
        user_registration_counter_error: ['count<10']
    },
    scenarios: {
        userRegistration: {
            exec: "userRegistration",
            executor: "shared-iterations",
            vus: 10,
            iterations: 200,
            maxDuration: "30s"
        },
        contactCreation: {
            exec: "contactCreation",
            executor: "constant-vus",
            vus: 10,
            duration: "10s"
        }
    }
}

const registerCounterSuccess = new Counter("user_registration_counter_success");
const registerCounterError = new Counter("user_registration_counter_error");

export function userRegistration() {
    const uniqueId = new Date().getTime();
    const registerRequest = {
        username: `user-${uniqueId}`,
        password: 'rahasia',
        name: 'Programmer Zaman Now',
    };

    const response = registerUser(registerRequest);
    if (response.status === 200) {
        registerCounterSuccess.add(1);
    } else {
        registerCounterError.add(1);
    }
}

export function contactCreation() {
    const number = (execution.vu.idInInstance % 9) + 1;
    const username = `contoh${number}`
    const loginRequest = {
        username: username,
        password: 'rahasia',
    }

    const loginResponse = loginUser(loginRequest);
    const token = loginResponse.json().data.token;

    const contact = {
        "first_name": "Kontak",
        "last_name": `Contoh`,
        "email": `contact@example.com`,
    };
    createContact(token, contact);
}
