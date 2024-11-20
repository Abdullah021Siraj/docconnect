import { getAllAppointmentsWithUser } from "@/actions/all-appointment";

export async function DashboardTable() {
  const users = await getAllAppointmentsWithUser();
  return (
    <div className="ml-4 mr-4 overflow-huser?.idden rounded-xl border-black border-2 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Patient</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Doctor</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow>
              <TableCell className="font-medium">{user.user?.name}</TableCell>
              <TableCell>
                <div className="font-bold">
                  {new Date(user.createdAt).toLocaleDateString()} <br />
                </div>
              </TableCell>
              <TableCell>{user?.status}</TableCell>
              <TableCell>
                {/* <div className="font-semibold">
                  <div>
                    {new Date(user.createdAt).toLocaleTimeString()}
                    <span className="ml-1 mr-1">-</span>
                    {new Date(user.expiresAt).toLocaleTimeString()}
                  </div>
                </div> */}
              </TableCell>
              <TableCell className="text-right">{user?.doctor?.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
    </div>
  );
}
