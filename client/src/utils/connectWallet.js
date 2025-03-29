import { ethers } from "ethers";
import contractAbi from "../constants/contractAbi.json";
import toast from "react-hot-toast";
import axios from "axios";

// Track pending requests
let isConnectionPending = false;

export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    // Check if there's already a pending request
    if (isConnectionPending) {
      throw { 
        code: -32002,
        message: "Connection request already in progress" 
      };
    }

    isConnectionPending = true;

    // First check existing connections
    const existingAccounts = await window.ethereum.request({ 
      method: "eth_accounts" 
    }).catch(() => []);

    if (existingAccounts.length > 0) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0x9dCd9Ad2e6eE604530f6E5372aAE3E1d7C52a925";
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      isConnectionPending = false;
      return { contractInstance, selectedAccount: existingAccounts[0] };
    }

    // Request new connection with cleanup
    let accounts;
    try {
      accounts = await Promise.race([
        window.ethereum.request({ method: "eth_requestAccounts" }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout")), 30000)
        )
      ]);
    } finally {
      isConnectionPending = false;
    }

    const selectedAccount = accounts[0];
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Sign message
    const message = "Welcome to Crypto Vault Website";
    const signature = await signer.signMessage(message);

    // Authenticate with backend
    const { data } = await axios.post(
      `http://localhost:3000/api/authentication?address=${selectedAccount}`,
      { signature }
    );

    localStorage.setItem("token", data.token);

    // Create contract instance
    const contractInstance = new ethers.Contract(
      "0x9dCd9Ad2e6eE604530f6E5372aAE3E1d7C52a925",
      contractAbi,
      signer
    );
    
    return { contractInstance, selectedAccount };
    
  } catch (error) {
    isConnectionPending = false;
    
    if (error.code === -32002) {
      toast.error(
        "MetaMask popup not showing?\n\n" +
        "1. Check your browser extensions for the MetaMask icon\n" +
        "2. Click on any pending notifications\n" +
        "3. Try connecting again",
        { 
          duration: 8000,
          icon: "🔍"
        }
      );
    } else {
      toast.error(error.message || "Wallet connection failed");
    }
    
    console.error("Wallet connection error:", error);
    throw error;
  }
};