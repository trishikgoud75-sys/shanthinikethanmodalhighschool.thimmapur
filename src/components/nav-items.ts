import {
  Home,
  Info,
  GraduationCap,
  Users,
  ShieldCheck,
  CalendarDays,
  Images,
  Megaphone,
  IndianRupee,
  FileSignature,
  MessageSquareHeart,
} from "lucide-react";

/** The ten public pages of the site, shown in the top navigation. */
export const publicNav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/about", label: "About", icon: Info },
  { to: "/admissions", label: "Admission", icon: FileSignature },
  { to: "/fees", label: "Fees", icon: IndianRupee },
  { to: "/faculty", label: "Faculty", icon: Users },
  { to: "/management", label: "Management", icon: ShieldCheck },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/notices", label: "Notices", icon: Megaphone },
  { to: "/gallery", label: "Gallery", icon: Images },
  { to: "/feedback", label: "Feedback", icon: MessageSquareHeart },
] as const;

export const SCHOOL_NAME = "Shanthinikethan Model High School";

export const SCHOOL_TAGLINE = "Towards the Better Future";

export const SCHOOL_CLASSES = "Nursery to 10th class";

export const ADMISSION_PERIOD = "September to July";

export const SCHOOL_ADDRESS_LINES = [
  "Thimmapur Village",
  "Kothur Mandal",
  "Ranga Reddy District",
  "Telangana - 509325",
] as const;

export const SCHOOL_PIN = "509325";

export const SCHOOL_ADDRESS = SCHOOL_ADDRESS_LINES.join(", ");

export const SCHOOL_MAP_QUERY = `${SCHOOL_NAME}, Thimmapur Village, Kothur Mandal, Ranga Reddy District, Telangana ${SCHOOL_PIN}`;

export const SCHOOL_MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  SCHOOL_MAP_QUERY,
)}`;

export const SCHOOL_MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  SCHOOL_MAP_QUERY,
)}&output=embed`;

/** Admission / office contact numbers shown across the site. */
export const SCHOOL_PHONES = ["7396802002", "9059988823", "9030007245"] as const;
export const SCHOOL_EMAIL = "shanthi123@gmail.com";
export const SCHOOL_INSTAGRAM = "https://www.instagram.com/snmhs2002?rpxt=MXNhdHcyNGVjMGV0cw==";
