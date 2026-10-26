import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { customers, pool, ageOf, fullName } from "../lib/data.js";
import { rankMatches } from "../lib/matching.js";
import { Avatar, EmptyState, Verified } from "./shared.jsx";
import { MatchCard } from "./CustomerDetail.jsx";

export function MatchPool({ onView }) {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All genders");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [limit, setLimit] = useState(24);
  const profiles = pool.filter(
    (person) =>
      (!verifiedOnly || person.verified) &&
      (gender === "All genders" || person.gender === gender) &&
      `${fullName(person)} ${person.city} ${person.designation}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="greeting">More people. More possibilities.</div>
          <h1>The match pool.</h1>
          <p>
            240 fictional profiles. A story waiting to be discovered in each
            one.
          </p>
        </div>
        <span className="pool-count">
          <Users size={17} />
          120 women · 120 men
        </span>
      </div>
      <section className="panel library-panel">
        <div className="library-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="Search match pool"
              placeholder="Search name, city, or profession…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setLimit(24);
              }}
            />
          </div>
          <select
            aria-label="Filter pool by gender"
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setLimit(24);
            }}
          >
            <option>All genders</option>
            <option>Female</option>
            <option>Male</option>
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
            Verified only
          </label>
        </div>
        <p className="library-result-count">
          {profiles.length} profiles · Suggestions also require active status,
          consent, and reciprocal preferences.
        </p>
        <div className="pool-grid">
          {profiles.slice(0, limit).map((person) => (
            <button
              className="pool-person"
              key={person.id}
              onClick={() => onView(person)}
            >
              <Avatar profile={person} size="lg" />
              <strong>
                {fullName(person)}
                {person.verified && <Verified compact />}
              </strong>
              <span>
                {ageOf(person.dob)} years · {person.city}
              </span>
              <small>{person.designation}</small>
              <span
                className={`pool-state ${person.verified && person.active && person.shareConsent ? "" : "pool-state-muted"}`}
              >
                {!person.verified
                  ? "Verification pending"
                  : !person.active
                    ? "Inactive"
                    : !person.shareConsent
                      ? "Sharing consent pending"
                      : "Available for matching"}
              </span>
            </button>
          ))}
        </div>
        {!profiles.length && (
          <EmptyState icon={Search} title="No profiles found">
            Try another search or change the filters.
          </EmptyState>
        )}
        {profiles.length > limit && (
          <button
            className="button secondary load-more"
            onClick={() => setLimit(limit + 24)}
          >
            Load more profiles
          </button>
        )}
      </section>
    </>
  );
}

export function Shortlist({
  workspace,
  onShortlist,
  onSend,
  onExplain,
  onView,
  onSelect,
  onNavigate,
}) {
  const groups = useMemo(
    () =>
      customers
        .map((customer) => {
          const saved = workspace.shortlist.filter(
            (item) => item.customerId === customer.id,
          );
          if (!saved.length) return null;
          const ranked = rankMatches(customer, pool).matches;
          return {
            customer,
            matches: ranked.filter((match) =>
              saved.some((item) => item.profileId === match.profile.id),
            ),
          };
        })
        .filter(Boolean),
    [workspace.shortlist],
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="greeting">Worth a second look</div>
          <h1>Your shortlist.</h1>
          <p>Promising connections, saved with a particular person in mind.</p>
        </div>
        <span className="pool-count">
          <Bookmark size={17} />
          {workspace.shortlist.length} saved
        </span>
      </div>
      {!groups.length ? (
        <section className="panel">
          <EmptyState
            icon={Bookmark}
            title="Keep a good possibility close"
            action={
              <button
                className="button primary"
                onClick={() => onNavigate("customers")}
              >
                Explore customer matches <ArrowRight size={15} />
              </button>
            }
          >
            Save a suggested match using the bookmark. You’ll find it here.
          </EmptyState>
        </section>
      ) : (
        groups.map(({ customer, matches }) => (
          <section className="shortlist-group" key={customer.id}>
            <div className="shortlist-heading">
              <Avatar profile={customer} size="sm" />
              <h2>For {fullName(customer)}</h2>
              <button
                className="text-button"
                onClick={() => onSelect(customer.id)}
              >
                View customer <ArrowRight size={14} />
              </button>
            </div>
            <div className="match-grid shortlist-grid">
              {matches.map((match) => (
                <MatchCard
                  key={match.profile.id}
                  customerId={customer.id}
                  match={match}
                  workspace={workspace}
                  onShortlist={onShortlist}
                  onSend={onSend}
                  onExplain={onExplain}
                  onView={onView}
                />
              ))}
            </div>
            {!matches.length && (
              <p className="info-banner">
                Saved profiles no longer meet eligibility preferences. Review
                the customer’s suggestions.
              </p>
            )}
          </section>
        ))
      )}
    </>
  );
}

export function Introductions({ workspace, onRead, onNavigate }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="greeting">The first hello</div>
          <h1>Introductions, thoughtfully sent.</h1>
          <p>A record of every match shared from your workspace.</p>
        </div>
        <span className="demo-chip">Mock email outbox</span>
      </div>
      <section className="panel outbox-panel">
        {!workspace.sent.length ? (
          <EmptyState
            icon={Mail}
            title="A good introduction starts with a good match"
            action={
              <button
                className="button primary"
                onClick={() => onNavigate("customers")}
              >
                Find a match <ArrowRight size={15} />
              </button>
            }
          >
            Preview an introduction from a customer’s suggested matches, then
            send it here. No real email is sent.
          </EmptyState>
        ) : (
          <>
            <div className="section-heading">
              <h2>
                Sent introductions{" "}
                <span className="count-pill">{workspace.sent.length}</span>
              </h2>
              <span className="muted">Demo emails only</span>
            </div>
            {[...workspace.sent].reverse().map((item) => {
              const customer = customers.find(
                (person) => person.id === item.customerId,
              );
              const person = pool.find(
                (person) => person.id === item.profileId,
              );
              if (!customer || !person) return null;
              return (
                <button
                  className="outbox-row"
                  onClick={() => onRead(item)}
                  key={item.id}
                >
                  <span className="outbox-icon">
                    <Mail size={20} />
                  </span>
                  <div className="outbox-text">
                    <strong>Meet {fullName(person)}</strong>
                    <span>
                      To {fullName(customer)} · {customer.email}
                    </span>
                  </div>
                  <span className="outbox-date">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="sent-badge">
                    <Check size={12} />
                    Sent (demo)
                  </span>
                  <ArrowRight size={17} />
                </button>
              );
            })}
          </>
        )}
      </section>
      <p className="ranking-disclaimer">
        The outbox is stored in this browser. These introductions do not send
        real email.
      </p>
    </>
  );
}

export function Notebook({ workspace, onSelect }) {
  const [search, setSearch] = useState("");
  const entries = customers
    .flatMap((customer) =>
      (workspace.notes[customer.id] ?? []).map((note) => ({
        ...note,
        customer,
      })),
    )
    .filter((entry) =>
      `${fullName(entry.customer)} ${entry.text} ${entry.kind}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="greeting">Listen. Remember. Connect.</div>
          <h1>Your matchmaker notebook.</h1>
          <p>The small details that help you see the whole person.</p>
        </div>
      </div>
      <section className="panel notebook-panel">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer names or notes…"
          />
        </div>
        <div className="notebook-list">
          {entries.map((entry) => (
            <article className="notebook-entry" key={entry.id}>
              <button
                className="notebook-customer"
                onClick={() => onSelect(entry.customer.id)}
              >
                <Avatar profile={entry.customer} size="sm" />
                <span>
                  <strong>{fullName(entry.customer)}</strong>
                  <small>
                    {entry.kind} ·{" "}
                    {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>
              <p>{entry.text}</p>
              <span className="note-author">{entry.author}</span>
            </article>
          ))}
        </div>
        {!entries.length && (
          <EmptyState icon={MessageSquare} title="No notes found">
            Add notes from a customer’s profile, or try another search.
          </EmptyState>
        )}
      </section>
    </>
  );
}
