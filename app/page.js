import Nav from "@/components/Nav/Nav";
import VideoIntro from "@/components/VideoIntro/VideoIntro";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import Work from "@/components/sections/Work";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main id="top">
      <Nav />
      <VideoIntro />
      <About />
      <Capabilities />
      <Work />
      <Contact />
    </main>
  );
}
