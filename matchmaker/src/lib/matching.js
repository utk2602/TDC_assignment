import { ageOf } from "./data.js";

const STOP_WORDS = new Set(
  "a an and are as at be by for from happy i in is it life looking make me my of on or partner the to together with".split(
    " ",
  ),
);
const tokens = (text = "") =>
  text
    .toLowerCase()
    .match(/[a-z]+/g)
    ?.filter((word) => word.length > 2 && !STOP_WORDS.has(word)) ?? [];
const overlap = (left = [], right = []) =>
  left.filter((value) => right.includes(value));
const agreement = (a, b) =>
  !a || !b ? 0.5 : a === b ? 1 : a === "Maybe" || b === "Maybe" ? 0.5 : 0;
const clash = (a, b) => a && b && a !== "Maybe" && b !== "Maybe" && a !== b;

// Fit one IDF vocabulary per pool, rather than changing scores for every pair.
export function createTextModel(profiles) {
  const documents = profiles.map((profile) => new Set(tokens(profile.bio)));
  const frequencies = new Map();
  documents.forEach((document) =>
    document.forEach((word) =>
      frequencies.set(word, (frequencies.get(word) ?? 0) + 1),
    ),
  );
  const vector = (text) => {
    const counts = new Map();
    tokens(text).forEach((word) =>
      counts.set(word, (counts.get(word) ?? 0) + 1),
    );
    for (const [word, count] of counts)
      counts.set(
        word,
        (1 + Math.log(count)) *
          (Math.log(
            (1 + documents.length) / (1 + (frequencies.get(word) ?? 0)),
          ) +
            1),
      );
    return counts;
  };
  const cache = new Map();
  const getVector = (text) => {
    if (!cache.has(text)) cache.set(text, vector(text));
    return cache.get(text);
  };
  return {
    similarity(a, b) {
      const left = getVector(a);
      const right = getVector(b);
      const norm = (values) =>
        Math.sqrt(
          [...values.values()].reduce((sum, value) => sum + value * value, 0),
        );
      const denominator = norm(left) * norm(right);
      if (!denominator) return 0.5;
      return (
        [...left].reduce(
          (sum, [word, value]) => sum + value * (right.get(word) ?? 0),
          0,
        ) / denominator
      );
    },
  };
}

function preferenceFailures(person, other, today) {
  const failures = [];
  const age = ageOf(other.dob, today);
  const prefs = person.preferences ?? {};
  if (age < (prefs.minAge ?? 18) || age > (prefs.maxAge ?? 100))
    failures.push("Outside a stated age range");
  if (
    prefs.acceptedMaritalStatuses?.length &&
    !prefs.acceptedMaritalStatuses.includes(other.maritalStatus)
  )
    failures.push("Marital status preference differs");
  if (prefs.nonSmoker && other.smoking !== "Never")
    failures.push("Non-smoking preference differs");
  return failures;
}

export function eligibility(customer, candidate, today = new Date()) {
  const failures = [];
  if (customer.id === candidate.id || customer.gender === candidate.gender)
    failures.push("Outside the opposite-gender pool");
  if (!customer.verified || !candidate.verified)
    failures.push("Profile is not verified");
  if (!customer.active || !candidate.active)
    failures.push("Profile is inactive");
  if (!customer.shareConsent || !candidate.shareConsent)
    failures.push("Profile sharing consent is missing");
  if (
    [customer, candidate].some(
      (person) =>
        ageOf(person.dob, today) === null || ageOf(person.dob, today) < 18,
    )
  )
    failures.push("Valid adult date of birth required");
  failures.push(
    ...preferenceFailures(customer, candidate, today),
    ...preferenceFailures(candidate, customer, today),
  );
  if (clash(customer.wantKids, candidate.wantKids))
    failures.push("Family plans conflict");
  if (
    customer.city !== candidate.city &&
    customer.relocate === "No" &&
    candidate.relocate === "No"
  )
    failures.push("Neither person can relocate");

  // The assessment explicitly specifies these four rules for male customers.
  if (customer.gender === "Male") {
    if (!(ageOf(candidate.dob, today) < ageOf(customer.dob, today)))
      failures.push("Must be younger than the customer");
    if (!(candidate.income < customer.income))
      failures.push("Must earn less than the customer");
    if (!(candidate.height < customer.height))
      failures.push("Must be shorter than the customer");
    if (!customer.wantKids || customer.wantKids !== candidate.wantKids)
      failures.push("Family plans must match exactly");
  }
  return { eligible: failures.length === 0, failures: [...new Set(failures)] };
}

export const WEIGHTS = {
  Female: {
    values: 24,
    children: 20,
    location: 18,
    lifestyle: 12,
    career: 10,
    language: 4,
    text: 12,
  },
  Male: {
    values: 24,
    children: 20,
    location: 16,
    lifestyle: 12,
    career: 10,
    language: 6,
    text: 12,
  },
};

function directionalScore(person, other, model) {
  const sharedValues = overlap(person.values, other.values);
  const sharedInterests = overlap(person.interests, other.interests);
  const location =
    person.city === other.city
      ? 1
      : other.relocate === "Yes"
        ? 0.9
        : person.relocate === "Yes"
          ? 0.75
          : 0.4;
  const components = {
    values: person.values?.length
      ? sharedValues.length / person.values.length
      : 0.5,
    children: agreement(person.wantKids, other.wantKids),
    location,
    lifestyle:
      (agreement(person.pets, other.pets) +
        (person.diet === other.diet ? 1 : 0.5) +
        (person.smoking === other.smoking ? 1 : 0.3) +
        sharedInterests.length / Math.max(1, person.interests.length)) /
      4,
    career: person.careerField === other.careerField ? 1 : 0.65,
    language: overlap(person.languages, other.languages).length ? 1 : 0.3,
    text: model.similarity(person.bio, other.bio),
  };
  const weights = WEIGHTS[person.gender] ?? WEIGHTS.Female;
  const score = Object.entries(weights).reduce(
    (total, [key, weight]) => total + components[key] * weight,
    0,
  );
  return { score, components, weights };
}

export function rankMatches(
  customer,
  pool,
  { today = new Date(), model = createTextModel([customer, ...pool]) } = {},
) {
  const excluded = {};
  const matches = [];
  for (const candidate of pool) {
    const result = eligibility(customer, candidate, today);
    if (!result.eligible) {
      result.failures.forEach((reason) => {
        excluded[reason] = (excluded[reason] ?? 0) + 1;
      });
      continue;
    }
    const forward = directionalScore(customer, candidate, model);
    const reverse = directionalScore(candidate, customer, model);
    // Harmonic mean prevents a strong one-sided fit from hiding weak reciprocity.
    const mutualScore =
      forward.score + reverse.score
        ? (2 * forward.score * reverse.score) / (forward.score + reverse.score)
        : 0;
    const sharedValues = overlap(customer.values, candidate.values);
    const sharedInterests = overlap(customer.interests, candidate.interests);
    const reasons = [];
    const cautions = [];
    if (sharedValues.length)
      reasons.push(`Shared values: ${sharedValues.join(", ").toLowerCase()}`);
    if (customer.wantKids === candidate.wantKids)
      reasons.push(
        customer.wantKids === "Maybe"
          ? "Both are still considering children"
          : `Both ${customer.wantKids === "Yes" ? "want" : "do not want"} children`,
      );
    if (customer.city === candidate.city)
      reasons.push(`Both based in ${customer.city}`);
    else if (candidate.relocate === "Yes") reasons.push("Open to relocating");
    if (sharedInterests.length)
      reasons.push(
        `Connect over ${sharedInterests.join(" and ").toLowerCase()}`,
      );
    if (customer.careerField === candidate.careerField)
      reasons.push(
        `Shared ${customer.careerField.toLowerCase()} career context`,
      );
    if (!reasons.length) {
      const sharedLanguages = overlap(customer.languages, candidate.languages);
      reasons.push(
        sharedLanguages.length
          ? `Shared language: ${sharedLanguages.join(', ')}`
          : 'Meets eligibility rules; limited positive compatibility signals',
      );
    }
    if (customer.city !== candidate.city)
      cautions.push(
        `Different cities: ${customer.city} and ${candidate.city}. Discuss who would move.`,
      );
    if (customer.wantKids === "Maybe" || candidate.wantKids === "Maybe")
      cautions.push("Family plans need a conversation.");
    if (clash(customer.pets, candidate.pets))
      cautions.push("Different preferences around pets.");
    if (customer.diet !== candidate.diet)
      cautions.push("Different dietary habits.");
    if (customer.marriageTimeline !== candidate.marriageTimeline)
      cautions.push("Confirm the timeline for marriage.");
    if (!sharedValues.length)
      cautions.push(
        "No shared stated values; explore these before introducing.",
      );
    matches.push({
      profile: candidate,
      score: Math.round(mutualScore),
      forwardScore: Math.round(forward.score),
      reverseScore: Math.round(reverse.score),
      breakdown: forward,
      reasons,
      cautions,
      sharedInterests,
    });
  }
  matches.sort(
    (a, b) => b.score - a.score || a.profile.id.localeCompare(b.profile.id),
  );
  return {
    matches,
    excluded,
    considered: pool.filter((candidate) => candidate.gender !== customer.gender)
      .length,
    model: "TF-IDF cosine similarity + reciprocal weighted rules",
  };
}

export function draftIntro(customer, match) {
  const person = match.profile;
  const shared = match.sharedInterests.length
    ? `Your shared interest in ${match.sharedInterests.join(" and ").toLowerCase()} could be a lovely place to start.`
    : "There may be an opportunity to get to know one another through a thoughtful first conversation.";
  return `Hi ${customer.firstName},\n\nI thought you might like to meet ${person.firstName}, a ${person.designation.toLowerCase()} at ${person.company}, based in ${person.city}.\n\n${match.reasons.slice(0, 2).join(". ")}. ${shared}\n\nIf this feels like a connection worth exploring, let me know and we can plan an introduction. There is no pressure — your comfort comes first.\n\nWarmly,\nPriya\nThe Date Crew`;
}
