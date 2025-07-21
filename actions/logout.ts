"use server";

import { signOut } from "@/src/auth";
import { currentUser } from "@/src/lib/auth"; // Import your currentUser function
import { logUserActivity } from "@/src/lib/notification";

export const logout = async () => {
   // Get user information before signing out
   const user = await currentUser();
   
   // Log the activity if user exists
   if (user && typeof user.id === "string") {
      await logUserActivity(user.id, "LOGGED_OUT", "Logged out.");
   }
   
   // Sign out and redirect
   await signOut({ redirectTo: '/' });
};