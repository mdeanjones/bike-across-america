import { formatDate } from "./utilities";

const formatter = new Intl.NumberFormat('en-us', { style: 'unit', unit: 'meter' });

function buildInfoWindowContent(pin: typeof window.locationPins[0]) {
  return `
    <div class="p-1">
      <p class="fw-bold mb-1">Checkin ${ pin.idx }</p>
      <p class="text-muted mb-1 text-nowrap">(${ formatDate(pin.time) ?? 'No Timestamp Provided' })</p>

      <table class="table table-striped table-sm mb-0">
        <tbody>
          <tr>
            <th scope="row">Elevation</th>
            <td>${ formatter.format(pin.alt ?? 0) }</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

export default function setupChart() {
  function drawChart() {
    const dataTable = new google.visualization.DataTable();

    dataTable.addColumn('number', 'Distance');
    dataTable.addColumn('number', 'Elevation');
    dataTable.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });

    dataTable.addRows(
      window.locationPins.map(pin => [pin.dist, pin.alt, buildInfoWindowContent(pin)]),
    );

    const options = {
      hAxis: { title: 'Distance', format: 'decimal' },
      vAxis: { title: 'Elevation', format: 'decimal', minValue: 0 },
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
