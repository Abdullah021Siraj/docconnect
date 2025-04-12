// Import necessary components and hooks from Agora SDK and React
import {
  LocalVideoTrack,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteUsers,
  useClientEvent,
} from "agora-rtc-react";

import React, { createContext, useContext, useState, useEffect } from "react";
import AgoraRTC, {
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
} from "agora-rtc-sdk-ng";
import { configType } from "./config";

// Define the shape of the Agora context
interface AgoraContextType {
  localCameraTrack: ICameraVideoTrack | null;
  localMicrophoneTrack: IMicrophoneAudioTrack | null;
  children: React.ReactNode;
}

// Create the Agora context
const AgoraContext = createContext<AgoraContextType | null>(null);

// AgoraProvider component to provide the Agora context to its children
export const AgoraProvider: React.FC<AgoraContextType> = ({
  children,
  localCameraTrack,
  localMicrophoneTrack,
}) => (
  <AgoraContext.Provider
    value={{ localCameraTrack, localMicrophoneTrack, children }}
  >
    {children}
  </AgoraContext.Provider>
);

// Custom hook to access the Agora context
export const useAgoraContext = () => {
  const context = useContext(AgoraContext);
  if (!context)
    throw new Error("useAgoraContext must be used within an AgoraProvider");
  return context;
};

// AgoraManager component responsible for handling Agora-related logic and rendering UI
export const AgoraManager = ({
  config,
  children,
}: {
  config: configType;
  children: React.ReactNode;
}) => {
  // Retrieve local camera and microphone tracks and remote users
  const agoraEngine = useRTCClient();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const remoteUsers = useRemoteUsers();
  const [role, setRole] = useState("host"); // Default role is host

  //   localCameraTrack?.setEncoderConfiguration({
  //     width: 640,
  //     height: { ideal: 480, min: 400, max: 500 },
  //     frameRate: 15,
  //     bitrateMin: 600,
  //     bitrateMax: 1000,
  // })
  // Publish local tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Join the Agora channel with the specified configuration
  useJoin({
    appid: config.appId,
    channel: config.channelName,
    token: config.rtcToken,
    uid: config.uid,
  });

  useClientEvent(agoraEngine, "user-joined", (user) => {
    console.log("The user", user.uid, " has joined the channel");
  });

  const callQualityEssentials = async () => {
    try {
      AgoraRTC.setLogLevel(2); // Info level
      await agoraEngine.enableDualStream();
    } catch (error) {
      console.log(error);
    }
    await localCameraTrack?.setEncoderConfiguration({
      width: 640,
      height: { ideal: 480, min: 400, max: 500 },
      frameRate: 15,
      bitrateMin: 600,
      bitrateMax: 1000,
    });
  };

  useClientEvent(agoraEngine, "user-left", (user) => {
    console.log("The user", user.uid, " has left the channel");
  });

  useClientEvent(agoraEngine, "user-published", (user, mediaType) => {
    console.log("The user", user.uid, " has published media in the channel");
  });

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole(event.target.value);
    if (event.target.value === "host") {
      agoraEngine
        .setClientRole("host")
        .then(() => {
          // Your code to handle the resolution of the promise
          console.log("Client role set to host successfully");
        })
        .catch((error) => {
          // Your code to handle any errors
          console.error("Error setting client role:", error);
        });
    } else {
      agoraEngine
        .setClientRole("audience")
        .then(() => {
          // Your code to handle the resolution of the promise
          console.log("Client role set to host successfully");
        })
        .catch((error) => {
          // Your code to handle any errors
          console.error("Error setting client role:", error);
        });
    }
  };

  useEffect(() => {
    return () => {
      localCameraTrack?.close();
      localMicrophoneTrack?.close();
    };
  }, []);

  // Check if devices are still loading
  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading) return <div>Loading devices...</div>;

  // Render the AgoraProvider and associated UI components
  return (
    <AgoraProvider
      localCameraTrack={localCameraTrack as any}
      localMicrophoneTrack={localMicrophoneTrack as any}
    >
      {/* Conditional rendering based on remoteUsers */}
      {remoteUsers.length > 0 ? (
        <div
          id="videos"
          className="absolute inset-0 flex justify-center items-center"
        >
          {/* Render the local video track */}
          <div className="vid flex w-auto h-screen  bg-[#1D4ED8]  min-w-full">
            {remoteUsers.map((remoteUser) => (
              <div key={remoteUser.uid} className="w-auto h-screen  min-w-full">
                <RemoteUser
                  user={remoteUser}
                  playVideo={true}
                  playAudio={true}
                />
              </div>
            ))}

            {/* <LocalVideoTrack track={localCameraTrack} play={true} /> */}
          </div>
          {/* Render remote users' video and audio tracks */}
            <div
              className="vid absolute left-6 top-6 p-1 bg-[#1D4ED8] shadow-2xl rounded-lg w-[150px] h-[210px] md:w-[350px] md:h-[200px] "
              // style={{ height: 200, width: 350 }}
            >
              <LocalVideoTrack track={localCameraTrack} play={true} />
            </div>
          
        </div>
      ) : (
        // Render this when no remote users
        <div
          id="videos"
          className="absolute inset-0 flex justify-center items-center"
        >
          {/* Render the local video track */}
          <div className="vid flex w-auto h-screen   bg-[#1D4ED8]  min-w-full">
            {/* <div className="vid " style={{ height: 300, width: 600 }}> */}
            {/* <div> */}
            <LocalVideoTrack track={localCameraTrack} play={true} />
            {/* </div> */}
          </div>
          {/* Render remote users' video and audio tracks */}
          {remoteUsers.map((remoteUser) => (
            <div
              className="vid w-[150px] h-[210px] md:w-[350px] md:h-[200px]  absolute left-6 top-6 p-1 bg-[#1D4ED8] shadow-2xl rounded-lg"
              // style={{ height: 200, width: 350 }}
              key={remoteUser.uid}
            >
              <RemoteUser user={remoteUser} playVideo={true} playAudio={true} />
            </div>
          ))}
        </div>
      )}

      {/* <div
        id="videos"
        className="absolute inset-0 flex justify-center items-center"
      > */}
      {/* Render the local video track */}
      {/* <div className="vid flex w-auto h-screen  bg-[#1D4ED8]  min-w-full"> */}
      {/* <div className="vid " style={{ height: 300, width: 600 }}> */}
      {/* <div> */}
      {/* <LocalVideoTrack track={localCameraTrack} play={true} /> */}
      {/* </div> */}
      {/* </div> */}
      {/* Render remote users' video and audio tracks */}
      {/* {remoteUsers.map((remoteUser) => (
          <div
            className="vid absolute left-6 top-6 p-1 bg-[#1D4ED8] shadow-2xl rounded-lg"
            style={{ height: 200, width: 350 }}
            key={remoteUser.uid}
          >
            <RemoteUser user={remoteUser} playVideo={true} playAudio={true} />
          </div>
        ))}
      </div> */}

      {children}
    </AgoraProvider>
  );
};

// Export the AgoraManager component as the default export
export default AgoraManager;
