import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId: string): Promise<string> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  try {
    // High quality capture
    const canvas = await html2canvas(element, {
      scale: 2, // Retina scale for clear text
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Subsequent pages if long
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Return Base64 string (remove data prefix for API compatibility if needed, 
    // but the script expects full base64 or split inside script. 
    // The script provided uses `pdfData.split(',')[1]`, so we send full Data URI)
    return canvas.toDataURL('image/jpeg', 0.85);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};