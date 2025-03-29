const crypto = require('crypto');

const decryptData = (encryptedData, iv, encryptionKey) => {
    try {
        // Validate inputs
        if (!encryptedData || !iv || !encryptionKey) {
            throw new Error('Missing required parameters');
        }

        // Convert inputs to Buffers if needed
        const ivBuffer = Buffer.isBuffer(iv) ? iv : Buffer.from(iv.data || iv);
        const encryptedDataBuffer = Buffer.isBuffer(encryptedData) 
            ? encryptedData 
            : Buffer.from(encryptedData.data || encryptedData);
        const keyBuffer = Buffer.from(encryptionKey);

        // Create decipher
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
        
        // Decrypt
        const decrypted = Buffer.concat([
            decipher.update(encryptedDataBuffer),
            decipher.final()
        ]);
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null; // Explicitly return null on error
    }
};

module.exports = { decryptData };