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
    status: "idle",
    error: null,
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

      setConnectionState({ status: "connecting", error: null });
      const result = await connectWallet();

      if (result) {
        updateWeb3State({
          contractInstance: result.contractInstance,
          selectedAccount: result.selectedAccount,
        });
      }
    } catch (error) {
      setConnectionState({
        status: "idle",
        error: error.code === -32002 ? "pending" : "failed",
      });

      if (error.code === -32002) {
        const toastId = toast.loading("Waiting for MetaMask approval...", {
          duration: Infinity,
          position: "bottom-right",
        });

        const checkInterval = setInterval(async () => {
          try {
            const accounts = await window.ethereum.request({
              method: "eth_accounts",
            });
            if (accounts.length > 0) {
              clearInterval(checkInterval);
              toast.dismiss(toastId);
              handleWalletConnection();
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
      case "checking":
        return {
          text: "Checking Wallet...",
          className: "bg-gray-700 animate-pulse cursor-wait",
          disabled: true,
        };
      case "connecting":
        return {
          text: "Awaiting MetaMask...",
          className: "bg-yellow-500 cursor-wait animate-pulse",
          disabled: true,
        };
      case "signing":
        return {
          text: "Signing Message...",
          className: "bg-blue-500 cursor-wait animate-pulse",
          disabled: true,
        };
      case "authenticating":
        return {
          text: "Authenticating...",
          className: "bg-purple-600 cursor-wait animate-pulse",
          disabled: true,
        };
      default:
        return {
          text:
            connectionState.error === "pending"
              ? "Approving..."
              : connectionState.error === "failed"
              ? "Connection Failed - Try Again"
              : "CONNECT WALLET",
          className:
            connectionState.error === "pending"
              ? "bg-yellow-500 hover:bg-yellow-600"
              : connectionState.error === "failed"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-cyan-500 hover:bg-cyan-700",
          disabled: false,
        };
    }
  };

  const buttonState = getButtonState();

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden bg-black">
      {/* Moving Cyberpunk Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-pulse"></div>

      {/* Floating Cyberpunk Glows */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_700px_at_50%_20%,rgba(0,255,255,0.15),transparent)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_80%_90%,rgba(255,0,255,0.1),transparent)] animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 text-center">
        {/* Cyberpunk Glitch Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-600 animate-pulse">
          CRYPTED VAULT
        </h1>

        {/* Wallet Connect Button */}
        <button
          className={`relative px-12 py-4 text-white rounded-md font-semibold transition-all shadow-lg shadow-cyan-500/50 duration-300 hover:shadow-cyan-700 hover:scale-105 hover:animate-pulse ${buttonState.className}`}
          onClick={handleWalletConnection}
          disabled={buttonState.disabled}
        >
          {buttonState.text}
        </button>

        {/* MetaMask Pending Message */}
        {connectionState.error === "pending" && (
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-yellow-400 underline"
          >
            Stuck? Refresh page
          </button>
        )}
      </div>
    </div>
  );
};

export default Wallet;
