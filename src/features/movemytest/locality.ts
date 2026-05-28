import { TEST_CENTRE_PASS_RATE_BY_SLUG, type TestCentrePassRate } from "./generated/pass-rate-data";

export type CentreLocality = {
  county: string;
  countySlug: string;
  countyPopulation?: number;
};

export type AggregatePassRate = {
  conducted: number;
  passes: number;
  passRate: number;
};

export const REGION_DISPLAY_META: Record<string, { populationRank: number; populationLabel: string; demandLabel: string }> = {
  london: { populationRank: 1, populationLabel: "c. 8.8m", demandLabel: "Highest population" },
  "north-west-england": { populationRank: 2, populationLabel: "c. 7.4m", demandLabel: "Very high demand" },
  "south-east-england": { populationRank: 3, populationLabel: "c. 9.3m", demandLabel: "High county demand" },
  "west-midlands": { populationRank: 4, populationLabel: "c. 6.0m", demandLabel: "Major urban demand" },
  scotland: { populationRank: 5, populationLabel: "c. 5.5m", demandLabel: "Wide rural/urban spread" },
  "east-of-england": { populationRank: 6, populationLabel: "c. 6.4m", demandLabel: "Commuter-belt demand" },
  "yorkshire-and-the-humber": { populationRank: 7, populationLabel: "c. 5.5m", demandLabel: "Large regional pool" },
  "south-west-england": { populationRank: 8, populationLabel: "c. 5.7m", demandLabel: "Large rural spread" },
  "east-midlands": { populationRank: 9, populationLabel: "c. 4.9m", demandLabel: "Mixed city/rural demand" },
  wales: { populationRank: 10, populationLabel: "c. 3.1m", demandLabel: "National coverage" },
  "north-east-england": { populationRank: 11, populationLabel: "c. 2.7m", demandLabel: "Compact region" },
};

export const COUNTY_POPULATIONS: Record<string, number> = {
  "greater-london": 8788010,
  hampshire: 1860283,
  kent: 1858346,
  devon: 1218613,
  surrey: 1205616,
  hertfordshire: 1200620,
  somerset: 982941,
  berkshire: 950588,
  gloucestershire: 937363,
  norfolk: 918369,
  cambridgeshire: 896756,
  "west-sussex": 885055,
  "east-sussex": 823258,
  dorset: 781401,
  suffolk: 763375,
  wiltshire: 747124,
  oxfordshire: 726530,
  bedfordshire: 706128,
  cornwall: 574281,
  bristol: 471117,
  "isle-of-wight": 140889,
  "west-midlands": 2916132,
  "greater-manchester": 2868387,
  "west-yorkshire": 2349987,
  essex: 1862848,
  lancashire: 1531911,
  merseyside: 1423145,
  "south-yorkshire": 1374182,
  nottinghamshire: 1145823,
  staffordshire: 1135893,
  cheshire: 1098031,
  lincolnshire: 1096611,
  leicestershire: 1078590,
  derbyshire: 1057983,
  "north-yorkshire": 1157971,
  "tyne-and-wear": 1125695,
  worcestershire: 604947,
  warwickshire: 599153,
  shropshire: 510558,
  cumbria: 500821,
  northumberland: 321558,
  herefordshire: 187557,
};

const EXACT_COUNTY_OVERRIDES: Record<string, string> = {
// South West
  "Barnstaple": "Devon", "Bodmin": "Cornwall", "Bristol (Avonmouth)": "Bristol", "Bristol (Kingswood)": "Bristol", "Camborne": "Cornwall", "Cheltenham": "Gloucestershire", "Chippenham": "Wiltshire", "Dorchester": "Dorset", "Exeter": "Devon", "Gloucester": "Gloucestershire", "Launceston": "Cornwall", "Newton Abbot": "Devon", "Penzance": "Cornwall", "Plymouth": "Devon", "Poole": "Dorset", "Salisbury": "Wiltshire", "Swindon": "Wiltshire", "Taunton": "Somerset", "Trowbridge": "Wiltshire", "Weston-super-Mare": "Somerset", "Yeovil": "Somerset",
// South East
  "Ashford (Kent)": "Kent", "Aylesbury": "Buckinghamshire", "Banbury": "Oxfordshire", "Basingstoke": "Hampshire", "Burgess Hill": "West Sussex", "Canterbury": "Kent", "Chichester": "West Sussex", "Crawley": "West Sussex", "Eastbourne": "East Sussex", "Farnborough": "Hampshire", "Folkestone": "Kent", "Gillingham": "Kent", "Greenham": "Berkshire", "Guildford": "Surrey", "Hastings (Ore)": "East Sussex", "Herne Bay": "Kent", "High Wycombe": "Buckinghamshire", "Lee On The Solent": "Hampshire", "Maidstone": "Kent", "Newport (Isle of Wight)": "Isle of Wight", "Oxford (Cowley)": "Oxfordshire", "Portsmouth": "Hampshire", "Reading": "Berkshire", "Redhill Aerodrome": "Surrey", "Sevenoaks": "Kent", "Southampton (Maybush)": "Hampshire", "Tunbridge Wells": "Kent", "West Wickham (London)": "Greater London", "Winchester": "Hampshire", "Worthing": "West Sussex",
// East of England
  "Basildon": "Essex", "Bedford": "Bedfordshire", "Bishops Stortford": "Hertfordshire", "Bletchley": "Buckinghamshire", "Bury St Edmunds": "Suffolk", "Cambridge (Brookmount Court)": "Cambridgeshire", "Chelmsford": "Essex", "Clacton-on-Sea": "Essex", "Colchester": "Essex", "Ipswich": "Suffolk", "Kings Lynn": "Norfolk", "Leighton Buzzard (Stanbridge Road)": "Bedfordshire", "Letchworth": "Hertfordshire", "Lowestoft (Mobbs Way)": "Suffolk", "Luton": "Bedfordshire", "Norwich (Peachman Way)": "Norfolk", "Peterborough": "Cambridgeshire", "Southend-on-Sea": "Essex", "St Albans": "Hertfordshire", "Stevenage": "Hertfordshire", "Tilbury": "Essex", "Watford": "Hertfordshire",
// West Midlands
  "Birmingham (Cocks Moors)": "West Midlands", "Birmingham (Garretts Green)": "West Midlands", "Birmingham (Kings Heath)": "West Midlands", "Birmingham (Kingstanding)": "West Midlands", "Birmingham (Shirley)": "West Midlands", "Birmingham (South Yardley)": "West Midlands", "Burton on Trent": "Staffordshire", "Coventry": "West Midlands", "Dudley": "West Midlands", "Featherstone": "Staffordshire", "Hereford": "Herefordshire", "Lichfield": "Staffordshire", "Ludlow": "Shropshire", "Nuneaton": "Warwickshire", "Oswestry": "Shropshire", "Redditch": "Worcestershire", "Rugby": "Warwickshire", "Shrewsbury": "Shropshire", "Stafford": "Staffordshire", "Stoke-on-Trent (Cobridge)": "Staffordshire", "Stoke-on-Trent (Newcastle-Under-Lyme)": "Staffordshire", "Telford": "Shropshire", "Warwick (Wedgenock House)": "Warwickshire", "Wednesbury": "West Midlands", "Wolverhampton": "West Midlands", "Worcester": "Worcestershire",
// North West
  "Atherton (Manchester)": "Greater Manchester", "Barrow In Furness": "Cumbria", "Blackburn with Darwen": "Lancashire", "Blackpool": "Lancashire", "Bolton (Manchester)": "Greater Manchester", "Bredbury (Manchester)": "Greater Manchester", "Bury (Manchester)": "Greater Manchester", "Buxton": "Derbyshire", "Carlisle": "Cumbria", "Carlisle LGV (Cars)": "Cumbria", "Chadderton": "Greater Manchester", "Cheetham Hill (Manchester)": "Greater Manchester", "Chester": "Cheshire", "Chorley": "Lancashire", "Crewe": "Cheshire", "Heysham": "Lancashire", "Kendal (Oxenholme Road)": "Cumbria", "Macclesfield": "Cheshire", "Nelson": "Lancashire", "Norris Green (Liverpool)": "Merseyside", "Northwich": "Cheshire", "Preston": "Lancashire", "Rochdale (Manchester)": "Greater Manchester", "Sale (Manchester)": "Greater Manchester", "Southport (Liverpool)": "Merseyside", "Speke (Liverpool)": "Merseyside", "St Helens (Liverpool)": "Merseyside", "Steeton": "West Yorkshire", "Upton": "Merseyside", "Wallasey": "Merseyside", "Warrington": "Cheshire", "West Didsbury (Manchester)": "Greater Manchester", "Widnes": "Cheshire", "Workington": "Cumbria",
// North East
  "Alnwick": "Northumberland", "Berwick-On-Tweed": "Northumberland", "Blyth": "Northumberland", "Darlington": "County Durham", "Durham": "County Durham", "Gateshead": "Tyne and Wear", "Gosforth": "Tyne and Wear", "Hartlepool": "County Durham", "Hexham": "Northumberland", "Middlesbrough": "North Yorkshire", "Northallerton": "North Yorkshire", "Sunderland": "Tyne and Wear",
// East Midlands
  "Ashfield": "Nottinghamshire", "Boston": "Lincolnshire", "Chesterfield": "Derbyshire", "Derby (Alvaston)": "Derbyshire", "Grantham (Somerby)": "Lincolnshire", "Hinckley": "Leicestershire", "Kettering": "Northamptonshire", "Leicester (Cannock Street)": "Leicestershire", "Leicester (Wigston)": "Leicestershire", "Lincoln": "Lincolnshire", "Loughborough": "Leicestershire", "Louth": "Lincolnshire", "Melton Mowbray": "Leicestershire", "Northampton": "Northamptonshire", "Nottingham (Chilwell)": "Nottinghamshire", "Nottingham (Colwick)": "Nottinghamshire", "Skegness": "Lincolnshire", "Wellingborough": "Northamptonshire", "Worksop": "Nottinghamshire",
// Yorkshire and the Humber
  "Barnsley": "South Yorkshire", "Beverley LGV": "East Riding of Yorkshire", "Bradford (Heaton)": "West Yorkshire", "Bradford (Thornbury)": "West Yorkshire", "Bridlington": "East Riding of Yorkshire", "Doncaster": "South Yorkshire", "Grimsby Coldwater": "Lincolnshire", "Halifax": "West Yorkshire", "Heckmondwike": "West Yorkshire", "Horsforth": "West Yorkshire", "Huddersfield": "West Yorkshire", "Hull": "East Riding of Yorkshire", "Knaresborough": "North Yorkshire", "Leeds (Colton Mill)": "West Yorkshire", "Leeds (Fearnville)": "West Yorkshire", "Malton": "North Yorkshire", "Pontefract": "West Yorkshire", "Rotherham": "South Yorkshire", "Scarborough": "North Yorkshire", "Scunthorpe": "Lincolnshire", "Sheffield (Handsworth)": "South Yorkshire", "Sheffield (Middlewood Road)": "South Yorkshire", "Skipton": "North Yorkshire", "Wakefield": "West Yorkshire", "Walton LGV": "West Yorkshire", "Whitby": "North Yorkshire", "York": "North Yorkshire",
};

export function slugifyLocality(value: string) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getCentreLocality(displayName: string, region: string): CentreLocality {
  const county = EXACT_COUNTY_OVERRIDES[displayName] ?? (/^County /.test(region) ? region : region === "London" ? "Greater London" : region);
  const countySlug = slugifyLocality(county);
  return { county, countySlug, countyPopulation: COUNTY_POPULATIONS[countySlug] };
}

export function getPassRateForCentre(slug: string, displayName: string): TestCentrePassRate | undefined {
  return TEST_CENTRE_PASS_RATE_BY_SLUG.get(slug)
    ?? TEST_CENTRE_PASS_RATE_BY_SLUG.get(slugifyLocality(displayName.replace(/\s+\((London|Cars)\)$/i, "")));
}

export function aggregatePassRates(items: Array<{ passRate?: TestCentrePassRate }>): AggregatePassRate | undefined {
  const conducted = items.reduce((sum, item) => sum + (item.passRate?.conducted ?? 0), 0);
  const passes = items.reduce((sum, item) => sum + (item.passRate?.passes ?? 0), 0);
  if (!conducted) return undefined;
  return { conducted, passes, passRate: Math.round((passes / conducted) * 1000) / 10 };
}
