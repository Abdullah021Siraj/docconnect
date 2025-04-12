"use client";
import React, { useEffect } from "react";
import { MicOffIcon, MicIcon, VideoIcon, VideoOffIcon } from "lucide-react";
import {
  // AgoraRTCProvider,
  // useRTCClient,
  useConnectionState,
} from "agora-rtc-react";
import { DeviceInfo, IAgoraRTCError } from "agora-rtc-sdk-ng";
// import AuthenticationWorkflowManager from "./authenticationWorkflowManager";
// import config from "./config";
import { useAgoraContext } from "./agoraManager";
//
import { useState } from "react";
import { AgoraManager } from "./agoraManager";
import config from "./config";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  AgoraRTCProvider,
  useClientEvent,
  useRTCClient,
} from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";
// import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import { PhoneOffIcon } from "lucide-react";

// Product Workflow

export function ProductWorkflow() {
  const agoraEngine = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: config.selectedProduct }) as any
  );

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
    <button
      className={`${
        isMuteVideo ? "bg-red-500 text-white" : "bg-green-500 text-white"
      } p-2 lg:p-4 border hover:bg-red-500/50 rounded-full flex justify-center items-center `}
      // } p-2 border hover:bg-red-500/50 rounded-full flex justify-center items-center absolute bottom-14`}
      onClick={toggleMuteVideo}
    >
      {isMuteVideo ? (
        <VideoOffIcon  />
      ) : (
        <VideoIcon  />
      )}
    </button>
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
    <button
      className={`${
        isMuteAudio ? "bg-red-500 text-white" : "bg-green-500 text-white"
      } p-2 lg:p-4 border right-[700px] hover:bg-red-500/50 rounded-full flex justify-center items-center`}
      // } p-2 border absolute bottom-14 right-[700px] hover:bg-red-500/50 rounded-full flex justify-center items-center`}
      onClick={toggleMuteAudio}
    >
      {isMuteAudio ? (
        <MicOffIcon  />
      ) : (
        <MicIcon  />
      )}
      {/* {isMuteAudio ? <div className="w-9 h-9"><MicOffIcon  /></div> : <div className="w-9 h-9"> <MicIcon  /></div>} */}
    </button>
  );
};


const OnMicrophoneChangedHook: React.FC = () => {
  const agoraContext = useAgoraContext();

  useEffect(() => {
    const onMicrophoneChanged = (changedDevice: DeviceInfo) => {
      if (changedDevice.state === "ACTIVE") {
        agoraContext.localMicrophoneTrack
          ?.setDevice(changedDevice.device.deviceId)
          .catch((error: IAgoraRTCError) => console.error(error));
      } else if (
        changedDevice.device.label ===
        agoraContext.localMicrophoneTrack?.getTrackLabel()
      ) {
        AgoraRTC.getMicrophones()
          .then((devices) =>
            agoraContext.localMicrophoneTrack?.setDevice(devices[0].deviceId)
          )
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
        agoraContext.localCameraTrack
          ?.setDevice(changedDevice.device.deviceId)
          .catch((error) => console.error(error));
      } else if (
        changedDevice.device.label ===
        agoraContext.localCameraTrack?.getTrackLabel()
      ) {
        AgoraRTC.getCameras()
          .then((devices) =>
            agoraContext.localCameraTrack?.setDevice(devices[0].deviceId)
          )
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

// export default ProductWorkflow;

async function fetchRTCToken(channelName: string) {
  if (config.serverUrl !== "") {
    try {
      const response = await fetch(
        `${config.proxyUrl}${config.serverUrl}/rtc/${channelName}/publisher/uid/${config.uid}/?expiry=${config.tokenExpiryTime}`
      );
      const data = (await response.json()) as { rtcToken: string };
      console.log("RTC token fetched from server: ", data.rtcToken);
      return data.rtcToken;
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    return config.rtcToken;
  }
}

// const useTokenWillExpire = () => {
//   const agoraEngine = useRTCClient();
//   useClientEvent(agoraEngine, "token-privilege-will-expire", () => {
//     if (config.serverUrl !== "") {
//       fetchRTCToken(config.channelName)
//         .then((token) => {
          //console.log("RTC token fetched from server: ", token);
//           if (token) return agoraEngine.renewToken(token);
//         })
//         .catch((error) => {
//           console.error(error);
//         });
//     } else {
      //console.log(
//         "Please make sure you specified the token server URL in the configuration file"
//       );
//     }
//   });
// };

function AuthenticationWorkflowManager(props: { children?: React.ReactNode }) {
  // const [channelName, setChannelName] = useState<string>("");
  const searchParams = useSearchParams();
  const { id }: { id: string } = useParams();
  const channelName = id || "";
  const [joined, setJoined] = useState(false);
  const router = useRouter();
  // useTokenWillExpire();

  async function routeDashboard() {
    router.push("/");
  }

  const fetchTokenFunction = async () => {
    if (config.serverUrl !== "" && channelName !== "") {
      try {
        const token = (await fetchRTCToken(channelName)) as string;
        config.rtcToken = token;
        config.channelName = channelName;
        setJoined(true);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log(
        "Please make sure you specified the token server URL in the configuration file"
      );
    }
  };

  const client = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }) as any
  );

  return (
    <div>
      {!joined ? (
        <div className="flex w-full h-screen justify-center items-center flex-col">
          {/* <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Channel name"
          /> */}
          <h1 className="text-xl font-semibold mb-4">
            Interview is ready. Please join
          </h1>
          <div className="flex flex-row gap-4">
            {/* <Button onClick={() => void fetchTokenFunction()}>Join</Button>
            <Button onClick={() => routeDashboard()}>Back to Dashboard</Button> */}
            <button onClick={() => void fetchTokenFunction()}>Join</button>
            <button onClick={() => routeDashboard()}>Back to Dashboard</button>
          </div>
          {props.children}
        </div>
      ) : (
        // <div className="flex w-full h-full  justify-center items-center flex-col">
        <div className="flex w-screen h-screen justify-center items-center">
          <AgoraRTCProvider client={client}>
            <AgoraManager config={config}>
              {props.children}
              <div className="absolute flex w-[35%] lg:w-[20%] justify-between bottom-8 z-10">
                <MuteAudioComponent />
                <MuteVideoComponent />
                <button
                  className={`text-white bg-red-500 p-2 lg:p-4  hover:bg-red-500/50 border rounded-full flex justify-center items-center `}
                  // className={`text-white bg-red-500 p-2  hover:bg-red-500/50 border rounded-full flex justify-center items-center absolute bottom-14 right-[582px]`}
                  onClick={() => setJoined(false)}
                >
                  <PhoneOffIcon  />
                </button>
              </div>
            </AgoraManager>
          </AgoraRTCProvider>
        </div>
      )}
    </div>
  );
}

export default AuthenticationWorkflowManager;
