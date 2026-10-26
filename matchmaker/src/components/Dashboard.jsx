import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Users,
  HeartHandshake,
  Send,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarDays,
  Coffee,
  Plus,
  X,
} from "lucide-react";
import { customers, STAGES, ageOf, fullName } from "../lib/data.js";
import { Avatar, StatusBadge, Verified, EmptyState } from "./shared.jsx";

export default function Dashboard({
  workspace,
  onSelect,
  search,
  setSearch,
  onNavigate,
}) {
  const [stage, setStage] = useState("All stages");
  const [city, setCity] = useState("All cities");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("name");
  const records = customers.map((customer) => ({
    ...customer,
    status: workspace.statuses[customer.id] ?? customer.status,
  }));
  const filtered = useMemo(
    () =>
      records
        .filter(
          (customer) =>
            `${fullName(customer)} ${customer.city} ${customer.id}`
              .toLowerCase()
              .includes(search.toLowerCase()) &&
            (stage === "All stages" || customer.status === stage) &&
            (city === "All cities" || customer.city === city),
        )
        .sort((a, b) =>
          sort === "age"
            ? ageOf(a.dob) - ageOf(b.dob)
            : fullName(a).localeCompare(fullName(b)),
        ),
    [search, stage, city, sort, workspace.statuses],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 8, currentPage * 8);
  const active = records.filter(
    (customer) => customer.status !== "On hold",
  ).length;
  const matching = records.filter(
    (customer) => customer.status === "Matching",
  ).length;
  const introduced = new Set([
    ...records
      .filter((customer) => customer.status === "Introduced")
      .map((customer) => customer.id),
    ...workspace.sent.map((item) => item.customerId),
  ]).size;
  const ready = records.filter((customer) => customer.status === "Matching");
  const reset = () => {
    setSearch("");
    setStage("All stages");
    setCity("All cities");
    setPage(1);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="greeting">
            A little care goes a long way <span>♡</span>
          </div>
          <h1>Good things start with a connection.</h1>
          <p>Welcome back, Priya. Let’s make someone’s day.</p>
        </div>
        <div className="heading-date">
          <CalendarDays size={16} />
          <span>
            {new Intl.DateTimeFormat("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: "Asia/Kolkata",
            }).format(new Date())}
          </span>
        </div>
      </div>
      <section className="stat-grid" aria-label="Workspace summary">
        {[
          {
            label: "Assigned customers",
            value: records.length.toString().padStart(2, "0"),
            icon: Users,
            hint: "People in your care",
            tone: "purple",
          },
          {
            label: "Actively looking",
            value: active.toString().padStart(2, "0"),
            icon: HeartHandshake,
            hint: `${matching} ready for a match`,
            tone: "pink",
          },
          {
            label: "Customers introduced",
            value: introduced.toString().padStart(2, "0"),
            icon: Send,
            hint: "A first step together",
            tone: "green",
          },
          {
            label: "On hold",
            value: records
              .filter((c) => c.status === "On hold")
              .length.toString()
              .padStart(2, "0"),
            icon: Clock3,
            hint: "Taking their own time",
            tone: "amber",
          },
        ].map(({ label, value, icon: Icon, hint, tone }) => (
          <div className="stat-card" key={label}>
            <div>
              <span className="stat-label">{label}</span>
              <strong>{value}</strong>
              <span className="stat-hint">{hint}</span>
            </div>
            <span className={`stat-icon tone-${tone}`}>
              <Icon size={21} />
            </span>
          </div>
        ))}
      </section>
      <div className="dashboard-columns">
        <section className="panel customer-panel">
          <div className="section-heading">
            <div>
              <h2>
                Your customers{" "}
                <span className="count-pill">{customers.length}</span>
              </h2>
              <p>A story behind every profile. A possibility in every match.</p>
            </div>
            <button
              className={`button subtle filter-toggle ${showFilters ? "selected" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>
          <div className="table-tools">
            <div className="search-field">
              <Search size={17} />
              <input
                id="customer-search"
                aria-label="Search customers"
                placeholder="Search by name, city, or ID…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <button
                  className="clear-search"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <label className="sr-only" htmlFor="stage-filter">
              Filter by stage
            </label>
            <select
              id="stage-filter"
              value={stage}
              onChange={(e) => {
                setStage(e.target.value);
                setPage(1);
              }}
            >
              <option>All stages</option>
              {STAGES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          {showFilters && (
            <div className="expanded-filters">
              <label>
                City
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>All cities</option>
                  {[...new Set(customers.map((c) => c.city))]
                    .sort()
                    .map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                </select>
              </label>
              <label>
                Sort by
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="name">Name A–Z</option>
                  <option value="age">Age, youngest first</option>
                </select>
              </label>
              <button className="text-button" onClick={reset}>
                Reset filters
              </button>
            </div>
          )}
          <div className="table-scroll">
            <table className="customer-table">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Age / City</th>
                  <th scope="col">Marital status</th>
                  <th scope="col">Journey stage</th>
                  <th scope="col">
                    <span className="sr-only">Open profile</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <button
                        className="customer-name-button"
                        onClick={() => onSelect(customer.id)}
                      >
                        <Avatar profile={customer} />
                        <span>
                          <strong>
                            {fullName(customer)} <Verified compact />
                          </strong>
                          <small>{customer.id}</small>
                        </span>
                      </button>
                    </td>
                    <td>
                      <span>{ageOf(customer.dob)} years</span>
                      <small>{customer.city}</small>
                    </td>
                    <td>
                      <span className="marital-label">
                        {customer.maritalStatus}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={customer.status} />
                    </td>
                    <td>
                      <button
                        className="row-open icon-button"
                        aria-label={`Open ${fullName(customer)}`}
                        onClick={() => onSelect(customer.id)}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && (
            <EmptyState
              icon={Search}
              title="No customers found"
              action={
                <button className="button secondary" onClick={reset}>
                  Clear filters
                </button>
              }
            >
              Try another name, city, or journey stage.
            </EmptyState>
          )}
          <div className="table-footer">
            <span>
              {filtered.length
                ? `Showing ${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, filtered.length)} of ${filtered.length} customers`
                : "0 customers"}
            </span>
            <div className="pagination">
              <button
                className="icon-button"
                disabled={currentPage === 1}
                aria-label="Previous page"
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  aria-label={`Page ${i + 1}`}
                  aria-current={currentPage === i + 1 ? "page" : undefined}
                  className={currentPage === i + 1 ? "page-current" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="icon-button"
                disabled={currentPage === pages}
                aria-label="Next page"
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
        <aside className="dashboard-aside">
          <section className="daily-card">
            <div className="daily-heading">
              <span className="daily-heart">
                <HeartHandshake size={24} />
              </span>
              <span className="small-tag">Your daily nudge</span>
            </div>
            <h2>
              A thoughtful intro
              <br />
              can change everything.
            </h2>
            <p>Start with someone who’s ready to take the next step.</p>
            <button
              className="button primary"
              onClick={() => onSelect(ready[0]?.id ?? customers[0].id)}
            >
              Find a connection <ArrowRight size={16} />
            </button>
            <span className="daily-decoration">♡</span>
          </section>
          <section className="panel next-up">
            <div className="section-heading">
              <h2>Ready for a little magic</h2>
              <span className="tiny-sparkle">✧</span>
            </div>
            <p className="muted">Customers in the matching stage</p>
            {ready.slice(0, 3).map((customer) => (
              <button
                className="next-customer"
                key={customer.id}
                onClick={() => onSelect(customer.id)}
              >
                <Avatar profile={customer} size="sm" />
                <span>
                  <strong>{fullName(customer)}</strong>
                  <small>{customer.city} · View suggestions</small>
                </span>
                <ChevronRight size={15} />
              </button>
            ))}
            {!ready.length && (
              <p className="muted">No customers are in matching right now.</p>
            )}
          </section>
          <section className="care-note">
            <span>
              <Coffee size={21} />
            </span>
            <div>
              <h3>The human part matters.</h3>
              <p>A quick check-in can tell you what a profile can’t.</p>
              <button
                className="text-button"
                onClick={() => onNavigate("notes")}
              >
                Open your notebook <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </aside>
      </div>
      <div className="workspace-footnote">
        <ShieldCheckIcon />{" "}
        <span>
          Fictional demo profiles. Every real introduction begins with consent.
        </span>
      </div>
    </>
  );
}

function ShieldCheckIcon() {
  return <Check size={13} />;
}
