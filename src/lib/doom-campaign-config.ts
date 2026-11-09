/**
 * OKTOPUS CLOTHING — DR. DOOM COLLECTION
 * Official Campaign Copy & Typography
 */

export const DOOM_CAMPAIGN_CONFIG = {
  id: 'dr-doom',
  title: 'Dr. Doom Collection',
  categoryId: '6aef915028011062ace64289', // MongoDB category ID for "Dr. Doom"
  categoryName: 'Dr. Doom',

  // Official Headlines
  headlines: {
    banner: 'A NEW ORDER BEGINS.',
    hero: 'POWER HAS A PRESENCE.',
    insignia: 'BENEATH NO ONE.',
    products: 'THE SOVEREIGN EDITION',
    outro: 'THE CROWN IS FORGED.',
    alt: 'RULE YOUR OWN REALM.',
  },

  // Punchlines
  punchlines: {
    bornBeyond: 'Born beyond permission.',
    neverBuilt: 'Never built to obey.',
    quietPower: 'Quiet power. Absolute presence.',
    mindArmour: 'The mind is the armour.',
    noApproval: 'No approval. No apology.',
    differentOrder: 'Cut from a different order.',
    authority: 'Authority is not borrowed.',
    standards: 'Some standards cannot be negotiated.',
    makeEmpire: 'Make your own empire.',
    greatness: "Greatness doesn't ask.",
    noThrone: 'No throne required.',
  },

  // Philosophical Campaign Copy
  philosophy: {
    intro: 'An empire is first built in the mind.',
    ambition: 'Some chase the impossible. Others redefine it.',
    authority: 'Power is not the ability to command. It is the conviction to never surrender your will.',
    perfection: 'Perfection is a pursuit. Not a destination.',
    independence: 'The world has its rules. Your ambition doesn\'t have to.',
    legacy: 'Long after the noise fades, what remains is what you built.',
    control: 'Chaos is easy. Creating order takes conviction.',
    identity: 'Never let the world decide the measure of your existence.',
  },

  colors: {
    obsidianBlack: '#050705',
    forestArmour: '#394F3F',
    mutedEmerald: '#4B5E4A',
    parchmentIvory: '#F2F1DD',
    antiqueGold: '#8E815A',
    champagneGold: '#C1B188',
    armourSilver: '#A1AAA3',
    shadowGreen: '#2D382D',
    sageGreen: '#7B8F7C',
    darkBronze: '#494333',
  },
} as const;

/**
 * Check whether a product belongs to the Dr. Doom category.
 */
export function isDoomProduct(
  p?: { category?: any } | null,
  categoryId?: string | string[]
): boolean {
  if (!p || !p.category) return false;
  const ids: string[] = [DOOM_CAMPAIGN_CONFIG.categoryId];
  if (Array.isArray(categoryId)) {
    ids.push(...categoryId.filter(Boolean));
  } else if (typeof categoryId === 'string' && categoryId) {
    ids.push(categoryId);
  }

  const pCats = Array.isArray(p.category) ? p.category : [p.category];
  return pCats.some((c) => {
    if (!c) return false;
    const s = String(c).toLowerCase();
    if (s.includes('doom')) return true;
    return ids.some((id) => id.toLowerCase() === s);
  });
}

/**
 * Filter products to strictly show ONLY products added to the Dr. Doom category.
 */
export function filterDoomCollectionProducts<T extends { category?: any }>(
  allProducts: T[],
  categoryId?: string | string[]
): T[] {
  if (!allProducts || allProducts.length === 0) return [];
  return allProducts.filter((p) => isDoomProduct(p, categoryId));
}

/**
 * Filter out Dr. Doom products from standard storefront pages (ensures strict exclusivity).
 */
export function filterOutDoomProducts<T extends { category?: any }>(
  allProducts: T[],
  categoryId?: string | string[]
): T[] {
  if (!allProducts || allProducts.length === 0) return [];
  return allProducts.filter((p) => !isDoomProduct(p, categoryId));
}
