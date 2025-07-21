import VirtualAssistant from "../../components/VirtualAssist/virt";

const RootLayout = ({ children }: any) => {
  return (
    <html lang="en">
      <body>
        {children}
        <VirtualAssistant />
      </body>
    </html>
  );
};

export default RootLayout;
