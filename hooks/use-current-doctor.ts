import { useSession } from "next-auth/react";

export const useCurrentDoctor = () => {
  const session = useSession();

  return session.data?.user;
};
