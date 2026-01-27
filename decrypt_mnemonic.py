import sys
import os
import binascii
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Usage: python3 decrypt_mnemonic.py <encrypted_hex> <iv_hex> <secret_key_hex>
# Or set WALLET_SECRET in .env or environment

def decrypt(encrypted_hex, iv_hex, secret_key_hex):
    try:
        # Convert hex strings to bytes
        key = binascii.unhexlify(secret_key_hex)
        iv = binascii.unhexlify(iv_hex)
        ciphertext = binascii.unhexlify(encrypted_hex)
        
        # Ensure key is 32 bytes (256 bits) for AES-256
        if len(key) != 32:
            return f"Error: Secret key must be 32 bytes (64 hex characters). Got {len(key)} bytes."

        # Setup Cipher
        backend = default_backend()
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
        decryptor = cipher.decryptor()
        
        # Decrypt
        padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        
        # Remove PKCS7 padding
        # In AES-CBC (Node.js default), padding is used.
        # We need to manually unpad if cryptography lib doesn't handle high level padding easily in primitives
        # Or we can write a simple unpadder.
        # Node's 'aes-256-cbc' uses PKCS7.
        
        pad_len = padded_plaintext[-1]
        mnemonic = padded_plaintext[:-pad_len].decode('utf-8')
        
        return mnemonic
    except Exception as e:
        return f"Decryption Failed: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 decrypt_mnemonic.py <encrypted_hex> <iv_hex> [secret_key_hex]")
        sys.exit(1)
        
    encrypted_hex = sys.argv[1]
    iv_hex = sys.argv[2]
    
    secret_key_hex = ""
    if len(sys.argv) > 3:
        secret_key_hex = sys.argv[3]
    else:
        # Try finding in .env
        secret_key_hex = os.environ.get('WALLET_SECRET')
        
        # If not in env, try reading .env file manually
        if not secret_key_hex and os.path.exists('.env'):
            try:
                with open('.env', 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith('WALLET_SECRET='):
                            # Remove quotes if present
                            raw_val = line.split('=', 1)[1]
                            secret_key_hex = raw_val.strip('"').strip("'")
                            break
            except Exception:
                pass

        if not secret_key_hex:
            # Fallback mock key for demo if not set (Same as lib/crypto.ts default)
            secret_key_hex = '0000000000000000000000000000000000000000000000000000000000000000'
            print(f"Warning: Using default fallback key: {secret_key_hex}")

    result = decrypt(encrypted_hex, iv_hex, secret_key_hex)
    print(f"Decrypted Mnemonic: {result}")
