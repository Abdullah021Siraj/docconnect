import jsPDF from "jspdf";
import { useState } from "react";

const ExportChatHistoryToPDF = () => {
    const doc = new jsPDF();


          const [userChatHistory, setUserChatHistory] = useState<{
            messages: { question: string; userResponse: string; botResponse: string }[];
            result: string | null;
          }>({ messages: [], result: null });
  
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255); // Blue color for title
    doc.text("Chat History Report", 10, 10);
    doc.setTextColor(0, 0, 0); // Reset text color to black
  
    // Add chat messages
    userChatHistory.messages.forEach((entry, index) => {
      const yOffset = 20 + index * 40; // Adjust Y position for each message
      doc.setFontSize(14);
  
      doc.text(`Q${index + 1}:`, 10, yOffset);
      doc.setFontSize(12);
      doc.text(entry.question, 20, yOffset);
      doc.text(`Your Response: ${entry.userResponse}`, 10, yOffset + 10);
      doc.text(`Bot Response: ${entry.botResponse}`, 10, yOffset + 30);
      doc.addPage(); // Adding page break after each message
    });
  
    // Final Result
    if (userChatHistory.result) {
      doc.setFontSize(16);
      doc.setTextColor(0, 128, 0); // Green color for conclusion
      doc.text("Conclusion:", 10, 20 + userChatHistory.messages.length * 40);
      doc.setFontSize(14);
      doc.text(userChatHistory.result, 10, 25 + userChatHistory.messages.length * 40);
    }
  
    // Save PDF
    doc.save("Chat_History_Report.pdf");
  };

  export default ExportChatHistoryToPDF;