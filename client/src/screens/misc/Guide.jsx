import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import '../../style/guide.css';
import {Image} from "react-bootstrap";

const Guide = () => {
    const [loading, setLoading] = useState(false);

    const pdfUrl = '/Guida.pdf';

    const handleDownload = () => {
        setLoading(true);

        // Create a download link
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'Reg_smart.pdf';

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="pdf-viewer-page animated-bg">
            <div className="pdf-viewer-container">
                <div className="pdf-viewer-card">
                    {/* Header */}
                    <div className="pdf-viewer-header">
                        <div className="pdf-viewer-header-content">
                            <FileText size={24} />
                            <h2 className="pdf-viewer-title">
                                FANTASHOW SC - Regolamento SMART
                            </h2>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="pdf-viewer-body">
                        {/* Controls */}
                        <div className="pdf-viewer-controls">
                            {/* Download Button */}
                            <button
                                className={`pdf-viewer-btn pdf-viewer-btn-download ${loading ? 'disabled' : ''}`}
                                onClick={handleDownload}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="pdf-viewer-spinner"></div>
                                        Scaricando...
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        Scarica PDF
                                    </>
                                )}
                            </button>
                        </div>


                        {/* Image Viewer */}
                        <div className="pdf-viewer-container-inner">
                            <Image fluid src={"/Guida.jpg"} width={300} height={400} alt={pdfUrl} />
                        </div>

                        {/* Contact Info */}
                        <div className="pdf-viewer-contact">
                            Contatti: Stefano (3517088136) | Simon (3455740402)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guide;