import React from "react";

const WelcomeCard = () => {
  return (
   <div
     className="text-white py-5 px-6 rounded-md shadow-md"
      style={{
      background: "var(--Gradasi-Hijau-Biru, linear-gradient(90deg, #6EA57C 0%, #8FC2D1 100%))",
  }}
>
      <h2 className="text-3xl font-bold mb-2">
        Ayo Olah Sumber Daya Alam dan Wujudkan Kemandirian Papua!
      </h2>
      <h1 className="text-xl">Eksplorasi kekayaan alam Papua lewat produk dan kreasi autentik.</h1>
      <span className="text-xl">Dari bahan segar hingga hasil olahan mandiri </span>
      <h1 className="text-xl">semuanya berakar dari bumi Papua, untuk dapur dan hidup yang lebih mandiri.</h1>
      <span className="text-xl">Nikmati hasilnya, rasakan jejak lokalnya!</span>
    </div>
  );
};

export default WelcomeCard;
