import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  CircleHelp,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { customers, DEMO_USER, fullName, pool } from "./lib/data.js";
import { draftIntro } from "./lib/matching.js";
import {
  readSession,
  readWorkspace,
  saveSession,
  saveWorkspace,
} from "./lib/storage.js";
import { Avatar, Brand, Login, Modal, Verified } from "./components/shared.jsx";
import Dashboard from "./components/Dashboard.jsx";
import CustomerDetail, {
  MatchExplanation,
  ProfileFields,
} from "./components/CustomerDetail.jsx";
import {
  Introductions,
  MatchPool,
  Notebook,
  Shortlist,
} from "./components/WorkspacePages.jsx";
import IntroductionComposer from "./components/IntroductionComposer.jsx";

const NAVIGATION = [
  { id: "customers", label: "My customers", icon: LayoutDashboard },
  { id: "pool", label: "Match pool", icon: Users },
  { id: "shortlist", label: "Shortlist", icon: Bookmark },
  { id: "introductions", label: "Introductions", icon: Send },
  { id: "notes", label: "Notebook", icon: MessageSquare },
];

export default function App() {
  const [signedIn, setSignedIn] = useState(readSession);
  const [workspace, setWorkspace] = useState(readWorkspace);
  const [page, setPage] = useState("customers");
  const [customerId, setCustomerId] = useState(null);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [serverEnabled, setServerEnabled] = useState(false);
  const storageWarned = useRef(false);
  const selectedCustomer = customers.find((person) => person.id === customerId);
  const activeNav = NAVIGATION.find((item) => item.id === page);
  const notify = (message, type = "success") =>
    setToast({ message, type, id: Date.now() });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then(async (response) => {
        if (
          response.ok &&
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const result = await response.json();
          setServerEnabled(result.service === "tdc-api");
          setApiAvailable(Boolean(result.aiEnabled));
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!saveWorkspace(workspace) && !storageWarned.current) {
      storageWarned.current = true;
      notify(
        "Browser storage is unavailable. Changes will last for this visit only.",
        "error",
      );
    }
  }, [workspace]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const onKey = (event) => {
      if (
        signedIn &&
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setCustomerId(null);
        setPage("customers");
        setTimeout(
          () => document.getElementById("customer-search")?.focus(),
          0,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [signedIn]);

  function navigate(nextPage) {
    setPage(nextPage);
    setCustomerId(null);
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }
  function selectCustomer(id) {
    setCustomerId(id);
    setPage("customers");
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }
  function changeStatus(id, status) {
    setWorkspace((current) => ({
      ...current,
      statuses: { ...current.statuses, [id]: status },
    }));
    notify(`Journey updated to ${status.toLowerCase()}.`);
  }
  function addNote(id, text, kind) {
    const note = {
      id: crypto.randomUUID(),
      text,
      kind,
      author: DEMO_USER.name,
      createdAt: new Date().toISOString(),
    };
    setWorkspace((current) => ({
      ...current,
      notes: { ...current.notes, [id]: [...(current.notes[id] ?? []), note] },
    }));
    notify("Note saved. A little more context for the next connection.");
  }
  function toggleShortlist(id, profileId) {
    const exists = workspace.shortlist.some(
      (item) => item.customerId === id && item.profileId === profileId,
    );
    setWorkspace((current) => ({
      ...current,
      shortlist: exists
        ? current.shortlist.filter(
            (item) => !(item.customerId === id && item.profileId === profileId),
          )
        : [...current.shortlist, { customerId: id, profileId }],
    }));
    notify(exists ? "Removed from shortlist." : "Saved to your shortlist.");
  }
  function openSend(id, match) {
    const customer = customers.find((person) => person.id === id);
    if ((workspace.statuses[id] ?? customer.status) === "On hold") {
      notify(
        "This customer is on hold. Update their journey stage before sending.",
        "error",
      );
      return;
    }
    if (
      workspace.sent.some(
        (item) => item.customerId === id && item.profileId === match.profile.id,
      )
    ) {
      notify("This match is already in your outbox.");
      return;
    }
    setModal({ type: "compose", customer, match });
  }
  function sendMatch(body) {
    const { customer, match } = modal;
    const item = {
      id: crypto.randomUUID(),
      customerId: customer.id,
      profileId: match.profile.id,
      body,
      score: match.score,
      createdAt: new Date().toISOString(),
    };
    setWorkspace((current) => {
      if (
        current.sent.some(
          (sent) =>
            sent.customerId === customer.id &&
            sent.profileId === match.profile.id,
        )
      )
        return current;
      return {
        ...current,
        sent: [...current.sent, item],
        statuses: { ...current.statuses, [customer.id]: "Introduced" },
      };
    });
    setModal(null);
    notify(`Match sent to ${customer.firstName} in the demo outbox.`);
  }
  async function login() {
    if (serverEnabled) {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "priya", password: "Tdc@2026" }),
        });
        if (!response.ok)
          throw new Error(
            "Sign-in is temporarily unavailable. Please try again.",
          );
      } catch (error) {
        notify(error.message, "error");
        return;
      }
    }
    saveSession(true);
    setSignedIn(true);
  }
  function logout() {
    if (serverEnabled) fetch("/api/logout", { method: "POST" }).catch(() => {});
    saveSession(false);
    setSignedIn(false);
    setModal(null);
    setCustomerId(null);
    setPage("customers");
  }
  const matchCallbacks = {
    workspace,
    onShortlist: toggleShortlist,
    onSend: openSend,
    onExplain: (match) =>
      setModal({
        type: match.methodology ? "methodology" : "explanation",
        ...match,
      }),
    onView: (profile) => setModal({ type: "profile", profile }),
  };

  return (
    <>
      {!signedIn ? (
        <Login onLogin={login} />
      ) : (
        <div className="app-shell">
          {mobileOpen && (
            <button
              className="sidebar-scrim"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
          )}
          <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
            <Brand />
            <div className="workspace-label">Matchmaker workspace</div>
            <nav aria-label="Main navigation">
              {NAVIGATION.map(({ id, label, icon: Icon }) => (
                <button
                  className={`nav-item ${page === id ? "nav-active" : ""}`}
                  key={id}
                  onClick={() => navigate(id)}
                  aria-current={page === id ? "page" : undefined}
                >
                  <Icon size={19} strokeWidth={1.7} />
                  <span>{label}</span>
                  {id === "customers" && <small>{customers.length}</small>}
                  {id === "shortlist" && workspace.shortlist.length > 0 && (
                    <small>{workspace.shortlist.length}</small>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-manifesto">
                <span>✧</span>
                <p>
                  Connections with intention.
                  <br />
                  <strong>Always, with heart.</strong>
                </p>
              </div>
              <button
                className="help-button"
                onClick={() => setModal({ type: "help" })}
              >
                <CircleHelp size={17} />A quick guide
                <ChevronRight size={15} />
              </button>
              <div className="matchmaker-account">
                <span className="account-avatar">PS</span>
                <div>
                  <strong>{DEMO_USER.name}</strong>
                  <small>{DEMO_USER.role}</small>
                </div>
                <button
                  className="icon-button"
                  aria-label="Sign out"
                  onClick={logout}
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          </aside>
          <div className="main-shell">
            <header className="topbar">
              <div className="breadcrumb">
                <button
                  className="icon-button mobile-menu"
                  aria-label="Open navigation"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu size={21} />
                </button>
                <span>Workspace</span>
                <ChevronRight size={13} />
                <strong>
                  {selectedCustomer
                    ? fullName(selectedCustomer)
                    : activeNav.label}
                </strong>
              </div>
              <div className="topbar-actions">
                <button
                  className="topbar-search"
                  onClick={() => {
                    navigate("customers");
                    setTimeout(
                      () => document.getElementById("customer-search")?.focus(),
                      0,
                    );
                  }}
                >
                  <Search size={16} />
                  <span>Find a customer</span>
                  <kbd>⌘ K</kbd>
                </button>
                <span className="demo-indicator">
                  <i />
                  Demo workspace
                </span>
                <span className="topbar-avatar">PS</span>
              </div>
            </header>
            <main className="main-content" id="main-content">
              {selectedCustomer ? (
                <CustomerDetail
                  key={customerId}
                  customer={selectedCustomer}
                  onBack={() => navigate("customers")}
                  onStatus={changeStatus}
                  onAddNote={addNote}
                  {...matchCallbacks}
                />
              ) : (
                <>
                  {page === "customers" && (
                    <Dashboard
                      workspace={workspace}
                      onSelect={selectCustomer}
                      search={search}
                      setSearch={setSearch}
                      onNavigate={navigate}
                    />
                  )}
                  {page === "pool" && (
                    <MatchPool onView={matchCallbacks.onView} />
                  )}
                  {page === "shortlist" && (
                    <Shortlist
                      {...matchCallbacks}
                      onSelect={selectCustomer}
                      onNavigate={navigate}
                    />
                  )}
                  {page === "introductions" && (
                    <Introductions
                      workspace={workspace}
                      onRead={(item) => setModal({ type: "sent", item })}
                      onNavigate={navigate}
                    />
                  )}
                  {page === "notes" && (
                    <Notebook workspace={workspace} onSelect={selectCustomer} />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}
      {signedIn && modal?.type === "profile" && (
        <Modal
          wide
          title={fullName(modal.profile)}
          subtitle="Fictional match pool profile"
          onClose={() => setModal(null)}
        >
          <div className="candidate-preview">
            <Avatar profile={modal.profile} size="xl" />
            <div>
              <p>{modal.profile.bio}</p>
              {modal.profile.verified && <Verified />}
            </div>
          </div>
          <ProfileFields profile={modal.profile} />
        </Modal>
      )}
      {signedIn && modal?.type === "explanation" && (
        <Modal
          title={`Why ${modal.profile.firstName}?`}
          subtitle="A transparent look at this recommendation"
          onClose={() => setModal(null)}
        >
          <MatchExplanation match={modal} />
        </Modal>
      )}
      {signedIn && modal?.type === "methodology" && (
        <Modal
          title="A little science. A little heart."
          subtitle="How suggestions are selected and ranked"
          onClose={() => setModal(null)}
        >
          <div className="methodology-content">
            <h3>Start with the non-negotiables</h3>
            <p>
              Only verified, active adult profiles with sharing consent are
              eligible. Both people’s age ranges, marital-status preferences,
              and non-smoking dealbreakers must hold. Conflicting yes/no family
              plans or two people who cannot relocate from different cities are
              excluded.
            </p>
            <h3>Follow the assessment’s gender-specific rules</h3>
            <p>
              Male customers are matched with women who are younger, shorter,
              earn less, and have the same stated family plans. Female customers
              are ranked on values, career context, lifestyle, and location
              flexibility, without income or height scoring.
            </p>
            <h3>Look for a fit in both directions</h3>
            <p>
              Values, children, location, lifestyle, career context, and
              language contribute to a weighted score. A TF-IDF content-based
              recommender compares bio vocabulary. The harmonic mean of both
              directional scores favours reciprocal fit.
            </p>
            <div className="discussion-box">
              <h3>Your judgment comes first</h3>
              <p>
                Scores are compatibility indices, not predictions. “Maybe” needs
                a conversation. Caste, religion, and photos never affect
                ranking. Eligibility is never silently relaxed.
              </p>
            </div>
            <details>
              <summary>Eligibility audit for this customer</summary>
              <p className="muted">
                A profile can fail multiple checks, so counts overlap.
              </p>
              <ul className="audit-list">
                {Object.entries(modal.methodology.excluded).map(
                  ([reason, count]) => (
                    <li key={reason}>
                      <span>{reason}</span>
                      <strong>{count}</strong>
                    </li>
                  ),
                )}
              </ul>
            </details>
          </div>
        </Modal>
      )}
      {signedIn && modal?.type === "compose" && (
        <Modal
          title="Make a thoughtful introduction."
          subtitle="A first hello, in your words."
          onClose={() => setModal(null)}
        >
          <IntroductionComposer
            customer={modal.customer}
            match={modal.match}
            apiAvailable={apiAvailable}
            notify={notify}
            onSend={sendMatch}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
      {signedIn && modal?.type === "sent" && (
        <Modal
          title="Your sent introduction"
          subtitle={`Saved ${new Date(modal.item.createdAt).toLocaleString("en-IN")}`}
          onClose={() => setModal(null)}
        >
          <div className="sent-message">
            <span className="demo-chip">Mock email · no real delivery</span>
            <pre>{modal.item.body}</pre>
          </div>
        </Modal>
      )}
      {signedIn && modal?.type === "help" && (
        <Modal
          title="Your workspace, at a glance."
          onClose={() => setModal(null)}
        >
          <div className="help-content">
            <p>
              Open a customer to see their biodata, suggested matches, and
              private notes. Use the journey selector to keep their stage up to
              date.
            </p>
            <p>
              Every suggested match includes a score explanation. Bookmark a
              possibility for later, or choose <strong>Send match</strong> to
              edit an introduction and save a mock email to the outbox.
            </p>
            <p>
              The match pool contains 120 women and 120 men. Names, biodata, and
              contacts are fictional; portraits are illustrative. Verification
              badges are simulated.
            </p>
            <div className="info-banner">
              This demo uses browser storage. It is not a production
              authentication or customer data system. Use the sample credentials
              only.
            </div>
            <p>
              Notes, stages, shortlists, and sent introductions persist in this
              browser. Signing out ends the session while preserving your
              workspace.
            </p>
          </div>
        </Modal>
      )}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.type === "error" ? (
            <CircleHelp size={18} />
          ) : (
            <Check size={18} />
          )}
          <span>{toast.message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
