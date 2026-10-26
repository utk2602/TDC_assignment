const women = [
  "Aanya",
  "Isha",
  "Meera",
  "Kavya",
  "Riya",
  "Ananya",
  "Tara",
  "Naina",
  "Priya",
  "Sana",
  "Diya",
  "Avni",
];
const men = [
  "Rohan",
  "Arjun",
  "Kabir",
  "Aditya",
  "Rahul",
  "Vihaan",
  "Dev",
  "Ishaan",
  "Kunal",
  "Nikhil",
  "Aman",
  "Siddharth",
];
const surnames = [
  "Mehta",
  "Kapoor",
  "Shah",
  "Rao",
  "Malhotra",
  "Iyer",
  "Desai",
  "Sinha",
  "Khanna",
  "Nair",
  "Bose",
  "Patel",
];
const cities = ["Mumbai", "Bengaluru", "Delhi", "Pune", "Hyderabad", "Chennai"];
const careers = [
  ["Product designer", "Figma", "Design", "B.Des", "NID Ahmedabad"],
  ["Software engineer", "Atlassian", "Technology", "B.Tech", "BITS Pilani"],
  ["Marketing lead", "Nykaa", "Business", "B.Com", "Christ University"],
  ["Architect", "Studio Lotus", "Design", "B.Arch", "CEPT University"],
  ["Product manager", "Microsoft", "Technology", "B.Tech", "IIT Bombay"],
  ["Consultant", "Deloitte", "Business", "BBA", "Delhi University"],
  ["Doctor", "Apollo Hospitals", "Healthcare", "MBBS", "KMC Manipal"],
  ["Research scientist", "Biocon", "Healthcare", "B.Sc", "IISc Bengaluru"],
];
const interests = [
  "Travel",
  "Reading",
  "Cooking",
  "Hiking",
  "Music",
  "Art",
  "Fitness",
  "Cinema",
  "Photography",
  "Dogs",
];
const values = [
  "Family",
  "Independence",
  "Kindness",
  "Curiosity",
  "Ambition",
  "Honesty",
];
const languages = [
  ["Hindi", "English"],
  ["Gujarati", "Hindi", "English"],
  ["Tamil", "English"],
  ["Marathi", "Hindi", "English"],
  ["Bengali", "Hindi", "English"],
  ["Telugu", "English"],
];
export const STAGES = [
  "New",
  "In conversation",
  "Matching",
  "Introduced",
  "On hold",
];
export const DEMO_USER = {
  name: "Priya Sharma",
  role: "Senior matchmaker",
  initials: "PS",
};

function seededRandom(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seededRandom(2602);
const pick = (items) => items[Math.floor(random() * items.length)];
const subset = (items, count) =>
  [...items]
    .map((item) => ({ item, order: random() }))
    .sort((a, b) => a.order - b.order)
    .slice(0, count)
    .map(({ item }) => item);

export function ageOf(dob, today = new Date()) {
  const born = new Date(`${dob}T00:00:00Z`);
  if (!Number.isFinite(born.getTime())) return null;
  let age = today.getUTCFullYear() - born.getUTCFullYear();
  if (
    today.getUTCMonth() < born.getUTCMonth() ||
    (today.getUTCMonth() === born.getUTCMonth() &&
      today.getUTCDate() < born.getUTCDate())
  )
    age--;
  return age;
}

export const fullName = (profile) => `${profile.firstName} ${profile.lastName}`;
export const initials = (profile) =>
  `${profile.firstName[0]}${profile.lastName[0]}`;
export const incomeLabel = (income) => `₹${income} lakh / year`;
export function heightLabel(cm) {
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)}? ${inches % 12}? (${cm} cm)`;
}

function makeProfile(index, gender, isCustomer = false) {
  const career = pick(careers);
  const hobbies = subset(interests, 3);
  const principles = subset(values, 3);
  const birthYear =
    gender === "Female"
      ? 1991 + Math.floor(random() * 10)
      : 1987 + Math.floor(random() * 11);
  const profile = {
    id: `${isCustomer ? "C" : gender === "Female" ? "F" : "M"}${String(index + 1).padStart(3, "0")}`,
    firstName: pick(gender === "Female" ? women : men),
    lastName: pick(surnames),
    gender,
    dob: `${birthYear}-${String(1 + Math.floor(random() * 12)).padStart(2, "0")}-15`,
    country: "India",
    city: pick(cities),
    height:
      gender === "Female"
        ? 152 + Math.floor(random() * 22)
        : 170 + Math.floor(random() * 20),
    email: `demo.${isCustomer ? "customer" : gender.toLowerCase()}.${index + 1}@example.com`,
    phone: "+91 00000 00000",
    college: career[4],
    degree: career[3],
    income:
      gender === "Female"
        ? 12 + Math.floor(random() * 30)
        : 24 + Math.floor(random() * 40),
    company: career[1],
    designation: career[0],
    careerField: career[2],
    maritalStatus: random() > 0.85 ? "Divorced" : "Never married",
    languages: pick(languages),
    motherTongue: "",
    siblings: pick([
      "One younger sister",
      "One elder brother",
      "Only child",
      "Two siblings",
    ]),
    religion: pick([
      "Hindu",
      "Hindu",
      "Jain",
      "Sikh",
      "Muslim",
      "Christian",
      "Prefer not to say",
    ]),
    caste: "Not specified",
    wantKids: pick(["Yes", "Yes", "No", "Maybe"]),
    relocate: pick(["Yes", "No", "Maybe"]),
    pets: pick(["Yes", "Yes", "No", "Maybe"]),
    diet: pick(["Vegetarian", "Eggetarian", "Non-vegetarian"]),
    smoking: pick(["Never", "Never", "Occasionally"]),
    drinking: pick(["Never", "Socially"]),
    familyType: pick(["Nuclear", "Joint"]),
    livingArrangement: pick(["With family", "Independently"]),
    marriageTimeline: pick([
      "Within a year",
      "1–2 years",
      "Open to the right person",
    ]),
    interests: hobbies,
    values: principles,
    bio: `I make time for ${hobbies[0].toLowerCase()} and ${hobbies[1].toLowerCase()}, even on a busy week. ${principles[0]} and ${principles[1].toLowerCase()} matter to me. Looking for a thoughtful partner to build a full, happy life with.`,
    partnerNote:
      "Someone kind, communicative, and comfortable growing together. A sense of humour goes a long way.",
    preferences: {
      minAge: 23,
      maxAge: 44,
      acceptedMaritalStatuses: ["Never married", "Divorced"],
      nonSmoker: false,
    },
    verified: isCustomer || random() > 0.1,
    shareConsent: isCustomer || random() > 0.04,
    active: isCustomer || random() > 0.04,
    photo: `https://randomuser.me/api/portraits/${gender === "Female" ? "women" : "men"}/${(index * 7 + 22) % 90}.jpg`,
    status: STAGES[index % STAGES.length],
    assignedTo: isCustomer ? "priya" : null,
  };
  profile.motherTongue = profile.languages[0];
  return profile;
}

export const pool = [
  ...Array.from({ length: 120 }, (_, i) => makeProfile(i, "Female")),
  ...Array.from({ length: 120 }, (_, i) => makeProfile(i, "Male")),
];

const customerSpecs = [
  ["Aanya", "Mehta", "Female", "1997-04-12", "Mumbai", "Matching"],
  ["Rohan", "Kapoor", "Male", "1993-08-24", "Bengaluru", "Matching"],
  ["Isha", "Shah", "Female", "1998-02-18", "Delhi", "In conversation"],
  ["Arjun", "Rao", "Male", "1991-11-06", "Mumbai", "Introduced"],
  ["Meera", "Iyer", "Female", "1995-06-22", "Chennai", "New"],
  ["Kabir", "Malhotra", "Male", "1994-03-09", "Delhi", "In conversation"],
  ["Kavya", "Desai", "Female", "1996-09-14", "Pune", "Matching"],
  ["Aditya", "Sinha", "Male", "1992-12-04", "Hyderabad", "On hold"],
  ["Riya", "Khanna", "Female", "1998-07-19", "Bengaluru", "Introduced"],
  ["Vihaan", "Nair", "Male", "1990-01-27", "Chennai", "Matching"],
  ["Tara", "Bose", "Female", "1994-10-03", "Mumbai", "On hold"],
  ["Dev", "Patel", "Male", "1995-05-16", "Pune", "New"],
];

export const customers = customerSpecs.map(
  ([firstName, lastName, gender, dob, city, status], index) => ({
    ...makeProfile(index, gender, true),
    firstName,
    lastName,
    dob,
    city,
    status,
    income: gender === "Male" ? 48 + index : 22 + index,
    height: gender === "Male" ? 182 : 163 + (index % 7),
    wantKids: index === 6 || index === 10 ? "No" : "Yes",
    relocate: index % 3 === 0 ? "No" : "Yes",
    assignedTo: "priya",
  }),
);

customers[0] = {
  ...customers[0],
  designation: "Product designer",
  company: "Figma",
  careerField: "Design",
  degree: "B.Des, Communication Design",
  college: "NID Ahmedabad",
  languages: ["Gujarati", "Hindi", "English"],
  motherTongue: "Gujarati",
  interests: ["Travel", "Art", "Cooking"],
  values: ["Family", "Curiosity", "Kindness"],
  diet: "Vegetarian",
  smoking: "Never",
  drinking: "Socially",
  pets: "Yes",
  bio: "A designer by day and an enthusiastic home cook by evening. I love slow travel, gallery afternoons, and having everyone around the dinner table. Looking for a partnership with equal parts kindness, curiosity, and laughter.",
  partnerNote:
    "Someone grounded and curious, who values family and an independent career. Prefer to stay in Mumbai for now.",
};

export const initialNotes = {
  C001: [
    {
      id: "seed-note-1",
      text: "Enjoyed our first call. Aanya values emotional openness and wants a partner who supports her design career. Mumbai is a priority for now.",
      kind: "Call",
      createdAt: "2026-10-24T09:30:00.000Z",
      author: "Priya Sharma",
    },
  ],
  C002: [
    {
      id: "seed-note-2",
      text: "Ready to start receiving introductions. Family plans are a firm preference; happy to consider someone in a different city.",
      kind: "Meeting",
      createdAt: "2026-10-23T11:00:00.000Z",
      author: "Priya Sharma",
    },
  ],
};
