export interface SeoCategory {
  slug: string;
  title: string;
  searchTags: string[];
  seoTitle: string;
  seoDescription: string;
  relatedCategories: string[]; // slugs
}

export const SEO_CATEGORIES: SeoCategory[] = [
  {
    slug: "arrow",
    title: "Arrow",
    searchTags: ["arrow", "pointer", "direction", "chevron", "caret", "angle"],
    seoTitle: "Best Arrow Icons for UI Design",
    seoDescription: "Browse {count} free arrow SVG icons across {libs} libraries. Download arrow, chevron, and direction icons in SVG, PNG, or copy as code.",
    relatedCategories: ["navigation", "download-upload", "refresh-sync"]
  },
  {
    slug: "navigation",
    title: "Navigation",
    searchTags: ["navigation", "menu", "hamburger", "sidebar", "breadcrumb", "nav", "tab"],
    seoTitle: "Best Navigation Icons for UI Design",
    seoDescription: "Browse {count} free navigation SVG icons across {libs} libraries. Menus, hamburgers, sidebars, and more.",
    relatedCategories: ["arrow", "home", "layout-grid"]
  },
  {
    slug: "user",
    title: "User & People",
    searchTags: ["user", "person", "people", "avatar", "profile", "account", "group", "team"],
    seoTitle: "Best User & People Icons for UI Design",
    seoDescription: "Browse {count} free user and people SVG icons across {libs} libraries. Avatars, profiles, groups, and team icons.",
    relatedCategories: ["communication", "security", "settings"]
  },
  {
    slug: "communication",
    title: "Communication",
    searchTags: ["communication", "chat", "message", "mail", "email", "envelope", "phone", "call", "comment", "inbox"],
    seoTitle: "Best Communication Icons for UI Design",
    seoDescription: "Browse {count} free communication SVG icons across {libs} libraries. Chat, email, phone, and messaging icons.",
    relatedCategories: ["user", "notification", "social"]
  },
  {
    slug: "media",
    title: "Media & Player",
    searchTags: ["media", "play", "pause", "stop", "video", "audio", "player", "record", "stream", "volume", "speaker"],
    seoTitle: "Best Media & Player Icons for UI Design",
    seoDescription: "Browse {count} free media player SVG icons across {libs} libraries. Play, pause, volume, and video controls.",
    relatedCategories: ["music", "camera", "film"]
  },
  {
    slug: "file",
    title: "Files & Documents",
    searchTags: ["file", "document", "folder", "paper", "page", "attachment", "archive", "zip", "pdf"],
    seoTitle: "Best File & Document Icons for UI Design",
    seoDescription: "Browse {count} free file and document SVG icons across {libs} libraries. Folders, papers, attachments, and archive icons.",
    relatedCategories: ["clipboard", "download-upload", "editing"]
  },
  {
    slug: "weather",
    title: "Weather",
    searchTags: ["weather", "sun", "moon", "cloud", "rain", "snow", "wind", "storm", "thunder", "temperature", "thermometer"],
    seoTitle: "Best Weather Icons for UI Design",
    seoDescription: "Browse {count} free weather SVG icons across {libs} libraries. Sun, cloud, rain, snow, and temperature icons.",
    relatedCategories: ["cloud", "power-energy"]
  },
  {
    slug: "shopping",
    title: "Shopping & Commerce",
    searchTags: ["shopping", "cart", "bag", "store", "shop", "basket", "ecommerce", "purchase", "buy", "price", "tag"],
    seoTitle: "Best Shopping & Commerce Icons for UI Design",
    seoDescription: "Browse {count} free shopping and commerce SVG icons across {libs} libraries. Cart, store, bag, and ecommerce icons.",
    relatedCategories: ["finance", "gift", "heart"]
  },
  {
    slug: "social",
    title: "Social Media",
    searchTags: ["social", "share", "like", "follow", "feed", "post", "story", "retweet", "hashtag"],
    seoTitle: "Best Social Media Icons for UI Design",
    seoDescription: "Browse {count} free social media SVG icons across {libs} libraries. Share, like, follow, and social platform icons.",
    relatedCategories: ["communication", "heart", "user"]
  },
  {
    slug: "device",
    title: "Devices",
    searchTags: ["device", "mobile", "phone", "tablet", "laptop", "desktop", "computer", "monitor", "screen", "keyboard", "mouse", "printer"],
    seoTitle: "Best Device Icons for UI Design",
    seoDescription: "Browse {count} free device SVG icons across {libs} libraries. Phone, laptop, monitor, and hardware icons.",
    relatedCategories: ["wifi", "battery", "bluetooth"]
  },
  {
    slug: "chart",
    title: "Charts & Data",
    searchTags: ["chart", "graph", "data", "analytics", "statistics", "bar", "pie", "line-chart", "dashboard", "metric", "trend"],
    seoTitle: "Best Chart & Data Icons for UI Design",
    seoDescription: "Browse {count} free chart and data visualization SVG icons across {libs} libraries. Graphs, analytics, and dashboard icons.",
    relatedCategories: ["database", "filter-sort", "layout-grid"]
  },
  {
    slug: "editing",
    title: "Editing & Text",
    searchTags: ["edit", "pen", "pencil", "write", "compose", "eraser", "undo", "redo", "cut", "paste", "copy", "format"],
    seoTitle: "Best Editing Icons for UI Design",
    seoDescription: "Browse {count} free editing SVG icons across {libs} libraries. Pen, pencil, undo, redo, cut, copy, and paste icons.",
    relatedCategories: ["text-typography", "file", "clipboard"]
  },
  {
    slug: "security",
    title: "Security & Lock",
    searchTags: ["security", "lock", "unlock", "shield", "key", "password", "protect", "privacy", "safe", "guard"],
    seoTitle: "Best Security & Lock Icons for UI Design",
    seoDescription: "Browse {count} free security SVG icons across {libs} libraries. Lock, shield, key, and protection icons.",
    relatedCategories: ["user", "settings", "eye"]
  },
  {
    slug: "calendar",
    title: "Calendar & Time",
    searchTags: ["calendar", "time", "clock", "date", "schedule", "event", "alarm", "timer", "watch", "hour"],
    seoTitle: "Best Calendar & Time Icons for UI Design",
    seoDescription: "Browse {count} free calendar and time SVG icons across {libs} libraries. Clock, schedule, alarm, and timer icons.",
    relatedCategories: ["notification", "refresh-sync"]
  },
  {
    slug: "map",
    title: "Map & Location",
    searchTags: ["map", "location", "pin", "marker", "gps", "compass", "globe", "world", "earth", "place", "navigate"],
    seoTitle: "Best Map & Location Icons for UI Design",
    seoDescription: "Browse {count} free map and location SVG icons across {libs} libraries. Pin, GPS, compass, and globe icons.",
    relatedCategories: ["navigation", "transport"]
  },
  {
    slug: "settings",
    title: "Settings & Gear",
    searchTags: ["settings", "gear", "cog", "config", "preference", "option", "wrench", "tool", "adjust", "tune", "slider"],
    seoTitle: "Best Settings & Gear Icons for UI Design",
    seoDescription: "Browse {count} free settings SVG icons across {libs} libraries. Gear, wrench, configuration, and preference icons.",
    relatedCategories: ["tools", "filter-sort", "toggle"]
  },
  {
    slug: "notification",
    title: "Notification",
    searchTags: ["notification", "bell", "alert", "badge", "ring", "remind", "warning", "info", "exclamation"],
    seoTitle: "Best Notification Icons for UI Design",
    seoDescription: "Browse {count} free notification SVG icons across {libs} libraries. Bell, alert, badge, and reminder icons.",
    relatedCategories: ["communication", "calendar"]
  },
  {
    slug: "heart",
    title: "Heart & Favorite",
    searchTags: ["heart", "favorite", "love", "like", "wish", "wishlist"],
    seoTitle: "Best Heart & Favorite Icons for UI Design",
    seoDescription: "Browse {count} free heart and favorite SVG icons across {libs} libraries. Love, like, and wishlist icons.",
    relatedCategories: ["star", "bookmark", "shopping"]
  },
  {
    slug: "star",
    title: "Star & Rating",
    searchTags: ["star", "rating", "review", "rank", "score", "sparkle"],
    seoTitle: "Best Star & Rating Icons for UI Design",
    seoDescription: "Browse {count} free star and rating SVG icons across {libs} libraries. Stars, reviews, and ranking icons.",
    relatedCategories: ["heart", "bookmark", "flag"]
  },
  {
    slug: "home",
    title: "Home",
    searchTags: ["home", "house", "building", "residence", "apartment"],
    seoTitle: "Best Home Icons for UI Design",
    seoDescription: "Browse {count} free home SVG icons across {libs} libraries. House, building, and residence icons.",
    relatedCategories: ["navigation", "building"]
  },
  {
    slug: "search",
    title: "Search",
    searchTags: ["search", "find", "magnify", "magnifying", "glass", "zoom", "lookup", "explore", "discover"],
    seoTitle: "Best Search Icons for UI Design",
    seoDescription: "Browse {count} free search SVG icons across {libs} libraries. Magnifying glass, zoom, and find icons.",
    relatedCategories: ["filter-sort", "navigation", "eye"]
  },
  {
    slug: "download-upload",
    title: "Download & Upload",
    searchTags: ["download", "upload", "import", "export", "save", "load", "transfer"],
    seoTitle: "Best Download & Upload Icons for UI Design",
    seoDescription: "Browse {count} free download and upload SVG icons across {libs} libraries. Import, export, save, and transfer icons.",
    relatedCategories: ["arrow", "cloud", "file"]
  },
  {
    slug: "cloud",
    title: "Cloud",
    searchTags: ["cloud", "server", "hosting", "saas", "storage", "sync"],
    seoTitle: "Best Cloud Icons for UI Design",
    seoDescription: "Browse {count} free cloud SVG icons across {libs} libraries. Cloud storage, hosting, and sync icons.",
    relatedCategories: ["download-upload", "database", "weather"]
  },
  {
    slug: "code",
    title: "Code & Development",
    searchTags: ["code", "development", "programming", "terminal", "console", "bug", "git", "branch", "merge", "api", "bracket"],
    seoTitle: "Best Code & Development Icons for UI Design",
    seoDescription: "Browse {count} free code and development SVG icons across {libs} libraries. Terminal, git, bug, and API icons.",
    relatedCategories: ["database", "tools", "device"]
  },
  {
    slug: "education",
    title: "Education",
    searchTags: ["education", "school", "book", "learn", "study", "graduation", "cap", "certificate", "diploma", "library", "teach"],
    seoTitle: "Best Education Icons for UI Design",
    seoDescription: "Browse {count} free education SVG icons across {libs} libraries. Book, graduation, school, and learning icons.",
    relatedCategories: ["file", "star"]
  },
  {
    slug: "food",
    title: "Food & Drink",
    searchTags: ["food", "drink", "restaurant", "coffee", "cup", "pizza", "cake", "wine", "beer", "glass", "fork", "knife", "spoon", "cooking"],
    seoTitle: "Best Food & Drink Icons for UI Design",
    seoDescription: "Browse {count} free food and drink SVG icons across {libs} libraries. Coffee, restaurant, and cooking icons.",
    relatedCategories: ["shopping", "heart"]
  },
  {
    slug: "health",
    title: "Health & Medical",
    searchTags: ["health", "medical", "hospital", "doctor", "heart", "pulse", "pill", "medicine", "stethoscope", "ambulance", "first-aid"],
    seoTitle: "Best Health & Medical Icons for UI Design",
    seoDescription: "Browse {count} free health and medical SVG icons across {libs} libraries. Hospital, pulse, medicine, and doctor icons.",
    relatedCategories: ["heart", "user"]
  },
  {
    slug: "finance",
    title: "Finance & Money",
    searchTags: ["finance", "money", "dollar", "currency", "wallet", "bank", "credit", "card", "payment", "coin", "cash", "invoice", "receipt"],
    seoTitle: "Best Finance & Money Icons for UI Design",
    seoDescription: "Browse {count} free finance SVG icons across {libs} libraries. Wallet, credit card, payment, and banking icons.",
    relatedCategories: ["shopping", "chart"]
  },
  {
    slug: "transport",
    title: "Transport & Vehicle",
    searchTags: ["transport", "vehicle", "car", "bus", "train", "plane", "airplane", "ship", "boat", "bicycle", "bike", "truck", "taxi"],
    seoTitle: "Best Transport & Vehicle Icons for UI Design",
    seoDescription: "Browse {count} free transport and vehicle SVG icons across {libs} libraries. Car, plane, train, and bicycle icons.",
    relatedCategories: ["map", "navigation"]
  },
  {
    slug: "animal",
    title: "Animals",
    searchTags: ["animal", "pet", "dog", "cat", "bird", "fish", "bug", "insect", "paw", "rabbit", "horse"],
    seoTitle: "Best Animal Icons for UI Design",
    seoDescription: "Browse {count} free animal SVG icons across {libs} libraries. Dog, cat, bird, fish, and pet icons.",
    relatedCategories: ["nature", "heart"]
  },
  {
    slug: "sport",
    title: "Sports & Fitness",
    searchTags: ["sport", "fitness", "gym", "ball", "basketball", "football", "soccer", "tennis", "trophy", "medal", "run", "exercise"],
    seoTitle: "Best Sports & Fitness Icons for UI Design",
    seoDescription: "Browse {count} free sports SVG icons across {libs} libraries. Ball, trophy, gym, and fitness icons.",
    relatedCategories: ["heart", "star"]
  },
  {
    slug: "building",
    title: "Buildings",
    searchTags: ["building", "office", "city", "factory", "warehouse", "store", "hospital", "church", "tower", "skyscraper"],
    seoTitle: "Best Building Icons for UI Design",
    seoDescription: "Browse {count} free building SVG icons across {libs} libraries. Office, city, store, and architecture icons.",
    relatedCategories: ["home", "map"]
  },
  {
    slug: "music",
    title: "Music & Audio",
    searchTags: ["music", "audio", "sound", "note", "headphone", "microphone", "mic", "speaker", "radio", "podcast", "equalizer"],
    seoTitle: "Best Music & Audio Icons for UI Design",
    seoDescription: "Browse {count} free music and audio SVG icons across {libs} libraries. Headphones, microphone, note, and sound icons.",
    relatedCategories: ["media", "device"]
  },
  {
    slug: "camera",
    title: "Camera & Photo",
    searchTags: ["camera", "photo", "image", "picture", "gallery", "lens", "flash", "snapshot", "selfie", "film"],
    seoTitle: "Best Camera & Photo Icons for UI Design",
    seoDescription: "Browse {count} free camera and photo SVG icons across {libs} libraries. Camera, gallery, image, and photography icons.",
    relatedCategories: ["media", "file"]
  },
  {
    slug: "power-energy",
    title: "Power & Energy",
    searchTags: ["power", "energy", "electric", "bolt", "lightning", "plug", "outlet", "charge", "solar", "wind", "nuclear"],
    seoTitle: "Best Power & Energy Icons for UI Design",
    seoDescription: "Browse {count} free power and energy SVG icons across {libs} libraries. Lightning, plug, charge, and electricity icons.",
    relatedCategories: ["battery", "device", "settings"]
  },
  {
    slug: "layout-grid",
    title: "Layout & Grid",
    searchTags: ["layout", "grid", "column", "row", "table", "list", "dashboard", "panel", "section", "template"],
    seoTitle: "Best Layout & Grid Icons for UI Design",
    seoDescription: "Browse {count} free layout and grid SVG icons across {libs} libraries. Dashboard, table, column, and panel icons.",
    relatedCategories: ["chart", "settings", "filter-sort"]
  },
  {
    slug: "text-typography",
    title: "Text & Typography",
    searchTags: ["text", "typography", "font", "bold", "italic", "underline", "heading", "paragraph", "align", "indent", "quote", "letter"],
    seoTitle: "Best Text & Typography Icons for UI Design",
    seoDescription: "Browse {count} free text and typography SVG icons across {libs} libraries. Font, bold, italic, and alignment icons.",
    relatedCategories: ["editing", "file"]
  },
  {
    slug: "shape",
    title: "Shapes & Geometry",
    searchTags: ["shape", "circle", "square", "triangle", "rectangle", "polygon", "hexagon", "diamond", "oval", "cube", "sphere"],
    seoTitle: "Best Shape & Geometry Icons for UI Design",
    seoDescription: "Browse {count} free shape and geometry SVG icons across {libs} libraries. Circle, square, triangle, and polygon icons.",
    relatedCategories: ["layout-grid", "star"]
  },
  {
    slug: "toggle",
    title: "Toggle & Switch",
    searchTags: ["toggle", "switch", "checkbox", "radio", "check", "tick", "on", "off", "select"],
    seoTitle: "Best Toggle & Switch Icons for UI Design",
    seoDescription: "Browse {count} free toggle and switch SVG icons across {libs} libraries. Checkbox, radio, and toggle icons.",
    relatedCategories: ["settings", "filter-sort"]
  },
  {
    slug: "flag",
    title: "Flags",
    searchTags: ["flag", "banner", "report", "mark", "flagged"],
    seoTitle: "Best Flag Icons for UI Design",
    seoDescription: "Browse {count} free flag SVG icons across {libs} libraries. Flag, banner, and report icons.",
    relatedCategories: ["notification", "bookmark"]
  },
  {
    slug: "gift",
    title: "Gift & Reward",
    searchTags: ["gift", "present", "reward", "prize", "surprise", "box", "wrap"],
    seoTitle: "Best Gift & Reward Icons for UI Design",
    seoDescription: "Browse {count} free gift and reward SVG icons across {libs} libraries. Present, prize, and surprise icons.",
    relatedCategories: ["shopping", "star", "heart"]
  },
  {
    slug: "tools",
    title: "Tools & Wrench",
    searchTags: ["tool", "wrench", "hammer", "screwdriver", "plier", "saw", "drill", "repair", "fix", "maintenance"],
    seoTitle: "Best Tool & Wrench Icons for UI Design",
    seoDescription: "Browse {count} free tool SVG icons across {libs} libraries. Wrench, hammer, screwdriver, and repair icons.",
    relatedCategories: ["settings", "code"]
  },
  {
    slug: "database",
    title: "Database & Server",
    searchTags: ["database", "server", "storage", "data", "backup", "rack", "hosting", "sql"],
    seoTitle: "Best Database & Server Icons for UI Design",
    seoDescription: "Browse {count} free database and server SVG icons across {libs} libraries. Storage, backup, and hosting icons.",
    relatedCategories: ["cloud", "code", "chart"]
  },
  {
    slug: "wifi",
    title: "WiFi & Signal",
    searchTags: ["wifi", "signal", "wireless", "network", "connection", "internet", "antenna", "bluetooth", "cellular"],
    seoTitle: "Best WiFi & Signal Icons for UI Design",
    seoDescription: "Browse {count} free WiFi and signal SVG icons across {libs} libraries. Wireless, network, and connection icons.",
    relatedCategories: ["device", "cloud"]
  },
  {
    slug: "battery",
    title: "Battery",
    searchTags: ["battery", "charge", "power", "energy", "level", "low", "full"],
    seoTitle: "Best Battery Icons for UI Design",
    seoDescription: "Browse {count} free battery SVG icons across {libs} libraries. Charge, power level, and energy icons.",
    relatedCategories: ["device", "power-energy"]
  },
  {
    slug: "clipboard",
    title: "Clipboard",
    searchTags: ["clipboard", "paste", "board", "task", "checklist", "todo", "list"],
    seoTitle: "Best Clipboard Icons for UI Design",
    seoDescription: "Browse {count} free clipboard SVG icons across {libs} libraries. Paste, checklist, task, and todo icons.",
    relatedCategories: ["editing", "file"]
  },
  {
    slug: "bookmark",
    title: "Bookmark",
    searchTags: ["bookmark", "save", "saved", "ribbon", "reading", "mark"],
    seoTitle: "Best Bookmark Icons for UI Design",
    seoDescription: "Browse {count} free bookmark SVG icons across {libs} libraries. Save, ribbon, and reading list icons.",
    relatedCategories: ["heart", "star", "flag"]
  },
  {
    slug: "filter-sort",
    title: "Filter & Sort",
    searchTags: ["filter", "sort", "funnel", "order", "arrange", "ascending", "descending"],
    seoTitle: "Best Filter & Sort Icons for UI Design",
    seoDescription: "Browse {count} free filter and sort SVG icons across {libs} libraries. Funnel, order, and arrangement icons.",
    relatedCategories: ["search", "settings", "layout-grid"]
  },
  {
    slug: "refresh-sync",
    title: "Refresh & Sync",
    searchTags: ["refresh", "sync", "reload", "update", "rotate", "loop", "repeat", "cycle"],
    seoTitle: "Best Refresh & Sync Icons for UI Design",
    seoDescription: "Browse {count} free refresh and sync SVG icons across {libs} libraries. Reload, update, and rotate icons.",
    relatedCategories: ["arrow", "cloud", "download-upload"]
  },
  {
    slug: "link",
    title: "Link & Chain",
    searchTags: ["link", "chain", "url", "anchor", "connect", "attach", "unlink", "external"],
    seoTitle: "Best Link & Chain Icons for UI Design",
    seoDescription: "Browse {count} free link and chain SVG icons across {libs} libraries. URL, anchor, connect, and attach icons.",
    relatedCategories: ["code", "navigation"]
  },
  {
    slug: "eye",
    title: "Eye & Visibility",
    searchTags: ["eye", "view", "visible", "visibility", "hidden", "show", "hide", "watch", "observe", "preview"],
    seoTitle: "Best Eye & Visibility Icons for UI Design",
    seoDescription: "Browse {count} free eye and visibility SVG icons across {libs} libraries. View, show, hide, and preview icons.",
    relatedCategories: ["security", "search"]
  },
  {
    slug: "nature",
    title: "Nature & Plants",
    searchTags: ["nature", "plant", "tree", "leaf", "flower", "forest", "garden", "seed", "grass", "eco", "green"],
    seoTitle: "Best Nature & Plant Icons for UI Design",
    seoDescription: "Browse {count} free nature and plant SVG icons across {libs} libraries. Tree, leaf, flower, and eco icons.",
    relatedCategories: ["animal", "weather"]
  },
];

export function getCategoryBySlug(slug: string): SeoCategory | undefined {
  return SEO_CATEGORIES.find(c => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return SEO_CATEGORIES.map(c => c.slug);
}
