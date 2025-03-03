"use client";

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  url: string;
  size?: number;
}

export function QRCode({ url, size = 200 }: QRCodeProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCodeSVG 
          value={url}
          size={size}
          level="H" // High error correction capability
          includeMargin={true}
        />
      </div>
      <p className="mt-4 text-center text-sm text-gray-600">
        Scan this QR code with your mobile device to take a photo
      </p>
    </div>
  );
}
