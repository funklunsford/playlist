import { localDate, longDate } from './day';

export function App() {
  return (
    <main className="page">
      <header className="head">
        <h1>Today</h1>
        <p className="sub">{longDate(localDate())}</p>
      </header>
      <p className="empty">Your playlist is empty.</p>
    </main>
  );
}
