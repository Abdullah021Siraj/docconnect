"use client"

import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useRouter, usePathname } from 'next/navigation';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { encryptKey } from '@/lib/utils';

const PasskeyModal = () => {
  const [open, setOpen] = useState(true);
  const path = usePathname();
  const router = useRouter();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  // Clear any existing passkey from local storage on component load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessKey'); // Clear saved key on load
    }
  }, []);

  const validatePasskey = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      const encryptedKey = encryptKey(passkey);  // Encrypt the entered passkey
      localStorage.setItem('accessKey', encryptedKey); // Save encrypted key in local storage
      setOpen(false);
      router.push('/admin'); // Redirect to admin page
    } else {
      setError('Invalid Passkey. Please Try Again');
    }
  };

  const closeModal = () => {
    setOpen(false);
    router.push('/');
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className='shad-alert-dialog'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-start justify-between'>
            Admin Access Verification
            <Image
              src="/assets/icons/close.svg"
              alt="close"
              width={20}
              height={20}
              onClick={closeModal}
              className='cursor-pointer'
            />
          </AlertDialogTitle>
          <AlertDialogDescription>
            Enter Passkey to Access Admin Panel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <InputOTP
            maxLength={5}
            value={passkey}
            onChange={(value) => setPasskey(value)}
          >
            <InputOTPGroup className="shad-otp">
              <InputOTPSlot className="shad-otp-slot" index={0} />
              <InputOTPSlot className="shad-otp-slot" index={1} />
              <InputOTPSlot className="shad-otp-slot" index={2} />
              <InputOTPSlot className="shad-otp-slot" index={3} />
              <InputOTPSlot className="shad-otp-slot" index={4} />
            </InputOTPGroup>
          </InputOTP>

          {error && <p className='shad-error text-14-regular mt-4 justify-center'>{error}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={validatePasskey} className='shad-primary-btn w-full'>
            Enter Admin Passkey
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PasskeyModal;
