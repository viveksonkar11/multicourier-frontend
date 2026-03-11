import React from "react";
import "./Features.css";

function Features() {
  const stats = [
    { number: "200,000+", label: "DAILY SHIPMENTS" },
    { number: "6,500+", label: "FRANCHISES" },
    { number: "10,000+", label: "EXPERTS" },
    { number: "17,000+", label: "PIN CODES" }
  ];

  return (
    <section className="compact-stats-only">
      <div className="stats-inline-wrapper">
        {stats.map((stat, index) => (
          <div className="stat-block" key={index}>
            <h3 className="stat-blue-text">{stat.number}</h3>
            <span className="stat-label-gray">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;