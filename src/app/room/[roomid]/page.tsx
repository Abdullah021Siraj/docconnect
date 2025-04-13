"use client";

import React, { useCallback, useEffect, useRef } from 'react';

import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { v4 as uuid } from 'uuid';
import useUser from '@/src/hooks/useUser';

const Room = ({ params }: { params: Promise<{ roomid: string }> }) => {
  const { fullName } = useUser();
  const { roomid } = React.use(params);
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
        url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomid}`
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

  return <div className="flex w-full " ref={containerRef} />
    
};

export default Room;