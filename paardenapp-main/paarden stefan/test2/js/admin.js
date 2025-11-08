document.addEventListener("DOMContentLoaded", () => {
  const barCtx = document.getElementById("barChart");
  const donutCtx = document.getElementById("donutChart");

  if (!barCtx || !donutCtx) {
    console.error("Canvas-elementen niet gevonden.");
    return;
  }

  // === Staafgrafiek: Klanten & Inkomsten ===
  new Chart(barCtx.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
      datasets: [
        {
          label: "Klanten",
          data: [3, 5, 8, 12, 15, 18, 21, 25, 27, 30, 33, 35],
          backgroundColor: "rgba(78, 115, 223, 0.8)",
          borderRadius: 5,
        },
        {
          label: "Inkomsten (€)",
          data: [400, 550, 700, 950, 1200, 1450, 1600, 1800, 2100, 2300, 2500, 2700],
          backgroundColor: "rgba(28, 200, 138, 0.8)",
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // === Donutgrafiek: Modules in gebruik ===
  new Chart(donutCtx.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Paarden", "Stallen", "Trainingen", "Contracten", "Voeding"],
      datasets: [
        {
          data: [85, 70, 40, 50, 30],
          backgroundColor: [
            "rgba(78, 115, 223, 0.9)",
            "rgba(28, 200, 138, 0.9)",
            "rgba(54, 185, 204, 0.9)",
            "rgba(246, 194, 62, 0.9)",
            "rgba(231, 74, 59, 0.9)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
});
