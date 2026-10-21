"use client";

import { useEffect, useMemo, useState } from "react";

type Race = {
  round: string;
  raceName: string;
  circuit: string;
  date: string;
  time?: string;
  country: string;
};

const fallbackRaces: Race[] = [
  { round: "01", raceName: "Australian Grand Prix", circuit: "Albert Park Grand Prix Circuit", date: "2026-03-08", country: "Australia" },
  { round: "02", raceName: "Chinese Grand Prix", circuit: "Shanghai International Circuit", date: "2026-03-15", country: "China" },
  { round: "03", raceName: "Japanese Grand Prix", circuit: "Suzuka International Racing Course", date: "2026-03-29", country: "Japan" },
  { round: "04", raceName: "Bahrain Grand Prix", circuit: "Bahrain International Circuit", date: "2026-04-12", country: "Bahrain" },
  { round: "05", raceName: "Saudi Arabian Grand Prix", circuit: "Jeddah Corniche Circuit", date: "2026-04-19", country: "Saudi Arabia" },
  { round: "06", raceName: "Miami Grand Prix", circuit: "Miami International Autodrome", date: "2026-05-03", country: "United States" },
  { round: "07", raceName: "Canadian Grand Prix", circuit: "Circuit Gilles-Villeneuve", date: "2026-05-24", country: "Canada" },
  { round: "08", raceName: "Monaco Grand Prix", circuit: "Circuit de Monaco", date: "2026-06-07", country: "Monaco" },
  { round: "09", raceName: "Barcelona-Catalunya Grand Prix", circuit: "Circuit de Barcelona-Catalunya", date: "2026-06-14", country: "Spain" },
  { round: "10", raceName: "Austrian Grand Prix", circuit: "Red Bull Ring", date: "2026-06-28", country: "Austria" },
  { round: "11", raceName: "British Grand Prix", circuit: "Silverstone Circuit", date: "2026-07-05", country: "United Kingdom" },
  { round: "12", raceName: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", date: "2026-07-19", country: "Belgium" },
  { round: "13", raceName: "Hungarian Grand Prix", circuit: "Hungaroring", date: "2026-07-26", country: "Hungary" },
  { round: "14", raceName: "Dutch Grand Prix", circuit: "Circuit Zandvoort", date: "2026-08-23", country: "Netherlands" },
  { round: "15", raceName: "Italian Grand Prix", circuit: "Autodromo Nazionale Monza", date: "2026-09-06", country: "Italy" },
  { round: "16", raceName: "Azerbaijan Grand Prix", circuit: "Baku City Circuit", date: "2026-09-26", country: "Azerbaijan" },
  { round: "17", raceName: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", date: "2026-10-11", country: "Singapore" },
  { round: "18", raceName: "United States Grand Prix", circuit: "Circuit of The Americas", date: "2026-10-25", country: "United States" },
  { round: "19", raceName: "Mexico City Grand Prix", circuit: "Autódromo Hermanos Rodríguez", date: "2026-11-01", country: "Mexico" },
  { round: "20", raceName: "São Paulo Grand Prix", circuit: "Autódromo José Carlos Pace", date: "2026-11-08", country: "Brazil" },
  { round: "21", raceName: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", date: "2026-11-21", country: "United States" },
  { round: "22", raceName: "Qatar Grand Prix", circuit: "Lusail International Circuit", date: "2026-11-29", country: "Qatar" },
  { round: "23", raceName: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", date: "2026-12-06", country: "United Arab Emirates" }
];

type Driver = { position: string; name: string; team: string; points: string };

export default function Home() {
  const [tab, setTab] = useState("Overview");
  const [races, setRaces] = useState<Race[]>(fallbackRaces);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [constructors, setConstructors] = useState<Driver[]>([]);
  const [dataStatus, setDataStatus] = useState("Calendar preview");
  const [query, setQuery] = useState("");
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("https://api.jolpi.ca/ergast/f1/2026/races/?limit=100");
        if (!res.ok) throw new Error("calendar unavailable");
        const json = await res.json();
        const list = json?.MRData?.RaceTable?.Races;
        if (Array.isArray(list) && list.length && alive) {
          setRaces(list.map((r: any) => ({
            round: String(r.round).padStart(2, "0"),
            raceName: r.raceName,
            circuit: r.Circuit?.circuitName ?? "Circuit details unavailable",
            date: r.date,
            time: r.time,
            country: r.Circuit?.Location?.country ?? ""
          })));
          setDataStatus("Calendar API connected");
        }
      } catch {
        if (alive) setDataStatus("Preview calendar · API unavailable");
      }
      try {
        const res = await fetch("https://api.jolpi.ca/ergast/f1/2026/driverStandings/");
        if (res.ok) {
          const json = await res.json();
          const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
          if (alive) setDrivers(list.map((x: any) => ({
            position: String(x.position),
            name: `${x.Driver?.givenName ?? ""} ${x.Driver?.familyName ?? ""}`.trim(),
            team: x.Constructors?.[0]?.name ?? "—",
            points: String(x.points ?? "0")
          })));
        }
      } catch {}
      try {
        const res = await fetch("https://api.jolpi.ca/ergast/f1/2026/constructorStandings/");
        if (res.ok) {
          const json = await res.json();
          const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
          if (alive) setConstructors(list.map((x: any) => ({
            position: String(x.position),
            name: x.Constructor?.name ?? "Unknown team",
            team: "Constructor",
            points: String(x.points ?? "0")
          })));
        }
      } catch {}
    }
    load();
    return () => { alive = false; };
  }, []);

  const nextRace = useMemo(() => {
    const today = new Date();
    return races.find(r => new Date(`${r.date}T23:59:00`) >= today) ?? races[races.length - 1];
  }, [races]);

  const filteredRaces = races.filter(r =>
    `${r.raceName} ${r.circuit} ${r.country}`.toLowerCase().includes(query.toLowerCase())
  );

  const formattedDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });

  return (
    <main className="site-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span><span>APEX<span className="brand-light">F1</span></span></div>
        <div className="side-label">RACE CENTER</div>
        {["Overview", "Race Calendar", "Driver Standings", "Constructor Standings"].map((item, i) => (
          <button key={item} className={`nav-item ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>
            <span className="nav-icon">{["◈", "▦", "♙", "⌁"][i]}</span>{item}
          </button>
        ))}
        <div className="sidebar-bottom">
          <div className="live-dot" />
          <div><strong>TRACKER STATUS</strong><small>{dataStatus}</small></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">MOTORSPORT <span>/</span> {tab.toUpperCase()}</div>
          <div className="season-pill"><span className="season-dot" /> 2026 SEASON</div>
        </header>

        {tab === "Overview" && <>
          <section className="hero">
            <div className="hero-content">
              <div className="eyebrow"><span className="red-line" /> THE HOME OF RACE DAY</div>
              <h1>Every second.<br /><em>Every lap.</em></h1>
              <p>Your Formula 1 season, tracked in one place.</p>
              <button className="primary-btn" onClick={() => setTab("Race Calendar")}>EXPLORE THE CALENDAR <span>↗</span></button>
            </div>
            <div className="hero-number">F1<span>26</span></div>
            <div className="hero-stripe" />
          </section>

          <div className="section-heading"><div><div className="eyebrow muted">UP NEXT</div><h2>Next Grand Prix</h2></div><span className="subtle-tag">ROUND {nextRace?.round ?? "—"}</span></div>
          <div className="next-race-card">
            <div className="race-date-block"><span className="date-month">{nextRace ? formattedDate(nextRace.date).split(" ")[1] : "TBA"}</span><strong>{nextRace ? formattedDate(nextRace.date).split(" ")[0] : "—"}</strong><span>{nextRace ? formattedDate(nextRace.date).split(" ")[2] : "2026"}</span></div>
            <div className="race-main-info"><div className="country-label">{nextRace?.country ?? "FORMULA 1"} GRAND PRIX</div><h3>{nextRace?.raceName ?? "Race schedule unavailable"}</h3><p>{nextRace?.circuit ?? "Circuit information will appear here"}</p></div>
            <div className="race-card-side"><span className="flag-symbol">🏁</span><span className="track-label">RACE WEEKEND</span><button className="text-btn" onClick={() => { setSelectedRace(nextRace ?? null); setTab("Race Calendar"); }}>VIEW DETAILS ↗</button></div>
          </div>

          <div className="section-heading lower-heading"><div><div className="eyebrow muted">SEASON AT A GLANCE</div><h2>Tracker overview</h2></div></div>
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-icon red">▦</span><span className="stat-label">SCHEDULED ROUNDS</span><strong>{races.length || "—"}</strong><small>2026 calendar</small></div>
            <div className="stat-card"><span className="stat-icon blue">♙</span><span className="stat-label">DRIVER STANDINGS</span><strong>{drivers.length || "—"}</strong><small>{drivers.length ? "Drivers returned by API" : "Waiting for standings data"}</small></div>
            <div className="stat-card"><span className="stat-icon gold">⌁</span><span className="stat-label">CONSTRUCTOR TEAMS</span><strong>{constructors.length || "—"}</strong><small>{constructors.length ? "Teams returned by API" : "Waiting for standings data"}</small></div>
          </div>
          <div className="notice"><span>i</span><div><strong>Data transparency</strong><p>Calendar and standings are requested from a public timing-data API. If it is unavailable, the calendar preview is shown and standings are left blank rather than invented.</p></div></div>
        </>}

        {tab === "Race Calendar" && <section className="content-page">
          <div className="eyebrow"><span className="red-line" /> 2026 SEASON</div><h1 className="page-title">Race <em>Calendar</em></h1>
          <p className="page-subtitle">Every round, from lights out to the chequered flag.</p>
          <div className="search-wrap"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Grand Prix, circuit or country..." /></div>
          <div className="race-list">{filteredRaces.map(r => <button className={`calendar-row ${selectedRace?.round === r.round ? "selected" : ""}`} key={`${r.round}-${r.raceName}`} onClick={() => setSelectedRace(r)}>
            <span className="round-num">{r.round}</span><span className="calendar-date">{formattedDate(r.date)}</span><span className="calendar-name"><strong>{r.raceName}</strong><small>{r.circuit} · {r.country}</small></span><span className="row-arrow">↗</span>
          </button>)}</div>
          {filteredRaces.length === 0 && <p className="empty-state">No races match your search.</p>}
          {selectedRace && <div className="notice"><span>✓</span><div><strong>{selectedRace.raceName}</strong><p>{formattedDate(selectedRace.date)} · {selectedRace.circuit} · {selectedRace.country}</p></div></div>}
        </section>}

        {tab === "Driver Standings" && <Standings title="Driver" subtitle="The battle for the World Drivers' Championship." rows={drivers} empty="No driver standings were returned by the data source yet." />}
        {tab === "Constructor Standings" && <Standings title="Constructor" subtitle="The fight for the Constructors' Championship." rows={constructors} empty="No constructor standings were returned by the data source yet." />}

        <footer className="footer"><span>APEX F1 © 2026</span><span>MADE FOR THE LOVE OF RACING <b>●</b></span></footer>
      </section>
    </main>
  );
}

function Standings({ title, subtitle, rows, empty }: { title: string; subtitle: string; rows: Driver[]; empty: string }) {
  return <section className="content-page">
    <div className="eyebrow"><span className="red-line" /> CHAMPIONSHIP</div><h1 className="page-title">{title} <em>Standings</em></h1><p className="page-subtitle">{subtitle}</p>
    {rows.length ? <div className="standings-table"><div className="table-head"><span>POS</span><span>{title.toUpperCase()}</span><span>TEAM</span><span>PTS</span></div>{rows.map(r => <div className="table-row" key={`${r.position}-${r.name}`}><strong className="position">{r.position.padStart(2, "0")}</strong><strong>{r.name}</strong><span className="team-name">{r.team}</span><strong className="points">{r.points}</strong></div>)}</div> : <div className="empty-panel"><span>◌</span><h3>Standings not available</h3><p>{empty}</p><small>Nothing has been filled in with made-up points.</small></div>}
  </section>;
}
