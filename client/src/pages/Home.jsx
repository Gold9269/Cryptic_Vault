import { useState } from "react";
import UploadImage from "../components/UploadImage";
import GetImage from "../components/GetImage";

const Home = () => {
  const [reload, setReload] = useState(false);

  const reloadEffect = () => {
    setReload(!reload);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col justify-center items-center bg-black text-white overflow-hidden">
      {/* Dynamic Blue Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,132,255,0.4),rgba(0,0,64,1))] animate-pulse"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-6xl h-full flex flex-col justify-center items-center gap-10 px-6 py-10">
        <UploadImage reloadEffect={reloadEffect} />
        <GetImage reload={reload} />
      </div>
    </div>
  );
};

export default Home;
