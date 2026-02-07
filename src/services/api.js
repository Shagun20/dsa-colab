const apiUrl = 'http://localhost:3000/';

export const get = (endpoint, userData) => {
    // Use backticks `` for template literals to inject the endpoint variable
    return fetch(`${apiUrl}${endpoint}`, {
        method: 'POST', // Use POST if you are sending a body
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        });
};
