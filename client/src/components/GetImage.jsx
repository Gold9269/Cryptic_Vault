import axios from "axios";
import { useWeb3Context } from "../contexts/useWeb3Context";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CircleArrowLeft, CircleArrowRight } from "lucide-react";
import Spinner from "./Spinner";

const GetImage = ({ reload }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [imagePerPage, setImagePerPage] = useState(2);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { web3State } = useWeb3Context();
    const { selectedAccount, contractInstance } = web3State;
    
    useEffect(() => {
        const getImageHashes = async () => {
            if (!contractInstance || !selectedAccount) {
                console.log("Missing contract or account:", { 
                    hasContract: !!contractInstance, 
                    hasAccount: !!selectedAccount 
                });
                return [];
            }
            
            try {
                console.log("Fetching IPFS hashes for account:", selectedAccount);
                const ipfsHashes = await contractInstance.viewFiles(selectedAccount);
                console.log("IPFS hashes retrieved:", Object.values(ipfsHashes).length);
                return ipfsHashes;
            } catch (error) {
                console.error("Error fetching IPFS hashes:", error);
                toast.error("Failed to retrieve image references");
                return [];
            }
        };
        
        const getImages = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const ipfsHashes = await getImageHashes();
                const ipfsHashArray = Object.values(ipfsHashes);
                
                if (ipfsHashArray.length === 0) {
                    console.log("No IPFS hashes found");
                    setImages([]);
                    return;
                }
                
                const url = `http://localhost:3000/api/getImage?page=${currentPage}&limit=${imagePerPage}`;
                const token = localStorage.getItem("token");
                
                if (!token) {
                    setError("Authentication token not found");
                    toast.error("Authentication required");
                    return;
                }
                
                console.log("Sending request to:", url);
                console.log("Request payload:", ipfsHashArray);
                
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        "x-access-token": token
                    }
                };
                
                try {
                    const response = await axios.post(url, ipfsHashArray, config);
                    console.log("API response:", response.data);
                    
                    if (response.data && response.data.depcryptedImageArr) {
                        setImages(response.data.depcryptedImageArr);
                    } else {
                        setImages([]);
                        console.warn("No images in response:", response.data);
                    }
                } catch (apiError) {
                    console.error("API error details:", {
                        status: apiError.response?.status,
                        statusText: apiError.response?.statusText,
                        data: apiError.response?.data,
                        message: apiError.message
                    });
                    
                    setError(apiError.response?.data?.message || apiError.message);
                    throw apiError; // Re-throw to be caught by outer catch
                }
                
            } catch (error) {
                console.error("Error fetching images:", error);
                toast.error(error.response?.data?.message || "Failed to fetch images");
                setImages([]);
            } finally {
                setLoading(false);
            }
        };
        
        getImages();
    }, [contractInstance, currentPage, imagePerPage, selectedAccount, reload]);

    const paginate = (pageNumber) => {
        if (pageNumber < 1) return;
        setCurrentPage(pageNumber);
    };

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-[240px]">
                    <p className="text-lg"><Spinner/></p>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-[240px] text-red-500">
                    <p className="text-lg">Error: {error}</p>
                </div>
            ) : images.length > 0 ? (
                <div className="flex justify-start md:justify-center items-center w-full overflow-x-auto">
                    {images.map((imgData, index) => (
                        <img
                            key={index}
                            src={`data:image/jpeg;base64,${imgData}`}
                            alt={`Image ${index + 1}`}
                            className="w-[300px] h-[240px] mx-2 object-cover"
                        />
                    ))}
                </div>
            ) : (
                <div className="flex justify-center items-center h-[240px]">
                    <p className="text-lg font-bold text-red-500 animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 drop-shadow-2xl animate-glow">
                        ⚠ No images found
                    </p>
                </div>


            )}
            
            <div className="w-full h-20 flex justify-center items-center gap-4">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className={currentPage === 1 || loading ? "opacity-30" : ""}
                >
                    <CircleArrowLeft className="w-8 h-8 opacity-80" />
                </button>
                <span className="font-bold text-[24px]">{currentPage}</span>
                <button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={loading}
                    className={loading ? "opacity-30" : ""}
                >
                    <CircleArrowRight className="w-8 h-8 opacity-80" />
                </button>
            </div>
        </>
    );
};

export default GetImage;