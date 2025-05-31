"use server";

import { signOut } from "@/src/auth";
import { logUserActivity } from "@/src/lib/notification";


export const logout = async () => {
   const user = await signOut();
   await signOut({ redirectTo: '/' });
   await logUserActivity(user.id, "LOGGED_OUT", "Logged out.");
};
