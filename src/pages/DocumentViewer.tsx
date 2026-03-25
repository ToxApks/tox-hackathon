import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

// Set worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface DocumentViewerProps {
  pdfUrl: string;
  title: string;
}

export const DocumentViewer = ({ pdfUrl, title }: DocumentViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) {
        setError('No PDF URL provided');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNumber(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load PDF. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  // Render page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || loading) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (error) {
        console.error('Error rendering page:', error);
        setError('Failed to render page');
      }
    };

    renderPage();
  }, [pdfDoc, pageNumber, scale, loading]);

  // Controls
  const nextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const prevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.5);
  };

  // Download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    link.click();
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= numPages) {
      setPageNumber(value);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900" ref={containerRef}>
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white truncate">{title}</h2>
        </div>

        <div className="flex gap-2 ml-4">
          {/* Zoom Controls */}
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <button
            onClick={resetZoom}
            className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="border-l border-gray-700" />

          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF VIEWER */}
      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center max-w-md">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Error Loading PDF</h3>
              <p className="text-gray-400">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            </div>
            <p className="text-gray-400 mt-4">Loading PDF...</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full shadow-2xl rounded"
            style={{ backgroundColor: '#fff' }}
          />
        )}
      </div>

      {/* FOOTER CONTROLS */}
      {!error && numPages > 0 && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
            {/* Previous Button */}
            <button
              onClick={prevPage}
              disabled={pageNumber <= 1}
              className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={numPages}
                value={pageNumber}
                onChange={handlePageInput}
                className="w-16 px-2 py-1 text-center bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-gray-400">/ {numPages}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};