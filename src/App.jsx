import Header from "./components/Header";
import Hero from "./components/Hero";
import RequestForm from "./components/RequestForm";
import HowItWorks from "./components/HowItWorks";
import WhyChooseUs from "./components/WhyChooseUs";
import SupportedParts from "./components/SupportedParts";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import { ContactInfoProvider } from "./context/ContactInfoContext";

function App() {
  return (
    <ContactInfoProvider>
      <div className="min-h-screen bg-silver-50">
        <Header />
        <main>
          <Hero />
          <RequestForm />
          <HowItWorks />
          <WhyChooseUs />
          <SupportedParts />
          <Contact />
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </ContactInfoProvider>
  );
}

export default App;
