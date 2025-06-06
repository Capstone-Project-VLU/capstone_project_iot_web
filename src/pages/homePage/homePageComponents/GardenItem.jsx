import React, { useState, useEffect, memo } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router";
import { ToggleSwitch } from "../../../components/ToggleComponent/ToggleSwitch";
import { updateControlById } from "../../../api/deviceApi";
import { apiResponseHandler } from "../../../components/Alert/alertComponent";
import "react-loading-skeleton/dist/skeleton.css";
import i18n from "../../../i18n";

const GardenItem = memo(function GardenItem({
  id,
  name,
  sensors = [],
  controls = [],
  img_area,
  isOwner = false,
}) {
  const navigate = useNavigate();
  const sensorTypes = ["temperature", "moisture"];
  const controlNames = ["water", "light", "wind"]; // Added "fan" control
  const [cooldowns, setCooldowns] = useState({}); // Initialize cooldown state as empty object

  const displayedSensors = sensorTypes.map((type) => {
    return sensors.find((s) => s.type === type) || { type, value: "---" };
  });

  const [controlStatuses, setControlStatuses] = useState({});

  useEffect(() => {
    const updatedStatuses = {};

    controlNames.forEach((name) => {
      const control = controls.find((c) => c.name === name);
      updatedStatuses[name] = {
        status: control?.status ?? false,
        mode: control?.mode ?? "---",
      };
    });

    setControlStatuses(updatedStatuses);

    // Merge new control names into cooldowns without resetting existing ones
    setCooldowns((prev) => {
      const updatedCooldowns = { ...prev };
      controlNames.forEach((name) => {
        if (!(name in updatedCooldowns)) {
          updatedCooldowns[name] = false;
        }
      });
      return updatedCooldowns;
    });
  }, [controls]);

  const handleToggle = async (controlName, controlId) => {
    if (cooldowns[controlName]) return; // Ignore if in cooldown

    // Start cooldown by setting it to true
    setCooldowns((prev) => ({
      ...prev,
      [controlName]: true, // Set cooldown for this control
    }));

    const current = controlStatuses[controlName];
    const newStatus = !current.status;

    // Optimistically update status AND mode to "manual"
    setControlStatuses((prev) => ({
      ...prev,
      [controlName]: {
        status: newStatus,
        mode: "manual", // Set mode to "manual" immediately after toggle
      },
    }));

    try {
      // Send the request to the backend to update control status and mode
      await updateControlById({
        id_esp: id,
        controlId,
        data: {
          status: newStatus,
          mode: "manual", // Send the updated mode to the backend
        },
      });
    } catch (error) {
      // Revert status and mode if the request fails
      setControlStatuses((prev) => ({
        ...prev,
        [controlName]: current, // Revert to the original state if the request fails
      }));
      apiResponseHandler("Failed to update control status.", "error");
    } finally {
      // Set the cooldown timeout (2 seconds in this case)
      setTimeout(() => {
        // End the cooldown after 2 seconds
        setCooldowns((prev) => ({
          ...prev,
          [controlName]: false, // Remove the cooldown after 2 seconds
        }));
      }, 2000);
    }
  };

  const handleImageGardenClick = (deviceId) => {
    navigate(`/garden/${deviceId}`);
  };

  return (
    <div
      className={`w-[32%] rounded-2xl shadow-xl bg-white flex ${
        isOwner === true ? "border-green-500 border-2" : "border-2"
      }`}
    >
      <div className="w-1/2 aspect-square rounded-xl border-r-2 transition-transform hover:scale-105 overflow-hidden">
        <img
          src={
            img_area !== ""
              ? img_area
              : require("../../../assets/images/ItemImg.png")
          }
          alt="Garden"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => handleImageGardenClick(id)}
        />
      </div>
      <div className="w-3/5 p-1 flex flex-col justify-between">
        <div className="m-1 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-green-800 truncate">
            {name}
          </h1>
          <img
            src={require("../../../assets/images/TreePlanting.png")}
            className="w-6 h-6 cursor-pointer hover:opacity-80"
            alt="edit"
          />
        </div>
        <hr className="border-t-1 border-gray-300" />
        <div className="m-1 text-gray-700">
          {displayedSensors.map((sensor, index) => {
            const sensorIcons = {
              moisture: "💧", // Water
              temperature: "🌡️", // Temperature
              humidity: "💦", // Humidity
            };
            return (
              <div key={index} className="flex justify-between">
                <h2 className="w-4/5 font-medium text-gray-600 flex items-center">
                  <span className="mr-2">{sensorIcons[sensor.type]}</span>
                  {sensor.type === "temperature"
                    ? i18n.t("temperature")
                    : i18n.t("soil_moisture")}
                  :
                </h2>
                <div className="w-1/5 flex justify-end items-center">
                  <h2 className="text-xl font-semibold text-green-600">
                    {sensor?.value.toFixed(1)}
                  </h2>
                  <h2 className="text-xl font-semibold text-green-600 ml-2">
                    {sensor.type === "temperature" ? "°C" : "%"}
                  </h2>
                </div>
              </div>
            );
          })}
        </div>
        <hr className="my-1 border-t-1 border-gray-300" />
        <div className="text-gray-700">
          {controlNames.map((controlName, index) => {
            const control = controls.find((c) => c.name === controlName);
            const isControlAvailable = control?.status !== undefined;
            const status = controlStatuses[controlName]?.status; // Use status from controlStatuses state
            const mode = controlStatuses[controlName]?.mode; // Use mode from controlStatuses state

            return (
              <div
                key={index}
                className="px-1 flex justify-between items-center"
              >
                <span
                  className={`font-medium text-green-600 flex items-center ${
                    !isControlAvailable ? "opacity-40" : ""
                  }`}
                >
                  {/* Control icon based on control type */}
                  <span className="mr-2">
                    {controlName === "water"
                      ? "🚿"
                      : controlName === "light"
                      ? "🔆"
                      : "🌬️"}
                  </span>
                  {controlName === "water"
                    ? i18n.t("water")
                    : controlName === "light"
                    ? i18n.t("light")
                    : i18n.t("wind")}
                </span>

                {/* Toggle with Mode next to it */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs italic text-green-400">
                    {i18n.t(mode || "---")}
                  </span>
                  {isControlAvailable ? (
                    <ToggleSwitch
                      isOn={status}
                      onToggle={() => handleToggle(controlName, control?._id)}
                      disabled={cooldowns[controlName]} // Use the cooldown status for this control
                      isLoading={cooldowns[controlName]} // Apply reduced opacity when in cooldown
                    />
                  ) : (
                    <div className="opacity-40 pointer-events-none">
                      <ToggleSwitch />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const GardenItemSkeleton = memo(function GardenItemSkeleton() {
  return (
    <div className="w-[32%] h-1/2 rounded-xl border-2 shadow-lg bg-white flex overflow-hidden">
      <div className="p-2 w-2/5 bg-gray-200 rounded-xl border-r-2">
        <Skeleton height="100%" width="100%" />
      </div>
      <div className="w-3/5 p-2 flex flex-col justify-between">
        <div className="m-1 flex justify-between items-center">
          <Skeleton width="60%" height={20} />
          <Skeleton circle width={30} height={30} />
        </div>

        <div className="m-1 p-2 space-y-2 text-gray-700">
          <div className="px-2 flex justify-between items-center">
            <Skeleton width="40%" height={20} />
            <Skeleton width="30%" height={20} />
          </div>
          <div className="px-2 flex justify-between items-center">
            <Skeleton width="40%" height={20} />
            <Skeleton width="30%" height={20} />
          </div>
        </div>

        <div className=" m-1 p-2 space-y-1 text-gray-700">
          <div className="px-2 flex justify-between items-center">
            <Skeleton width="40%" height={20} />
            <Skeleton circle width={30} height={30} />
          </div>
          <div className="px-2 flex justify-between items-center">
            <Skeleton width="40%" height={20} />
            <Skeleton circle width={30} height={30} />
          </div>
        </div>
      </div>
    </div>
  );
});

export { GardenItem, GardenItemSkeleton };
