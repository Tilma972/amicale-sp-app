'use client';

// components/QRCodeDisplay.tsx
import QRCode from 'react-qr-code'

interface QRCodeDisplayProps {
  teamId: string
  teamName: string
  teamColor: string
  onSuccess: (transactionId: string) => void
  onExpired: () => void
  className?: string
}

export default function QRCodeDisplay({
  teamId,
  teamName,
  teamColor,
  onSuccess,
  onExpired,
  className
}: QRCodeDisplayProps) {
  const paymentUrl = `https://votre-domaine.fr/payment/${teamId}`
  
  return (
    <div className={className}>
      <QRCode 
        value={paymentUrl}
        size={200}
        fgColor={teamColor}
      />
      <p className="mt-2 text-sm text-gray-600">
        Scannez pour payer par carte
      </p>
    </div>
  )
}
