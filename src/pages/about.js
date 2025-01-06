import Footer from "@/components/Footer";
import Image from "next/image";

export default function Archive() {
  return (
    <div className="flex flex-col gap-16 font-['Funnel_Sans']">
      <main className="w-full px-8 lg:grid lg:grid-cols-8">
        <div className="lg:col-span-5 w-full pt-[70vh] flex flex-col gap-4 mb-32">
          <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
            About
          </span>
          <h1 className="text-7xl">
            <span className="text-lime-300">[</span>SHENGCHI
            <span className="text-lime-300">]</span> is a web designer &
            creative developer based in Taiwan, passionate about crafting
            meaningful digital experiences.
          </h1>
          <p className="text-xl">
            With a strong foundation in design and no/low-code development, I
            specialize in blending aesthetics with functionality to create
            visually stunning and user-friendly websites. My work focuses on
            delivering innovative solutions that not only look great but also
            resonate with users, bringing brands and ideas to life online.
          </p>
        </div>
        <Image
          src="/assets/hero-bg.jpg"
          alt="background"
          width={1920}
          height={1080}
          className="object-cover lg:col-span-2 lg:col-start-7 pt-[70vh]"
        />
        <div className="lg:col-span-6 w-full flex flex-col gap-4 lg:gap-y-8 mb-32 lg:grid lg:grid-cols-6">
          <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px] lg:justify-self-start">
            Expertise
          </span>
          <div className="flex flex-col lg:col-span-3 lg:col-start-1">
            <h2 className="text-4xl">User-Centered Design</h2>
            <p className="text-xl">
              Blending design and development to create beautiful, functional
              digital experiences.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-4">
            <h2 className="text-4xl">Webflow Development</h2>
            <p className="text-xl">
              Designing and building responsive, user-friendly websites using
              Webflow’s no-code platform.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-1">
            <h2 className="text-4xl">Shopify Solutions</h2>
            <p className="text-xl">
              Creating customized e-commerce stores that are both functional and
              visually appealing.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-4">
            <h2 className="text-4xl">Workflow Automation</h2>
            <p className="text-xl">
              Using tools like Make.com and Zapier to simplify processes and
              create efficient systems.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-1">
            <h2 className="text-4xl">Creative Animations</h2>
            <p className="text-xl">
              Developing interactive animations with Spline, Rive, and Lottie to
              bring creative ideas to life.
            </p>
          </div>
          <div className="flex flex-col lg:col-span-3 lg:col-start-4">
            <h2 className="text-4xl">Professional Video Editing</h2>
            <p className="text-xl">
              Producing polished videos to enhance storytelling and brand
              presence.
            </p>
          </div>
        </div>
        <div className="lg:col-span-8 w-full flex flex-col gap-4 lg:gap-y-8 mb-32 lg:grid lg:grid-cols-8">
          <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px] lg:justify-self-start">
            Experiences
          </span>
          <div className="flex flex-col lg:col-span-3 lg:col-start-1 p-4 border relative bg-slate-100/10 border-gray-500">
            <div className="flex flex-row gap-4 items-end">
              <h2 className="text-4xl">tenten.co</h2>
              <h3 className="text-2xl">2022-present</h3>
            </div>
            <h3 className="text-xl">
              <span className="text-lime-300">[</span>UI/UX designer
              <span className="text-lime-300">]</span>,
              <span className="text-lime-300">[</span>Low/no-code developer
              <span className="text-lime-300">]</span>
            </h3>
            <ul className="text-md">
              <li className="text-lime-300">
                •Independently design and build responsive, user-friendly
                websites, including corporate sites and e-commerce platforms,
                using low/no-code tools such as Webflow and Shopify.
              </li>
              <li className="text-lime-300">
                •Collaborate with clients to understand their business needs and
                goals, and provide tailored solutions.
              </li>
              <li className="text-lime-300">
                •Utilize automation tools like Make.com and Zapier to streamline
                business processes and improve efficiency.
              </li>
              <li className="text-lime-300">
                •Create visually compelling motion graphics and high-quality
                graphic assets for marketing campaigns, digital platforms, and
                branding materials.
              </li>
              <li className="text-lime-300">
                Collaborate with internal teams to conceptualize and develop
                digital products tailored to the company’s objectives.
              </li>
            </ul>
            <Image
              src="/assets/tenten_logo.svg"
              className="absolute right-0 h-[40%] max-w-[50%] object-cover top-0 bottom-0"
              alt="Logo"
              width={450}
              height={450}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
