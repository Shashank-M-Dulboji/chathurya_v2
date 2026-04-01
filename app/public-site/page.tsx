import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import AboutSection from "./components/AboutSection";
import WorkshopsSection from "./components/WorkshopsSection";
import TeamSection from "./components/TeamSection";
import JoinSection from "./components/JoinSection";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsBar />
      <AboutSection />
      <WorkshopsSection />
      <TeamSection />
      <JoinSection />
      <Footer />
    </>
  );
}
