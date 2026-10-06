import * as THREE from "three";
import { App } from "locar";

// Coordenada del Laboratorio de Redes
const TARGET = {
    lat: -2.299114,
    lon: -78.118125,
    name: "LABORATORIO DE REDES"
};

// Crear un cubo
function makeBox(color, size = 10) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: color
    });

    return new THREE.Mesh(geometry, material);
}

// Elementos HTML
const canvas = document.getElementById("canvas");
const startButton = document.getElementById("startButton");
const status = document.getElementById("status");
const gpsInfo = document.getElementById("gpsInfo");

// Iniciar AR
startButton.addEventListener("click", async () => {

    try {

        startButton.style.display = "none";
        status.textContent = "Iniciando cámara y sensores...";

        const app = new App({
            canvas,
            cameraOptions: {
                hFov: 80,
                near: 0.001,
                far: 1500
            }
        });

        const locar = await app.start();

        status.textContent = "Cámara iniciada. Activando GPS...";

        // Escuchar actualizaciones del GPS
        locar.on("gpsupdate", (ev) => {

            const coords = ev.position.coords;

            const lat = coords.latitude;
            const lon = coords.longitude;
            const accuracy = coords.accuracy;

            gpsInfo.innerHTML = `
                <strong>Ubicación actual</strong><br>
                Latitud: ${lat}<br>
                Longitud: ${lon}<br>
                Precisión: ${accuracy.toFixed(2)} metros
            `;

            console.log("Latitud:", lat);
            console.log("Longitud:", lon);
            console.log("Precisión:", accuracy);
        });

        // Manejar errores del GPS
        locar.on("gpserror", (error) => {

            console.error("Error GPS:", error);

            status.textContent =
                "No se pudo obtener la ubicación GPS.";

        });

        await locar.startGps();

        status.textContent =
            "GPS activo. Gira lentamente el celular.";

        // Cubo ROJO = NORTE
        const northBox = makeBox(0xff0000, 10);

        locar.add(
            northBox,
            -78.12425970813916,
            -2.2788191757627727 + 0.00045,
            5
        );

        // Cubo AMARILLO = SUR
        const southBox = makeBox(0xffff00, 10);

        locar.add(
            southBox,
            -78.12425970813916,
            -2.2788191757627727 - 0.00045,
            5
        );

        // Cubo CELESTE = OESTE
        const westBox = makeBox(0x00ffff, 10);

        locar.add(
            westBox,
            -78.12425970813916 - 0.00045,
            -2.2788191757627727,
            5
        );

        // Cubo VERDE = ESTE
        const eastBox = makeBox(0x00ff00, 10);

        locar.add(
            eastBox,
            -78.12425970813916 + 0.00045,
            -2.2788191757627727,
            5
        );

        // Cubo MAGENTA = LABORATORIO DE REDES
        const targetBox = makeBox(0xff00ff, 12);

        locar.add(
            targetBox,
            TARGET.lon,
            TARGET.lat,
            6
        );

        console.log(
            "Laboratorio de Redes colocado en:",
            TARGET.lat,
            TARGET.lon
        );

    } catch (error) {

        console.error("Error iniciando AR:", error);

        status.textContent =
            "Error al iniciar AR: " + error.message;

        startButton.style.display = "block";
    }
});
