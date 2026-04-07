import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import TalentCard from '../components/TalentCard';
import type { TalentRecord } from '../types/talentRecord';
import {
  NARROW_BOOKING_CATEGORIES,
  fetchTalentDirectory,
  filterRosterByCitySlug,
  MEMPHIS_AREA_TALENT_IDS,
  NASHVILLE_AREA_TALENT_IDS,
  NEW_ORLEANS_AREA_TALENT_IDS,
} from '../data/talent';
import { rankTalentResults, type ProviderTypeFilter } from '../lib/search/rankTalent';
import { useCity } from '../context/CityContext';

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
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-sk-gold">Chef &amp; truck tags</h2>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {NARROW_BOOKING_CATEGORIES.map((cat) => {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { citySlug, cityDisplayName } = useCity();
  const verifiedOnly = searchParams.get('verified') === 'true';
  const locationFilter = searchParams.get('location');
  const rawType = searchParams.get('type');
  const typeFromUrl = rawType === 'private_chef' || rawType === 'food_truck' ? rawType : null;
  const providerTypeRaw = typeFromUrl ?? searchParams.get('providerType');
  const providerType: ProviderTypeFilter =
    providerTypeRaw === 'food_truck' || providerTypeRaw === 'private_chef' ? providerTypeRaw : 'all';
  const memphisOnly = locationFilter === 'Memphis';
  const nashvilleOnly = locationFilter === 'Nashville';
  const newOrleansOnly = locationFilter === 'New Orleans';

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
        setRoster(filterRosterByCitySlug(list, citySlug));
        setDirectoryLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [citySlug]);

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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('verified');
      next.delete('location');
      next.delete('type');
      next.delete('providerType');
      return next;
    });
  }, [setSearchParams]);

  const setProviderTypeInUrl = useCallback(
    (nextType: ProviderTypeFilter) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (nextType === 'all') next.delete('type');
        else next.set('type', nextType);
        next.delete('providerType');
        return next;
      });
    },
    [setSearchParams],
  );

  const typeFilterActive = providerType !== 'all';

  const hasActiveFilters = useMemo(
    () =>
      selectedCategories.length > 0 ||
      debouncedSearch.trim().length > 0 ||
      verifiedOnly ||
      memphisOnly ||
      nashvilleOnly ||
      newOrleansOnly ||
      typeFilterActive,
    [
      selectedCategories,
      debouncedSearch,
      verifiedOnly,
      memphisOnly,
      nashvilleOnly,
      newOrleansOnly,
      typeFilterActive,
    ],
  );

  const activeFilterCount = useMemo(
    () =>
      selectedCategories.length +
      (debouncedSearch.trim() ? 1 : 0) +
      (verifiedOnly ? 1 : 0) +
      (memphisOnly || nashvilleOnly || newOrleansOnly ? 1 : 0) +
      (typeFilterActive ? 1 : 0),
    [
      selectedCategories,
      debouncedSearch,
      verifiedOnly,
      memphisOnly,
      nashvilleOnly,
      newOrleansOnly,
      typeFilterActive,
    ],
  );

  const filtered = useMemo(() => {
    const base = roster.filter((row) => {
      if (verifiedOnly && !row.verified) return false;
      if (memphisOnly && !MEMPHIS_AREA_TALENT_IDS.includes(row.id)) return false;
      if (nashvilleOnly && !NASHVILLE_AREA_TALENT_IDS.includes(row.id)) return false;
      if (newOrleansOnly && !NEW_ORLEANS_AREA_TALENT_IDS.includes(row.id)) return false;
      return matchesCategoryFilters(selectedCategories, row) && matchesSearch(debouncedSearch, row);
    });
    return rankTalentResults(base, providerType);
  }, [
    roster,
    debouncedSearch,
    selectedCategories,
    verifiedOnly,
    memphisOnly,
    nashvilleOnly,
    newOrleansOnly,
    providerType,
  ]);

  const searchPending = searchInput !== debouncedSearch;

  const pageHeading =
    providerType === 'private_chef'
      ? `${cityDisplayName} Private Chefs`
      : providerType === 'food_truck'
        ? `${cityDisplayName} Food Trucks`
        : `${cityDisplayName} Chefs & Food Trucks`;

  const filterBtn = (active: boolean) =>
    `min-h-[44px] rounded-sk-md px-4 py-2 text-sm font-bold transition-colors border-0 cursor-pointer ${
      active ? 'text-white' : 'border border-sk-card-border bg-white text-sk-navy'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-sk-body-bg">
      <SEO
        title={`${pageHeading} | SpiceKrewe`}
        description="Book verified private chefs and food trucks in Memphis with SpiceKrewe. AI concierge, secure payment."
        path="/talent"
        ogTitle={`${pageHeading} | SpiceKrewe`}
        ogDescription="Book verified private chefs and food trucks in Memphis with SpiceKrewe. AI concierge, secure payment."
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
            <h1
              className="m-0 mb-2 text-[clamp(1.35rem,4vw,1.75rem)] font-bold tracking-tight text-sk-navy"
              style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif' }}
            >
              {pageHeading}
            </h1>
            <p className="m-0 mb-5 max-w-[560px] text-[15px] leading-snug text-sk-text-subtle">
              Verified {cityDisplayName}-area private chefs and food trucks for dinners, celebrations, and corporate or
              outdoor events.
            </p>
            <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by provider type">
              <button
                type="button"
                className={filterBtn(providerType === 'all')}
                style={providerType === 'all' ? { backgroundColor: '#4d2f91' } : undefined}
                onClick={() => setProviderTypeInUrl('all')}
              >
                All
              </button>
              <button
                type="button"
                className={filterBtn(providerType === 'private_chef')}
                style={providerType === 'private_chef' ? { backgroundColor: '#4d2f91' } : undefined}
                onClick={() => setProviderTypeInUrl('private_chef')}
              >
                Private Chefs
              </button>
              <button
                type="button"
                className={filterBtn(providerType === 'food_truck')}
                style={providerType === 'food_truck' ? { backgroundColor: '#4d2f91' } : undefined}
                onClick={() => setProviderTypeInUrl('food_truck')}
              >
                Food Trucks
              </button>
            </div>
            {verifiedOnly ? (
              <p className="m-0 mb-3 rounded-sk-md border border-sk-gold/40 bg-[#fef8e7] px-3 py-2 text-[13px] font-medium text-[#8a6200]">
                Showing SK Verified professionals only.
              </p>
            ) : null}
            {providerType === 'private_chef' ? (
              <p className="m-0 mb-3 rounded-sk-md border border-sk-card-border bg-sk-purple-light/10 px-3 py-2 text-[13px] font-medium text-sk-navy">
                Showing private chefs (intimate events, 1–30 guests).
              </p>
            ) : null}
            {providerType === 'food_truck' ? (
              <p className="m-0 mb-3 rounded-sk-md border border-sk-card-border bg-sk-purple-light/10 px-3 py-2 text-[13px] font-medium text-sk-navy">
                Showing food trucks (gatherings &amp; outdoor events, 20–200+ guests).
              </p>
            ) : null}
            {memphisOnly ? (
              <p className="m-0 mb-3 rounded-sk-md border border-sk-card-border bg-sk-purple-light/10 px-3 py-2 text-[13px] font-medium text-sk-navy">
                Showing Memphis-area talent from the directory roster.
              </p>
            ) : null}
            {nashvilleOnly ? (
              <p className="m-0 mb-3 rounded-sk-md border border-sk-card-border bg-sk-purple-light/10 px-3 py-2 text-[13px] font-medium text-sk-navy">
                Showing Nashville-area talent from the directory roster.
              </p>
            ) : null}
            {newOrleansOnly ? (
              <p className="m-0 mb-3 rounded-sk-md border border-sk-card-border bg-sk-purple-light/10 px-3 py-2 text-[13px] font-medium text-sk-navy">
                Showing New Orleans-area talent from the directory roster.
              </p>
            ) : null}

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
              {NARROW_BOOKING_CATEGORIES.map((cat) => {
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

      <Footer />
    </div>
  );
}
