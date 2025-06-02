import VirtualAssistant from '../../components/VirtualAssist/virt';

     export default function RootLayout({
       children,
     }: {
       children: React.ReactNode;
     }) {
       return (
         <html lang="en">
           <body>
             {children}
             <VirtualAssistant />
           </body>
         </html>
       );
     }