function destroyChart(canvas) {
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
}

function formatNumber(value) {
    return value.toLocaleString();
}

export function createPieChart(canvas, legitCount, phishCount) {
    if (!canvas) return;
    destroyChart(canvas);
    return new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Legitimate', 'Phishing'],
            datasets: [{
                data: [legitCount, phishCount],
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: '#0a0a1a',
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            cutout: '58%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ${ctx.parsed} scans`
                    }
                }
            }
        }
    });
}

export function createDoughnutChart(canvas, labels, values) {
    if (!canvas) return;
    destroyChart(canvas);
    return new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'],
                borderColor: '#0a0a1a',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            cutout: '65%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'bottom', labels: { color: '#d1d5db' } },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` } }
            }
        }
    });
}

export function createLineChart(canvas, labels, values) {
    if (!canvas) return;
    destroyChart(canvas);
    return new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Scan Volume',
                data: values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.18)',
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#ffffff',
                pointRadius: 4,
                tension: 0.35,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(148, 163, 184, 0.12)' } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(148, 163, 184, 0.12)' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

export function createBarChart(canvas, labels, values) {
    if (!canvas) return;
    destroyChart(canvas);
    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Threat Categories',
                data: values,
                backgroundColor: labels.map(label => {
                    if (label.includes('Spoof')) return '#f97316';
                    if (label.includes('Keyword')) return '#facc15';
                    if (label.includes('Shortener')) return '#06b6d4';
                    if (label.includes('HTTPS')) return '#22c55e';
                    return '#8b5cf6';
                }),
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#d1d5db' }, grid: { display: false } },
                y: { ticks: { color: '#d1d5db' }, grid: { color: 'rgba(148, 163, 184, 0.12)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

export function createFeatureChart(canvas, labels, values) {
    if (!canvas) return;
    destroyChart(canvas);
    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Feature Importance',
                data: values,
                backgroundColor: 'rgba(99,102,241,0.8)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 10,
                maxBarThickness: 30
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#d1d5db' }, grid: { color: 'rgba(148, 163, 184, 0.12)' } },
                y: { ticks: { color: '#d1d5db' }, grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

export function renderLegend(container, legitCount, phishCount) {
    if (!container) return;
    container.innerHTML = `
        <div class="legend-item">
            <span class="legend-dot" style="background:#10b981"></span>
            <span>Legitimate (${formatNumber(legitCount)})</span>
        </div>
        <div class="legend-item">
            <span class="legend-dot" style="background:#ef4444"></span>
            <span>Phishing (${formatNumber(phishCount)})</span>
        </div>
    `;
}
