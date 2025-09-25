import React from "react";
import { Button } from "react-bootstrap";
import QRCode from "qrcode";
import {Download} from "react-bootstrap-icons";

const QrCodeDownloadButton = ({ url, smallScreen }) => {
    const downloadQRCode = async () => {
        try {
            const dataUrl = await QRCode.toDataURL(url);

            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "qr-code.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to generate QR code", err);
        }
    };

    return (
        smallScreen ? (
            <Button onClick={downloadQRCode} className="btn-dark ms-3" style={{borderRadius: "100%"}}>
                <Download />
            </Button>
        ) : (
            <Button onClick={downloadQRCode} className="btn-dark ms-3 rounded-5 px-3 py-2" style={{fontSize: "0.8rem"}}>
                Scarica QR
            </Button>
        )
    );
};

export default QrCodeDownloadButton;
