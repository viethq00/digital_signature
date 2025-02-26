const fs = require("fs");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");

async function replaceTextSequent(filePath, placeholders, replacements) {
  try {
    if (placeholders.length !== replacements.length) {
      throw new Error(
        "Placeholders and replacements arrays must have the same length."
      );
    }

    const buffer = fs.readFileSync(filePath);
    const zip = new PizZip(buffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const data = {};
    for (let i = 0; i < placeholders.length; i++) {
      data[placeholders[i]] = replacements[i];
    }

    doc.setData(data);
    doc.render();

    const updatedBuffer = doc.getZip().generate({ type: "nodebuffer" });

    // Write the updated document to a new file
    fs.writeFileSync("updated1.docx", updatedBuffer);
    console.log("Document updated successfully.");
  } catch (error) {
    console.error("Error updating document:", error);
  }
}

function extractPlaceholders(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    const zip = new PizZip(buffer);

    const text = zip.files["word/document.xml"].asText();

    const regex = /\{([^}]+)\}/g;
    let matches;
    const placeholders = [];

    while ((matches = regex.exec(text)) !== null) {
      placeholders.push(matches[1].trim());
    }

    return placeholders
      .map((snippet) => snippet.replace(/<[^>]+>/g, "").trim()) // Remove all XML tags
      .filter((text) => text.length > 0); // Filter out empty strings
  } catch (error) {
    console.error("Error extracting placeholders:", error);
    return [];
  }
}

const placeholders = extractPlaceholders("service_index.docx");
console.log("Placeholders found:", placeholders);

const replacements = [
  "001C000001",
  "2024-09-06",
  "2024-09-07",
  "Description 3",
  "Value 1",
  "Value 3",
  "Value 2",
  "Value 3 again",
  "Another Value 1",
  "Another Value 3",
  "Another Value 2",
  "Yet another Value 3",
];

replaceTextSequent("service_index.docx", placeholders, replacements).then(
  () => {
    console.log("Replacement process completed.");
  }
);
