// Builds docs/blockchain-game-jam/index.html: browser viewer for the general "Blockchain Game Jam" pitch deck.
// Slide titles are listed here; speaker notes are read from the .pptx (python-pptx) so they match the download.
// Usage: node site-gamejam.js <notes.json> <outDir>   (notes.json = array of 14 strings)
const fs = require("fs");
const { writeViewer } = require("./viewer.js");
const [notesFile, outDir] = process.argv.slice(2);
const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));
const TITLES = [
  "Break it out of the game", "You don't own your games. You rent them.", "Blockchain won't \"revolutionize gaming\"",
  "A blockchain is a language of ownership", "The new part: items can leave the game", "It already exists: Nexa Warriors",
  "The idea: a blockchain game jam", "Why build it on Nexa?", "What teams build with", "48 hours, one card, many new games",
  "Everyone leaves with something", "How we judge: the talk's own test", "What we need to make it happen", "So, who owns this card?",
];
const spec = {
  lang: "en",
  pageTitle: "Blockchain Game Jam: break it out of the game",
  meta: "14 slides · Jørgen S. Notland · pitch deck for organizers, 2026",
  slides: TITLES.map((t, i) => ({ title: t, notes: notes[i] || "" })),
  pptxUrl: "blockchain-game-jam.pptx",
  pdfUrl: "blockchain-game-jam.pdf",
  depth: "../",
};
console.log("wrote", writeViewer(spec, outDir), "slides:", spec.slides.length);
