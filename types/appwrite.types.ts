import { Models } from "node-appwrite";

export interface Patient extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phonenum: string;
  birthdate: Date;
  gender: Gender;
  Address: string;
  occupation: string;
  emergencyContactname: string;
  emergencyContactnumber: string;
  primaryphysician: string;
  insuranceprovider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationtype: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacy: boolean;
}

export interface Appointment extends Models.Document {
  patient: Patient;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  userId: string;
  cancellationReason: string | null;
}