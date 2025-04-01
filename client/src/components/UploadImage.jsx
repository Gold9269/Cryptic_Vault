import axios from "axios";
import { useState } from "react";
import { useWeb3Context } from "../contexts/useWeb3Context";
import toast from "react-hot-toast";
import { ImageUp, Loader } from "lucide-react";

const UploadImage = ({ reloadEffect }) => {
  const [file, setFile] = useState(null);
  const { web3State } = useWeb3Context();
  const { selectedAccount, contractInstance } = web3State;
  const [loading, setLoading] = useState(false);

  const uploadImageHash = async (ipfsHash) => {
    await toast.promise(contractInstance.uploadFile(selectedAccount, ipfsHash), {
      loading: "Transaction in progress...",
      success: "Transaction successful!",
      error: "Transaction failed!",
    });
  };

  const handleImageUpload = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const url = `http://localhost:3000/api/uploadImage`;
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          "x-access-token": token,
        },
      };
      const res = await axios.post(url, formData, config);

      toast.success("Image uploaded successfully!");
      await uploadImageHash(res.data.ipfsHash);
      reloadEffect();
    } catch (error) {
      console.error(error);
      toast.error("Image Upload Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center relative text-white">
      {/* Cyberpunk Gradient Background */}
      <div className="absolute inset-0"></div>

      <p className="relative z-10 text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-600 drop-shadow-lg">
        Upload File with <span className="text-blue-400">Web3 Security</span>
      </p>

      {/* Upload Card */}
      <div className="relative z-10 w-full max-w-2xl p-8 mt-6 bg-[#001a33] border border-blue-500 shadow-xl rounded-xl flex flex-col items-center gap-6 transition-all duration-300 hover:shadow-blue-500/50 hover:scale-105">
        
        {/* File Input */}
        <label className="relative w-full text-center p-4 border border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-500/10 transition-all duration-300 hover:border-blue-400 hover:scale-105 group">
          <input
            type="file"
            accept=".jpg, .jpeg, .png"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
          <span className="text-lg font-semibold text-blue-400 group-hover:text-white transition-all">
            📁 Choose a File
          </span>
        </label>

        {file && (
          <p className="text-sm text-blue-300 font-mono bg-black/50 px-3 py-1 rounded-md border border-blue-500">
            Selected: {file.name}
          </p>
        )}

        {/* Upload Button */}
        {file && (
          <button
            onClick={handleImageUpload}
            disabled={loading}
            className="relative flex items-center gap-3 px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all duration-300 hover:scale-110 disabled:opacity-50 overflow-hidden"
          >
            {loading ? <Loader className="animate-spin text-white" /> : <ImageUp />}
            {loading ? "Uploading..." : "Upload"}
          </button>
        )}

        {!file && (
          <p className="text-lg font-bold text-red-400 animate-pulse">
            ⚠ Choose a file to upload!
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadImage;
