import { formatDate, FEET_PER_METER, METER_PER_MILE } from "./utilities";

const formatter = new Intl.NumberFormat('en-us', { style: 'unit', unit: 'foot' });

function buildInfoWindowContent(pin: typeof window.locationPins[0]) {
  return `
    <div class="p-1">
      <p class="fw-bold mb-1">Checkin ${ pin.idx }</p>
      <p class="text-muted mb-1 text-nowrap">(${ formatDate(pin.time) ?? 'No Timestamp Provided' })</p>

      <table class="table table-striped table-sm mb-0">
        <tbody>
          <tr>
            <th scope="row">Elevation</th>
            <td>${ formatter.format((pin.alt ?? 0) / FEET_PER_METER) }</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

export default function setupChart() {
  function drawChart() {
    const dataTable = new google.visualization.DataTable();

    dataTable.addColumn('number', 'Distance (mi)');
    dataTable.addColumn('number', 'Elevation (ft)');
    dataTable.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });

    let cumulativeDistance = 0;

    for (const pin of window.locationPins) {
      cumulativeDistance += pin.dist ?? 0;
      dataTable.addRow([
        cumulativeDistance * METER_PER_MILE,
        (pin.alt ?? 0) / FEET_PER_METER,
        buildInfoWindowContent(pin),
      ]);
    }

    const options = {
      hAxis: { title: 'Distance (mi)', format: 'decimal' },
      vAxis: { title: 'Elevation (ft)', format: 'decimal', minValue: 0 },
      animation: { duration: 1000, startup: true },
      explorer: { axis: 'horizontal' },
      legend: 'none' as 'none',
      colors: ['orange'],
      tooltip: { isHtml: true },
    };

    const chartEl = document.getElementById('elevationChart');

    if (chartEl) {
      new google.visualization.AreaChart(chartEl).draw(dataTable, options);
    }
  }

  google.charts.load('current', { 'packages':['corechart'] });
  google.charts.setOnLoadCallback(drawChart);
}
