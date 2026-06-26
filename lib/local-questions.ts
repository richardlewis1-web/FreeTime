import type { TriviaQuestion } from "./types";

export const localQuestions: TriviaQuestion[] = [
  {
    id: "premier-league-golden-boot-2010-onward",
    title: "Name Premier League Golden Boot winners from 2010 onward.",
    hint: "Shared awards count as individual answers. Surnames work for many players.",
    category: "Barclaysmen",
    difficulty: "hard",
    maxGuesses: 6,
    answers: [
      { id: "drogba", label: "Didier Drogba", aliases: ["Didier Drogba", "Drogba"], rank: 1, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "berbatov", label: "Dimitar Berbatov", aliases: ["Dimitar Berbatov", "Berbatov"], rank: 2, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "tevez", label: "Carlos Tevez", aliases: ["Carlos Tevez", "Tevez"], rank: 3, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "van-persie", label: "Robin van Persie", aliases: ["Robin van Persie", "Van Persie", "RVP"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "suarez", label: "Luis Suarez", aliases: ["Luis Suarez", "Suarez"], rank: 5, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "aguero", label: "Sergio Aguero", aliases: ["Sergio Aguero", "Aguero", "Kun Aguero"], rank: 6, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "kane", label: "Harry Kane", aliases: ["Harry Kane", "Kane"], rank: 7, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "salah", label: "Mohamed Salah", aliases: ["Mohamed Salah", "Mo Salah", "Salah"], rank: 8, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "mane", label: "Sadio Mane", aliases: ["Sadio Mane", "Mane"], rank: 9, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "aubameyang", label: "Pierre-Emerick Aubameyang", aliases: ["Pierre-Emerick Aubameyang", "Aubameyang", "Auba"], rank: 10, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "vardy", label: "Jamie Vardy", aliases: ["Jamie Vardy", "Vardy"], rank: 11, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "son", label: "Son Heung-min", aliases: ["Son Heung-min", "Heung-min Son", "Son"], rank: 12, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "haaland", label: "Erling Haaland", aliases: ["Erling Haaland", "Haaland"], rank: 13, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" }
    ]
  },
  {
    id: "premier-league-175-goal-club",
    title: "Name players with at least 175 Premier League goals.",
    hint: "Use common surnames or full names. This list is based on Premier League goals only.",
    category: "Barclaysmen",
    difficulty: "medium",
    maxGuesses: 5,
    answers: [
      { id: "shearer", label: "Alan Shearer", aliases: ["Alan Shearer", "Shearer"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "kane", label: "Harry Kane", aliases: ["Harry Kane", "Kane"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "rooney", label: "Wayne Rooney", aliases: ["Wayne Rooney", "Rooney"], rank: 3, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "cole", label: "Andy Cole", aliases: ["Andy Cole", "Andrew Cole", "Cole"], rank: 4, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "salah", label: "Mohamed Salah", aliases: ["Mohamed Salah", "Mo Salah", "Salah"], rank: 5, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "aguero", label: "Sergio Aguero", aliases: ["Sergio Aguero", "Aguero", "Kun Aguero"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "lampard", label: "Frank Lampard", aliases: ["Frank Lampard", "Lampard"], rank: 7, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "henry", label: "Thierry Henry", aliases: ["Thierry Henry", "Henry"], rank: 8, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  },
  {
    id: "champions-league-winners-2010-2024",
    title: "Name clubs that won the UEFA Champions League from 2010 to 2024.",
    hint: "Use club names, common short names, or familiar abbreviations.",
    category: "Champions League Heritage",
    difficulty: "easy",
    maxGuesses: 5,
    answers: [
      { id: "inter", label: "Inter Milan", aliases: ["Inter Milan", "Inter", "Internazionale"], rank: 1, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "barcelona", label: "Barcelona", aliases: ["Barcelona", "Barca", "FC Barcelona"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "chelsea", label: "Chelsea", aliases: ["Chelsea", "Chelsea FC"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "bayern", label: "Bayern Munich", aliases: ["Bayern Munich", "Bayern", "FC Bayern"], rank: 4, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "real-madrid", label: "Real Madrid", aliases: ["Real Madrid", "Madrid", "Real"], rank: 5, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "liverpool", label: "Liverpool", aliases: ["Liverpool", "Liverpool FC"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "man-city", label: "Manchester City", aliases: ["Manchester City", "Man City", "City", "MCFC"], rank: 7, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  },
  {
    id: "champions-league-winners-2000-2009",
    title: "Name clubs that won the UEFA Champions League from 2000 to 2009.",
    hint: "The list uses unique clubs, not every winning year.",
    category: "Champions League Heritage",
    difficulty: "medium",
    maxGuesses: 5,
    answers: [
      { id: "real-madrid", label: "Real Madrid", aliases: ["Real Madrid", "Madrid", "Real"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "bayern", label: "Bayern Munich", aliases: ["Bayern Munich", "Bayern", "FC Bayern"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "milan", label: "AC Milan", aliases: ["AC Milan", "Milan"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "porto", label: "Porto", aliases: ["Porto", "FC Porto"], rank: 4, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "liverpool", label: "Liverpool", aliases: ["Liverpool", "Liverpool FC"], rank: 5, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "barcelona", label: "Barcelona", aliases: ["Barcelona", "Barca", "FC Barcelona"], rank: 6, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "man-united", label: "Manchester United", aliases: ["Manchester United", "Man United", "Man Utd", "United", "MUFC"], rank: 7, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" }
    ]
  },
  {
    id: "england-euro-2024-forwards",
    title: "Name England forwards in the Euro 2024 squad.",
    hint: "This follows the squad grouping used for England's final 26-player list.",
    category: "England Pain",
    difficulty: "medium",
    maxGuesses: 5,
    answers: [
      { id: "bellingham", label: "Jude Bellingham", aliases: ["Jude Bellingham", "Bellingham"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "bowen", label: "Jarrod Bowen", aliases: ["Jarrod Bowen", "Bowen"], rank: 2, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "eze", label: "Eberechi Eze", aliases: ["Eberechi Eze", "Eze"], rank: 3, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "gordon", label: "Anthony Gordon", aliases: ["Anthony Gordon", "Gordon"], rank: 4, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "foden", label: "Phil Foden", aliases: ["Phil Foden", "Foden"], rank: 5, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "kane", label: "Harry Kane", aliases: ["Harry Kane", "Kane"], rank: 6, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "palmer", label: "Cole Palmer", aliases: ["Cole Palmer", "Palmer"], rank: 7, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "saka", label: "Bukayo Saka", aliases: ["Bukayo Saka", "Saka"], rank: 8, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "toney", label: "Ivan Toney", aliases: ["Ivan Toney", "Toney"], rank: 9, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "watkins", label: "Ollie Watkins", aliases: ["Ollie Watkins", "Watkins"], rank: 10, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  },
  {
    id: "england-world-cup-2022-goalkeepers-defenders",
    title: "Name England goalkeepers and defenders in the 2022 World Cup squad.",
    hint: "Ben White is included because he was named in the final squad before withdrawing.",
    category: "England Pain",
    difficulty: "hard",
    maxGuesses: 6,
    answers: [
      { id: "pickford", label: "Jordan Pickford", aliases: ["Jordan Pickford", "Pickford"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "pope", label: "Nick Pope", aliases: ["Nick Pope", "Pope"], rank: 2, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "ramsdale", label: "Aaron Ramsdale", aliases: ["Aaron Ramsdale", "Ramsdale"], rank: 3, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "alexander-arnold", label: "Trent Alexander-Arnold", aliases: ["Trent Alexander-Arnold", "Trent", "Alexander-Arnold", "TAA"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "coady", label: "Conor Coady", aliases: ["Conor Coady", "Coady"], rank: 5, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" },
      { id: "dier", label: "Eric Dier", aliases: ["Eric Dier", "Dier"], rank: 6, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "maguire", label: "Harry Maguire", aliases: ["Harry Maguire", "Maguire"], rank: 7, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "shaw", label: "Luke Shaw", aliases: ["Luke Shaw", "Shaw"], rank: 8, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "stones", label: "John Stones", aliases: ["John Stones", "Stones"], rank: 9, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "trippier", label: "Kieran Trippier", aliases: ["Kieran Trippier", "Trippier"], rank: 10, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "walker", label: "Kyle Walker", aliases: ["Kyle Walker", "Walker"], rank: 11, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "white", label: "Ben White", aliases: ["Ben White", "White", "Benjamin White"], rank: 12, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" }
    ]
  },
  {
    id: "ballon-dor-winners-2010-2024",
    title: "Name men's Ballon d'Or winners from 2010 to 2024.",
    hint: "Unique winners only. There was no award in 2020.",
    category: "Proper Ball Knowledge",
    difficulty: "easy",
    maxGuesses: 4,
    answers: [
      { id: "messi", label: "Lionel Messi", aliases: ["Lionel Messi", "Messi", "Leo Messi"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "ronaldo", label: "Cristiano Ronaldo", aliases: ["Cristiano Ronaldo", "Ronaldo", "CR7"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "modric", label: "Luka Modric", aliases: ["Luka Modric", "Modric"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "benzema", label: "Karim Benzema", aliases: ["Karim Benzema", "Benzema"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "rodri", label: "Rodri", aliases: ["Rodri", "Rodrigo Hernandez", "Rodrigo"], rank: 5, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" }
    ]
  },
  {
    id: "ballon-dor-winners-1995-2009",
    title: "Name men's Ballon d'Or winners from 1995 to 2009.",
    hint: "Unique winners only across the era before the FIFA Ballon d'Or merger.",
    category: "Proper Ball Knowledge",
    difficulty: "hard",
    maxGuesses: 7,
    answers: [
      { id: "weah", label: "George Weah", aliases: ["George Weah", "Weah"], rank: 1, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "sammer", label: "Matthias Sammer", aliases: ["Matthias Sammer", "Sammer"], rank: 2, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" },
      { id: "ronaldo-nazario", label: "Ronaldo", aliases: ["Ronaldo", "Ronaldo Nazario", "R9"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "zidane", label: "Zinedine Zidane", aliases: ["Zinedine Zidane", "Zidane", "Zizou"], rank: 4, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "rivaldo", label: "Rivaldo", aliases: ["Rivaldo"], rank: 5, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "figo", label: "Luis Figo", aliases: ["Luis Figo", "Figo"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "owen", label: "Michael Owen", aliases: ["Michael Owen", "Owen"], rank: 7, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "nedved", label: "Pavel Nedved", aliases: ["Pavel Nedved", "Nedved"], rank: 8, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "shevchenko", label: "Andriy Shevchenko", aliases: ["Andriy Shevchenko", "Andrei Shevchenko", "Shevchenko"], rank: 9, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "ronaldinho", label: "Ronaldinho", aliases: ["Ronaldinho", "Ronaldinho Gaucho"], rank: 10, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "cannavaro", label: "Fabio Cannavaro", aliases: ["Fabio Cannavaro", "Cannavaro"], rank: 11, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "kaka", label: "Kaka", aliases: ["Kaka", "Ricardo Kaka"], rank: 12, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "cristiano-ronaldo", label: "Cristiano Ronaldo", aliases: ["Cristiano Ronaldo", "CR7"], rank: 13, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "messi", label: "Lionel Messi", aliases: ["Lionel Messi", "Messi", "Leo Messi"], rank: 14, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" }
    ]
  },
  {
    id: "premier-league-ever-present-clubs-through-2024-25",
    title: "Name clubs to play in every Premier League season through 2024-25.",
    hint: "Six clubs contested every Premier League season from 1992-93 through 2024-25.",
    category: "Premier League Royalty",
    difficulty: "easy",
    maxGuesses: 4,
    answers: [
      { id: "arsenal", label: "Arsenal", aliases: ["Arsenal", "Arsenal FC"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "chelsea", label: "Chelsea", aliases: ["Chelsea", "Chelsea FC"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "everton", label: "Everton", aliases: ["Everton", "Everton FC"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "liverpool", label: "Liverpool", aliases: ["Liverpool", "Liverpool FC"], rank: 4, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "man-united", label: "Manchester United", aliases: ["Manchester United", "Man United", "Man Utd", "United", "MUFC"], rank: 5, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "tottenham", label: "Tottenham Hotspur", aliases: ["Tottenham Hotspur", "Tottenham", "Spurs", "THFC"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  },
  {
    id: "premier-league-b-clubs",
    title: "Name clubs beginning with B that have played in the Premier League.",
    hint: "Includes clubs from England and Wales, and uses Premier League era only.",
    category: "Premier League Royalty",
    difficulty: "hard",
    maxGuesses: 6,
    answers: [
      { id: "barnsley", label: "Barnsley", aliases: ["Barnsley", "Barnsley FC"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "birmingham", label: "Birmingham City", aliases: ["Birmingham City", "Birmingham", "Blues"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "blackburn", label: "Blackburn Rovers", aliases: ["Blackburn Rovers", "Blackburn"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "blackpool", label: "Blackpool", aliases: ["Blackpool", "Blackpool FC"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "bolton", label: "Bolton Wanderers", aliases: ["Bolton Wanderers", "Bolton"], rank: 5, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "bournemouth", label: "Bournemouth", aliases: ["Bournemouth", "AFC Bournemouth"], rank: 6, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "bradford", label: "Bradford City", aliases: ["Bradford City", "Bradford"], rank: 7, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "brentford", label: "Brentford", aliases: ["Brentford", "Brentford FC"], rank: 8, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "brighton", label: "Brighton & Hove Albion", aliases: ["Brighton & Hove Albion", "Brighton and Hove Albion", "Brighton", "BHAFC"], rank: 9, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "burnley", label: "Burnley", aliases: ["Burnley", "Burnley FC"], rank: 10, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "premier-league-title-winning-clubs",
    title: "Name clubs that have won the Premier League title.",
    hint: "Unique clubs only, from 1992-93 onward.",
    category: "Premier League Royalty",
    difficulty: "easy",
    maxGuesses: 5,
    answers: [
      { id: "man-united", label: "Manchester United", aliases: ["Manchester United", "Man United", "Man Utd", "United", "MUFC"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "blackburn", label: "Blackburn Rovers", aliases: ["Blackburn Rovers", "Blackburn"], rank: 2, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "arsenal", label: "Arsenal", aliases: ["Arsenal", "Arsenal FC"], rank: 3, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "chelsea", label: "Chelsea", aliases: ["Chelsea", "Chelsea FC"], rank: 4, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "man-city", label: "Manchester City", aliases: ["Manchester City", "Man City", "City", "MCFC"], rank: 5, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "leicester", label: "Leicester City", aliases: ["Leicester City", "Leicester"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "liverpool", label: "Liverpool", aliases: ["Liverpool", "Liverpool FC"], rank: 7, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  },
  {
    id: "premier-league-w-clubs",
    title: "Name clubs beginning with W that have played in the Premier League.",
    hint: "Premier League era only, including clubs that later changed league status.",
    category: "Premier League Royalty",
    difficulty: "medium",
    maxGuesses: 5,
    answers: [
      { id: "wimbledon", label: "Wimbledon", aliases: ["Wimbledon", "Wimbledon FC"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "watford", label: "Watford", aliases: ["Watford", "Watford FC"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "west-brom", label: "West Bromwich Albion", aliases: ["West Bromwich Albion", "West Brom", "WBA"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "west-ham", label: "West Ham United", aliases: ["West Ham United", "West Ham", "WHUFC"], rank: 4, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "wigan", label: "Wigan Athletic", aliases: ["Wigan Athletic", "Wigan"], rank: 5, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "wolves", label: "Wolverhampton Wanderers", aliases: ["Wolverhampton Wanderers", "Wolves", "Wolverhampton"], rank: 6, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "premier-league-title-winning-managers",
    title: "Name managers who have won the Premier League title.",
    hint: "Unique managers only, from 1992-93 onward.",
    category: "Manager Merry-Go-Round",
    difficulty: "hard",
    maxGuesses: 7,
    answers: [
      { id: "ferguson", label: "Alex Ferguson", aliases: ["Alex Ferguson", "Sir Alex Ferguson", "Ferguson", "SAF"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "dalglish", label: "Kenny Dalglish", aliases: ["Kenny Dalglish", "Dalglish"], rank: 2, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" },
      { id: "wenger", label: "Arsene Wenger", aliases: ["Arsene Wenger", "Wenger"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "mourinho", label: "Jose Mourinho", aliases: ["Jose Mourinho", "Mourinho"], rank: 4, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "ancelotti", label: "Carlo Ancelotti", aliases: ["Carlo Ancelotti", "Ancelotti"], rank: 5, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "mancini", label: "Roberto Mancini", aliases: ["Roberto Mancini", "Mancini"], rank: 6, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "pellegrini", label: "Manuel Pellegrini", aliases: ["Manuel Pellegrini", "Pellegrini"], rank: 7, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "ranieri", label: "Claudio Ranieri", aliases: ["Claudio Ranieri", "Ranieri"], rank: 8, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "conte", label: "Antonio Conte", aliases: ["Antonio Conte", "Conte"], rank: 9, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "guardiola", label: "Pep Guardiola", aliases: ["Pep Guardiola", "Guardiola"], rank: 10, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "klopp", label: "Jurgen Klopp", aliases: ["Jurgen Klopp", "Klopp"], rank: 11, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  },
  {
    id: "english-clubs-european-cup-winners",
    title: "Name English clubs that have won the European Cup or Champions League.",
    hint: "Includes the competition before and after the Champions League rebrand.",
    category: "Champions League Heritage",
    difficulty: "medium",
    maxGuesses: 5,
    answers: [
      { id: "liverpool", label: "Liverpool", aliases: ["Liverpool", "Liverpool FC"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "man-united", label: "Manchester United", aliases: ["Manchester United", "Man United", "Man Utd", "United", "MUFC"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "nottingham-forest", label: "Nottingham Forest", aliases: ["Nottingham Forest", "Forest", "NFFC"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "aston-villa", label: "Aston Villa", aliases: ["Aston Villa", "Villa", "AVFC"], rank: 4, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "chelsea", label: "Chelsea", aliases: ["Chelsea", "Chelsea FC"], rank: 5, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "man-city", label: "Manchester City", aliases: ["Manchester City", "Man City", "City", "MCFC"], rank: 6, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "european-cup-champions-league-winners-1990-1999",
    title: "Name European Cup or Champions League winners from 1990 to 1999.",
    hint: "Unique clubs only across the decade.",
    category: "Champions League Heritage",
    difficulty: "hard",
    maxGuesses: 7,
    answers: [
      { id: "milan", label: "AC Milan", aliases: ["AC Milan", "Milan"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "red-star", label: "Red Star Belgrade", aliases: ["Red Star Belgrade", "Red Star", "Crvena Zvezda"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "barcelona", label: "Barcelona", aliases: ["Barcelona", "Barca", "FC Barcelona"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "marseille", label: "Marseille", aliases: ["Marseille", "Olympique Marseille", "OM"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "ajax", label: "Ajax", aliases: ["Ajax", "Ajax Amsterdam"], rank: 5, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "juventus", label: "Juventus", aliases: ["Juventus", "Juve"], rank: 6, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "dortmund", label: "Borussia Dortmund", aliases: ["Borussia Dortmund", "Dortmund", "BVB"], rank: 7, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "real-madrid", label: "Real Madrid", aliases: ["Real Madrid", "Madrid", "Real"], rank: 8, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "man-united", label: "Manchester United", aliases: ["Manchester United", "Man United", "Man Utd", "United", "MUFC"], rank: 9, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "england-euro-2020-final-starting-xi",
    title: "Name England's starting XI in the Euro 2020 final.",
    hint: "The final was played in July 2021, but the tournament was Euro 2020.",
    category: "England Pain",
    difficulty: "medium",
    maxGuesses: 6,
    answers: [
      { id: "pickford", label: "Jordan Pickford", aliases: ["Jordan Pickford", "Pickford"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "walker", label: "Kyle Walker", aliases: ["Kyle Walker", "Walker"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "stones", label: "John Stones", aliases: ["John Stones", "Stones"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "maguire", label: "Harry Maguire", aliases: ["Harry Maguire", "Maguire"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "trippier", label: "Kieran Trippier", aliases: ["Kieran Trippier", "Trippier"], rank: 5, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "shaw", label: "Luke Shaw", aliases: ["Luke Shaw", "Shaw"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "rice", label: "Declan Rice", aliases: ["Declan Rice", "Rice"], rank: 7, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "phillips", label: "Kalvin Phillips", aliases: ["Kalvin Phillips", "Phillips"], rank: 8, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "mount", label: "Mason Mount", aliases: ["Mason Mount", "Mount"], rank: 9, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "sterling", label: "Raheem Sterling", aliases: ["Raheem Sterling", "Sterling"], rank: 10, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "kane", label: "Harry Kane", aliases: ["Harry Kane", "Kane"], rank: 11, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" }
    ]
  },
  {
    id: "england-world-cup-2018-forwards",
    title: "Name England forwards in the 2018 World Cup squad.",
    hint: "Uses the forwards grouping from England's final squad.",
    category: "England Pain",
    difficulty: "easy",
    maxGuesses: 4,
    answers: [
      { id: "kane", label: "Harry Kane", aliases: ["Harry Kane", "Kane"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "rashford", label: "Marcus Rashford", aliases: ["Marcus Rashford", "Rashford"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "sterling", label: "Raheem Sterling", aliases: ["Raheem Sterling", "Sterling"], rank: 3, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "vardy", label: "Jamie Vardy", aliases: ["Jamie Vardy", "Vardy"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "welbeck", label: "Danny Welbeck", aliases: ["Danny Welbeck", "Welbeck"], rank: 5, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "ballon-dor-winners-1980-1994",
    title: "Name men's Ballon d'Or winners from 1980 to 1994.",
    hint: "Unique winners only across the period.",
    category: "Proper Ball Knowledge",
    difficulty: "hard",
    maxGuesses: 7,
    answers: [
      { id: "rummenigge", label: "Karl-Heinz Rummenigge", aliases: ["Karl-Heinz Rummenigge", "Karl Heinz Rummenigge", "Rummenigge"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "rossi", label: "Paolo Rossi", aliases: ["Paolo Rossi", "Rossi"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "platini", label: "Michel Platini", aliases: ["Michel Platini", "Platini"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "belanov", label: "Igor Belanov", aliases: ["Igor Belanov", "Belanov"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "gullit", label: "Ruud Gullit", aliases: ["Ruud Gullit", "Gullit"], rank: 5, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "van-basten", label: "Marco van Basten", aliases: ["Marco van Basten", "Van Basten"], rank: 6, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "matthaus", label: "Lothar Matthaus", aliases: ["Lothar Matthaus", "Matthaus"], rank: 7, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "papin", label: "Jean-Pierre Papin", aliases: ["Jean-Pierre Papin", "Jean Pierre Papin", "Papin"], rank: 8, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "baggio", label: "Roberto Baggio", aliases: ["Roberto Baggio", "Baggio"], rank: 9, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "stoichkov", label: "Hristo Stoichkov", aliases: ["Hristo Stoichkov", "Stoichkov"], rank: 10, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "world-cup-winners-1990-onward",
    title: "Name men's FIFA World Cup winners from 1990 onward.",
    hint: "Unique winning nations only.",
    category: "World Cup Fever",
    difficulty: "easy",
    maxGuesses: 4,
    answers: [
      { id: "germany", label: "Germany", aliases: ["Germany", "Deutschland", "West Germany"], rank: 1, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "brazil", label: "Brazil", aliases: ["Brazil", "Brasil"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "france", label: "France", aliases: ["France"], rank: 3, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "italy", label: "Italy", aliases: ["Italy", "Italia"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "spain", label: "Spain", aliases: ["Spain", "Espana"], rank: 5, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "argentina", label: "Argentina", aliases: ["Argentina"], rank: 6, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" }
    ]
  },
  {
    id: "euro-winners-1992-onward",
    title: "Name men's European Championship winners from 1992 onward.",
    hint: "Unique winning nations only.",
    category: "World Cup Fever",
    difficulty: "medium",
    maxGuesses: 5,
    answers: [
      { id: "denmark", label: "Denmark", aliases: ["Denmark"], rank: 1, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "germany", label: "Germany", aliases: ["Germany", "Deutschland"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "france", label: "France", aliases: ["France"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "greece", label: "Greece", aliases: ["Greece"], rank: 4, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "spain", label: "Spain", aliases: ["Spain", "Espana"], rank: 5, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "portugal", label: "Portugal", aliases: ["Portugal"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "italy", label: "Italy", aliases: ["Italy", "Italia"], rank: 7, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  },
  {
    id: "arsenal-invincibles-main-xi",
    title: "Name Arsenal's main Invincibles XI from 2003-04.",
    hint: "The classic league-winning shape: keeper, back four, midfield four, front two.",
    category: "Premier League Royalty",
    difficulty: "medium",
    maxGuesses: 6,
    answers: [
      { id: "lehmann", label: "Jens Lehmann", aliases: ["Jens Lehmann", "Lehmann"], rank: 1, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "lauren", label: "Lauren", aliases: ["Lauren", "Lauren Etame Mayer"], rank: 2, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "toure", label: "Kolo Toure", aliases: ["Kolo Toure", "Toure"], rank: 3, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "campbell", label: "Sol Campbell", aliases: ["Sol Campbell", "Campbell"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "cole", label: "Ashley Cole", aliases: ["Ashley Cole", "Cole"], rank: 5, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "ljungberg", label: "Freddie Ljungberg", aliases: ["Freddie Ljungberg", "Ljungberg"], rank: 6, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "vieira", label: "Patrick Vieira", aliases: ["Patrick Vieira", "Vieira"], rank: 7, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "gilberto", label: "Gilberto Silva", aliases: ["Gilberto Silva", "Gilberto"], rank: 8, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "pires", label: "Robert Pires", aliases: ["Robert Pires", "Pires"], rank: 9, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "bergkamp", label: "Dennis Bergkamp", aliases: ["Dennis Bergkamp", "Bergkamp"], rank: 10, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "henry", label: "Thierry Henry", aliases: ["Thierry Henry", "Henry"], rank: 11, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" }
    ]
  },
  {
    id: "premier-league-c-clubs",
    title: "Name clubs beginning with C that have played in the Premier League.",
    hint: "Premier League era only. Full club names or common short names work.",
    category: "Premier League Royalty",
    difficulty: "easy",
    maxGuesses: 4,
    answers: [
      { id: "cardiff", label: "Cardiff City", aliases: ["Cardiff City", "Cardiff"], rank: 1, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "charlton", label: "Charlton Athletic", aliases: ["Charlton Athletic", "Charlton"], rank: 2, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "chelsea", label: "Chelsea", aliases: ["Chelsea", "Chelsea FC"], rank: 3, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "coventry", label: "Coventry City", aliases: ["Coventry City", "Coventry"], rank: 4, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "crystal-palace", label: "Crystal Palace", aliases: ["Crystal Palace", "Palace", "CPFC"], rank: 5, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" }
    ]
  },
  {
    id: "tottenham-bale-money-signings",
    title: "Name Tottenham's summer 2013 Bale money signings.",
    hint: "Seven arrivals after the Gareth Bale sale changed the group chat forever.",
    category: "Transfer Chaos",
    difficulty: "hard",
    maxGuesses: 6,
    answers: [
      { id: "paulinho", label: "Paulinho", aliases: ["Paulinho", "Jose Paulo Bezerra Maciel Junior"], rank: 1, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "chadli", label: "Nacer Chadli", aliases: ["Nacer Chadli", "Chadli"], rank: 2, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "soldado", label: "Roberto Soldado", aliases: ["Roberto Soldado", "Soldado"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "capoue", label: "Etienne Capoue", aliases: ["Etienne Capoue", "Capoue"], rank: 4, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "chiriches", label: "Vlad Chiriches", aliases: ["Vlad Chiriches", "Chiriches"], rank: 5, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" },
      { id: "lamela", label: "Erik Lamela", aliases: ["Erik Lamela", "Lamela"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "eriksen", label: "Christian Eriksen", aliases: ["Christian Eriksen", "Eriksen"], rank: 7, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" }
    ]
  },
  {
    id: "chelsea-2023-expensive-midfield-signings",
    title: "Name Chelsea midfielders signed for huge fees in 2023.",
    hint: "Three midfield buys from the 2023 spending storm. Surnames work.",
    category: "Transfer Chaos",
    difficulty: "medium",
    maxGuesses: 3,
    answers: [
      { id: "enzo", label: "Enzo Fernandez", aliases: ["Enzo Fernandez", "Enzo", "Fernandez"], rank: 1, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "caicedo", label: "Moises Caicedo", aliases: ["Moises Caicedo", "Caicedo"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "lavia", label: "Romeo Lavia", aliases: ["Romeo Lavia", "Lavia"], rank: 3, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" }
    ]
  },
  {
    id: "chelsea-deadline-day-2011-signings",
    title: "Name Chelsea's January 2011 deadline-day signings.",
    hint: "Two massive arrivals, one very dramatic fax-machine evening.",
    category: "Deadline Day",
    difficulty: "easy",
    maxGuesses: 2,
    answers: [
      { id: "torres", label: "Fernando Torres", aliases: ["Fernando Torres", "Torres"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "david-luiz", label: "David Luiz", aliases: ["David Luiz", "Luiz"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  },
  {
    id: "arsenal-deadline-day-2011-signings",
    title: "Name Arsenal's late-window signings in August 2011.",
    hint: "The post-8-2 emergency trolley dash. Common surnames work.",
    category: "Deadline Day",
    difficulty: "hard",
    maxGuesses: 5,
    answers: [
      { id: "arteta", label: "Mikel Arteta", aliases: ["Mikel Arteta", "Arteta"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "mertesacker", label: "Per Mertesacker", aliases: ["Per Mertesacker", "Mertesacker"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "andre-santos", label: "Andre Santos", aliases: ["Andre Santos", "Santos"], rank: 3, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "benayoun", label: "Yossi Benayoun", aliases: ["Yossi Benayoun", "Benayoun"], rank: 4, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "park", label: "Park Chu-young", aliases: ["Park Chu-young", "Chu-young Park", "Park Chu Young", "Park"], rank: 5, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "nicolas-anelka-premier-league-clubs",
    title: "Name Premier League clubs Nicolas Anelka played for.",
    hint: "The original Barclays passport. Clubs, not loan clauses.",
    category: "Streets Won't Forget",
    difficulty: "medium",
    maxGuesses: 5,
    answers: [
      { id: "arsenal", label: "Arsenal", aliases: ["Arsenal", "Arsenal FC"], rank: 1, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "liverpool", label: "Liverpool", aliases: ["Liverpool", "Liverpool FC"], rank: 2, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "man-city", label: "Manchester City", aliases: ["Manchester City", "Man City", "City", "MCFC"], rank: 3, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "bolton", label: "Bolton Wanderers", aliases: ["Bolton Wanderers", "Bolton"], rank: 4, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "chelsea", label: "Chelsea", aliases: ["Chelsea", "Chelsea FC"], rank: 5, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "west-brom", label: "West Bromwich Albion", aliases: ["West Bromwich Albion", "West Brom", "WBA"], rank: 6, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "fernando-torres-senior-clubs",
    title: "Name Fernando Torres' senior clubs.",
    hint: "Unique clubs only, from Madrid to Japan.",
    category: "Streets Won't Forget",
    difficulty: "easy",
    maxGuesses: 4,
    answers: [
      { id: "atletico", label: "Atletico Madrid", aliases: ["Atletico Madrid", "Atletico", "Atleti"], rank: 1, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "liverpool", label: "Liverpool", aliases: ["Liverpool", "Liverpool FC"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "chelsea", label: "Chelsea", aliases: ["Chelsea", "Chelsea FC"], rank: 3, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "milan", label: "AC Milan", aliases: ["AC Milan", "Milan"], rank: 4, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "sagan-tosu", label: "Sagan Tosu", aliases: ["Sagan Tosu", "Tosu"], rank: 5, basePoints: 100, rarityScore: 100, rarityLabel: "Proper Ball Knowledge" }
    ]
  },
  {
    id: "champions-league-finalists-2010s",
    title: "Name clubs that reached a Champions League final in the 2010s.",
    hint: "Unique finalists from 2010 through 2019.",
    category: "Champions League Heritage",
    difficulty: "hard",
    maxGuesses: 7,
    answers: [
      { id: "inter", label: "Inter Milan", aliases: ["Inter Milan", "Inter", "Internazionale"], rank: 1, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "bayern", label: "Bayern Munich", aliases: ["Bayern Munich", "Bayern", "FC Bayern"], rank: 2, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "barcelona", label: "Barcelona", aliases: ["Barcelona", "Barca", "FC Barcelona"], rank: 3, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "man-united", label: "Manchester United", aliases: ["Manchester United", "Man United", "Man Utd", "United", "MUFC"], rank: 4, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "chelsea", label: "Chelsea", aliases: ["Chelsea", "Chelsea FC"], rank: 5, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "dortmund", label: "Borussia Dortmund", aliases: ["Borussia Dortmund", "Dortmund", "BVB"], rank: 6, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "real-madrid", label: "Real Madrid", aliases: ["Real Madrid", "Madrid", "Real"], rank: 7, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "atletico", label: "Atletico Madrid", aliases: ["Atletico Madrid", "Atletico", "Atleti"], rank: 8, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "juventus", label: "Juventus", aliases: ["Juventus", "Juve"], rank: 9, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "liverpool", label: "Liverpool", aliases: ["Liverpool", "Liverpool FC"], rank: 10, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "tottenham", label: "Tottenham Hotspur", aliases: ["Tottenham Hotspur", "Tottenham", "Spurs", "THFC"], rank: 11, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" }
    ]
  },
  {
    id: "world-cup-golden-ball-winners-1998-onward",
    title: "Name men's World Cup Golden Ball winners from 1998 onward.",
    hint: "Unique winners only. One player won it twice in this span.",
    category: "World Cup Fever",
    difficulty: "medium",
    maxGuesses: 5,
    answers: [
      { id: "ronaldo", label: "Ronaldo", aliases: ["Ronaldo", "Ronaldo Nazario", "R9"], rank: 1, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "kahn", label: "Oliver Kahn", aliases: ["Oliver Kahn", "Kahn"], rank: 2, basePoints: 100, rarityScore: 70, rarityLabel: "Streets Won't Forget" },
      { id: "zidane", label: "Zinedine Zidane", aliases: ["Zinedine Zidane", "Zidane", "Zizou"], rank: 3, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" },
      { id: "forlan", label: "Diego Forlan", aliases: ["Diego Forlan", "Forlan"], rank: 4, basePoints: 100, rarityScore: 45, rarityLabel: "Niche" },
      { id: "messi", label: "Lionel Messi", aliases: ["Lionel Messi", "Messi", "Leo Messi"], rank: 5, basePoints: 100, rarityScore: 10, rarityLabel: "Tap-in" },
      { id: "modric", label: "Luka Modric", aliases: ["Luka Modric", "Modric"], rank: 6, basePoints: 100, rarityScore: 25, rarityLabel: "Solid" }
    ]
  }
];
