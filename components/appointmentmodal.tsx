'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from './ui/button';
import {AppointmentForm} from './forms/appointmentform';
import { Appointment } from '@/types/appwrite.types';

const Appointmentmodal = ({
  type,
  patientId,
  userId,
  appointment,
}:
  {
    type:'schedule'|'cancel',
    patientId:string,
    userId:string,
    appointment?:Appointment
    title?:string,
    description?:string
  }
) => {
  const[Open,setopen]=useState(false);
  return (
<Dialog open={Open} onOpenChange={setopen}>
  <DialogTrigger asChild>
    <Button
      variant="ghost"
      className={`capitalize ${type === 'schedule' ? 'text-green-500' : ''}`}
    >
      {type}
    </Button>
  </DialogTrigger>
  <DialogContent className='shad-dialog sm:max-w-md'>
    <DialogHeader className='mb-4 space-y-3'>
      <DialogTitle className='capitalize'>{type}Appointment</DialogTitle>
      <DialogDescription>
       Kindly fill the following details to {type} an appointment
      </DialogDescription>
    </DialogHeader>
    <AppointmentForm
    userId={userId}
    patientId={patientId}
    type={type}
    appointment={appointment}
    setOpen={setopen}
    />
  </DialogContent>
</Dialog>
  );
}
export default Appointmentmodal