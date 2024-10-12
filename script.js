document.getElementById('calculate').addEventListener('click', function () {
    calculate(); // Appelle la fonction calculate lorsque le bouton est cliqué
});

const ipInput = document.getElementById('ip');
const subnetInput = document.getElementById('subnet');

// Fonction pour effectuer le calcul
function calculate() {
    const ipInputValue = ipInput.value;
    let subnet, isCidr = false;

    // Vérifiez si l'entrée contient une notation CIDR
    if (ipInputValue.includes('/')) {
        isCidr = true; // Indique que l'entrée est en CIDR
        // Séparer l'IP et le CIDR
        [ip, subnet] = ipInputValue.split('/');
        subnet = parseInt(subnet, 10);

        // Convertir le CIDR en masque de sous-réseau
        const subnetMask = (0xFFFFFFFF << (32 - subnet)) >>> 0;
        subnet = [
            (subnetMask >>> 24) & 255,
            (subnetMask >>> 16) & 255,
            (subnetMask >>> 8) & 255,
            subnetMask & 255
        ].join('.');
    } else {
        ip = ipInputValue;
        subnet = subnetInput.value;
    }

    // Si l'un des champs est vide, on efface les résultats et on sort de la fonction
    if (!ip || !subnet) {
        clearResults(); // Efface les résultats et masque le conteneur
        return;
    }

    const ipParts = ip.split('.').map(Number);
    const subnetParts = subnet.split('.').map(Number);

    const networkAddress = ipParts.map((part, index) => part & subnetParts[index]).join('.');
    const broadcastAddress = ipParts.map((part, index) => part | (~subnetParts[index] & 255)).join('.');

    const firstHost = networkAddress.split('.').map(Number);
    firstHost[3] += 1; // Incrémente le dernier octet pour le premier hôte
    const lastHost = broadcastAddress.split('.').map(Number);
    lastHost[3] -= 1; // Décrémente le dernier octet pour le dernier hôte

    const addressRange = firstHost.join('.') + " - " + lastHost.join('.');
    const hostCount = Math.pow(2, 32 - subnetParts.reduce((acc, part) => acc + part.toString(2).replace(/0/g, '').length, 0)) - 2;

    // Calcul de la notation CIDR
    const cidr = isCidr ? subnet : calculateCIDR(subnet);

    // Affichage des résultats avec les chiffres en gras
    document.getElementById('networkAddress').innerHTML = "Adresse de réseau: <strong>" + networkAddress + "</strong>";
    document.getElementById('broadcastAddress').innerHTML = "Adresse de diffusion: <strong>" + broadcastAddress + "</strong>";
    document.getElementById('addressRange').innerHTML = "Plage d'adresses: <strong>" + addressRange + "</strong>";
    document.getElementById('hostCount').innerHTML = "Nombre d'hôtes possibles: <strong>" + hostCount + "</strong>";

    // Affichage de la notation CIDR ou du masque de sous-réseau
    if (isCidr) {
        document.getElementById('cidrResult').innerHTML = "Masque de sous-réseau: <strong>" + subnet + "</strong>";
    } else {
        document.getElementById('cidrResult').innerHTML = "Notation CIDR: /<strong>" + cidr + "</strong>";
    }

    // Afficher le conteneur des résultats
    document.getElementById('results').classList.add('visible');
}

// Fonction pour calculer la notation CIDR à partir d'un masque
function calculateCIDR(subnet) {
    const subnetParts = subnet.split('.').map(Number);
    let count = 0;

    // Compte le nombre de bits à 1 dans le masque
    subnetParts.forEach(part => {
        count += part.toString(2).split('0').join('').length; // Compte les bits à 1
    });

    return count; // Retourne le total
}

// Fonction pour effacer les résultats et masquer le conteneur
function clearResults() {
    document.getElementById('networkAddress').textContent = "";
    document.getElementById('broadcastAddress').textContent = "";
    document.getElementById('addressRange').textContent = "";
    document.getElementById('hostCount').textContent = "";
    document.getElementById('cidrResult').textContent = "";
    document.getElementById('results').classList.remove('visible');
}

// Effacer les résultats si les champs sont vides
ipInput.addEventListener('input', function () {
    const ipValue = ipInput.value;
    const subnetValue = subnetInput.value;
    if (!ipValue || !subnetValue) {
        clearResults(); // Efface les résultats si les champs sont vides
    }
});

subnetInput.addEventListener('input', function () {
    const ipValue = ipInput.value;
    const subnetValue = subnetInput.value;
    if (!ipValue || !subnetValue) {
        clearResults(); // Efface les résultats si les champs sont vides
    }
});

// Écouteurs d'événements pour la touche "Entrée"
ipInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Empêche le comportement par défaut
        calculate(); // Appelle la fonction calculate
    }
});

subnetInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Empêche le comportement par défaut
        calculate(); // Appelle la fonction calculate
    }
});
