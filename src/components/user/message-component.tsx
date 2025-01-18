const MessageComponent: React.FC<{ text: string; sender: "you" | "other"; darkMode: boolean }> = ({ text, sender, darkMode }) => {
        return (
          <div className={`flex ${sender === "you" ? "justify-end " : "justify-start"}`}>
            <div
              className={`p-3 rounded-lg max-w-[70%] ${
                sender === "you"
                  ? darkMode
                    ? "bg-black text-white text-lg"
                    : "bg-black text-white text-lg"
                  : darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {text}
            </div>
          </div>
        );
};

export default MessageComponent;