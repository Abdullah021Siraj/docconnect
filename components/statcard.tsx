import clsx from 'clsx'
import React from 'react'
import Image from 'next/image'

interface StatcardProps {
    type: 'Scheduled'|'Pending'|'Cancelled'
    count:number
    label:string
    icon:string
}
export const StatCard = ({ count = 0, label, icon, type }: StatcardProps) => {
    return (
      <div
        className={clsx("stat-card", {
          "bg-appointments": type === "Scheduled",
          "bg-pending": type === "Pending",
          "bg-cancelled": type === "Cancelled",
        })}
      >
        <div className="flex items-center gap-4">
          <Image
            src={icon}
            height={32}
            width={32}
            alt="appointments"
            className="size-8 w-fit"
          />
            <h2 className="text-32-bold text-white">{count}</h2>
        </div>
        <p text-14-regular>{label}</p>
    </div>
  )
}

export default StatCard