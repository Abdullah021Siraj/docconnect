import Image from "next/image";
import Link from "next/link";

import { StatCard } from "@/components/statcard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/datatable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.action";
import { Appointment } from "@/types/appwrite.types";

// Adjust the structure below based on your actual Appointment type
const sampleData: Appointment[] = [
  {
    id: 1,
    patient: {
      userId: "12",
      name: "Abdul Muizz",
      email: "muizzmalik37@gmail.com",
      // ... other patient properties
    },
    schedule: new Date("2024-12-31"),
    primaryPhysician: "Dr. Asad Ali",
    reason: "Routine checkup",
    status: "scheduled",
  },
  {
    id: 2,
    patient: {
      userId: "13",
      name: "Abdullah Siraj",
      email: "abdullahsiraj@gmail.com",
      // ... other patient properties
    },
    schedule: new Date("2024-11-29"),
    primaryPhysician: "Dr. Ali Rizwan",
    reason: "Consultation",
    status: "pending",
  },
  {
    id: 3,
    patient: {
      userId: "17",
      name: "Osama malik",
      email: "osamamalik@gmail.com",
      // ... other patient properties
    },
    schedule: new Date("2024-11-30"),
    primaryPhysician: "Dr. Ali Rizwan",
    reason: "Consultation",
    status: "pending",
  },
  {
    id: 4,
    patient: {
      userId: "19",
      name: "Sameer malik",
      email: "Sameermalik@gmail.com",
      // ... other patient properties
    },
    schedule: new Date("2024-11-27"),
    primaryPhysician: "Dr. Junaid Awan",
    reason: "Consultation",
    status: "cancelled",
  },
];

const AdminPage = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/weblogo.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>

        <p className="text-16-semibold text-white">Admin Dashboard</p>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="Scheduled"
            count={1}
            label="Scheduled appointments"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="Pending"
            count={2}
            label="Pending appointments"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="Cancelled"
            count={1}
            label="Cancelled appointments"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

        <DataTable columns={columns} data={sampleData} />
      </main>
    </div>
  );
};

export default AdminPage;
