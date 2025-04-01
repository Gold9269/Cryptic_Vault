import ConnectedAccount from "./ConnectedAccount";
import {useNavigate} from 'react-router-dom'

const Navbar = () => {
    const navigate=useNavigate();
  return (
    <div className="w-full h-[90px] bg-gradient-to-r from-[#001F3F] via-[#003366] to-[#00081F] shadow-xl border-b-[3px] border-blue-500 flex justify-between items-center px-10 relative uppercase tracking-wide text-blue-300 font-bold text-lg">
      
      <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,132,255,0.1)] blur-md opacity-40"></div>

      {/* Navbar Title */}
      <h1 onClick={()=> navigate('/')} className="text-blue-400 text-2xl font-extrabold tracking-wide glow-text">Web3 Vault</h1>

      {/* Connected Account Button */}
      <ConnectedAccount />

      <style>{`
        .glow-text {
          text-shadow: 0 0 8px #00bfff, 0 0 15px #0099ff;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
