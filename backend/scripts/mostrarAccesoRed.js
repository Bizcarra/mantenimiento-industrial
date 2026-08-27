import QRCode from 'qrcode';

const urlAcceso = process.argv[2];

if (!urlAcceso) {
  console.error('No se recibio la direccion de acceso para generar el QR.');
  process.exit(1);
}

try {
  const url = new URL(urlAcceso);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('El enlace debe usar HTTP o HTTPS');
  }

  console.log('\nEscanea este QR desde un dispositivo conectado al mismo Wi-Fi:');
  console.log(await QRCode.toString(url.href, {
    type: 'terminal',
    small: true,
    margin: 1,
    errorCorrectionLevel: 'M',
  }));
  console.log(`Enlace: ${url.href}\n`);
} catch (error) {
  console.error(`No se pudo generar el QR: ${error.message}`);
  process.exit(1);
}
