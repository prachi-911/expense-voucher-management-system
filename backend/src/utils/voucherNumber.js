const prisma = require('../config/db');

/**
 * Generates a unique sequential voucher number in the format EV-YYYYMM-XXXX
 * e.g., EV-202610-0001
 */
const generateVoucherNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `EV-${year}${month}-`;

  // Find latest voucher with this prefix
  const latestVoucher = await prisma.voucher.findFirst({
    where: {
      voucherNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      voucherNumber: 'desc'
    }
  });

  let nextSequence = 1;
  if (latestVoucher) {
    const parts = latestVoucher.voucherNumber.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  }

  const sequenceFormatted = String(nextSequence).padStart(4, '0');
  const candidateNumber = `${prefix}${sequenceFormatted}`;

  // Extra safety check for uniqueness
  const exists = await prisma.voucher.findUnique({
    where: { voucherNumber: candidateNumber }
  });

  if (exists) {
    // Fallback with random tail to guarantee uniqueness
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${sequenceFormatted}-${randomSuffix}`;
  }

  return candidateNumber;
};

module.exports = {
  generateVoucherNumber
};
