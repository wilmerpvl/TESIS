require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: 1, nombre: "Administrador", email: "admin@sistema.com", rol: "ADMIN" },
    process.env.JWT_SECRET || 'clave_secreta_de_desarrollo',
    { expiresIn: '8h' }
);

console.log("Using Token:", token);

fetch('http://localhost:3000/api/usuarios', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(async r => {
    const text = await r.text();
    console.log("HTTP Status:", r.status);
    try {
        console.log("Response JSON:", JSON.parse(text));
    } catch (e) {
        console.log("Response text (not JSON):", text);
    }
})
.catch(e => console.error("Fetch Error:", e));
