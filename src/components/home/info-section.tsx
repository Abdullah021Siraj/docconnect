import Image from "next/image";
import { InfoCard } from "./info-card";

export const InfoCardSection = () => {
  return (
    <>
      <div className="m-6">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          <InfoCard
            headerLabel="Online Appointments"
            image="/doctor-patient.png"
          >
            <p className="font-medium text-sm">
              The gradual accumulation of information about atomic and
              small-scale behaviour...
            </p>
          </InfoCard>
          <InfoCard headerLabel="Healthcare Services" image="/healthcare.png">
            <p className="font-medium text-sm">
              The gradual accumulation of information about atomic and
              small-scale behaviour...
            </p>
          </InfoCard>
          <InfoCard headerLabel="Heartbeat Monitoring" image="/heartbeat.png">
            <p className="font-medium text-sm">
              The gradual accumulation of information about atomic and
              small-scale behaviour...
            </p>
          </InfoCard>
        </div>
      </div>
      <div>
        <Image
          src="/container.png"
          alt="container"
          width={600}
          height={0}
          quality={100}
          className="flex justify-center items-center mx-auto"
        />
      </div>
    </>
  );
};
