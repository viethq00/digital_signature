const { PDFDocument } = require("pdf-lib");
const crypto = require("crypto");
const fs = require("fs");

async function extractContentWithoutAnnotations(filePath) {
  const existingPdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  for (let page of pdfDoc.getPages()) {
    try {
      const annotations = page.node.get("Annots");
      if (annotations) {
        page.node.set("Annots", []);
      }
    } catch (err) {
      console.error("Error while removing annotations:", err);
    }
  }

  const pdfBytesWithoutAnnotations = await pdfDoc.save();
  return pdfBytesWithoutAnnotations;
}

async function hashPdfContent(filePath) {
  const contentBytes = await extractContentWithoutAnnotations(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(contentBytes);
  return hash.digest("hex");
}

const filePathBeforeSigning = "pdf_digital_signature_timestamp.pdf";
const filePathAfterSigning = "edit_content.pdf";

(async () => {
  try {
    const hashBefore = await hashPdfContent(filePathBeforeSigning);
    console.log(`Hash of the file content before signing: ${hashBefore}`);

    const hashAfter = await hashPdfContent(filePathAfterSigning);
    console.log(`Hash of the file content after signing: ${hashAfter}`);

    if (hashBefore === hashAfter) {
      console.log("No changes detected in the document content.");
    } else {
      console.log("The document content has been modified after signing.");
    }
  } catch (err) {
    console.error("Error processing the PDF:", err);
  }
})();
