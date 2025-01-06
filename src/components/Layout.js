import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="grid grid-rows-[80px_1fr_20px] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-['Funnel_Sans']">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
