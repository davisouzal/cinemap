import React from "react";

import "../components/Tooltip.css";

const Tooltip = () => (
  <span className="tooltip" style={{ width: "250px", height: "300px", flexShrink: 0 }}>
    <p>
      These movies were suggested by your <span className="font-black">user’s preferences.</span>
    </p>
    <p>A few tips for improving your results are:</p>
    <ul>
      <li>Add movies to your movie library;</li>
      <li>Update your watchlist;</li>
      <li>Rate your movies accordingly.</li>
    </ul>
  </span>
);

export default Tooltip;
