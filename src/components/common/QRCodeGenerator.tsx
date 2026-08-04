import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share, Printer, RefreshCw } from 'lucide-react';

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  description?: string;
  size?: number;
  logoUrl?: string;
  bgColor?: string;
  fgColor?: string;
  onDownload?: () => void;
}

const QRCodeGenerator = ({
  data,
  title = 'QR Code',
  description,
  size = 200,
  logoUrl,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  onDownload
}: QRCodeGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleDownload = () => {
    setIsGenerating(true);
    
    try {
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = url;
      link.click();
      
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleShare = async () => {
    if (!navigator.share) {
      alert('Web Share API is not supported in your browser');
      return;
    }
    
    try {
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
      
      const file = new File([blob], `${title.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
      
      await navigator.share({
        title: title,
        text: description || 'QR Code from MedFiNet',
        files: [file]
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };
  
  const handlePrint = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              h2 {
                margin-bottom: 10px;
              }
              p {
                color: #666;
                margin-bottom: 20px;
              }
              .print-container {
                max-width: 500px;
                margin: 0 auto;
              }
              @media print {
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h2>${title}</h2>
              ${description ? `<p>${description}</p>` : ''}
              <img src="${url}" alt="${title}" />
              <p class="no-print">
                <button onclick="window.print()">Print</button>
                <button onclick="window.close()">Close</button>
              </p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCodeSVG
          id="qr-canvas"
          value={data}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="H"
          includeMargin={true}
          imageSettings={
            logoUrl
              ? {
                  src: logoUrl,
                  x: undefined,
                  y: undefined,
                  height: size * 0.2,
                  width: size * 0.2,
                  excavate: true,
                }
              : undefined
          }
        />
      </div>
      
      {title && (
        <h3 className="mt-4 font-medium text-neutral-900 dark:text-white text-center">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 text-center max-w-xs">
          {description}
        </p>
      )}
      
      <div className="mt-4 flex space-x-3">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download
        </button>
        
        {navigator.share && (
          <button
            onClick={handleShare}
            className="flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
        )}
        
        <button
          onClick={handlePrint}
          className="flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;