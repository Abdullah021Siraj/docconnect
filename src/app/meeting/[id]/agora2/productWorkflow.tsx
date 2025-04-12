"use client"
import React, { useState, useEffect } from "react";
import {MicOffIcon, MicIcon, VideoIcon, VideoOffIcon, PhoneOffIcon} from "lucide-react";
import {
  AgoraRTCProvider,
  useRTCClient,
  useConnectionState,
} from "agora-rtc-react";
import AgoraRTC, { DeviceInfo, IAgoraRTCError } from "agora-rtc-sdk-ng";
import AuthenticationWorkflowManager from "./authenticationWorkflowManager";
import config from "./config";
import { useAgoraContext } from "./agoraManager";


export function ProductWorkflow() {
  const agoraEngine = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: config.selectedProduct }) as any);

  return (
    <div className="">
      <AgoraRTCProvider client={agoraEngine}>
        <AuthenticationWorkflowManager>
          <ProductWorkflowComponents />
        </AuthenticationWorkflowManager>
      </AgoraRTCProvider>
    </div>
  );
}
const ProductWorkflowComponents: React.FC = () => {
  const connectionState = useConnectionState();
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(connectionState === "CONNECTED");
  }, [connectionState]);



  return (
    <div>
      {isConnected && (
        <div className="flex gap-x-3 mt-4">
          <MuteVideoComponent />
          <MuteAudioComponent />
          <OnMicrophoneChangedHook />
          <OnCameraChangedHook />
        </div>
      )}
    </div>
  );
};


const MuteVideoComponent: React.FC = () => {
  const agoraContext = useAgoraContext();
  const [isMuteVideo, setMuteVideo] = useState(false);

  const toggleMuteVideo = () => {
    agoraContext.localCameraTrack
      ?.setEnabled(isMuteVideo)
      .then(() => setMuteVideo((prev) => !prev))
      .catch((error) => console.error(error));
  };

  return (
    <button className={`${isMuteVideo?"bg-red-500 text-white":"bg-green-500 text-white"} p-2 border hover:bg-red-500/50 rounded-full flex justify-center items-center absolute bottom-14`} onClick={toggleMuteVideo}>{isMuteVideo ? <VideoOffIcon /> : <VideoIcon/>}</button>
  );
};

const MuteAudioComponent: React.FC = () => {
  const agoraContext = useAgoraContext(); // Assuming you have a hook to access Agora context
  const [isMuteAudio, setMuteAudio] = useState(false);

  const toggleMuteAudio = () => {
    agoraContext.localMicrophoneTrack
      ?.setEnabled(isMuteAudio)
      .then(() => setMuteAudio((prev) => !prev))
      .catch((error) => console.error(error));
  };

  return (
    <button className={`${isMuteAudio?"bg-red-500 text-white":"bg-green-500 text-white"} p-2 border absolute bottom-14 right-[700px] hover:bg-red-500/50 rounded-full flex justify-center items-center`} onClick={toggleMuteAudio}>{isMuteAudio ? <MicOffIcon/> : <MicIcon/>}</button>
  );
};

const OnMicrophoneChangedHook: React.FC = () => {
  const agoraContext = useAgoraContext();

  useEffect(() => {
    const onMicrophoneChanged = (changedDevice: DeviceInfo) => {
      if (changedDevice.state === "ACTIVE") {
        agoraContext.localMicrophoneTrack?.setDevice(changedDevice.device.deviceId)
        .catch((error: IAgoraRTCError) => console.error(error));
      } else if (changedDevice.device.label === agoraContext.localMicrophoneTrack?.getTrackLabel()) {
        AgoraRTC.getMicrophones()
          .then((devices) => agoraContext.localMicrophoneTrack?.setDevice(devices[0].deviceId))
          .catch((error) => console.error(error));
      }
    };

    AgoraRTC.onMicrophoneChanged = onMicrophoneChanged;

    return () => {
      AgoraRTC.onMicrophoneChanged = undefined;
    };
  }, [agoraContext.localMicrophoneTrack]);

  return null;
};

const OnCameraChangedHook: React.FC = () => {
  const agoraContext = useAgoraContext();

  useEffect(() => {
    const onCameraChanged = (changedDevice: DeviceInfo) => {
      if (changedDevice.state === "ACTIVE") {
        agoraContext.localCameraTrack?.setDevice(changedDevice.device.deviceId)
        .catch((error) => console.error(error));
      } else if (changedDevice.device.label === agoraContext.localCameraTrack?.getTrackLabel()) {
        AgoraRTC.getCameras()
          .then((devices) => agoraContext.localCameraTrack?.setDevice(devices[0].deviceId))
          .catch((error) => console.error(error));
      }
    };

    AgoraRTC.onCameraChanged = onCameraChanged;

    return () => {
      AgoraRTC.onCameraChanged = undefined;
    };
  }, [agoraContext.localCameraTrack]);

  return null;
};

export default ProductWorkflow;