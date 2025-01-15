import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/src/components/ui/avatar";

interface MessageProps {
  text: string;
  sender: "you" | "other";
  image?: string;
}

const Message: React.FC<MessageProps> = ({ text, sender, image }) => {
  return (
    <div
      className={cn(
        "rounded-lg p-2 my-2 max-w-[70%] flex items-center",
        sender === "you"
          ? "bg-[#d7998c] text-black self-end"
          : "bg-[#2f2f2f] text-white self-start"
      )}
    >
      {/* Conditional Image (Avatar) */}
      {image && (
        <Avatar className={cn("w-8 h-8", sender === "you" ? "ml-2" : "mr-2")}>
          <AvatarImage src={image} alt="Sender" />
        </Avatar>
      )}

      {/* Text */}
      <span>{text}</span>
    </div>
  );
};

export default Message;
