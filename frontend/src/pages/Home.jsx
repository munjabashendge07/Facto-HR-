import "./Home.css";

function Home() {
  return (
    <div>
      <nav className="navbar">
        <h2>Facto HR</h2>

        <ul>

          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      </nav>

      <section className="hero">
        <h1>Welcome to Facto HR</h1>
        <p>
          Smart Employee Management System for HR Operations,
          Attendance, Leave Management and Payroll.
        </p>

        <button>Get Started</button>
      </section>

      <section className="features">
        <h2>Our Features</h2>

        <div className="cards">

          <div className="card">
            <h3>Employee Management</h3>
            <p>Manage employee records efficiently.</p>
          </div>

          <div className="card">
            <h3>Attendance Tracking</h3>
            <p>Track employee attendance in real time.</p>
          </div>

          <div className="card">
            <h3>Leave Management</h3>
            <p>Approve and manage employee leaves.</p>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Home;