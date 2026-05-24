const yearElement = document.getElementById("current-year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const footerMessages = [
    "Lost somewhere among the stars. Cosmic entities await me.",
    "No characters were harmed in the making of this website. People were though.",
    "Hand-coded with spite, stardust, and questionable amounts of caffeine.",
    "The archive hums softly in the dark. Don't listen too closely.",
    "Beware of the characters after midnight. They may bite.",
    "If you are reading this, the Maiden, Mother, and Crone have decided your fate.",
    "You think you've felt true fear? You think you've known actual pain?"
];

const messageElement = document.getElementById("footer-message");

if (messageElement) {
    const randomIndex = Math.floor(Math.random() * footerMessages.length);
    messageElement.textContent = footerMessages[randomIndex];
}