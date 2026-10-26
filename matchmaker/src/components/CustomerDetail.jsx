import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Heart,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  STAGES,
  ageOf,
  fullName,
  heightLabel,
  incomeLabel,
  pool,
} from "../lib/data.js";
import { rankMatches } from "../lib/matching.js";
import { Avatar, EmptyState, StatusBadge, Verified } from "./shared.jsx";

export function ProfileFields({ profile }) {
  const groups = [
    [
      "Personal details",
      [
        ["Full name", fullName(profile)],
        ["Gender", profile.gender],
        [
          "Date of birth",
          new Date(`${profile.dob}T00:00:00`).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        ],
        ["Height", heightLabel(profile.height)],
        ["City", profile.city],
        ["Country", profile.country],
        ["Marital status", profile.maritalStatus],
        ["Languages", profile.languages.join(", ")],
        ["Mother tongue", profile.motherTongue],
      ],
    ],
    [
      "Education & career",
      [
        ["Undergraduate college", profile.college],
        ["Degree", profile.degree],
        ["Company", profile.company],
        ["Designation", profile.designation],
        ["Annual income", incomeLabel(profile.income)],
      ],
    ],
    [
      "Family & background",
      [
        ["Siblings", profile.siblings],
        ["Family structure", profile.familyType],
        ["Living arrangement", profile.livingArrangement],
        ["Religion", profile.religion],
        ["Caste / community", profile.caste],
      ],
    ],
    [
      "Life together",
      [
        ["Want children", profile.wantKids],
        ["Open to relocate", profile.relocate],
        ["Open to pets", profile.pets],
        ["Diet", profile.diet],
        ["Smoking", profile.smoking],
        ["Drinking", profile.drinking],
        ["Marriage timeline", profile.marriageTimeline],
      ],
    ],
    [
      "Contact",
      [
        ["Email", profile.email],
        ["Phone", profile.phone],
      ],
    ],
  ];
  return (
    <div className="biodata-groups">
      {groups.map(([title, fields]) => (
        <section className="biodata-group" key={title}>
          <h3>{title}</h3>
          <dl>
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "Not specified"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <p className="field-footnote">
        Caste and religion do not affect ranking. Contact details and
        verification are simulated.
      </p>
    </div>
  );
}

export function MatchCard({
  match,
  customerId,
  workspace,
  onShortlist,
  onSend,
  onExplain,
  onView,
}) {
  const person = match.profile;
  const saved = workspace.shortlist.some(
    (item) => item.customerId === customerId && item.profileId === person.id,
  );
  const sent = workspace.sent.some(
    (item) => item.customerId === customerId && item.profileId === person.id,
  );
  return (
    <article className="match-card">
      <div className="match-card-top">
        <button className="match-person" onClick={() => onView(person)}>
          <Avatar profile={person} size="lg" />
          <span>
            <strong>
              {fullName(person)} <Verified compact />
            </strong>
            <span>
              {ageOf(person.dob)} yrs ·{" "}
              {heightLabel(person.height).split(" (")[0]}
            </span>
            <small>
              <MapPin size={12} />
              {person.city}
            </small>
          </span>
        </button>
        <button
          className={`icon-button bookmark-button ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Remove" : "Shortlist"} ${fullName(person)}${saved ? " from shortlist" : ""}`}
          aria-pressed={saved}
          onClick={() => onShortlist(customerId, person.id)}
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="match-career">
        <BriefcaseBusiness size={14} />
        <span>
          {person.designation} at {person.company}
        </span>
      </div>
      <div className="match-score-row">
        <span className="score-number">
          {match.score}
          <small>/100</small>
        </span>
        <div>
          <strong>
            {match.score >= 80
              ? "High potential"
              : match.score >= 65
                ? "Worth exploring"
                : "A possible connection"}
          </strong>
          <span>Mutual compatibility</span>
        </div>
        <Sparkles size={17} />
      </div>
      <ul className="match-reasons">
        {match.reasons.slice(0, 3).map((reason) => (
          <li key={reason}>
            <Check size={13} />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
      {match.cautions.length > 0 && (
        <p className="match-caution">
          {match.cautions.length} point{match.cautions.length > 1 ? "s" : ""} to
          discuss
        </p>
      )}
      <div className="match-actions">
        <button className="text-button" onClick={() => onExplain(match)}>
          Why this match <ChevronRight size={14} />
        </button>
        <button
          className={`button ${sent ? "secondary" : "primary"}`}
          disabled={sent}
          onClick={() => onSend(customerId, match)}
        >
          {sent ? <Check size={14} /> : <Send size={14} />}
          {sent ? "Sent" : "Send match"}
        </button>
      </div>
    </article>
  );
}

export function MatchExplanation({ match }) {
  const labels = {
    values: "Shared values",
    children: "Family plans",
    location: "Location & relocation",
    lifestyle: "Lifestyle & interests",
    career: "Career context",
    language: "Shared language",
    text: "Profile text similarity",
  };
  return (
    <div className="explanation">
      <div className="explanation-score">
        <span>
          {match.score}
          <small>/100</small>
        </span>
        <div>
          <h3>A mutual fit, with context.</h3>
          <p>
            Customer fit {match.forwardScore}/100 · Reverse fit{" "}
            {match.reverseScore}/100
          </p>
        </div>
      </div>
      <h3>What brings them together</h3>
      <ul className="explanation-list">
        {match.reasons.map((reason) => (
          <li key={reason}>
            <Check size={15} />
            {reason}
          </li>
        ))}
      </ul>
      <h3>Compatibility breakdown</h3>
      <p className="muted">
        Customer-side factors, before combining both directions.
      </p>
      <div className="breakdown">
        {Object.entries(match.breakdown.weights).map(([key, weight]) => (
          <div className="breakdown-row" key={key}>
            <span>{labels[key]}</span>
            <div className="score-track">
              <i
                style={{ width: `${match.breakdown.components[key] * 100}%` }}
              />
            </div>
            <strong>
              {Math.round(match.breakdown.components[key] * weight)}
              <small> / {weight}</small>
            </strong>
          </div>
        ))}
      </div>
      {match.cautions.length > 0 && (
        <div className="discussion-box">
          <h3>Leave room for a conversation</h3>
          <ul>
            {match.cautions.map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="method-note">
        A content-based recommender uses TF-IDF cosine similarity for the bio,
        alongside weighted preferences. The final score is the harmonic mean of
        both directional scores. This is an aid for your judgment, not a
        probability of relationship success.
      </p>
    </div>
  );
}

export function NotesPanel({ customer, notes, onAddNote }) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState("Call");
  return (
    <div className="notes-panel">
      <form
        className="note-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (text.trim()) {
            onAddNote(customer.id, text.trim(), kind);
            setText("");
          }
        }}
      >
        <label htmlFor="note-text">
          A little context makes a better match.
        </label>
        <textarea
          id="note-text"
          placeholder="What did you learn? Note a preference, a conversation, or a next step…"
          maxLength={2000}
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          required
        />
        <div className="note-form-footer">
          <label className="note-kind">
            Note type
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <option>Call</option>
              <option>Meeting</option>
              <option>Observation</option>
              <option>Follow-up</option>
            </select>
          </label>
          <span className="character-count">{text.length}/2000</span>
          <button
            type="submit"
            className="button primary"
            disabled={!text.trim()}
          >
            <Plus size={15} />
            Save note
          </button>
        </div>
      </form>
      <div className="note-list">
        {notes.length ? (
          [...notes]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((note) => (
              <article className="note-entry" key={note.id}>
                <span className="note-marker">
                  <MessageSquare size={15} />
                </span>
                <div>
                  <div className="note-meta">
                    <strong>{note.kind}</strong>
                    <time dateTime={note.createdAt}>
                      {new Date(note.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p>{note.text}</p>
                  <small>{note.author}</small>
                </div>
              </article>
            ))
        ) : (
          <EmptyState icon={MessageSquare} title="Their story starts here">
            Add a note after your next conversation.
          </EmptyState>
        )}
      </div>
    </div>
  );
}

export default function CustomerDetail({
  customer,
  workspace,
  onBack,
  onStatus,
  onAddNote,
  onShortlist,
  onSend,
  onExplain,
  onView,
}) {
  const [tab, setTab] = useState("Matches");
  const [minScore, setMinScore] = useState(0);
  const [cityOnly, setCityOnly] = useState(false);
  const [limit, setLimit] = useState(6);
  const [filterOpen, setFilterOpen] = useState(false);
  const result = useMemo(() => rankMatches(customer, pool), [customer]);
  const status = workspace.statuses[customer.id] ?? customer.status;
  const notes = workspace.notes[customer.id] ?? [];
  const matches = result.matches.filter(
    (match) =>
      match.score >= minScore &&
      (!cityOnly || match.profile.city === customer.city),
  );
  const stageIndex = [
    "New",
    "In conversation",
    "Matching",
    "Introduced",
  ].indexOf(status);
  return (
    <div className="detail-page">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to customers
      </button>
      <section className="profile-banner panel">
        <div className="profile-banner-main">
          <Avatar profile={customer} size="xl" />
          <div>
            <div className="profile-title">
              <h1>{fullName(customer)}</h1>
              <Verified />
            </div>
            <p>
              {ageOf(customer.dob)} years · {customer.gender} · {customer.city},{" "}
              {customer.country}
            </p>
            <span className="profile-subline">
              {customer.designation} at {customer.company}
              <span>{customer.id}</span>
            </span>
          </div>
        </div>
        <label className="stage-selector">
          Journey stage
          <select
            value={status}
            onChange={(event) => onStatus(customer.id, event.target.value)}
          >
            {STAGES.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </label>
      </section>
      <div
        className={`journey ${status === "On hold" ? "journey-paused" : ""}`}
        aria-label={`Current journey stage: ${status}`}
      >
        {["New", "In conversation", "Matching", "Introduced"].map(
          (stage, i) => (
            <div
              className={`journey-step ${i <= stageIndex ? "journey-complete" : ""} ${stage === status ? "journey-current" : ""}`}
              key={stage}
            >
              <span>{i < stageIndex ? <Check size={13} /> : <i />}</span>
              <small>{stage}</small>
              {i < 3 && <div className="journey-line" />}
            </div>
          ),
        )}
        {status === "On hold" && (
          <span className="journey-hold">Currently on hold</span>
        )}
      </div>
      <div className="detail-columns">
        <aside className="profile-sidebar">
          <section className="panel about-card">
            <h2>A little about {customer.firstName}</h2>
            <p className="profile-bio">{customer.bio}</p>
            <h3>What matters</h3>
            <div className="tag-list">
              {customer.values.map((value) => (
                <span className="tag tag-purple" key={value}>
                  {value}
                </span>
              ))}
            </div>
            <h3>Off the clock</h3>
            <div className="tag-list">
              {customer.interests.map((interest) => (
                <span className="tag" key={interest}>
                  {interest}
                </span>
              ))}
            </div>
            <h3>Looking for</h3>
            <p>{customer.partnerNote}</p>
            <div className="quick-facts">
              <div>
                <Heart size={15} />
                <span>Children</span>
                <strong>{customer.wantKids}</strong>
              </div>
              <div>
                <MapPin size={15} />
                <span>Relocation</span>
                <strong>{customer.relocate}</strong>
              </div>
              <div>
                <Users size={15} />
                <span>Marriage</span>
                <strong>{customer.marriageTimeline}</strong>
              </div>
            </div>
          </section>
          <section className="profile-care-note">
            <Sparkles size={20} />
            <p>
              Preferences guide the search.
              <br />
              <strong>You bring the human insight.</strong>
            </p>
          </section>
        </aside>
        <section className="detail-content">
          <div
            className="tabs"
            role="tablist"
            aria-label="Customer information"
          >
            {["Matches", "Biodata", "Notes"].map((item) => (
              <button
                role="tab"
                id={`tab-${item}`}
                aria-selected={tab === item}
                aria-controls={`panel-${item}`}
                key={item}
                className={tab === item ? "active" : ""}
                onClick={() => setTab(item)}
              >
                {item}
                {item === "Matches" && <span>{result.matches.length}</span>}
                {item === "Notes" && notes.length > 0 && (
                  <span>{notes.length}</span>
                )}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
          >
            {tab === "Matches" && (
              <>
                <div className="match-section-heading">
                  <div>
                    <h2>A few promising possibilities.</h2>
                    <p>
                      {result.matches.length} eligible profiles from{" "}
                      {result.considered} opposite-gender profiles, ranked for
                      mutual fit.
                    </p>
                  </div>
                  <button
                    className={`button secondary ${filterOpen ? "selected" : ""}`}
                    aria-expanded={filterOpen}
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    <SlidersHorizontal size={15} />
                    Refine
                  </button>
                </div>
                {status === "On hold" && (
                  <div className="info-banner">
                    This customer is on hold. Move them to an active stage
                    before sending an introduction.
                  </div>
                )}
                <div className="ranking-note">
                  <Sparkles size={16} />
                  <span>
                    Ranked with profile similarity and shared preferences. Every
                    score has a story.
                  </span>
                  <button onClick={() => onExplain({ methodology: result })}>
                    How it works
                  </button>
                </div>
                {filterOpen && (
                  <div className="expanded-filters match-filters">
                    <label>
                      Minimum score
                      <select
                        value={minScore}
                        onChange={(e) => setMinScore(Number(e.target.value))}
                      >
                        <option value={0}>All scores</option>
                        <option value={65}>65 and above</option>
                        <option value={75}>75 and above</option>
                        <option value={85}>85 and above</option>
                      </select>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={cityOnly}
                        onChange={(e) => setCityOnly(e.target.checked)}
                      />
                      {customer.city} only
                    </label>
                    <button
                      className="text-button"
                      onClick={() => {
                        setMinScore(0);
                        setCityOnly(false);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                )}
                <div className="match-grid">
                  {matches.slice(0, limit).map((match) => (
                    <MatchCard
                      key={match.profile.id}
                      match={match}
                      customerId={customer.id}
                      workspace={workspace}
                      onShortlist={onShortlist}
                      onSend={onSend}
                      onExplain={onExplain}
                      onView={onView}
                    />
                  ))}
                </div>
                {!matches.length && (
                  <EmptyState
                    icon={Search}
                    title="No matches with these preferences"
                  >
                    Try broadening the filters. Eligibility rules are never
                    relaxed silently.
                  </EmptyState>
                )}
                {matches.length > limit && (
                  <button
                    className="button secondary load-more"
                    onClick={() => setLimit(limit + 6)}
                  >
                    Show more possibilities <Plus size={15} />
                  </button>
                )}
                <p className="ranking-disclaimer">
                  Scores support your judgment. They don’t predict chemistry or
                  relationship success.
                </p>
              </>
            )}
            {tab === "Biodata" && (
              <section className="panel biodata-panel">
                <h2>The full picture.</h2>
                <ProfileFields profile={customer} />
                <section className="biodata-group">
                  <h3>Partner preferences</h3>
                  <dl>
                    <div>
                      <dt>Age range</dt>
                      <dd>
                        {customer.preferences.minAge}–
                        {customer.preferences.maxAge} years
                      </dd>
                    </div>
                    <div>
                      <dt>Marital status</dt>
                      <dd>
                        {customer.preferences.acceptedMaritalStatuses.join(
                          ", ",
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Non-smoker required</dt>
                      <dd>{customer.preferences.nonSmoker ? "Yes" : "No"}</dd>
                    </div>
                  </dl>
                </section>
              </section>
            )}
            {tab === "Notes" && (
              <section className="panel customer-notes">
                <h2>The things a profile can’t tell you.</h2>
                <p className="muted">
                  Private notes for this matchmaker workspace.
                </p>
                <NotesPanel
                  customer={customer}
                  notes={notes}
                  onAddNote={onAddNote}
                />
              </section>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
