import http from 'k6/http';
import {check, fail, sleep} from 'k6';

export const options = {
    // A number specifying the number of VUs to run concurrently.
    vus: 10,
    // A string specifying the total duration of the test run.
    duration: '10s'
};

export default function () {
    const uniqueId = new Date().getTime();
    const registerRequest = {
        username: `user-${uniqueId}`,
        password: 'rahasia',
        name: 'Programmer Zaman Now',
    };
    const registerResponse = http.post('http://localhost:3000/api/users', JSON.stringify(registerRequest), {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
    const checkRegister = check(registerResponse, {
        'register response status must 200' : (response) => response.status === 200,
        'register response data must not null' : (response) => response.json().data != null
    })
    if (!checkRegister) {
        fail(`Failed to register user-${uniqueId}`);
    }

    const loginRequest = {
        username: `user-${uniqueId}`,
        password: 'rahasia',
    }

    const loginResponse = http.post('http://localhost:3000/api/users/login', JSON.stringify(loginRequest), {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });
    const checkLogin = check(loginResponse, {
        'login response status must 200' : (response) => response.status === 200,
        'login response token must exists' : (response) => response.json().data.token != null,
    })
    if (!checkLogin) {
        fail(`Failed to login user-${uniqueId}`);
    }

    const loginBodyResponse = loginResponse.json();

    const currentResponse = http.get('http://localhost:3000/api/users/current', {
        headers: {
            'Accept': 'application/json',
            'Authorization': loginBodyResponse.data.token,
        }
    });

    const checkCurrent = check(currentResponse, {
        'current response status must 200' : (response) => response.status === 200,
        'current response data must not null' : (response) => response.json().data != null
    })
    if (!checkCurrent) {
        fail(`Failed to get user-${uniqueId}`);
    }
}
