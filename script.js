// Prompt command start script 
//node Script.js


const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function createPdf(volumeFolder, volumeNumber) {
  const pdfDoc = await PDFDocument.create();
  let isFirstImage = true;

  const chapterFolders = await fs.readdir(volumeFolder);

  for (const chapterFolder of chapterFolders) {
    const chapterPath = path.join(volumeFolder, chapterFolder);
    const imageFiles = await fs.readdir(chapterPath);

    for (const imageFile of imageFiles) {
      const imagePath = path.join(chapterPath, imageFile);

      // Check if the current item is a file
      const isFile = (await fs.stat(imagePath)).isFile();
      if (!isFile) {
        continue;
      }

      const imageBuffer = await fs.readFile(imagePath);

      // Create PDFImage from image buffer
      const pdfImage = await pdfDoc.embedJpg(imageBuffer);

      // Add a new page for each image
      const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
      const { width, height } = page.getSize();
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: pdfImage.width,
        height: pdfImage.height,
      });

      isFirstImage = false;
    }
  }

  // Remove the last page if it's empty
  if (isFirstImage) {
    pdfDoc.removePage(pdfDoc.getPage(pdfDoc.getPageCount() - 1));
  }

  const pdfBytes = await pdfDoc.save();
  const pdfFileName = `Volume ${volumeNumber}.pdf`;
  await fs.writeFile(path.join(volumeFolder, pdfFileName), pdfBytes);
}

const volumesFolder = 'C:/Users/stefa/Desktop/One Piece';

async function processVolumes() {
  const volumeFolders = await fs.readdir(volumesFolder);

  for (const [index, volumeSubFolder] of volumeFolders.entries()) {
    const volumePath = path.join(volumesFolder, volumeSubFolder);
    await createPdf(volumePath, index + 1);
  }
}

processVolumes()
  .then(() => console.log('PDFs created successfully'))
  .catch(error => console.error('Error:', error));
