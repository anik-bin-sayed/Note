import { FiSearch } from "react-icons/fi";

const Search = ({ search, setSearch }) => {
    return (
        <div className="mb-8">
            <div className="relative">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search your dictionary..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
                />
            </div>
        </div>
    );
};

export default Search;