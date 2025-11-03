import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";

/* =========================================================================
   APP OVERVIEW
   - Permanent datasets baked in
   - Network/Matrix/Immorality/Science/Religions/Global/Legal views
   - Minimal floating "+" -> bottom drawer submission panel (all pages)
   - Admin gear (only if isAdmin) -> right slide-out review/approve/export
   - LocalStorage persistence for submissions, approvals, contributors
   - Hidden Contributors page at ?contributors=1 (names only)
   ========================================================================= */

/* ============================== ADMIN GATE ============================== */
function isAdmin() {
  try {
    const qp = new URLSearchParams(window.location.search);
    if (qp.get("admin") === "1") { localStorage.setItem("viz_admin", "1"); return true; }
    if (localStorage.getItem("viz_admin") === "1") return true;
  } catch (_) {}
  return false;
}

/* ============================== DATA: PERMANENT SEEDS ============================== */
/* Contradictions structure:
  { id, type, topic, verseA:{ref,book,canon}, verseB:{ref,book,canon}, summary, detail? }
  type: "doctrinal" | "historical" | "scientific" | "moral" | "narrative"
  canon: "Bible" | "BoM"
*/
const CONTRADICTIONS_PERMANENT = [
  // --- Creation / origins / theology (1–20)
  {id:"c001",type:"narrative",topic:"Creation order",verseA:{ref:"Gen 1:24-27",book:"Genesis",canon:"Bible"},verseB:{ref:"Gen 2:18-19",book:"Genesis",canon:"Bible"},summary:"Animals→humans vs man→animals."},
  {id:"c002",type:"doctrinal",topic:"Seeing God",verseA:{ref:"Ex 33:20",book:"Exodus",canon:"Bible"},verseB:{ref:"Gen 32:30",book:"Genesis",canon:"Bible"},summary:"No one can see God vs Jacob saw God."},
  {id:"c003",type:"doctrinal",topic:"God repents / does not",verseA:{ref:"Gen 6:6",book:"Genesis",canon:"Bible"},verseB:{ref:"Num 23:19",book:"Numbers",canon:"Bible"},summary:"God regretted vs God does not repent."},
  {id:"c004",type:"doctrinal",topic:"God tempts / does not",verseA:{ref:"Gen 22:1",book:"Genesis",canon:"Bible"},verseB:{ref:"Jas 1:13",book:"James",canon:"Bible"},summary:"God tested Abraham vs tempts no one."},
  {id:"c005",type:"doctrinal",topic:"One God / many gods",verseA:{ref:"Deut 6:4",book:"Deuteronomy",canon:"Bible"},verseB:{ref:"Ps 82:1",book:"Psalms",canon:"Bible"},summary:"YHWH one vs divine council language."},
  {id:"c006",type:"scientific",topic:"Earth fixed / moves",verseA:{ref:"Ps 104:5",book:"Psalms",canon:"Bible"},verseB:{ref:"Job 38:14",book:"Job",canon:"Bible"},summary:"Immovable earth vs dawn turns earth like clay (rotation imagery)."},
  {id:"c007",type:"historical",topic:"Creation time span",verseA:{ref:"Gen 1",book:"Genesis",canon:"Bible"},verseB:{ref:"Gen 2:4",book:"Genesis",canon:"Bible"},summary:"Six days vs 'in the day' summary."},
  {id:"c008",type:"doctrinal",topic:"God is peace / creates evil",verseA:{ref:"1 Cor 14:33",book:"1 Corinthians",canon:"Bible"},verseB:{ref:"Isa 45:7",book:"Isaiah",canon:"Bible"},summary:"God of peace vs creates calamity/evil."},
  {id:"c009",type:"doctrinal",topic:"Invisible God / seen God",verseA:{ref:"1 Tim 1:17",book:"1 Timothy",canon:"Bible"},verseB:{ref:"Ex 24:10-11",book:"Exodus",canon:"Bible"},summary:"Invisible vs elders saw God."},
  {id:"c010",type:"doctrinal",topic:"God changes mind / not",verseA:{ref:"Ex 32:14",book:"Exodus",canon:"Bible"},verseB:{ref:"Mal 3:6",book:"Malachi",canon:"Bible"},summary:"Relented re: disaster vs do not change."},
  {id:"c011",type:"doctrinal",topic:"Omnipresence / localized",verseA:{ref:"Ps 139:7-10",book:"Psalms",canon:"Bible"},verseB:{ref:"Gen 11:5",book:"Genesis",canon:"Bible"},summary:"Everywhere vs 'came down' to see Babel."},
  {id:"c012",type:"doctrinal",topic:"God's anger short / long",verseA:{ref:"Ps 30:5",book:"Psalms",canon:"Bible"},verseB:{ref:"Num 32:13",book:"Numbers",canon:"Bible"},summary:"Anger a moment vs 40 years."},
  {id:"c013",type:"doctrinal",topic:"God is good / sends delusion",verseA:{ref:"Ps 145:9",book:"Psalms",canon:"Bible"},verseB:{ref:"2 Thess 2:11",book:"2 Thessalonians",canon:"Bible"},summary:"Good to all vs sends strong delusion."},
  {id:"c014",type:"doctrinal",topic:"Jealous / not jealous",verseA:{ref:"Ex 34:14",book:"Exodus",canon:"Bible"},verseB:{ref:"1 Cor 13:4",book:"1 Corinthians",canon:"Bible"},summary:"Name is Jealous vs love not jealous (attribution tension)."},
  {id:"c015",type:"doctrinal",topic:"God dwells in light / darkness",verseA:{ref:"1 Tim 6:16",book:"1 Timothy",canon:"Bible"},verseB:{ref:"1 Kgs 8:12",book:"1 Kings",canon:"Bible"},summary:"Unapproachable light vs dwells in thick darkness."},
  {id:"c016",type:"doctrinal",topic:"Fear God / perfect love casts fear",verseA:{ref:"Eccl 12:13",book:"Ecclesiastes",canon:"Bible"},verseB:{ref:"1 Jn 4:18",book:"1 John",canon:"Bible"},summary:"Fear commanded vs fear expelled by love."},
  {id:"c017",type:"doctrinal",topic:"Wisdom praised / foolishness praised",verseA:{ref:"Prov 4:7",book:"Proverbs",canon:"Bible"},verseB:{ref:"1 Cor 1:18-25",book:"1 Corinthians",canon:"Bible"},summary:"Seek wisdom vs God's wisdom appears foolish to world."},
  {id:"c018",type:"doctrinal",topic:"Righteous not forsaken / Jesus forsaken",verseA:{ref:"Ps 37:25",book:"Psalms",canon:"Bible"},verseB:{ref:"Mt 27:46",book:"Matthew",canon:"Bible"},summary:"Not forsaken vs 'why have you forsaken me'."},
  {id:"c019",type:"doctrinal",topic:"No partiality / chooses Israel",verseA:{ref:"Rom 2:11",book:"Romans",canon:"Bible"},verseB:{ref:"Deut 7:6",book:"Deuteronomy",canon:"Bible"},summary:"No favoritism vs chosen people."},
  {id:"c020",type:"doctrinal",topic:"Peace on earth / not peace",verseA:{ref:"Lk 2:14",book:"Luke",canon:"Bible"},verseB:{ref:"Mt 10:34",book:"Matthew",canon:"Bible"},summary:"Peace proclaimed vs 'not peace but a sword'."},

  // --- Law / ethics / practice (21–40)
  {id:"c021",type:"moral",topic:"Murder forbidden / commanded war",verseA:{ref:"Ex 20:13",book:"Exodus",canon:"Bible"},verseB:{ref:"1 Sam 15:3",book:"1 Samuel",canon:"Bible"},summary:"Do not murder vs destroy Amalek."},
  {id:"c022",type:"moral",topic:"Love enemies / imprecations",verseA:{ref:"Mt 5:44",book:"Matthew",canon:"Bible"},verseB:{ref:"Ps 137:9",book:"Psalms",canon:"Bible"},summary:"Love enemies vs cursing enemies."},
  {id:"c023",type:"moral",topic:"Oaths allowed / forbidden",verseA:{ref:"Deut 6:13",book:"Deuteronomy",canon:"Bible"},verseB:{ref:"Mt 5:34",book:"Matthew",canon:"Bible"},summary:"Swear by His name vs 'do not swear at all'."},
  {id:"c024",type:"moral",topic:"Divorce permitted / not",verseA:{ref:"Deut 24:1",book:"Deuteronomy",canon:"Bible"},verseB:{ref:"Mk 10:9-12",book:"Mark",canon:"Bible"},summary:"Certificate of divorce vs no divorce (except… in Matt)."},
  {id:"c025",type:"moral",topic:"Circumcision eternal / not required",verseA:{ref:"Gen 17:13",book:"Genesis",canon:"Bible"},verseB:{ref:"Gal 5:6",book:"Galatians",canon:"Bible"},summary:"Everlasting covenant vs neither circumcision nor uncircumcision counts."},
  {id:"c026",type:"moral",topic:"Food laws / all foods clean",verseA:{ref:"Lev 11",book:"Leviticus",canon:"Bible"},verseB:{ref:"Mk 7:19",book:"Mark",canon:"Bible"},summary:"Unclean animals vs declared all foods clean."},
  {id:"c027",type:"moral",topic:"Sabbath strict / human need",verseA:{ref:"Ex 31:14",book:"Exodus",canon:"Bible"},verseB:{ref:"Mk 2:27",book:"Mark",canon:"Bible"},summary:"Death for profaning vs sabbath for man."},
  {id:"c028",type:"moral",topic:"Vengeance / leave it to God",verseA:{ref:"Deut 19:21",book:"Deuteronomy",canon:"Bible"},verseB:{ref:"Rom 12:19",book:"Romans",canon:"Bible"},summary:"Eye for eye vs leave vengeance to God."},
  {id:"c029",type:"moral",topic:"Women silent / prophesy",verseA:{ref:"1 Cor 14:34",book:"1 Corinthians",canon:"Bible"},verseB:{ref:"1 Cor 11:5",book:"1 Corinthians",canon:"Bible"},summary:"Silent in churches vs women pray/prophesy with head covering."},
  {id:"c030",type:"moral",topic:"Justified by faith / works",verseA:{ref:"Rom 3:28",book:"Romans",canon:"Bible"},verseB:{ref:"Jas 2:24",book:"James",canon:"Bible"},summary:"By faith apart from works vs by works and not by faith alone."},
  {id:"c031",type:"moral",topic:"Pay for ministry / free of charge",verseA:{ref:"1 Cor 9:14",book:"1 Corinthians",canon:"Bible"},verseB:{ref:"1 Cor 9:18",book:"1 Corinthians",canon:"Bible"},summary:"Those who preach should get living vs preach free of charge."},
  {id:"c032",type:"moral",topic:"Answer a fool / do not answer",verseA:{ref:"Prov 26:4",book:"Proverbs",canon:"Bible"},verseB:{ref:"Prov 26:5",book:"Proverbs",canon:"Bible"},summary:"Do not answer vs answer a fool."},
  {id:"c033",type:"moral",topic:"Lying condemned / sanctioned",verseA:{ref:"Ex 20:16",book:"Exodus",canon:"Bible"},verseB:{ref:"Josh 2:4-6",book:"Joshua",canon:"Bible"},summary:"Do not bear false witness vs Rahab deceives to save spies."},
  {id:"c034",type:"moral",topic:"Alcohol forbidden / permitted",verseA:{ref:"Prov 20:1",book:"Proverbs",canon:"Bible"},verseB:{ref:"Jn 2:1-11",book:"John",canon:"Bible"},summary:"Wine a mocker vs Jesus turns water to wine."},
  {id:"c035",type:"moral",topic:"Riches blessing / woe",verseA:{ref:"Prov 10:22",book:"Proverbs",canon:"Bible"},verseB:{ref:"Lk 6:24",book:"Luke",canon:"Bible"},summary:"Blessing adds no sorrow vs woe to you rich."},
  {id:"c036",type:"moral",topic:"Charity seen / hidden",verseA:{ref:"Mt 5:16",book:"Matthew",canon:"Bible"},verseB:{ref:"Mt 6:1",book:"Matthew",canon:"Bible"},summary:"Let works be seen vs do not practice to be seen."},
  {id:"c037",type:"moral",topic:"Judging forbidden / required",verseA:{ref:"Mt 7:1",book:"Matthew",canon:"Bible"},verseB:{ref:"Jn 7:24",book:"John",canon:"Bible"},summary:"Do not judge vs judge with right judgment."},
  {id:"c038",type:"moral",topic:"Self-defense / turn other cheek",verseA:{ref:"Lk 22:36",book:"Luke",canon:"Bible"},verseB:{ref:"Mt 5:39",book:"Matthew",canon:"Bible"},summary:"Buy a sword vs do not resist evil."},
  {id:"c039",type:"moral",topic:"Family loyalty / hate family",verseA:{ref:"Ex 20:12",book:"Exodus",canon:"Bible"},verseB:{ref:"Lk 14:26",book:"Luke",canon:"Bible"},summary:"Honor parents vs hate father and mother (hyperbole)."},
  {id:"c040",type:"moral",topic:"Wealth of the righteous / poor saints",verseA:{ref:"Ps 112:3",book:"Psalms",canon:"Bible"},verseB:{ref:"2 Cor 8:2",book:"2 Corinthians",canon:"Bible"},summary:"Wealth in house vs severe poverty yet generosity."},

  // --- Numbers / chronology / history (41–60)
  {id:"c041",type:"historical",topic:"Census numbers",verseA:{ref:"Ex 12:37",book:"Exodus",canon:"Bible"},verseB:{ref:"Num 1:45-46",book:"Numbers",canon:"Bible"},summary:"2M implied vs logistics and alternate tallies."},
  {id:"c042",type:"historical",topic:"Duration in Egypt",verseA:{ref:"Ex 12:40",book:"Exodus",canon:"Bible"},verseB:{ref:"Gal 3:17",book:"Galatians",canon:"Bible"},summary:"430 yrs vs 430 from Abraham to Law."},
  {id:"c043",type:"historical",topic:"Age of Ahaziah",verseA:{ref:"2 Kgs 8:26",book:"2 Kings",canon:"Bible"},verseB:{ref:"2 Chr 22:2",book:"2 Chronicles",canon:"Bible"},summary:"22 vs 42 (textual issue)."},
  {id:"c044",type:"historical",topic:"Michal’s children",verseA:{ref:"2 Sam 6:23",book:"2 Samuel",canon:"Bible"},verseB:{ref:"2 Sam 21:8 (KJV)",book:"2 Samuel",canon:"Bible"},summary:"No child vs has children (variant)."},
  {id:"c045",type:"historical",topic:"Jair’s towns",verseA:{ref:"Num 32:41",book:"Numbers",canon:"Bible"},verseB:{ref:"Judg 10:4",book:"Judges",canon:"Bible"},summary:"Havvoth-jair count differs (23/30)."},
  {id:"c046",type:"historical",topic:"Solomon’s stalls",verseA:{ref:"1 Kgs 4:26",book:"1 Kings",canon:"Bible"},verseB:{ref:"2 Chr 9:25",book:"2 Chronicles",canon:"Bible"},summary:"40,000 vs 4,000 (scribal numeral)."},
  {id:"c047",type:"historical",topic:"God incites / Satan incites",verseA:{ref:"2 Sam 24:1",book:"2 Samuel",canon:"Bible"},verseB:{ref:"1 Chr 21:1",book:"1 Chronicles",canon:"Bible"},summary:"YHWH incited census vs Satan incited."},
  {id:"c048",type:"historical",topic:"Who killed Goliath",verseA:{ref:"1 Sam 17",book:"1 Samuel",canon:"Bible"},verseB:{ref:"2 Sam 21:19",book:"2 Samuel",canon:"Bible"},summary:"David vs Elhanan (textual clarification: brother of Goliath)."},
  {id:"c049",type:"historical",topic:"Jehoiachin’s age",verseA:{ref:"2 Kgs 24:8",book:"2 Kings",canon:"Bible"},verseB:{ref:"2 Chr 36:9",book:"2 Chronicles",canon:"Bible"},summary:"18 vs 8."},
  {id:"c050",type:"historical",topic:"Number of overseers",verseA:{ref:"2 Chr 2:2",book:"2 Chronicles",canon:"Bible"},verseB:{ref:"1 Kgs 5:16",book:"1 Kings",canon:"Bible"},summary:"3,600 vs 3,300."},
  {id:"c051",type:"historical",topic:"Captivity years",verseA:{ref:"Jer 25:11-12",book:"Jeremiah",canon:"Bible"},verseB:{ref:"Dan 9:2",book:"Daniel",canon:"Bible"},summary:"70 yrs; calculations vary vs fulfillment timing."},
  {id:"c052",type:"historical",topic:"Date of Jesus’ birth events",verseA:{ref:"Mt 2:1",book:"Matthew",canon:"Bible"},verseB:{ref:"Lk 2:1-2",book:"Luke",canon:"Bible"},summary:"Herod (d. 4 BCE) vs Quirinius census (6–7 CE)."},
  {id:"c053",type:"historical",topic:"Nazareth / Bethlehem origin",verseA:{ref:"Lk 2",book:"Luke",canon:"Bible"},verseB:{ref:"Mt 2",book:"Matthew",canon:"Bible"},summary:"From Nazareth to Bethlehem vs from Bethlehem then to Nazareth via Egypt."},
  {id:"c054",type:"historical",topic:"Number at the tomb",verseA:{ref:"Mt 28:2",book:"Matthew",canon:"Bible"},verseB:{ref:"Jn 20:12",book:"John",canon:"Bible"},summary:"One angel vs two angels."},
  {id:"c055",type:"historical",topic:"Women told / said nothing",verseA:{ref:"Mt 28:8",book:"Matthew",canon:"Bible"},verseB:{ref:"Mk 16:8",book:"Mark",canon:"Bible"},summary:"Told disciples vs said nothing (shorter Mark)."},
  {id:"c056",type:"historical",topic:"Resurrection appearance locale",verseA:{ref:"Mt 28:16",book:"Matthew",canon:"Bible"},verseB:{ref:"Lk 24:33-49",book:"Luke",canon:"Bible"},summary:"Galilee vs Jerusalem emphasis."},
  {id:"c057",type:"historical",topic:"Carrying the cross",verseA:{ref:"Jn 19:17",book:"John",canon:"Bible"},verseB:{ref:"Mk 15:21",book:"Mark",canon:"Bible"},summary:"Jesus carries vs Simon of Cyrene carries."},
  {id:"c058",type:"historical",topic:"Judas’s death",verseA:{ref:"Mt 27:5",book:"Matthew",canon:"Bible"},verseB:{ref:"Acts 1:18",book:"Acts",canon:"Bible"},summary:"Hanged vs fell and burst open."},
  {id:"c059",type:"historical",topic:"Field purchase",verseA:{ref:"Mt 27:6-8",book:"Matthew",canon:"Bible"},verseB:{ref:"Acts 1:18-19",book:"Acts",canon:"Bible"},summary:"Priests bought vs Judas bought."},
  {id:"c060",type:"historical",topic:"Empty tomb timing detail",verseA:{ref:"Jn 20:1",book:"John",canon:"Bible"},verseB:{ref:"Mt 28:1",book:"Matthew",canon:"Bible"},summary:"Still dark vs dawn."},

  // --- Genealogies / lists / counts (61–75)
  {id:"c061",type:"historical",topic:"Genealogy names differ",verseA:{ref:"Mt 1:1-16",book:"Matthew",canon:"Bible"},verseB:{ref:"Lk 3:23-38",book:"Luke",canon:"Bible"},summary:"Joseph’s line differs (Solomon vs Nathan)."},
  {id:"c062",type:"historical",topic:"Number of generations",verseA:{ref:"Mt 1:17",book:"Matthew",canon:"Bible"},verseB:{ref:"OT genealogies",book:"1 Chronicles",canon:"Bible"},summary:"14-14-14 schematized vs longer lists."},
  {id:"c063",type:"historical",topic:"Who was Joseph’s father",verseA:{ref:"Mt 1:16",book:"Matthew",canon:"Bible"},verseB:{ref:"Lk 3:23",book:"Luke",canon:"Bible"},summary:"Jacob vs Heli."},
  {id:"c064",type:"historical",topic:"How many with Jacob to Egypt",verseA:{ref:"Gen 46:27",book:"Genesis",canon:"Bible"},verseB:{ref:"Acts 7:14",book:"Acts",canon:"Bible"},summary:"70 vs 75."},
  {id:"c065",type:"historical",topic:"Temple cleansing timing",verseA:{ref:"Jn 2:13-16",book:"John",canon:"Bible"},verseB:{ref:"Mk 11:15-17",book:"Mark",canon:"Bible"},summary:"Early ministry vs final week."},
  {id:"c066",type:"historical",topic:"Fig tree cursing timing",verseA:{ref:"Mt 21:18-20",book:"Matthew",canon:"Bible"},verseB:{ref:"Mk 11:12-14,20",book:"Mark",canon:"Bible"},summary:"Withered immediately vs next day."},
  {id:"c067",type:"historical",topic:"Rooster crow count",verseA:{ref:"Mt 26:34,74-75",book:"Matthew",canon:"Bible"},verseB:{ref:"Mk 14:30,72",book:"Mark",canon:"Bible"},summary:"Before rooster crows vs before rooster crows twice."},
  {id:"c068",type:"historical",topic:"Staffs allowed?",verseA:{ref:"Mt 10:10",book:"Matthew",canon:"Bible"},verseB:{ref:"Mk 6:8",book:"Mark",canon:"Bible"},summary:"No staff vs take a staff."},
  {id:"c069",type:"historical",topic:"Beatitudes: poor / poor in spirit",verseA:{ref:"Lk 6:20",book:"Luke",canon:"Bible"},verseB:{ref:"Mt 5:3",book:"Matthew",canon:"Bible"},summary:"Blessed are the poor vs poor in spirit."},
  {id:"c070",type:"historical",topic:"Sermon location",verseA:{ref:"Mt 5:1",book:"Matthew",canon:"Bible"},verseB:{ref:"Lk 6:17",book:"Luke",canon:"Bible"},summary:"On a mountain vs on a level place."},
  {id:"c071",type:"historical",topic:"Who bought spices",verseA:{ref:"Mk 16:1",book:"Mark",canon:"Bible"},verseB:{ref:"Lk 23:56",book:"Luke",canon:"Bible"},summary:"After Sabbath vs before Sabbath rest."},
  {id:"c072",type:"historical",topic:"Jesus’ last words",verseA:{ref:"Lk 23:46",book:"Luke",canon:"Bible"},verseB:{ref:"Jn 19:30",book:"John",canon:"Bible"},summary:"'Into your hands' vs 'It is finished' (and Mt 27:46 cry)."},
  {id:"c073",type:"historical",topic:"Who visited first",verseA:{ref:"Jn 20:1",book:"John",canon:"Bible"},verseB:{ref:"Mt 28:1",book:"Matthew",canon:"Bible"},summary:"Mary Magdalene alone vs Mary M. and the other Mary."},
  {id:"c074",type:"historical",topic:"Ascension timing",verseA:{ref:"Lk 24:50-51",book:"Luke",canon:"Bible"},verseB:{ref:"Acts 1:3,9",book:"Acts",canon:"Bible"},summary:"Day of resurrection vs after 40 days."},
  {id:"c075",type:"historical",topic:"Number of demoniacs",verseA:{ref:"Mt 8:28",book:"Matthew",canon:"Bible"},verseB:{ref:"Mk 5:2",book:"Mark",canon:"Bible"},summary:"Two vs one at Gadara/Gerasa."},

  // --- Doctrine / salvation / practice (76–90)
  {id:"c076",type:"doctrinal",topic:"Law abolished / established",verseA:{ref:"Eph 2:15",book:"Ephesians",canon:"Bible"},verseB:{ref:"Rom 3:31",book:"Romans",canon:"Bible"},summary:"Abolished commandments vs we uphold the law."},
  {id:"c077",type:"doctrinal",topic:"Can we keep law?",verseA:{ref:"Lk 1:6",book:"Luke",canon:"Bible"},verseB:{ref:"Rom 3:10-12",book:"Romans",canon:"Bible"},summary:"Blameless in commandments vs none righteous."},
  {id:"c078",type:"doctrinal",topic:"Predestination / free call",verseA:{ref:"Rom 8:29-30",book:"Romans",canon:"Bible"},verseB:{ref:"1 Tim 2:4",book:"1 Timothy",canon:"Bible"},summary:"Foreknown/predestined vs desires all to be saved."},
  {id:"c079",type:"doctrinal",topic:"Seeing God the Father",verseA:{ref:"Jn 6:46",book:"John",canon:"Bible"},verseB:{ref:"Ex 24:10",book:"Exodus",canon:"Bible"},summary:"No one has seen the Father vs elders saw God."},
  {id:"c080",type:"doctrinal",topic:"Prayer heard / not heard",verseA:{ref:"Mt 7:7",book:"Matthew",canon:"Bible"},verseB:{ref:"Prov 28:9",book:"Proverbs",canon:"Bible"},summary:"Ask/receive vs prayer abomination if ignoring law."},
  {id:"c081",type:"doctrinal",topic:"Salvation by calling / by doing",verseA:{ref:"Rom 10:13",book:"Romans",canon:"Bible"},verseB:{ref:"Mt 7:21",book:"Matthew",canon:"Bible"},summary:"Everyone who calls vs only he who does Father’s will."},
  {id:"c082",type:"doctrinal",topic:"Apostasy possible / not",verseA:{ref:"Heb 6:4-6",book:"Hebrews",canon:"Bible"},verseB:{ref:"Jn 10:28",book:"John",canon:"Bible"},summary:"Falling away impossible to renew vs none can snatch them."},
  {id:"c083",type:"doctrinal",topic:"Justification instant / ongoing",verseA:{ref:"Lk 18:14",book:"Luke",canon:"Bible"},verseB:{ref:"Phil 2:12",book:"Philippians",canon:"Bible"},summary:"Went home justified vs work out salvation."},
  {id:"c084",type:"doctrinal",topic:"Forgiveness conditions",verseA:{ref:"Mk 11:25",book:"Mark",canon:"Bible"},verseB:{ref:"Heb 9:22",book:"Hebrews",canon:"Bible"},summary:"Forgive to be forgiven vs without shedding of blood no forgiveness."},
  {id:"c085",type:"doctrinal",topic:"Resurrection timing",verseA:{ref:"Jn 5:25-29",book:"John",canon:"Bible"},verseB:{ref:"1 Thess 4:16",book:"1 Thessalonians",canon:"Bible"},summary:"Hour now/coming vs at Lord’s descent (ordering nuances)."},
  {id:"c086",type:"doctrinal",topic:"Who raised Jesus",verseA:{ref:"Acts 2:24",book:"Acts",canon:"Bible"},verseB:{ref:"Jn 2:19-21",book:"John",canon:"Bible"},summary:"God raised him vs 'I will raise it' (self-reference)."},
  {id:"c087",type:"doctrinal",topic:"See God and live",verseA:{ref:"Ex 33:20",book:"Exodus",canon:"Bible"},verseB:{ref:"Job 42:5",book:"Job",canon:"Bible"},summary:"No man sees and lives vs 'my eyes have seen' poetic."},
  {id:"c088",type:"doctrinal",topic:"Perfection commanded / impossible",verseA:{ref:"Mt 5:48",book:"Matthew",canon:"Bible"},verseB:{ref:"1 Jn 1:8",book:"1 John",canon:"Bible"},summary:"Be perfect vs if we say no sin we deceive."},
  {id:"c089",type:"doctrinal",topic:"Good works seen / secret",verseA:{ref:"Mt 5:16",book:"Matthew",canon:"Bible"},verseB:{ref:"Mt 6:3-4",book:"Matthew",canon:"Bible"},summary:"Let light shine vs do not let left hand know."},
  {id:"c090",type:"doctrinal",topic:"God’s wrath remains / none",verseA:{ref:"Jn 3:36",book:"John",canon:"Bible"},verseB:{ref:"Rom 8:1",book:"Romans",canon:"Bible"},summary:"Wrath remains on disobedient vs no condemnation in Christ."},

  // --- Misc narrative & teaching (91–100)
  {id:"c091",type:"narrative",topic:"How Judas returned money",verseA:{ref:"Mt 27:3-5",book:"Matthew",canon:"Bible"},verseB:{ref:"Acts 1:18",book:"Acts",canon:"Bible"},summary:"Threw money in temple vs bought a field."},
  {id:"c092",type:"narrative",topic:"Who ran first",verseA:{ref:"Jn 20:4",book:"John",canon:"Bible"},verseB:{ref:"Lk 24:12",book:"Luke",canon:"Bible"},summary:"Beloved disciple outran Peter vs Peter ran and saw (order/focus)."},
  {id:"c093",type:"narrative",topic:"Temple veil torn timing",verseA:{ref:"Mt 27:50-51",book:"Matthew",canon:"Bible"},verseB:{ref:"Mk 15:37-38",book:"Mark",canon:"Bible"},summary:"At cry/breath; details vary across Gospels."},
  {id:"c094",type:"narrative",topic:"Who bore sins",verseA:{ref:"Isa 53:4",book:"Isaiah",canon:"Bible"},verseB:{ref:"Mt 8:16-17",book:"Matthew",canon:"Bible"},summary:"Servant bore griefs vs Jesus’ healings fulfill text (interpretation timing)."},
  {id:"c095",type:"narrative",topic:"Carpenter / carpenter’s son",verseA:{ref:"Mk 6:3",book:"Mark",canon:"Bible"},verseB:{ref:"Mt 13:55",book:"Matthew",canon:"Bible"},summary:"Jesus the carpenter vs carpenter’s son."},
  {id:"c096",type:"narrative",topic:"Disciples take staff / not",verseA:{ref:"Mk 6:8",book:"Mark",canon:"Bible"},verseB:{ref:"Mt 10:10",book:"Matthew",canon:"Bible"},summary:"Take staff vs not."},
  {id:"c097",type:"narrative",topic:"How many demons in Mary",verseA:{ref:"Lk 8:2",book:"Luke",canon:"Bible"},verseB:{ref:"Mk 16:9",book:"Mark",canon:"Bible"},summary:"Seven demons; longer ending Mark debated."},
  {id:"c098",type:"narrative",topic:"Who spoke at burning bush",verseA:{ref:"Ex 3:4-6",book:"Exodus",canon:"Bible"},verseB:{ref:"Acts 7:30-35",book:"Acts",canon:"Bible"},summary:"God/angel of the LORD vs angel in bush."},
  {id:"c099",type:"narrative",topic:"Number of blind men",verseA:{ref:"Mt 20:30",book:"Matthew",canon:"Bible"},verseB:{ref:"Mk 10:46",book:"Mark",canon:"Bible"},summary:"Two blind men vs one (Bartimaeus)."},
  {id:"c100",type:"narrative",topic:"Timing of Passover",verseA:{ref:"Jn 18:28; 19:14",book:"John",canon:"Bible"},verseB:{ref:"Mt 26:17-20",book:"Matthew",canon:"Bible"},summary:"Jesus dies before meal vs eats Passover with disciples."},
];

/* Immorality narratives (illustrative) */
const IMMORALITY_PERMANENT = [
  { id:"m001", category:"Killing by God", ref:"Genesis 7:21-23 (Flood)", canon:"Bible", commanded:true, estCount:"Global", note:"Near-total loss in narrative." },
  { id:"m002", category:"Genocide", ref:"Deuteronomy 20:16-18", canon:"Bible", commanded:true, estCount:"Cities", note:"Herem warfare language." },
  { id:"m003", category:"Slavery regulation", ref:"Leviticus 25:44-46", canon:"Bible", commanded:false, estCount:null, note:"Ownership of foreigners permitted." },
  { id:"m004", category:"Rape handling", ref:"Deuteronomy 22:28-29", canon:"Bible", commanded:false, estCount:null, note:"Marriage to victim; modern moral concern." },
];

/* Science items */
const SCIENCE_PERMANENT = [
  { id:"s001", story:"Global flood & ark", refs:["Genesis 6–9"], summary:"Worldwide deluge + wooden ark housing all kinds.", mechanisms:{ laws:["Fluid dynamics","Population genetics","Naval architecture","Geology"], why:["Water volume/energy infeasible.","Severe inbreeding with pairs.","Large hulls require modern bracing.","Ice cores/tree rings continuous."], observations:["Marine salinity/sediment mixing issues.","No single global one-year layer."] } },
  { id:"s002", story:"Sun stands still", refs:["Joshua 10:12-14"], summary:"Earth rotation effectively stops.", mechanisms:{ laws:["Angular momentum","Atmospherics"], why:["Stopping Earth implies ~10^29 J."], observations:["No synchronized global records; catastrophic winds expected."] } },
  { id:"s003", story:"Young Earth", refs:["Genesis genealogies"], summary:"~6–10k yrs vs radiometric & astrophysical data.", mechanisms:{ laws:["Nuclear decay","Stellar distances"], why:["Convergent dating at ~4.5B yrs."], observations:["Multiple independent clocks agree."] } },
  { id:"s004", story:"Luke’s census", refs:["Luke 2:1-2"], summary:"Empire-wide census w/ travel to ancestral towns.", mechanisms:{ laws:["Historical method"], why:["Conflicts with known Roman practice/timing."], observations:["Quirinius date vs Herod’s reign mismatch."] } },
];

/* Religions tree (expandable) */
const RELIGION_TREE_PERMANENT = [
  { name:"Christianity", family:"Abrahamic", text:"Bible", coreTenets:["Trinity","Incarnation","Grace/Faith","Resurrection"], adherentsM:2400, subgroups:[{name:"Catholic",adherentsM:1300},{name:"Protestant",adherentsM:900},{name:"Orthodox",adherentsM:260}] },
  { name:"Islam", family:"Abrahamic", text:"Quran", coreTenets:["Tawhid","Prophethood","Five Pillars"], adherentsM:1900, subgroups:[{name:"Sunni",adherentsM:1600},{name:"Shia",adherentsM:250}] },
  { name:"Hinduism", family:"Dharmic", text:"Vedas/Upanishads", coreTenets:["Dharma","Karma","Moksha"], adherentsM:1200, subgroups:[{name:"Vaishnavism"},{name:"Shaivism"},{name:"Shaktism"}]},
  { name:"Buddhism", family:"Dharmic", text:"Tripitaka/Mahayana", coreTenets:["Four Noble Truths","Eightfold Path"], adherentsM:500, subgroups:[{name:"Theravada"},{name:"Mahayana"},{name:"Vajrayana"}]},
  { name:"Judaism", family:"Abrahamic", text:"Tanakh/Talmud", coreTenets:["Covenant","Torah","Monotheism"], adherentsM:15, subgroups:[{name:"Orthodox"},{name:"Conservative"},{name:"Reform"}]},
  { name:"Sikhism", family:"Dharmic", text:"Guru Granth Sahib", coreTenets:["Ik Onkar","Seva","Equality"], adherentsM:26, subgroups:[] },
  { name:"Baháʼí", family:"Abrahamic", text:"Baháʼí writings", coreTenets:["Progressive revelation","Unity"], adherentsM:8, subgroups:[] },
  { name:"LDS", family:"Restorationist", text:"Bible & Book of Mormon", coreTenets:["Restoration","Additional scripture"], adherentsM:17, subgroups:[] },
  { name:"FLDS", family:"Restorationist", text:"Bible & Book of Mormon", coreTenets:["Fundamentalist offshoot","Plural marriage (historic)"], adherentsM:0.1, subgroups:[] },
  { name:"Satanism (var.)", family:"NRM", text:"Various", coreTenets:["LaVeyan","TST advocacy"], adherentsM:0.2, subgroups:[{name:"LaVeyan"},{name:"The Satanic Temple"}]},
  { name:"Atheist", family:"Unaffiliated", text:"-", coreTenets:["No deity"], adherentsM:450, subgroups:[] },
  { name:"Agnostic", family:"Unaffiliated", text:"-", coreTenets:["Knowledge uncertain"], adherentsM:600, subgroups:[] },
  { name:"Spiritual (not religious)", family:"Unaffiliated", text:"-", coreTenets:["Personal spirituality"], adherentsM:300, subgroups:[] },
  { name:"Jedi (self-identified)", family:"Novelty", text:"-", coreTenets:["Pop-culture identity"], adherentsM:0.5, subgroups:[] },
];

/* Legal cases (illustrative; expand as you verify specifics) */
const LEGAL_PERMANENT = [
  { groupName:"Catholic clergy", country:"USA", year:2002, allegedOffenseType:"Abuse scandals", outcome:"Widespread settlements; reforms" },
  { groupName:"Scientology", country:"France", year:2009, allegedOffenseType:"Fraud", outcome:"Organization fined; appeals followed" },
  { groupName:"Jehovah’s Witnesses", country:"Russia", year:2017, allegedOffenseType:"Extremism classification", outcome:"Organization banned; legal contest" },
  { groupName:"Various dioceses", country:"Ireland", year:2009, allegedOffenseType:"Institutional abuse", outcome:"State reports; compensation schemes" },
];

/* ============================== GLOBAL HELPERS ============================== */
const BOOK_ORDER = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
  "1 Nephi","2 Nephi","Jacob","Enos","Jarom","Omni","Words of Mormon","Mosiah","Alma","Helaman","3 Nephi","4 Nephi","Mormon","Ether","Moroni"
];
function bookIndex(book){ const i = BOOK_ORDER.indexOf(book); return i>=0 ? i : 9999; }
function relationOf(row){ const a=row.verseA?.canon||"Bible", b=row.verseB?.canon||"Bible"; return a===b ? a : "Cross"; }

/* ============================== LOCAL STORAGE KEYS ============================== */
const LS_KEYS = {
  submissions: "viz_submissions_v1",
  approved: "viz_approved_v1",
  contributors: "viz_contributors_v1"
};

/* ============================== DATA CONTEXT ============================== */
const DataCtx = createContext(null);
function useData(){ return useContext(DataCtx); }

/* ============================== APP ROOT ============================== */
export default function App(){
  const [view, setView] = useState(()=> {
    const qp = new URLSearchParams(window.location.search);
    if (qp.get("contributors")==="1") return "contributors_hidden";
    return "network";
  });

  // persistent approved data
  const [approved, setApproved] = useState(()=> {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.approved) || "{}"); } catch { return {}; }
  });
  useEffect(()=> { localStorage.setItem(LS_KEYS.approved, JSON.stringify(approved)); }, [approved]);

  // contributors (names only)
  const [contributors, setContributors] = useState(()=> {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.contributors) || "[]"); } catch { return []; }
  });
  useEffect(()=> { localStorage.setItem(LS_KEYS.contributors, JSON.stringify(contributors)); }, [contributors]);

  // merged datasets
  const merged = useMemo(()=>({
    contradictions: [...CONTRADICTIONS_PERMANENT, ...((approved?.contradictions)||[])],
    immorality:    [...IMMORALITY_PERMANENT,    ...((approved?.immorality)||[])],
    science:       [...SCIENCE_PERMANENT,       ...((approved?.science)||[])],
    religionsTree: [...RELIGION_TREE_PERMANENT, ...((approved?.religions)||[])],
    legal:         [...LEGAL_PERMANENT,         ...((approved?.legal)||[])],
  }), [approved]);

  return (
    <DataCtx.Provider value={{ merged, approved, setApproved, contributors, setContributors }}>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <TopBar view={view} setView={setView} />
        <main className="max-w-7xl mx-auto p-4 space-y-4">
          {view==="network" && <NetworkView/>}
          {view==="matrix" && <MatrixView/>}
          {view==="immorality" && <ImmoralityView/>}
          {view==="science" && <ScienceView/>}
          {view==="religions" && <ReligionsView/>}
          {view==="global" && <GlobalCountsView/>}
          {view==="legal" && <LegalCasesView/>}
          {view==="contributors_hidden" && <ContributorsHidden/>}
        </main>
        <Footer/>
        <FloatingActions/>
      </div>
    </DataCtx.Provider>
  );
}

/* ============================== UI CHROME ============================== */
function TopBar({ view, setView }){
  const tabs = [
    { id:"network", label:"Contradictions Network" },
    { id:"matrix", label:"Matrix" },
    { id:"immorality", label:"Immorality" },
    { id:"science", label:"Science" },
    { id:"religions", label:"Religions" },
    { id:"global", label:"Global Counts" },
    { id:"legal", label:"Legal Cases" },
  ];
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Religious Text Visualizer</h1>
        <nav className="flex flex-wrap gap-2">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setView(t.id)}
              className={
                "px-3 py-1.5 rounded-full text-sm border transition " +
                (view===t.id ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white hover:bg-slate-100 border-slate-300")
              }>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer(){
  return (
    <footer className="text-xs text-slate-500 max-w-7xl mx-auto px-4 pb-6">
      <div className="mt-2">Tip: Admin mode via <code>?admin=1</code>. Hidden contributors via <code>?contributors=1</code>. Data persists locally.</div>
    </footer>
  );
}

/* ============================== FLOATING ACTIONS (SUBMIT + ADMIN) ============================== */
function FloatingActions(){
  const [submitOpen, setSubmitOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  return (
    <>
      <button
        aria-label="Submit"
        className="fixed bottom-5 right-5 h-12 w-12 rounded-full bg-slate-900 text-white text-2xl shadow-lg hover:scale-105 transition"
        onClick={()=>setSubmitOpen(true)}
      >+</button>

      {isAdmin() && (
        <button
          aria-label="Admin"
          className="fixed bottom-20 right-5 h-12 w-12 rounded-full bg-white border text-slate-800 text-xl shadow hover:scale-105 transition"
          onClick={()=>setAdminOpen(true)}
          title="Admin review"
        >⚙️</button>
      )}

      <SubmissionDrawer open={submitOpen} onClose={()=>setSubmitOpen(false)} />
      {isAdmin() && <AdminPanel open={adminOpen} onClose={()=>setAdminOpen(false)} />}
    </>
  );
}

/* ============================== SUBMISSION DRAWER (BOTTOM) ============================== */
function SubmissionDrawer({ open, onClose }){
  const [category, setCategory] = useState("Contradiction");
  const [title, setTitle] = useState("");
  const [refs, setRefs] = useState("");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [sources, setSources] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  function reset(){
    setCategory("Contradiction"); setTitle(""); setRefs(""); setSummary(""); setDetail(""); setSources(""); setName(""); setEmail(""); setAnonymous(false);
  }

  function saveLocal(){
    if (!title.trim()) { alert("Please enter a title"); return; }
    const obj = {
      id: "sub_" + Date.now(),
      category, title, refs, summary, detail, sources,
      contributor: anonymous ? "Anonymous" : (name||""),
      contributorEmail: anonymous ? "" : (email||""),
      createdAt: new Date().toISOString(),
    };
    try {
      const arr = JSON.parse(localStorage.getItem(LS_KEYS.submissions)||"[]");
      arr.push(obj);
      localStorage.setItem(LS_KEYS.submissions, JSON.stringify(arr));
      alert("Submission saved locally!");
      reset();
      onClose();
    } catch (e) {
      alert("Could not save: " + e.message);
    }
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30" onClick={onClose} />}
      <div className={`fixed left-0 right-0 bottom-0 bg-white border-t rounded-t-2xl shadow-xl transition-transform duration-300 ${open?"translate-y-0":"translate-y-full"}`}>
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Submit Fact / Issue / Contradiction</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-xl">&times;</button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm">Category</label>
              <select className="w-full border rounded p-2" value={category} onChange={(e)=>setCategory(e.target.value)}>
                <option>Contradiction</option>
                <option>Science</option>
                <option>Immorality</option>
                <option>Religion</option>
                <option>Legal</option>
                <option>Global</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Title</label>
              <input className="w-full border rounded p-2" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Short headline"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">References (verses/links; use semicolons or new lines)</label>
              <textarea className="w-full border rounded p-2" rows={2} value={refs} onChange={(e)=>setRefs(e.target.value)} placeholder="Genesis 1:1-5; Genesis 2:4-7"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Summary</label>
              <textarea className="w-full border rounded p-2" rows={2} value={summary} onChange={(e)=>setSummary(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Detail</label>
              <textarea className="w-full border rounded p-2" rows={3} value={detail} onChange={(e)=>setDetail(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Sources / URLs (optional)</label>
              <textarea className="w-full border rounded p-2" rows={2} value={sources} onChange={(e)=>setSources(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Contributor name (optional)</label>
              <input className="w-full border rounded p-2" value={name} onChange={(e)=>setName(e.target.value)} disabled={anonymous} />
            </div>
            <div>
              <label className="text-sm">Email (optional)</label>
              <input className="w-full border rounded p-2" value={email} onChange={(e)=>setEmail(e.target.value)} disabled={anonymous} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input id="anon" type="checkbox" checked={anonymous} onChange={(e)=>setAnonymous(e.target.checked)} />
              <label htmlFor="anon" className="text-sm">Submit anonymously</label>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button className="px-3 py-1.5 border rounded" onClick={onClose}>Cancel</button>
            <button className="px-3 py-1.5 rounded bg-slate-900 text-white" onClick={saveLocal}>Save locally</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================== ADMIN PANEL (RIGHT SLIDE-OUT) ============================== */
function AdminPanel({ open, onClose }){
  const { approved, setApproved, contributors, setContributors } = useData();
  const [tab, setTab] = useState("All");

  const submissions = useMemo(()=> {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.submissions)||"[]"); } catch { return []; }
  }, [open]);

  const [rows, setRows] = useState(submissions);
  useEffect(()=> setRows(submissions), [submissions]);

  function approve(item){
    const next = { ...(approved||{}) };
    const cat = normalizeCategory(item.category);
    next[cat] = [...(next[cat]||[]), mapSubmissionToDataset(item)];
    setApproved(next);
    const remain = rows.filter(r=> r.id!==item.id);
    setRows(remain);
    localStorage.setItem(LS_KEYS.submissions, JSON.stringify(remain));
    if (item.contributor && item.contributor !== "Anonymous") {
      const set = new Set(contributors);
      set.add(item.contributor);
      setContributors(Array.from(set).sort());
    }
  }
  function reject(item){
    const remain = rows.filter(r=> r.id!==item.id);
    setRows(remain);
    localStorage.setItem(LS_KEYS.submissions, JSON.stringify(remain));
  }
  function exportAll(){
    const blob = new Blob([JSON.stringify({
      pending: rows,
      approved: approved||{},
      contributors
    }, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "religious-visualizer-export.json"; a.click();
    URL.revokeObjectURL(url);
  }
  function clearPending(){
    if (!window.confirm("Clear all pending submissions?")) return;
    setRows([]);
    localStorage.setItem(LS_KEYS.submissions, "[]");
  }
  function addContributor(){
    const name = prompt("Contributor name to add:");
    if (!name) return;
    const set = new Set(contributors);
    set.add(name);
    setContributors(Array.from(set).sort());
  }
  function removeContributor(n){
    if (!window.confirm(`Remove contributor "${n}"?`)) return;
    setContributors(contributors.filter(x=>x!==n));
  }

  const tabs = ["All","Contradiction","Science","Immorality","Religion","Legal","Global","Other"];
  const filtered = rows.filter(r=> tab==="All" || r.category===tab);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white border-l shadow-xl transition-transform duration-300 ${open?"translate-x-0":"translate-x-full"}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Admin Review</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-xl">&times;</button>
        </div>

        <div className="p-3 border-b flex flex-wrap gap-2">
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`text-sm px-2 py-1 rounded border ${tab===t? "bg-slate-900 text-white border-slate-900":"bg-white hover:bg-slate-100"}`}>{t}</button>
          ))}
        </div>

        <div className="p-3 space-y-2 overflow-y-auto h-[calc(100%-220px)]">
          {filtered.map(item=>(
            <div key={item.id} className="border rounded-lg p-3">
              <div className="text-xs text-slate-500">{item.category} • {new Date(item.createdAt).toLocaleString()}</div>
              <div className="font-medium">{item.title}</div>
              {item.contributor ? (
                <div className="text-xs text-slate-600">Contributor: {item.contributor}{item.contributor==="Anonymous" ? " (visible to admin)" : ""}</div>
              ) : <div className="text-xs text-slate-400">No contributor name</div>}
              {item.refs && <div className="text-sm mt-1"><span className="font-medium">Refs:</span> {item.refs}</div>}
              {item.summary && <div className="text-sm mt-1">{item.summary}</div>}
              {item.detail && <div className="text-xs mt-1 text-slate-600">{item.detail}</div>}
              {item.sources && <div className="text-xs mt-1 text-slate-500">Sources: {item.sources}</div>}
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 text-sm rounded bg-emerald-600 text-white" onClick={()=>approve(item)}>Approve</button>
                <button className="px-2 py-1 text-sm rounded border" onClick={()=>reject(item)}>Reject</button>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="text-sm text-slate-500">No pending items.</div>}
        </div>

        <div className="p-3 border-t space-y-3">
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded border" onClick={exportAll}>Export All (one JSON)</button>
            <button className="px-3 py-1.5 rounded border" onClick={clearPending}>Clear Pending</button>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium mb-2">Contributors (names only)</div>
            <div className="flex flex-wrap gap-2 mb-2">
              <button className="px-2 py-1 text-sm rounded border" onClick={addContributor}>Add</button>
            </div>
            <ul className="text-sm">
              {contributors.map(n=>(
                <li key={n} className="flex items-center justify-between border-b py-1">
                  <span>{n}</span>
                  <button className="text-xs text-red-600" onClick={()=>removeContributor(n)}>Remove</button>
                </li>
              ))}
              {contributors.length===0 && <li className="text-slate-500">No names yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

function normalizeCategory(cat){
  const m = {
    "Contradiction":"contradictions",
    "Science":"science",
    "Immorality":"immorality",
    "Religion":"religions",
    "Legal":"legal",
    "Global":"global",
    "Other":"other"
  };
  return m[cat] || "other";
}

function mapSubmissionToDataset(sub){
  if (sub.category==="Contradiction"){
    const parts = (sub.refs||"").split(/[\n;]+/).map(s=>s.trim()).filter(Boolean);
    const verseA = parts[0] ? parseRef(parts[0]) : {ref:"?", book:"?", canon:"Bible"};
    const verseB = parts[1] ? parseRef(parts[1]) : {ref:"?", book:"?", canon:"Bible"};
    return { id: sub.id, type:"narrative", topic: sub.title, verseA, verseB, summary: sub.summary||"", detail: sub.detail||"" };
  }
  if (sub.category==="Science"){
    return { id: sub.id, story: sub.title, refs: (sub.refs||"").split(/[\n;]+/).map(s=>s.trim()).filter(Boolean), summary: sub.summary||"", mechanisms:{ laws:[], why:[sub.detail||""], observations:[] } };
  }
  if (sub.category==="Immorality"){
    return { id: sub.id, category: sub.title, ref: sub.refs||"", canon:"Bible", commanded:false, estCount:null, note: sub.detail||"" };
  }
  if (sub.category==="Religion"){
    return { name: sub.title, family:"(submitted)", text:"-", coreTenets:[sub.summary||""], adherentsM:null, subgroups:[] };
  }
  if (sub.category==="Legal"){
    const parts = (sub.refs||"").split(/[,;]+/);
    return { groupName: sub.title, country: (parts[0]||"").trim(), year: Number((parts[1]||"").trim())||null, allegedOffenseType: sub.summary||"", outcome: sub.detail||"" };
  }
  return { id: sub.id, title: sub.title, refs: sub.refs||"", summary: sub.summary||"", detail: sub.detail||"" };
}

function parseRef(s){
  const canon = /nephi|mormon|alma|ether|mosiah|helaman|moroni/i.test(s) ? "BoM" : "Bible";
  return { ref: s, book: (s.match(/^[1-4]?\s?[A-Za-z]+/i)?.[0]||"?"), canon };
}

/* ============================== VIEWS ============================== */
function NetworkView(){
  const { merged } = useData();
  const [q, setQ] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [corpus, setCorpus] = useState("all"); // all|Bible|BoM|Cross
  const [timeline, setTimeline] = useState("all"); // all|OT|NT|BoM
  const hostRef = useRef(null);
  const [loadError, setLoadError] = useState("");

  const rows = merged.contradictions;

  const filtered = useMemo(()=> rows.filter((r)=>{
    if (topicFilter!=="all" && r.topic!==topicFilter) return false;
    if (corpus!=="all" && relationOf(r)!==corpus) return false;

    if (timeline!=="all"){
      const ai = bookIndex(r.verseA.book), bi = bookIndex(r.verseB.book);
      const inOT = ai < BOOK_ORDER.indexOf("Matthew") && bi < BOOK_ORDER.indexOf("Matthew");
      const inNT = ai >= BOOK_ORDER.indexOf("Matthew") && ai <= BOOK_ORDER.indexOf("Revelation")
                && bi >= BOOK_ORDER.indexOf("Matthew") && bi <= BOOK_ORDER.indexOf("Revelation");
      const inBoM = r.verseA.canon==="BoM" && r.verseB.canon==="BoM";
      if (timeline==="OT" && !inOT) return false;
      if (timeline==="NT" && !inNT) return false;
      if (timeline==="BoM" && !inBoM) return false;
    }
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (r.topic||"").toLowerCase().includes(s) ||
      (r.verseA?.ref||"").toLowerCase().includes(s) ||
      (r.verseB?.ref||"").toLowerCase().includes(s) ||
      (r.summary||"").toLowerCase().includes(s) ||
      (r.detail||"").toLowerCase().includes(s)
    );
  }), [rows, topicFilter, corpus, timeline, q]);

  useEffect(()=>{
    let cancelled = false;
    import("d3").then((d3)=>{
      if (cancelled) return;
      const el = hostRef.current; if (!el) return;
      const width = el.clientWidth || 960; const height = 520; const margin = 24;

      const topicSet = Array.from(new Set(filtered.map(r=>r.topic)));
      const color = d3.scaleOrdinal(d3.schemeTableau10).domain(topicSet);

      const nmap = new Map(); const links = [];
      filtered.forEach(row=>{
        const a = row.verseA?.ref || "?"; const b = row.verseB?.ref || "?";
        if (!nmap.has(a)) nmap.set(a, { id:a, topic:row.topic });
        if (!nmap.has(b)) nmap.set(b, { id:b, topic:row.topic });
        links.push({ source:a, target:b, row });
      });
      const nodes = Array.from(nmap.values());

      const root = d3.select(el); root.selectAll("svg").remove();
      const svg = root.append("svg").attr("width","100%").attr("height",height).attr("viewBox",`0 0 ${width} ${height}`);
      const g = svg.append("g");

      const zoom = d3.zoom().scaleExtent([0.5, 4]).on("zoom", ev => g.attr("transform", ev.transform));
      svg.call(zoom);

      const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d=>d.id).distance(140))
        .force("charge", d3.forceManyBody().strength(-320"))
        .force("center", d3.forceCenter(width/2, height/2))
        .force("collide", d3.forceCollide(18));

      const link = g.append("g").attr("stroke","#cbd5e1").attr("stroke-opacity",0.9)
        .selectAll("line").data(links).join("line").attr("stroke-width",1.4);

      const drag = d3.drag()
        .on("start",(ev,d)=>{ if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag",(ev,d)=>{ d.fx = clamp(ev.x, margin, width-margin); d.fy = clamp(ev.y, margin, height-margin); })
        .on("end",(ev,d)=>{ if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });

      const node = g.append("g").selectAll("g").data(nodes).join("g").call(drag);
      node.append("circle").attr("r",12).attr("fill",d=>color(d.topic)).attr("stroke","#0f172a").attr("stroke-opacity",0.1);
      node.append("text").text(d=>d.id).attr("x",16).attr("y",4).attr("font-size",11);

      sim.on("tick", ()=>{
        link.attr("x1", d=>clamp(d.source.x, margin, width-margin))
            .attr("y1", d=>clamp(d.source.y, margin, height-margin))
            .attr("x2", d=>clamp(d.target.x, margin, width-margin))
            .attr("y2", d=>clamp(d.target.y, margin, height-margin));
        node.attr("transform", d=>`translate(${clamp(d.x, margin, width-margin)},${clamp(d.y, margin, height-margin)})`);
      });

      function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
      return ()=>sim.stop();
    }).catch(err=> setLoadError(err?.message||"Failed to load d3"));
    return ()=>{ cancelled = true; };
  }, [filtered]);

  const topics = useMemo(()=> Array.from(new Set(rows.map(r=>r.topic))).sort(), [rows]);

  return (
    <Card title="Contradictions Network" right={
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search..." className="border rounded p-1" />
        <select value={topicFilter} onChange={(e)=>setTopicFilter(e.target.value)} className="border rounded p-1">
          <option value="all">All topics</option>
          {topics.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={corpus} onChange={(e)=>setCorpus(e.target.value)} className="border rounded p-1">
          <option value="all">All corpora</option>
          <option value="Bible">Bible</option>
          <option value="BoM">Book of Mormon</option>
          <option value="Cross">Bible ↔ BoM</option>
        </select>
        <select value={timeline} onChange={(e)=>setTimeline(e.target.value)} className="border rounded p-1">
          <option value="all">All timeline</option>
          <option value="OT">OT</option>
          <option value="NT">NT</option>
          <option value="BoM">BoM</option>
        </select>
      </div>
    }>
      <div className="text-xs text-slate-500 mb-2">Nodes are clamped within bounds; zoom with wheel/trackpad; drag to rearrange.</div>
      <div ref={hostRef} className="w-full border rounded-xl overflow-hidden bg-slate-25" />
      {loadError && <div className="text-red-600 text-sm mt-2">{loadError}</div>}
    </Card>
  );
}

function MatrixView(){
  const { merged } = useData();
  const rows = merged.contradictions;
  const [bookFilter, setBookFilter] = useState("all");
  const filtered = useMemo(()=> rows.filter(r=> bookFilter==="all" || r.verseA.book===bookFilter || r.verseB.book===bookFilter), [rows, bookFilter]);
  const books = useMemo(()=> Array.from(new Set(rows.flatMap(r=>[r.verseA.book, r.verseB.book]))).filter(Boolean).sort((a,b)=>bookIndex(a)-bookIndex(b)), [rows]);

  return (
    <Card title="Contradictions Matrix" right={
      <select value={bookFilter} onChange={(e)=>setBookFilter(e.target.value)} className="border rounded p-1">
        <option value="all">All books</option>{books.map(b=> <option key={b} value={b}>{b}</option>)}
      </select>
    }>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">Topic</th><th>Verse A</th><th>Verse B</th><th>Summary</th></tr></thead>
        <tbody>
          {filtered.map(r=>(
            <tr key={r.id} className="border-b hover:bg-slate-50">
              <td className="py-2 font-medium">{r.topic}</td>
              <td>{r.verseA.ref}</td>
              <td>{r.verseB.ref}</td>
              <td className="text-slate-600">{r.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ImmoralityView(){
  const { merged } = useData();
  const rows = merged.immorality;
  const counts = useMemo(()=> rows.reduce((m,r)=>{m[r.category]=(m[r.category]||0)+1; return m;},{}),[rows]);
  return (
    <Card title="Examples of Immorality (by narrative)">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Items</div>
          <ul className="list-disc pl-5 space-y-1">
            {rows.map(r=> <li key={r.id}><span className="font-medium">{r.category}</span> — {r.ref} {r.commanded?"(commanded)":""} <span className="text-slate-500">{r.note}</span></li>)}
          </ul>
        </div>
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Counts by Category</div>
          <ul className="space-y-1 text-sm">{Object.entries(counts).map(([k,v])=> <li key={k}><span className="font-medium">{k}:</span> {v}</li>)}</ul>
        </div>
      </div>
    </Card>
  );
}

function ScienceView(){
  const { merged } = useData();
  const rows = merged.science;
  return (
    <Card title="Scientific Inaccuracies & Why They Conflict with Natural Laws">
      <div className="space-y-3">
        {rows.map(s=>(
          <div key={s.id} className="border rounded-lg p-3">
            <div className="font-semibold">{s.story}</div>
            <div className="text-sm">Refs: {s.refs.join(", ")}</div>
            <div className="text-sm mt-1">{s.summary}</div>
            <div className="grid md:grid-cols-3 gap-2 mt-2 text-sm">
              <div><div className="font-medium">Laws</div><ul className="list-disc pl-5">{(s.mechanisms?.laws||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
              <div><div className="font-medium">Why</div><ul className="list-disc pl-5">{(s.mechanisms?.why||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
              <div><div className="font-medium">Observations</div><ul className="list-disc pl-5">{(s.mechanisms?.observations||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReligionsView(){
  const { merged } = useData();
  const [open, setOpen] = useState({});
  const tree = merged.religionsTree;

  return (
    <Card title="World Religions (expandable branches)">
      <ul className="space-y-2">
        {tree.map((n, idx)=>{
          const key = n.name+"_"+idx; const isOpen = !!open[key];
          return (
            <li key={key} className="border rounded p-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{n.name} <span className="text-xs text-slate-500">({n.family})</span></div>
                  <div className="text-xs">Text: {n.text} • Core tenets: {Array.isArray(n.coreTenets)? n.coreTenets.join(", ") : "-"}</div>
                  <div className="text-xs text-slate-500">Approx adherents (M): {n.adherentsM ?? "-"}</div>
                </div>
                {Array.isArray(n.subgroups) && n.subgroups.length>0 && (
                  <button onClick={()=>setOpen({...open, [key]:!isOpen})} className="text-xs px-2 py-1 border rounded">
                    {isOpen?"Collapse":"Expand"}
                  </button>
                )}
              </div>
              {isOpen && (
                <ul className="mt-2 pl-5 list-disc text-sm">
                  {n.subgroups.map((s,i)=> <li key={i}>{s.name}{s.adherentsM?` — ${s.adherentsM}M`:""}</li>)}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function GlobalCountsView(){
  const { merged } = useData();
  return (
    <Card title="Global Overview">
      <div className="grid md:grid-cols-3 gap-3">
        <Stat label="Contradictions" value={merged.contradictions.length}/>
        <Stat label="Immorality examples" value={merged.immorality.length}/>
        <Stat label="Science entries" value={merged.science.length}/>
      </div>
      <div className="text-xs text-slate-500 mt-2">Add more via Admin → Approve, or import later if you choose.</div>
    </Card>
  );
}
function Stat({label, value}){ return (
  <div className="border rounded-lg p-4 text-center">
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm text-slate-600">{label}</div>
  </div>
);}

function LegalCasesView(){
  const { merged } = useData();
  const rows = merged.legal;
  return (
    <Card title="Religious Legal Landscape">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b"><th className="py-2">Group</th><th>Country</th><th>Year</th><th>Type</th><th>Outcome</th></tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-b hover:bg-slate-50">
              <td className="py-2">{r.groupName}</td>
              <td>{r.country}</td>
              <td>{r.year}</td>
              <td>{r.allegedOffenseType}</td>
              <td className="text-slate-600">{r.outcome}</td>
            </tr>
          ))}
          {rows.length===0 && <tr><td colSpan="5" className="py-6 text-center text-slate-500">No rows.</td></tr>}
        </tbody>
      </table>
    </Card>
  );
}

function ContributorsHidden(){
  const { contributors } = useData();
  return (
    <Card title="Contributors (hidden page)">
      <ul className="list-disc pl-5">
        {contributors.map((n,i)=> <li key={i}>{n}</li>)}
        {contributors.length===0 && <li className="text-slate-500">No names yet.</li>}
      </ul>
      <div className="text-xs text-slate-500 mt-2">This page is hidden by default. Access with <code>?contributors=1</code>.</div>
    </Card>
  );
}

function Card({ title, children, right }){
  return (
    <section className="bg-white border rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
