"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { v4 as uuid } from 'uuid';
import useUser from '@/src/hooks/useUser';

interface RoomProps {
  roomid: string;
}

const Room = ({ roomid }: RoomProps) => {
  const { fullName } = useUser();
  const zpRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initializeMeeting = useCallback(() => {
    if (zpRef.current || !containerRef.current) return;

    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;
    
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomid,
      uuid(),
      fullName || `user_${Date.now()}`,
      720
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    zp.joinRoom({
      container: containerRef.current,
      sharedLinks: [{
        name: "Shareable link",
        url: `${window.location.origin}/room/${roomid}`
      }],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      maxUsers: 10,
    });
  }, [roomid, fullName]);

  useEffect(() => {
    initializeMeeting();

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [initializeMeeting]);

  return <div className="flex w-full h-screen" ref={containerRef} />;
};

export default Room;
