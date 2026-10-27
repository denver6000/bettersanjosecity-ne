/**
 * San Jose City, Nueva Ecija — tax and fee codes.
 *
 * Transcribed row by row from the schedule printouts of the Office of the
 * Treasurer (printed 8 October 2026, effectivity "2014 - PRESENT"). Every
 * figure here is as printed. Where the printout looks irregular, the row is
 * kept as printed and a note says so; nothing is corrected silently.
 *
 * The printouts themselves are not published or committed; maintainers keep
 * them in sources/ (git-ignored). Each schedule's `source` records which
 * printout it came from.
 */

/** The four flags printed beside every code on the schedule. */
export interface AppliesTo {
  new: boolean;
  renewal: boolean;
  withEssential: boolean;
  higherValueComparison: boolean;
}

/** One row of a graduated (range-based) schedule. */
export interface Bracket {
  from: number;
  to: number;
  amount: number;
  /** As printed, e.g. 0.005625. Zero means no rate is printed for the row. */
  rate: number;
}

interface CodeBase {
  code: string;
  title: string;
  /** Official wording, one paragraph per entry. */
  description?: string[];
  /** Numbered list that is part of the official wording. */
  enumerated?: string[];
  applies: AppliesTo;
  notes?: string[];
}

export interface GraduatedCode extends CodeBase {
  kind: 'graduated';
  subject: string;
  /** Unit the subject is measured in, used for the bracket finder input. */
  unit: 'peso' | 'area';
  showRate: boolean;
  brackets: Bracket[];
}

export interface FlatRateCode extends CodeBase {
  kind: 'flat-rate';
  subject: string;
  rate: number;
  amount: number;
}

export interface TieredCode extends CodeBase {
  kind: 'tiered';
  /** Column heading on the printout, e.g. "Asset Size" or "Garbage Fee". */
  column: string;
  rows: { label: string; amount: number }[];
}

export interface FixedCode extends CodeBase {
  kind: 'fixed';
  amount: number;
  /** Basis printed on the schedule, if any (e.g. "No. of employees"). */
  subject?: string;
  retirement?: boolean;
}

export type RevenueCode = GraduatedCode | FlatRateCode | TieredCode | FixedCode;

export interface Schedule {
  id: string;
  /** Heading printed on the source, e.g. "LICENSE". */
  printedHeading: string;
  name: string;
  short: string;
  summary: string;
  explainer: string[];
  /** The printout this was transcribed from. Printouts are kept offline, not published. */
  source: { label: string; printed: string; pages: number };
  codes: RevenueCode[];
}

/** Upper bound printed as "9,999,999,999,999.00" and similar: read as "and above". */
export const OPEN_ENDED = 9_999_999_999;

const renewalOnly: AppliesTo = {
  new: false,
  renewal: true,
  withEssential: false,
  higherValueComparison: false,
};
const newAndRenewal: AppliesTo = {
  new: true,
  renewal: true,
  withEssential: false,
  higherValueComparison: false,
};

const b = (from: number, to: number, amount: number, rate = 0): Bracket => ({
  from,
  to,
  amount,
  rate,
});

export const EFFECTIVITY = '2014 to present';
export const PRINTED_ON = '8 October 2026';

export const schedules: Schedule[] = [
  {
    id: 'business-tax',
    printedHeading: 'LICENSE',
    name: 'Business tax',
    short: 'Business tax',
    summary:
      'The yearly tax on doing business in the city, set by gross sales or receipts. Six codes cover manufacturers, wholesalers, retailers, contractors, banks and service businesses.',
    explainer: [
      'Most codes are graduated: find the row your gross sales or receipts fall in, and that row gives the amount. A few top rows also carry a rate.',
      'All six codes on this schedule are marked for renewal. The retailer code is also marked “with essential”.',
    ],
    source: {
      label: 'License schedule',
      printed: '2026-10-08 23:27',
      pages: 3,
    },
    codes: [
      {
        kind: 'graduated',
        code: '582-01',
        title: 'Manufacturers, assemblers, repackers and processors',
        description: [
          'On manufacturers, assemblers, repackers, processors, brewers, distillers, rectifiers, and compounders of liquors, distilled spirits, and wines, or manufacturers of any article of commerce of whatever kind or nature in accordance with the following schedule.',
        ],
        applies: renewalOnly,
        subject: 'Gross amount',
        unit: 'peso',
        showRate: true,
        brackets: [
          b(0.01, 9_999.99, 247.5),
          b(10_000, 14_999.99, 330),
          b(15_000, 19_999.99, 453),
          b(20_000, 29_999.99, 660),
          b(30_000, 39_999, 990),
          b(40_000, 49_999, 1_237),
          b(50_000, 74_999, 1_980),
          b(75_000, 99_999, 2_475),
          b(100_000, 149_999, 3_300),
          b(150_000, 199_999, 4_125),
          b(200_000, 299_999, 5_775),
          b(300_000, 499_999, 8_250),
          b(500_000, 749_999, 12_000),
          b(750_000, 999_999, 15_000),
          b(1_000_000, 1_999_999, 20_625),
          b(2_000_000, 2_999_999, 24_750),
          b(3_000_000, 3_999_999, 29_700),
          b(4_000_000, 4_999_999, 34_650),
          b(5_000_000, 6_499_999, 36_562.5),
          b(6_500_000, 9_999_999_999_999, 36_562.5, 0.005625),
        ],
      },
      {
        kind: 'graduated',
        code: '582-02',
        title: 'Wholesalers, distributors and dealers',
        description: [
          'On wholesalers, distributors, or dealers in any article of commerce of whatever kind or nature in accordance with the following articles.',
        ],
        applies: renewalOnly,
        subject: 'Gross amount',
        unit: 'peso',
        showRate: true,
        brackets: [
          b(0.01, 999.99, 27),
          b(1_000, 1_999.99, 49.5),
          b(2_000, 2_999.99, 75),
          b(3_000, 3_999.99, 108),
          b(4_000, 4_999.99, 150),
          b(5_000, 5_999.99, 181.5),
          b(6_000, 6_999.99, 214.5),
          b(7_000, 7_999.99, 247.5),
          b(8_000, 9_999.99, 280.5),
          b(10_000, 14_999.99, 330),
          b(15_000, 19_999.99, 412.5),
          b(20_000, 29_999.99, 495),
          b(30_000, 39_999.99, 660),
          b(40_000, 49_999.99, 990),
          b(50_000, 74_999.99, 1_485),
          b(75_000, 99_999.99, 1_980),
          b(100_000, 149_999.99, 2_805),
          b(150_000, 199_999.99, 3_630),
          b(200_000, 299_999.99, 4_950),
          b(300_000, 499_999.99, 6_600),
          b(500_000, 749_999.99, 9_900),
          b(750_000, 999_999.99, 13_200),
          b(100_000_000, 1_999_999_999.99, 15_000),
          b(2_000_000_000, 9_999_999_999_999, 15_000, 0.075),
        ],
        notes: [
          'As printed, the row after ₱750,000 to ₱999,999.99 starts at ₱100,000,000.00, so no row covers gross sales from ₱1,000,000 to ₱99,999,999.99. This may be a typing error for ₱1,000,000.00.',
          'The top row’s rate is printed as 0.075000 (7.5 per cent).',
        ],
      },
      {
        kind: 'graduated',
        code: '582-07',
        title: 'Retailers',
        description: [
          'On Retailers. The rate of two percent (2%) per annum shall be imposed on sales not exceeding FOUR HUNDRED THOUSAND PESOS (P400,000.00), while the rate of one percent (1%) per annum shall be imposed on sales in excess of FOUR HUNDRED THOUSAND PESOS (P400,000.00).',
          'However, barangays shall have the exclusive power to levy taxes on stores whose gross sales or receipts of the preceding calendar year does not exceed FIFTY THOUSAND PESOS (P50,000.00) subject to existing laws and regulations.',
        ],
        applies: { ...renewalOnly, withEssential: true },
        subject: 'Gross amount',
        unit: 'peso',
        showRate: true,
        brackets: [b(0.01, 399_999.99, 0, 0.02), b(400_000, 99_999_999_999, 0, 0.01)],
        notes: [
          'Stores with gross sales of ₱50,000 or less in the preceding year are taxed by their barangay, not by the city.',
        ],
      },
      {
        kind: 'graduated',
        code: '582-08',
        title: 'Contractors and other independent contractors',
        description: [
          'The tax on contractors and other independent contractors shall likewise be collected from tax subjects enumerated under Section 19 (c) of Presidential Decree No. 231, as amended, but which are no longer included in the enumeration of “contractor” under Section 131 of Republic Act 7160.',
        ],
        applies: renewalOnly,
        subject: 'Gross amount',
        unit: 'peso',
        showRate: true,
        brackets: [
          b(0.01, 4_999.99, 41.25),
          b(5_000, 9_999, 91.9),
          b(10_000, 14_999, 156.75),
          b(15_000, 19_999, 247.5),
          b(20_000, 29_999, 412.5),
          b(30_000, 39_999, 577.5),
          b(40_000, 49_999, 825),
          b(50_000, 74_999, 1_320),
          b(75_000, 99_999, 1_980),
          b(100_000, 149_999, 2_970),
          b(150_000, 199_999, 3_960),
          b(200_000, 249_999, 5_445),
          b(250_000, 299_999, 6_930),
          b(400_000, 499_999, 12_375),
          b(500_000, 749_999, 13_875),
          b(750_000, 999_999, 15_375),
          b(1_000_000, 1_999_999, 17_250),
        ],
        notes: [
          'As printed, there is no row for ₱300,000 to ₱399,999, and the schedule stops at ₱1,999,999. Code 582-10, which has the same amounts, lists ₱9,240.00 for that range.',
        ],
      },
      {
        kind: 'flat-rate',
        code: '582-09',
        title: 'Banks and other financial institutions',
        description: [
          'On banks and other financial institutions (interest, commissions and discounts from lending activities, income from financial leasing, dividends, rentals on property, profit from exchange or sale of property, and insurance premiums).',
        ],
        applies: renewalOnly,
        subject: 'Gross amount',
        rate: 0.00825,
        amount: 0,
      },
      {
        kind: 'graduated',
        code: '582-10',
        title: 'Service businesses: restaurants, amusement places, clinics and others',
        description: [
          'The rates of taxes on the businesses hereunder enumerated shall be the following:',
        ],
        enumerated: [
          'Cafes, cafeterias, ice cream and other refreshment parlors, restaurants, soda fountains, bars, carinderias, or food caterers',
          'Amusement places, including places wherein customers thereof actively participate without making bets or wagers, including but not limited to night clubs, day clubs, cocktail lounges, cabarets or dance halls, karaoke bars, skating rinks, bath houses, swimming pools, exclusive clubs such as country and sports clubs, resorts and other similar places, billiard and pool tables, bowling alleys, circuses, carnivals, merry-go-rounds, roller coasters, ferris wheels, swings, shooting galleries, and other similar contrivances, theaters and cinema houses, boxing stadia, race tracks, cockpits and other similar establishments',
          'Commission agents',
          'Lessors, dealers, brokers of real estate',
          'Travel agencies and travel agents',
          'Pension houses, motels, apartments, apartelles, and condominiums',
          'Subdivision owners, private cemeteries and memorial parks',
          'Privately-owned markets',
          'Boarding houses',
          'Hospitals, medical clinics, dental clinics, therapeutic clinics, medical laboratories, dental laboratories',
          'Cockpit operations (to include placida and cockpit rentals)',
          'Operators of cable network systems',
          'Operators of computer services establishments',
          'General consultancy services',
          'All other similar activities consisting essentially of the sales of services or a fee',
        ],
        applies: renewalOnly,
        subject: 'Gross amount',
        unit: 'peso',
        showRate: true,
        brackets: [
          b(0.01, 4_999, 41.25),
          b(5_000, 9_999, 91.9),
          b(10_000, 14_999, 156.75),
          b(15_000, 19_999, 247.5),
          b(20_000, 29_999, 412.5),
          b(30_000, 39_999, 577.5),
          b(40_000, 49_999, 825),
          b(50_000, 74_999, 1_320),
          b(75_000, 99_999, 1_980),
          b(100_000, 149_999, 2_970),
          b(150_000, 199_999, 3_960),
          b(200_000, 249_999, 5_445),
          b(250_000, 299_999, 6_930),
          b(300_000, 399_999, 9_240),
          b(400_000, 499_999, 12_375),
          b(500_000, 749_999, 13_875),
          b(750_000, 999_999, 15_375),
          b(1_000_000, 1_999_999, 17_250),
          b(2_000_000, 9_999_999_999_999, 17_250, 0.0078),
        ],
      },
    ],
  },
  {
    id: 'permit-fees',
    printedHeading: 'PERMIT',
    name: 'Mayor’s permit fees',
    short: 'Permit fees',
    summary:
      'The fee for the permit itself, charged on new applications and renewals. Most depend on the size of the business’s assets; a few are a fixed amount.',
    explainer: [
      'Find your line of business, then your asset size. Every code on this schedule is marked for both new applications and renewals.',
    ],
    source: {
      label: 'Permit schedule',
      printed: '2026-10-08 23:28',
      pages: 1,
    },
    codes: [
      {
        kind: 'tiered',
        code: '582-02-MP',
        title: 'Wholesalers',
        applies: newAndRenewal,
        column: 'Asset size',
        rows: [
          { label: 'Cottage', amount: 200 },
          { label: 'Small', amount: 400 },
          { label: 'Medium', amount: 800 },
          { label: 'Large', amount: 1_000 },
        ],
      },
      {
        kind: 'fixed',
        code: '582-06',
        title: 'Poultry and piggery',
        applies: newAndRenewal,
        amount: 500,
      },
      {
        kind: 'tiered',
        code: '582-08-MP',
        title: 'Contractors',
        applies: newAndRenewal,
        column: 'Asset size',
        rows: [
          { label: 'Cottage', amount: 100 },
          { label: 'Small', amount: 400 },
          { label: 'Medium', amount: 800 },
          { label: 'Large', amount: 1_000 },
        ],
      },
      {
        kind: 'tiered',
        code: '582-09-MP',
        title: 'Banks',
        applies: newAndRenewal,
        column: 'Type of bank',
        rows: [
          { label: 'Rural, thrift and savings bank', amount: 1_000 },
          { label: 'Commercial, industrial and development banks', amount: 3_000 },
          { label: 'Universal banks', amount: 5_000 },
        ],
        notes: ['The printout labels the middle row “Com Ind Dev Banks”.'],
      },
      {
        kind: 'fixed',
        code: '582-22',
        title: 'Other business',
        applies: newAndRenewal,
        amount: 500,
      },
      {
        kind: 'tiered',
        code: '589-09-01-MP',
        title: 'Financial institutions',
        applies: newAndRenewal,
        column: 'Asset size',
        rows: [
          { label: 'Option', amount: 0 },
          { label: 'Small', amount: 1_000 },
          { label: 'Medium', amount: 3_000 },
          { label: 'Large', amount: 5_000 },
        ],
        notes: ['The first row is printed as “Option” with an amount of ₱0.00.'],
      },
      {
        kind: 'tiered',
        code: '592-01',
        title: 'Transloading',
        applies: newAndRenewal,
        column: 'Asset size',
        rows: [
          { label: 'Medium', amount: 2_000 },
          { label: 'Large', amount: 4_000 },
        ],
      },
    ],
  },
  {
    id: 'sanitary-fee',
    printedHeading: 'SANITARY',
    name: 'Sanitary fee',
    short: 'Sanitary fee',
    summary:
      'One fee, set by the floor area of the business. It runs from ₱50 for the smallest spaces to ₱200 for 1,000 and up.',
    explainer: [
      'The schedule bases this fee on business area but does not print the unit. Square metres is the usual unit; confirm with the Treasurer’s Office.',
    ],
    source: {
      label: 'Sanitary schedule',
      printed: '2026-10-08 23:28',
      pages: 1,
    },
    codes: [
      {
        kind: 'graduated',
        code: 'FEE',
        title: 'Sanitary fee',
        applies: newAndRenewal,
        subject: 'Business area',
        unit: 'area',
        showRate: false,
        brackets: [
          b(0, 49, 50),
          b(50, 99, 75),
          b(100, 199, 100),
          b(200, 499, 125),
          b(500, 999, 150),
          b(1_000, 9_999_999_999, 200),
        ],
      },
    ],
  },
  {
    id: 'garbage-fees',
    printedHeading: 'GARBAGE',
    name: 'Garbage fees',
    short: 'Garbage fees',
    summary:
      'A yearly collection fee set by the type of establishment. Twelve groups, from industries and hospitals to sari-sari stores.',
    explainer: [
      'Find the group your business belongs to, then the line that describes it. Labels are kept as printed.',
    ],
    source: {
      label: 'Garbage schedule',
      printed: '2026-10-08 23:28',
      pages: 3,
    },
    codes: [
      {
        kind: 'tiered',
        code: '3001',
        title: 'Industrial and manufacturing firms',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Big Industries', amount: 10_000 },
          { label: 'Medium Scale LPG Recharging Plants', amount: 5_000 },
          { label: 'Small Scale Industries', amount: 3_000 },
        ],
      },
      {
        kind: 'tiered',
        code: '3002',
        title: 'Commercial establishments',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Fast Food Chain', amount: 3_000 },
          { label: 'Restaurants, Hotel, Motel', amount: 2_000 },
          { label: 'Fast Food Store', amount: 1_000 },
          { label: 'Gasoline Service Station', amount: 500 },
          { label: 'Lumber Yard and Hardware', amount: 500 },
          { label: 'Appliance Dealer', amount: 500 },
          { label: 'Motor Vehicle Dealer', amount: 500 },
          { label: 'Grocery Store', amount: 320 },
          { label: 'Dry Goods Store', amount: 320 },
          { label: 'Fish, Meat and Chicken Vendor', amount: 320 },
          { label: 'Vegetables and Fruit Vendor', amount: 320 },
          { label: 'Carinderias and Eateries', amount: 320 },
          { label: 'Glassware Store', amount: 320 },
          { label: 'Bakery and Bakeshop Store', amount: 320 },
          { label: 'Shoe Store', amount: 320 },
          { label: 'Barber and Beauty Shops', amount: 320 },
          { label: 'Dress and Tailoring Shops', amount: 320 },
          { label: 'Flower Shops', amount: 320 },
          { label: 'Music and Record Shops', amount: 320 },
          { label: 'Copying Machine, Wood Frames and Photography Shops', amount: 320 },
          { label: 'Pet Shops', amount: 320 },
          { label: 'LPG Store', amount: 320 },
          { label: 'Auto Supplies', amount: 320 },
        ],
      },
      {
        kind: 'tiered',
        code: '3003',
        title: 'Medical institutions',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Hospital', amount: 3_000 },
          { label: 'Medical Clinics with Patient Confinement Facilities', amount: 1_000 },
          { label: 'Medical and Dental Clinic with X-Rays, Ultrasound, CT Scan', amount: 500 },
          { label: 'Drug Store', amount: 300 },
          { label: 'Drug Store below 200 sq. meters', amount: 150 },
          { label: 'Optometrist Shops', amount: 300 },
        ],
      },
      {
        kind: 'tiered',
        code: '3004',
        title: 'Financial institutions',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Banks', amount: 500 },
          { label: 'Financing and Credit Loan', amount: 300 },
          { label: 'Pawnshop and Jewelry Shops', amount: 300 },
          { label: 'Insurance and Bonding Companies', amount: 300 },
        ],
      },
      {
        kind: 'tiered',
        code: '3005',
        title: 'Educational institutions',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'College', amount: 2_000 },
          { label: 'High School and Vocational School', amount: 500 },
          { label: 'Elementary, Nurseries and Kinder School', amount: 500 },
          { label: 'Physical Fitness School', amount: 300 },
        ],
      },
      {
        kind: 'tiered',
        code: '3006',
        title: 'Energy, transport and communication firms',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Bus or Minibus Companies with Terminals', amount: 3_000 },
          { label: 'Electric Company', amount: 500 },
          { label: 'Telephone and Communication', amount: 500 },
          { label: 'Water Service Company', amount: 500 },
        ],
      },
      {
        kind: 'tiered',
        code: '3007',
        title: 'Entertainment firms',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Cinemas', amount: 500 },
          { label: 'Cockpit Arenas', amount: 500 },
          { label: 'Night Clubs, Videoke Bar', amount: 500 },
          { label: 'Billiards and Pool Shops', amount: 300 },
          { label: 'Video Game Shops', amount: 300 },
          { label: 'Bowling Alleys', amount: 300 },
          { label: 'Swimming Resort with Entrance Fee', amount: 300 },
        ],
      },
      {
        kind: 'tiered',
        code: '3008',
        title: 'Offices',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Accounting, Law, Real Estate, Advertising, Insurance, etc.', amount: 300 },
        ],
      },
      {
        kind: 'tiered',
        code: '3009',
        title: 'Agricultural',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Piggery, Poultry and Cattle Farms', amount: 500 },
          { label: 'Nursery, Orchids and Flower Grower', amount: 300 },
          { label: 'Agricultural Farm Store', amount: 300 },
        ],
      },
      {
        kind: 'tiered',
        code: '3010',
        title: 'Repair shops',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Motor Vehicle Repair Shops', amount: 300 },
          { label: 'Battery and Electric Shops', amount: 300 },
          { label: 'Appliance Repair Shops', amount: 300 },
        ],
      },
      {
        kind: 'tiered',
        code: '3011',
        title: 'Wholesalers and dealers',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Chicken Dealer with Chicken Dressing House', amount: 2_000 },
          { label: 'Coconut and Buko Dealer or Wholesaler', amount: 1_000 },
          { label: 'Beer or Softdrink', amount: 500 },
          { label: 'Meat Dealer', amount: 500 },
          { label: 'Fruit and Vegetable Dealers', amount: 500 },
        ],
      },
      {
        kind: 'tiered',
        code: '3012',
        title: 'Others',
        applies: newAndRenewal,
        column: 'Type',
        rows: [
          { label: 'Machine Shop', amount: 500 },
          { label: 'Brake and Clutch Bonding Shops', amount: 400 },
          { label: 'Vulcanizing and Junk Shops', amount: 400 },
          { label: 'Gravel and Sand', amount: 400 },
          { label: 'Iron and Metal Craft', amount: 400 },
          { label: 'Sash and Wood Craft', amount: 400 },
          { label: 'Coffin and Casket Maker', amount: 400 },
          { label: 'Memorial Parks', amount: 400 },
          { label: 'Funeral Parlor', amount: 1_500 },
          { label: 'Furniture Stores', amount: 400 },
          { label: 'Public and Private Stall Holders', amount: 400 },
          { label: 'Warehouse of Any Kind', amount: 400 },
          { label: 'Food Stands, Barbeque Stands, Vegetable Stands and Other Items', amount: 400 },
          { label: 'Cold Storage Retailer', amount: 400 },
          { label: 'Paint, Advertising and Art Shop', amount: 300 },
          { label: 'Small Sari-Sari Store (Barangay)', amount: 300 },
        ],
      },
    ],
  },
  {
    id: 'fixed-fees',
    printedHeading: 'FIXED FEES',
    name: 'Fixed fees',
    short: 'Fixed fees',
    summary: 'Two fees tied to the number of employees: the health fee and the occupational fee.',
    explainer: [
      'Both are printed with “No. of employees” as the basis, which usually means the amount is charged for each employee. Both apply to new applications and renewals, not to retirement of a business.',
    ],
    source: {
      label: 'Fixed fees schedule',
      printed: '2026-10-08 23:28',
      pages: 1,
    },
    codes: [
      {
        kind: 'fixed',
        code: 'HEALTH-FEE',
        title: 'Health fee',
        applies: newAndRenewal,
        amount: 75,
        subject: 'No. of employees',
        retirement: false,
      },
      {
        kind: 'fixed',
        code: 'OCCUP-FEE',
        title: 'Occupational fee',
        applies: newAndRenewal,
        amount: 150,
        subject: 'No. of employees',
        retirement: false,
      },
    ],
  },
];

/* ---------- Derived figures, so the home page never hard-codes a count ---------- */

export const allCodes = schedules.flatMap((s) => s.codes.map((c) => ({ schedule: s, code: c })));

export function rowCount(c: RevenueCode): number {
  switch (c.kind) {
    case 'graduated':
      return c.brackets.length;
    case 'tiered':
      return c.rows.length;
    default:
      return 1;
  }
}

export const totals = {
  schedules: schedules.length,
  codes: allCodes.length,
  rows: allCodes.reduce((n, { code }) => n + rowCount(code), 0),
  flagged: allCodes.filter(({ code }) => code.notes?.length).length,
};

export function codeAnchor(code: string): string {
  return 'code-' + code.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Find the printed row a value falls in. Printed ranges sometimes end at
 * x,999.00 rather than x,999.99; a value in that sub-peso gap belongs to the
 * lower row. A wider gap means the printout has no row for the value.
 */
export function findBracket(
  brackets: Bracket[],
  value: number
): { index: number } | { gap: true } | null {
  if (!Number.isFinite(value) || value < 0) return null;
  for (let i = 0; i < brackets.length; i++) {
    const row = brackets[i];
    const next = brackets[i + 1];
    if (value < row.from) {
      // Below the first row, or inside a gap before this row.
      return i === 0 && row.from - value <= 0.01 ? { index: 0 } : { gap: true };
    }
    if (value <= row.to) return { index: i };
    if (next && value < next.from && next.from - row.to <= 1.01) return { index: i };
  }
  return { gap: true };
}
