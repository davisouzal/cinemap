export default function Body({ children }) {
  return (
    <div className="bg-primary-500 flex flex-col flex-[8] my-11 ml-16 mr-12 rounded-2xl shadow-2xl py-14 pl-16 pr-12 relative text-white overflow-x-hidden">
      {children}
    </div>
  );
}
