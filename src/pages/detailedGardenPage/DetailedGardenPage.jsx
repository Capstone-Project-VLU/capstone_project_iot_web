import React from "react";
import HeaderComponent from "../../components/Header/HeaderComponent";
import { useParams } from "react-router";
import { GardenTitle } from "../../pages/detailedGardenPage/detailGardenPageComponents/GardenTitle";
import { DetailedGardenInfo } from "../../pages/detailedGardenPage/detailGardenPageComponents/DetailedGardenInfo";
import IrrigationModeSection from "../../pages/detailedGardenPage/detailGardenPageComponents/IrrigationModeSection";
import FooterComponent from "../../components/FooterComponent/FooterComponent";

function DetailedGarden() {
  const { gardenId } = useParams();
  // console.log("Garden ID:", gardenId); // Debugging line

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <HeaderComponent />
      <div className="flex-grow">
        <GardenTitle
          gardenName={`Khu vườn ${gardenId}`}
          areaGardenName="Thông tin khu vườn"
        />
        <DetailedGardenInfo className="ml-8" deviceId={gardenId} />
        <IrrigationModeSection />
      </div>
      <FooterComponent />
    </div>
  );
}

export default DetailedGarden;
