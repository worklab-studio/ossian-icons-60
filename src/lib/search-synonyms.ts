// Comprehensive synonym dictionary for icon search

export const SYNONYM_MAP: Record<string, string[]> = {
  // Navigation & Direction
  'home': ['house', 'main', 'dashboard', 'start', 'index'],
  'house': ['home', 'building', 'residence'],
  'arrow': ['pointer', 'direction', 'navigate', 'point'],
  'back': ['return', 'previous', 'undo', 'reverse'],
  'forward': ['next', 'advance', 'continue', 'proceed'],
  'up': ['top', 'above', 'upward', 'north'],
  'down': ['bottom', 'below', 'downward', 'south'],
  'left': ['previous', 'west', 'backward'],
  'right': ['next', 'east', 'forward'],
  'menu': ['hamburger', 'nav', 'navigation', 'options'],
  
  // User & People
  'user': ['person', 'profile', 'account', 'people', 'individual'],
  'person': ['user', 'individual', 'human', 'people'],
  'people': ['users', 'group', 'team', 'crowd', 'persons'],
  'profile': ['user', 'account', 'avatar', 'bio'],
  'account': ['user', 'profile', 'login', 'signin'],
  'team': ['group', 'people', 'crew', 'squad'],
  
  // Actions
  'delete': ['remove', 'trash', 'clear', 'erase', 'destroy'],
  'remove': ['delete', 'clear', 'erase', 'eliminate'],
  'trash': ['delete', 'garbage', 'bin', 'waste'],
  'add': ['plus', 'create', 'new', 'insert', 'append'],
  'plus': ['add', 'create', 'new', 'positive'],
  'create': ['add', 'new', 'make', 'build', 'generate'],
  'edit': ['modify', 'change', 'update', 'alter', 'revise'],
  'save': ['store', 'keep', 'preserve', 'download'],
  'copy': ['duplicate', 'clone', 'replicate'],
  'cut': ['slice', 'trim', 'crop', 'remove'],
  'paste': ['insert', 'add', 'place'],
  
  // Search & Find
  'search': ['find', 'lookup', 'seek', 'magnify', 'zoom', 'discover'],
  'find': ['search', 'locate', 'discover', 'seek'],
  'filter': ['sort', 'organize', 'arrange', 'sift'],
  'sort': ['filter', 'arrange', 'organize', 'order'],
  
  // Communication
  'email': ['mail', 'message', 'letter', 'envelope'],
  'mail': ['email', 'message', 'post', 'letter'],
  'message': ['mail', 'email', 'text', 'chat', 'msg'],
  'phone': ['call', 'telephone', 'mobile', 'contact'],
  'call': ['phone', 'ring', 'dial', 'contact'],
  'chat': ['message', 'talk', 'conversation', 'discuss'],
  'notification': ['alert', 'bell', 'notice', 'ping'],
  'bell': ['notification', 'alert', 'ring', 'chime'],
  
  // Media & Content
  'play': ['start', 'run', 'begin', 'launch'],
  'pause': ['stop', 'break', 'halt', 'suspend'],
  'stop': ['pause', 'end', 'halt', 'cease'],
  'music': ['audio', 'sound', 'song', 'tune'],
  'audio': ['music', 'sound', 'voice', 'hear'],
  'video': ['movie', 'film', 'clip', 'media'],
  'image': ['picture', 'photo', 'graphic', 'pic'],
  'picture': ['image', 'photo', 'graphic', 'pic'],
  'photo': ['image', 'picture', 'snapshot', 'pic'],
  'camera': ['photo', 'picture', 'snapshot', 'lens'],
  
  // Files & Storage
  'file': ['document', 'doc', 'paper', 'record'],
  'folder': ['directory', 'collection', 'group', 'container'],
  'document': ['file', 'doc', 'paper', 'text'],
  'download': ['save', 'get', 'fetch', 'retrieve'],
  'upload': ['send', 'post', 'submit', 'transfer'],
  'archive': ['zip', 'compress', 'store', 'backup'],
  'backup': ['copy', 'save', 'archive', 'duplicate'],
  
  // System & Settings
  'settings': ['config', 'preferences', 'options', 'setup', 'gear'],
  'config': ['settings', 'setup', 'configure', 'options'],
  'preferences': ['settings', 'options', 'choices'],
  'options': ['settings', 'choices', 'preferences'],
  'gear': ['settings', 'cog', 'wheel', 'machine'],
  'tool': ['utility', 'instrument', 'device'],
  'wrench': ['tool', 'fix', 'repair', 'adjust'],
  
  // Security
  'lock': ['secure', 'protect', 'private', 'key'],
  'unlock': ['open', 'access', 'free', 'release'],
  'key': ['password', 'access', 'unlock', 'secret'],
  'shield': ['protect', 'security', 'guard', 'defense'],
  'security': ['protection', 'safety', 'guard', 'secure'],
  'eye': ['view', 'see', 'look', 'watch', 'visibility'],
  'visible': ['show', 'display', 'reveal', 'see'],
  'hidden': ['invisible', 'hide', 'secret', 'private'],
  
  // Social & Interaction
  'heart': ['love', 'like', 'favorite', 'affection'],
  'love': ['heart', 'like', 'favorite', 'adore'],
  'like': ['heart', 'love', 'favorite', 'thumbs'],
  'favorite': ['star', 'heart', 'like', 'bookmark'],
  'star': ['favorite', 'rating', 'bookmark', 'important'],
  'share': ['send', 'distribute', 'spread', 'post'],
  'follow': ['subscribe', 'track', 'watch', 'monitor'],
  'bookmark': ['save', 'favorite', 'mark', 'remember'],
  
  // Time & Calendar
  'calendar': ['date', 'schedule', 'time', 'event'],
  'clock': ['time', 'hour', 'minute', 'timer'],
  'time': ['clock', 'hour', 'schedule', 'when'],
  'date': ['calendar', 'day', 'when', 'schedule'],
  'timer': ['clock', 'countdown', 'stopwatch'],
  'alarm': ['alert', 'notification', 'reminder', 'wake'],
  
  // Status & Alerts
  'alert': ['warning', 'notification', 'danger', 'notice'],
  'warning': ['alert', 'caution', 'danger', 'notice'],
  'error': ['problem', 'issue', 'bug', 'wrong'],
  'info': ['information', 'help', 'about', 'details'],
  'help': ['support', 'assist', 'aid', 'question'],
  'question': ['help', 'ask', 'inquiry', 'quiz'],
  'check': ['correct', 'verify', 'confirm', 'tick'],
  'success': ['complete', 'done', 'finished', 'check'],
  
  // Commerce & Money
  'shopping': ['cart', 'buy', 'purchase', 'store'],
  'cart': ['shopping', 'basket', 'buy', 'purchase'],
  'buy': ['purchase', 'shopping', 'pay', 'order'],
  'store': ['shop', 'market', 'buy', 'commerce'],
  'money': ['cash', 'dollar', 'currency', 'payment'],
  'payment': ['money', 'pay', 'cash', 'transaction'],
  'price': ['cost', 'money', 'value', 'amount'],
  'tag': ['label', 'mark', 'price', 'category'],
  
  // Location & Maps
  'map': ['location', 'navigation', 'place', 'geography'],
  'location': ['place', 'position', 'map', 'pin'],
  'place': ['location', 'spot', 'position', 'area'],
  'pin': ['marker', 'location', 'point', 'place'],
  'marker': ['pin', 'point', 'indicator', 'flag'],
  'gps': ['location', 'navigation', 'map', 'tracking'],
  'building': ['structure', 'house', 'office', 'tower'],
  
  // Weather
  'sun': ['sunny', 'bright', 'day', 'weather'],
  'moon': ['night', 'dark', 'lunar', 'evening'],
  'cloud': ['weather', 'sky', 'overcast', 'storage'],
  'rain': ['weather', 'water', 'storm', 'wet'],
  'snow': ['weather', 'cold', 'winter', 'white'],
  'weather': ['climate', 'forecast', 'conditions'],
  
  // Common synonyms for better matching (made conservative for precision)
  'car': ['vehicle', 'auto'],
  'bike': ['bicycle', 'cycle'],
  'plane': ['airplane', 'aircraft'],
  'train': ['railway', 'subway'],
  'bus': ['transport', 'vehicle'],
  'book': ['notebook'],  // Removed broad synonyms like 'read', 'library'
  'game': ['play', 'sport'],
  'sport': ['game', 'athletic'],
  'food': ['meal', 'eat'],
  'drink': ['beverage'],
  'coffee': ['cafe', 'espresso']
};

// Get all synonyms for a given word
export function getSynonyms(word: string): string[] {
  const normalizedWord = word.toLowerCase().trim();
  return SYNONYM_MAP[normalizedWord] || [];
}

// Expand a query with synonyms
export function expandQueryWithSynonyms(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const expandedTerms = new Set<string>();
  
  // Add original query
  expandedTerms.add(query.toLowerCase());
  
  // Add individual words
  words.forEach(word => expandedTerms.add(word));
  
  // Add synonyms for each word
  words.forEach(word => {
    const synonyms = getSynonyms(word);
    synonyms.forEach(synonym => expandedTerms.add(synonym));
  });
  
  return Array.from(expandedTerms);
}