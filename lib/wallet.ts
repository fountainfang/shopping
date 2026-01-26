import { ethers } from 'ethers';

// Service to handle Wallet Derivation and Balance Checks
export class WalletService {
    private masterMnemonic: string;
    private provider: ethers.JsonRpcProvider;

    constructor() {
        const mnemonic = process.env.MASTER_MNEMONIC;
        if (!mnemonic) {
            throw new Error("MASTER_MNEMONIC not set in environment variables");
        }
        this.masterMnemonic = mnemonic;

        const rpcUrl = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/";
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    /**
     * Derives a BSC address from the master mnemonic at a specific index.
     * Path: m/44'/60'/0'/0/{index}
     */
    deriveAddress(index: number): string {
        // HDNodeWallet is the modern replacement for HDNode in ethers v6
        const wallet = ethers.HDNodeWallet.fromPhrase(this.masterMnemonic);
        // Derive the specific child
        const child = wallet.derivePath(`m/44'/60'/0'/0/${index}`);
        return child.address;
    }

    /**
     * Checks the balance of an address on BSC.
     * Returns generic object with BNB, USDT, and USDC balances.
     */
    async getBalances(address: string) {
        // 1. Native BNB Balance
        const bnbBalanceWei = await this.provider.getBalance(address);
        const bnbBalance = parseFloat(ethers.formatEther(bnbBalanceWei));

        // 2. USDT Balance (Mainnet Contract: 0x55d398326f99059fF775485246999027B3197955)
        // Note: If using Testnet, these addresses need to be changed.
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        const usdtBalance = await this.getTokenBalance(address, usdtAddress);

        // 3. USDC Balance (Mainnet Contract: 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d)
        const usdcAddress = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
        const usdcBalance = await this.getTokenBalance(address, usdcAddress);

        return {
            bnb: bnbBalance,
            usdt: usdtBalance,
            usdc: usdcBalance
        };
    }

    /**
     * Scans for new deposits for a given address.
     * @param address User's derived wallet address
     * @param existingTxHashes List of transaction hashes already processed
     * @param fromBlock Block to start scanning from (default: relative recent)
     */
    async scanDeposits(address: string, existingTxHashes: Set<string>, fromBlock = -1000) {
        if (!this.provider) return [];

        const contracts = [
            { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955" },
            { symbol: "USDC", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" }
        ];

        const newDeposits: { txHash: string; amount: number; asset: string }[] = [];

        for (const token of contracts) {
            const contract = new ethers.Contract(token.address, [
                "event Transfer(address indexed from, address indexed to, uint256 value)",
                "function decimals() view returns (uint8)"
            ], this.provider);

            const filter = contract.filters.Transfer(null, address);

            try {
                const logs = await contract.queryFilter(filter, fromBlock);
                for (const log of logs) {
                    if (existingTxHashes.has(log.transactionHash)) continue;
                    if (log instanceof ethers.EventLog) {
                        const value = log.args.value;
                        const decimals = 18; // Standard for BEP20 stablecoins
                        const amount = parseFloat(ethers.formatUnits(value, decimals));
                        newDeposits.push({ txHash: log.transactionHash, amount, asset: token.symbol });
                    }
                }
            } catch (e) {
                console.error(`Error scanning logs for ${token.symbol}:`, e);
            }
        }
        return newDeposits;
    }

    private async getTokenBalance(walletAddress: string, tokenAddress: string): Promise<number> {
        const abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];
        const contract = new ethers.Contract(tokenAddress, abi, this.provider);

        try {
            const balanceWei = await contract.balanceOf(walletAddress);
            const decimals = await contract.decimals();
            return parseFloat(ethers.formatUnits(balanceWei, decimals));
        } catch (error) {
            console.error(`Failed to get token balance for ${tokenAddress}:`, error);
            return 0;
        }
    }
}

export const walletService = new WalletService();
