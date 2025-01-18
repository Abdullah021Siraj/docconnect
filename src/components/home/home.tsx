import { Chatbot } from "../chatbot/chatbot";
import { DeptSection } from "./dept-section";
import { Footer } from "./footer";
import { HeaderSection } from "./header-section";
import { InfoCardSection } from "./info-section";
import { MeetOurExpertSection } from "./meet-section";
import { Newsletter } from "./newsletter";
import { ReviewSection } from "./review-section";
import { Team } from "./team";
import { UploadFile } from "./upload-section";

export const Home = () => {
  return (
    <div className="p-4 mt-12 min-h-screen">
      <HeaderSection />
      <InfoCardSection />
      <Chatbot />
      <UploadFile />
      <MeetOurExpertSection />
      <DeptSection />
      <ReviewSection />
      <Team />
      <Newsletter />
      <Footer />
    </div>
  );
};
