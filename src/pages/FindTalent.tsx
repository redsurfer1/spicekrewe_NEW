import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Search } from 'lucide-react';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import B2BBanner from '../components/B2BBanner';
import SEO from '../components/SEO';
import TalentCard from '../components/TalentCard';
import type { TalentRecord } from '../types/talentRecord';
import { CULINARY_CATEGORIES, fetchTalentDirectory } from '../data/talent';

const SEARCH_DEBOUNCE_MS = 300;

/** Match name, role, or specialty (all query terms must appear somewhere in those fields). */
function matchesSearch(q: string, row: TalentRecord): boolean {
  const raw = q.trim().toLowerCase();
  if (!raw) return true;
  const blob = [row.name, row.role, row.specialty].join(' ').toLowerCase();
  const terms = raw.split(/\s+/).filter(Boolean);
  return terms.every((term) => blob.includes(term));
}

function matchesCategoryFilters(selectedTags: string[], row: TalentRecord): boolean {
  if (selectedTags.length === 0) return true;
  return row.tags.some((tag) => selectedTags.includes(tag));
}

type FilterPanelProps = {
  selectedCategories: string[];
  toggleCategory: (cat: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
};

function TalentFilterPanel({ selectedCategories, toggleCategory, onClearAll, hasActiveFilters }: FilterPanelProps) {
  return (
    <>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-sk-gold">Culinary categories</h2>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {CULINARY_CATEGORIES.map((cat) => {
          const checked = selectedCategories.includes(cat);
          return (
            <li key={cat}>
              <label
                className={`flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-sk-md border px-2.5 py-2.5 text-sm box-border ${
                  checked
                    ? 'border-sk-purple bg-sk-purple text-white'
                    : 'border-transparent bg-transparent text-sk-purple-light'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat)}
                  className="h-[18px] w-[18px] shrink-0 accent-sk-purple"
                />
                <span>{cat}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearAll}
          className="mt-3.5 w-full min-h-[44px] rounded-sk-md border border-sk-gold/40 bg-transparent px-3 py-2.5 text-xs font-semibold text-sk-gold cursor-pointer"
        >
          Clear all filters
        </button>
      ) : null}
    </>
  );
}

function DirectorySkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading talent directory"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="min-h-[220px] rounded-sk-lg border border-sk-card-border p-5"
          style={{
            background: 'linear-gradient(90deg, rgba(185, 158, 232, 0.35) 25%, var(--sk-body-bg) 50%, rgba(185, 158, 232, 0.35) 75%)',
            backgroundSize: '200% 100%',
            animation: 'sk-shimmer 1.2s ease-in-out infinite',
          }}
        />
      ))}
      <style>{`@keyframes sk-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
    </div>
  );
}

function EmptyTalentState({ onClearAll }: { onClearAll: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-sk-lg border border-dashed border-sk-card-border bg-sk-body-bg px-6 py-14 text-center"
      role="status"
    >
      <p className="m-0 mb-4 text-lg font-semibold text-sk-navy">No professionals found</p>
      <p className="m-0 mb-6 max-w-md text-sm leading-relaxed text-sk-text-subtle">
        Try a different search, remove category filters, or clear everything to see the full directory.
      </p>
      <button
        type="button"
        onClick={onClearAll}
        className="min-h-[44px] rounded-sk-md bg-sk-purple px-5 py-2.5 text-sm font-semibold text-white cursor-pointer border-0"
      >
        Clear all filters
      </button>
    </div>
  );
}

export default function FindTalent() {
  const [roster, setRoster] = useState<TalentRecord[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setDirectoryLoading(true);
    fetchTalentDirectory().then((list) => {
      if (!cancelled) {
        setRoster(list);
        setDirectoryLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSearchInput('');
    setDebouncedSearch('');
  }, []);

  const hasActiveFilters = useMemo(
    () => selectedCategories.length > 0 || debouncedSearch.trim().length > 0,
    [selectedCategories, debouncedSearch],
  );

  const activeFilterCount = useMemo(
    () => selectedCategories.length + (debouncedSearch.trim() ? 1 : 0),
    [selectedCategories, debouncedSearch],
  );

  const filtered = useMemo(() => {
    return roster.filter(
      (row) => matchesCategoryFilters(selectedCategories, row) && matchesSearch(debouncedSearch, row),
    );
  }, [roster, debouncedSearch, selectedCategories]);

  const searchPending = searchInput !== debouncedSearch;

  return (
    <div className="flex min-h-screen flex-col bg-sk-body-bg">
      <SEO
        title="Find culinary talent – Spice Krewe"
        description="Source vetted culinary R&D professionals, recipe developers, and flavor consultants."
        path="/talent"
        ogTitle="Find culinary talent – Spice Krewe"
        ogDescription="Source vetted culinary R&D professionals, recipe developers, and flavor consultants."
      />
      <Navbar />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <button
          type="button"
          className="flex w-full min-h-[48px] items-center justify-between gap-3 rounded-xl border border-sk-gold/25 bg-sk-navy px-4 py-3 text-left font-semibold text-white lg:hidden"
          aria-expanded={mobileFiltersOpen}
          aria-controls="talent-directory-filters"
          onClick={() => setMobileFiltersOpen((o) => !o)}
        >
          <span>
            Filters
            {activeFilterCount > 0 ? (
              <span className="ml-2 font-medium text-sk-gold">({activeFilterCount} active)</span>
            ) : null}
          </span>
          <span className="text-[18px] text-sk-purple-light" aria-hidden>
            {mobileFiltersOpen ? '−' : '+'}
          </span>
        </button>

        <aside
          id="talent-directory-filters"
          className={`w-full shrink-0 rounded-xl border border-sk-gold/25 bg-sk-navy p-4 lg:sticky lg:top-[88px] lg:block lg:w-64 lg:self-start ${
            mobileFiltersOpen ? 'block' : 'hidden'
          }`}
        >
          <TalentFilterPanel
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            onClearAll={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden rounded-xl border border-sk-card-border bg-sk-surface w-full">
          <div className="border-b border-sk-card-border px-4 pb-5 pt-6 sm:px-6 sm:pt-7">
            <h1 className="m-0 mb-2 text-[clamp(1.35rem,4vw,1.75rem)] font-bold tracking-tight text-sk-navy">
              Find culinary talent
            </h1>
            <p className="m-0 mb-5 max-w-[560px] text-[15px] leading-snug text-sk-text-subtle">
              Search vetted chefs, developers, stylists, and consultants. Use categories to narrow the directory.
            </p>

            <div className="relative w-full max-w-full sm:max-w-[480px]">
              <label htmlFor="talent-directory-search" className="sr-only">
                Search talent by name, role, or specialty
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-sk-text-soft"
                strokeWidth={2}
                aria-hidden
              />
              <input
                id="talent-directory-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, role, or specialty…"
                className="box-border w-full min-h-[48px] rounded-sk-md border border-sk-card-border bg-white py-3 pl-11 pr-4 text-base text-sk-navy outline-none transition-colors duration-150 focus:border-sk-purple focus:ring-2 focus:ring-sk-purple/25"
              />
            </div>
            {searchPending ? (
              <p className="mt-2 text-xs text-sk-text-soft">Updating results…</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {CULINARY_CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`min-h-[44px] rounded-sk-pill border px-3 text-xs font-semibold cursor-pointer transition-colors ${
                      active
                        ? 'border-sk-purple bg-sk-purple text-white'
                        : 'border-sk-card-border bg-white text-sk-text-muted'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="min-h-[44px] rounded-sk-pill border border-sk-gold/50 bg-transparent px-3 text-xs font-semibold text-sk-gold cursor-pointer"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </div>

          <div className="px-4 py-6 sm:px-6">
            <p className="m-0 mb-4 text-[13px] text-sk-text-subtle">
              {directoryLoading
                ? 'Loading directory…'
                : `${filtered.length} professional${filtered.length === 1 ? '' : 's'} match your filters`}
            </p>
            {directoryLoading ? (
              <DirectorySkeleton />
            ) : filtered.length === 0 ? (
              <EmptyTalentState onClearAll={clearAllFilters} />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {filtered.map((row, index) => (
                  <TalentCard
                    key={row.id}
                    professional={row}
                    className="animate-sk-enter"
                    style={{ animationDelay: `${Math.min(index, 12) * 45}ms` } satisfies CSSProperties}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <B2BBanner />
      <Footer />
    </div>
  );
}
