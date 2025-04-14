"use client"

import React from 'react';
import dynamic from 'next/dynamic';

const RoomComponent = dynamic(() => import('../../../components/Room'), { ssr: false });

export default function RoomPage({ params }: { params: Promise<{ roomid: string }> }) {
  const { roomid } = React.use(params); // this avoids the warning

  return <RoomComponent roomid={roomid} />;
}
