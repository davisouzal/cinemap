export default function Tab({ children, hover, color, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex my-2 py-2 px-2 flex-1 justify-center ${hover} ${
        active && color
      } transition duration-300 ease-in-out rounded-lg cursor-pointer`}
    >
      {children}
    </div>
  );
}
