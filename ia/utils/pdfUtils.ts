/**
 * Converts a File (PDF) to a base64 string of its first page rendered as an image.
 * We convert to image so Gemini handles "text-based" and "image-based" PDFs identically via Vision.
 */
export const convertPdfToImage = async (file: File, scale: number = 2.0): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);

        // @ts-ignore - pdfjsLib is loaded via CDN in index.html
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        
        // Fetch the first page
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: scale });

        // Prepare canvas using PDF page dimensions
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) {
          reject(new Error("No se pudo crear el contexto del canvas"));
          return;
        }

        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;

        // Convert canvas to Data URL (JPEG for compression/compatibility)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        // Remove the data:image/jpeg;base64, prefix to get raw base64
        const base64 = dataUrl.split(',')[1];
        resolve(base64);

      } catch (error) {
        console.error("Error parsing PDF:", error);
        reject(error);
      }
    };

    fileReader.onerror = (err) => reject(err);
    fileReader.readAsArrayBuffer(file);
  });
};

/**
 * Resizes an image (base64) to fit within maxDimension, preserving aspect ratio.
 * Used to optimize payload size for API calls.
 */
export const resizeImage = async (base64Image: string, maxDimension: number = 1536): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Image}`;
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            
            // Only resize if significantly larger (save processing for small images)
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(base64Image);
                
                // High quality scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height);
                
                // Re-encode as JPEG 0.85 quality to save bandwidth
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                resolve(dataUrl.split(',')[1]);
            } else {
                resolve(base64Image);
            }
        };
        img.onerror = () => resolve(base64Image); // Fallback
    });
};

/**
 * Preprocesses an image for OCR.
 * Adjusted to 1600px width to balance large/small text recognition.
 * Removes padding to ensure coordinate mapping is straightforward.
 */
export const preprocessImageForOCR = async (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Image}`;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(base64Image); // Fallback

            // UPSCALING STRATEGY
            // 1600px is a sweet spot. 2500px makes the MP amount too large for standard kernels.
            const TARGET_WIDTH = 1600;
            const scaleFactor = Math.max(1, TARGET_WIDTH / img.width);
            
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
            
            // Fill background with white
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // High quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // SOFT CONTRAST STRETCH
            const contrast = 25; 
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                let newVal = factor * (avg - 128) + 128;
                if (newVal < 0) newVal = 0;
                if (newVal > 255) newVal = 255;

                data[i] = newVal;     // R
                data[i + 1] = newVal; // G
                data[i + 2] = newVal; // B
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg').split(',')[1]);
        };
    });
};

/**
 * Crops an image based on vertical coordinates.
 * Used to extract the specific strip between "Date" and "Motivo".
 */
export const cropImage = async (base64Image: string, yStart: number, height: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Image}`;
    img.onload = () => {
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
       if(!ctx) return resolve("");
       
       // Add a small horizontal padding for the crop
       canvas.width = img.width;
       canvas.height = height;
       
       // Draw the slice
       // source x, y, w, h -> dest x, y, w, h
       ctx.drawImage(img, 0, yStart, img.width, height, 0, 0, img.width, height);
       
       resolve(canvas.toDataURL('image/jpeg').split(',')[1]);
    };
    img.onerror = () => resolve("");
  });
};