import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import PixelatedImage from "@/components/PixelatedImage";
import DecryptedText from "@/components/DecryptedText";

export default function Archive() {
  return (
    <div className="flex flex-col gap-16 font-['Funnel_Sans']">
      <main className="w-full px-4 md:px-8 lg:grid lg:grid-cols-8 relative">
        <div className="fixed w-full h-[100dvh] z-[-1] top-0 left-0">
          <Image
            src="/assets/about-bg.webp"
            alt="about-hero"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={85}
          />
        </div>
        <div className="lg:col-span-5 w-full pt-[70vh] flex flex-col gap-4 lg:mb-64 mb-32">
          <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
            About
          </span>
          <h1 className="md:text-7xl text-4xl">
            <span className="text-lime-300">[</span>
            <DecryptedText
              text="SHENGCHI"
              hoverText="JOSH"
              animateOn="hover"
              speed={50}
              maxIterations={10}
              sequential={true}
              revealDirection="left"
            >
              SHENGCHI
            </DecryptedText>
            <span className="text-lime-300">]</span> is a web designer &
            creative developer based in Taiwan, passionate about crafting
            meaningful digital experiences.
          </h1>
          <p className="text-lg mt-2 leading-tight">
            With a strong foundation in design and no/low-code development, I
            specialize in blending aesthetics with functionality to create
            visually stunning and user-friendly websites. My work focuses on
            delivering innovative solutions that not only look great but also
            resonate with users, bringing brands and ideas to life online.
          </p>
        </div>
        <div className="lg:col-span-2 lg:col-start-7 lg:pt-[70vh] pb-[8rem] flex flex-row justify-end">
          <PixelatedImage
            src="/assets/personal-img.webp"
            alt="background"
            width={1920}
            height={1080}
            className="object-cover lg:sticky lg:top-[20vh] lg:max-w-[20rem] h-[30vh] lg:max-h-[10rem] max-h-max"
          />
        </div>

        <div className="lg:col-span-6 w-full flex flex-col gap-4 lg:gap-y-8 mb-64 lg:grid lg:grid-cols-6">
          <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px] lg:justify-self-start">
            Expertise
          </span>
          <div className="flex flex-col lg:col-span-3 lg:col-start-1">
            <h2 className="text-4xl">User-Centered Design</h2>
            <p className="text-lg mt-2 leading-tight">
              Blending design and development to create beautiful, functional
              digital experiences.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-4">
            <h2 className="text-4xl">Webflow Development</h2>
            <p className="text-lg mt-2 leading-tight">
              Designing and building responsive, user-friendly websites using
              Webflow’s no-code platform.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-1">
            <h2 className="text-4xl">Shopify Solutions</h2>
            <p className="text-lg mt-2 leading-tight">
              Creating customized e-commerce stores that are both functional and
              visually appealing.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-4">
            <h2 className="text-4xl">Workflow Automation</h2>
            <p className="text-lg mt-2 leading-tight">
              Using tools like Make.com and Zapier to simplify processes and
              create efficient systems.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-1">
            <h2 className="text-4xl">Creative Animations</h2>
            <p className="text-lg mt-2 leading-tight">
              Developing interactive animations with Spline, Rive, and Lottie to
              bring creative ideas to life.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-4">
            <h2 className="text-4xl">Professional Video Editing</h2>
            <p className="text-lg mt-2 leading-tight">
              Producing polished videos to enhance storytelling and brand
              presence.
            </p>
          </div>
        </div>
        <div className="lg:col-span-8 w-full flex flex-col gap-8 lg:gap-y-8 mb-4 lg:grid lg:grid-cols-8">
          <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px] lg:justify-self-start">
            Experiences
          </span>
          <div
            className="flex flex-col lg:col-span-3 lg:col-start-1 lg:p-8 p-4 border relative bg-slate-100/5 border-white/10 gap-2 backdrop-blur-md rounded-[2px] lg:mb-8 mb-0"
            style={{
              backgroundImage: "url('./assets/tenten_logo.svg')",
              backgroundSize: "auto 10rem",
              backgroundPosition: "top right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <h2 className="text-4xl">UI/UX designer & Low/no-code developer</h2>
            <div className="flex flex-row gap-4 items-end">
              <h3 className="text-xl">tenten.co</h3>
              <h3 className="text-xl">2022-present</h3>
            </div>
            <ul className="text-lg list-[square] ml-4 leading-tight">
              <li className="mb-2">
                Design and develop responsive websites with Webflow and Shopify,
                incorporating motion graphics for engaging user experiences.
              </li>
              <li className="mb-2">
                Automate workflows and optimize processes using tools like
                Make.com and Zapier.
              </li>
              <li>
                Develop and prototype experimental digital products aligned with
                business goals.
              </li>
            </ul>
          </div>
          <div
            className="flex flex-col lg:col-span-3 lg:col-start-3 lg:p-8 p-4 border relative bg-slate-100/5 border-white/10 gap-2 backdrop-blur-md rounded-[2px] lg:mb-8 mb-0"
            style={{
              backgroundImage: "url('./assets/net_logo.svg')",
              backgroundSize: "auto 10rem",
              backgroundPosition: "top right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <h2 className="text-4xl">Product Designer</h2>
            <div className="flex flex-row gap-4 items-end">
              <h3 className="text-xl">Netigate</h3>
              <h3 className="text-xl">2021-2022</h3>
            </div>
            <ul className="text-lg list-[square] ml-4 leading-tight">
              <li className="mb-2">
                Designed and maintained industrial IoT products, focusing on
                usability and user-centered design principles.
              </li>
              <li>
                Developed and upheld consistent visual branding for the
                company&apos;s promotional materials.
              </li>
            </ul>
          </div>
          <div
            className="flex flex-col lg:col-span-3 lg:col-start-5 lg:p-8 p-4 border relative bg-slate-100/5 border-white/10 gap-2 backdrop-blur-md rounded-[2px] lg:mb-8 mb-0"
            style={{
              backgroundImage: "url('./assets/domus_logo.svg')",
              backgroundSize: "auto 10rem",
              backgroundPosition: "top right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <h2 className="text-4xl">Master in Interaction Design</h2>
            <div className="flex flex-row gap-4 items-end">
              <h3 className="text-xl">Domus Academy</h3>
              <h3 className="text-xl">2020-2021</h3>
            </div>
            <ul className="text-lg list-[square] ml-4 leading-tight">
              <li className="mb-2">
                Awarded a scholarship for academic excellence; created projects
                including interactive installations and apps.
              </li>
              <li>
                Led end-to-end design processes, from UX research to UI/UX
                design, prototyping, and presentations evaluated by industry
                professionals.
              </li>
            </ul>
          </div>
          <Link
            className="flex flex-col lg:col-span-2 lg:col-start-7 py-4 px-4 border relative transition-all bg-slate-100/5 hover:bg-slate-100/10 border-white/10 rounded-[2px] backdrop-blur-md"
            href="https://linkedin.com/in/sheng-chi-huang-9600371a7"
            target="_blank"
          >
            <div className="flex flex-row gap-4 items-end justify-between">
              <h3 className="text-2xl">Learn me more on</h3>
              <Image
                src="/assets/linkedin-logo.svg"
                alt="linkedin logo"
                width="382"
                height="382"
                className="w-8 aspect-square"
              />
            </div>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
