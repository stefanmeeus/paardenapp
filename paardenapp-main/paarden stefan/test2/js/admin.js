document.addEventListener("DOMContentLoaded", () => {
  const clientsCtx = document.getElementById("clientsChart");
  const incomeCtx = document.getElementById("incomeChart");
  const donutCtx = document.getElementById("modulesDonut");

  if (!clientsCtx || !incomeCtx || !donutCtx) {
    console.error("Canvas-elementen niet gevonden.");
    return;
  }

  // === Klanten per maand ===
  new Chart(clientsCtx.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
      datasets: [
        {
          label: "Aantal klanten",
          data: [3, 5, 8, 12, 15, 18, 21, 25, 27, 30, 33, 35],
          backgroundColor: "rgba(78, 115, 223, 0.8)",
          borderColor: "rgba(78, 115, 223, 1)",
          borderWidth: 1,
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      aspectRatio: 2,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 5 } },
      },
    },
  });

  // === Inkomsten per maand ===
  new Chart(incomeCtx.getContext("2d"), {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
      datasets: [
        {
          label: "Inkomsten (€)",
          data: [400, 550, 700, 950, 1200, 1450, 1600, 1800, 2100, 2300, 2500, 2700],
          backgroundColor: "rgba(28, 200, 138, 0.3)",
          borderColor: "rgba(28, 200, 138, 1)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "rgba(28, 200, 138, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      aspectRatio: 2,
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
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      aspectRatio: 1.2,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 15,
            color: "#333",
          },
        },
      },
    },
  });
});
