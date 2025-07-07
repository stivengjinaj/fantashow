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
            <Button onClick={downloadQRCode} className="outlined-orange-button rounded-3 mt-1" style={{fontSize: "0.8rem"}}>
                Scarica QR
            </Button>
        ) : (
            <Button onClick={downloadQRCode} className="glowing-border-blue mx-2" style={{borderRadius: "100%"}}>
                <Download />
            </Button>
        )
    );
};

export default QrCodeDownloadButton;
