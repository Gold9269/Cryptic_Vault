import { useWeb3Context } from "../contexts/useWeb3Context.jsx";
import { connectWallet } from "../utils/connectWallet.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Wallet = () => {
  const navigateTo = useNavigate();
  const { updateWeb3State, web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const [connectionState, setConnectionState] = useState({
    status: "idle", // 'idle' | 'checking' | 'connecting' | 'signing' | 'authenticating'
    error: null
  });

  useEffect(() => {
    if (selectedAccount) {
      navigateTo("/home");
    }
  }, [selectedAccount, navigateTo]);

  const handleWalletConnection = async () => {
    if (connectionState.status !== "idle") return;
    
    try {
      setConnectionState({ status: "checking", error: null });
      
      // Step 1: Check/Connect Wallet
      setConnectionState({ status: "connecting", error: null });
      const result = await connectWallet();
      
      if (result) {
        // Step 2: Update state
        updateWeb3State({
          contractInstance: result.contractInstance,
          selectedAccount: result.selectedAccount
        });
      }
    } catch (error) {
      setConnectionState({ 
        status: "idle", 
        error: error.code === -32002 ? "pending" : "failed" 
      });
      
      if (error.code === -32002) {
        // Show persistent notification until resolved
        const toastId = toast.loading(
          "Waiting for MetaMask approval...",
          { 
            duration: Infinity,
            position: "bottom-right"
          }
        );
        
        // Poll for resolution
        const checkInterval = setInterval(async () => {
          try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
              clearInterval(checkInterval);
              toast.dismiss(toastId);
              handleWalletConnection(); // Retry
            }
          } catch (e) {
            clearInterval(checkInterval);
            toast.dismiss(toastId);
          }
        }, 1000);
      }
    }
  };

  const getButtonState = () => {
    switch (connectionState.status) {
      case "checking": return {
        text: "Checking Wallet...",
        className: "bg-gray-400 cursor-wait",
        disabled: true
      };
      case "connecting": return {
        text: "Awaiting MetaMask...",
        className: "bg-amber-500 cursor-wait",
        disabled: true
      };
      case "signing": return {
        text: "Signing Message...",
        className: "bg-blue-400 cursor-wait",
        disabled: true
      };
      case "authenticating": return {
        text: "Authenticating...",
        className: "bg-purple-400 cursor-wait",
        disabled: true
      };
      default: return {
        text: connectionState.error === "pending" 
          ? "Approve in MetaMask" 
          : connectionState.error === "failed"
            ? "Connection Failed - Try Again"
            : "Connect Wallet",
        className: connectionState.error === "pending"
          ? "bg-amber-500 hover:bg-amber-600"
          : connectionState.error === "failed"
            ? "bg-red-500 hover:bg-red-600"
            : "bg-sky-400 hover:bg-sky-800",
        disabled: false
      };
    }
  };

  const buttonState = getButtonState();

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)] flex flex-col justify-center items-center gap-20">
        <h1 className="font-bold text-[42px] gradient-text md:text-[60px]">
          Crypted Vault
        </h1>
        <div className="flex flex-col items-center">
          <button
            className={`relative px-12 py-4 text-white rounded-md font-semibold transition-all ${buttonState.className}`}
            onClick={handleWalletConnection}
            disabled={buttonState.disabled}
          >
            {buttonState.text}
          </button>
          {connectionState.error === "pending" && (
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-amber-700 underline mt-2"
            >
              Stuck? Refresh page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;