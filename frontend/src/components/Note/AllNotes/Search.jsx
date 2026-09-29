import { FiSearch } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

const Search = ({
  setSearchInput,
  setShowSuggestions,
  handleSearchSubmit,
  showSuggestions,
  suggestionTitles,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("q") || "";

  return (
    <div className="mb-8">
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(event) => {
            const value = event.target.value;

            // Input state update
            setSearchInput(value);

            // URL update
            const newParams = new URLSearchParams(searchParams);

            if (value.trim()) {
              newParams.set("q", value);
            } else {
              newParams.delete("q");
            }

            newParams.set("page", "1");

            setSearchParams(newParams);

            setShowSuggestions(Boolean(value.trim()));
          }}
          onFocus={() => {
            setShowSuggestions(Boolean(search.trim()));
          }}
          onBlur={() => {
            setTimeout(() => {
              setShowSuggestions(false);
            }, 100);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearchSubmit();
            }
          }}
          placeholder="Search your notes..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
        />

        {showSuggestions && suggestionTitles.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {suggestionTitles.map((title) => (
              <li key={title}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();

                    setSearchInput(title);

                    const newParams = new URLSearchParams(searchParams);

                    newParams.set("q", title);
                    newParams.set("page", "1");

                    setSearchParams(newParams);

                    handleSearchSubmit(title);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <FiSearch className="text-slate-400" />
                  {title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
