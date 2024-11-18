import FilterButton from "./FilterButton";
import { FaClock, FaCircleCheck, FaCircleXmark } from "react-icons/fa6";

export default function MovieFilter({ setFilter, filter }) {
  return (
    <div className="flex bg-primary-700 rounded-xl text-xl flex-1 gap-2 px-2">
      <FilterButton
        hover="hover:bg-secondary-700"
        color="bg-secondary-700"
        active={filter === "plan"}
        onClick={() => setFilter("plan")}
      >
        <FaClock size={24} className="mr-3 mt-0.5" />
        Plan to watch
      </FilterButton>
      <FilterButton
        hover="hover:bg-[#609F6E]"
        color="bg-[#609F6E]"
        active={filter === "completed"}
        onClick={() => {
          setFilter("completed");
        }}
      >
        <FaCircleCheck size={24} className="mr-3 mt-0.5" />
        Completed
      </FilterButton>
      <FilterButton
        hover="hover:bg-[#9F6060]"
        color="bg-[#9F6060]"
        active={filter === "dropped"}
        onClick={() => setFilter("dropped")}
      >
        <FaCircleXmark size={24} className="mr-3 mt-0.5" />
        Dropped
      </FilterButton>
    </div>
  );
}
