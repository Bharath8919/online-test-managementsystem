(function() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const root = document.documentElement;

    if (currentTheme === 'dark') {
        root.classList.add('dark-mode');
    }

    function updateChartColors(isDark) {
        if (typeof Chart !== 'undefined') {
            const color = isDark ? '#e0e0e0' : '#666';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            
            Chart.defaults.color = color;
            Chart.defaults.borderColor = gridColor;
            
            // Update existing charts
            Chart.instances && Object.values(Chart.instances).forEach(chart => {
                chart.options.scales && Object.values(chart.options.scales).forEach(scale => {
                    scale.ticks.color = color;
                    scale.grid.color = gridColor;
                });
                chart.update();
            });
        }
    }

    // Handle UI components once DOM is ready
    window.addEventListener('DOMContentLoaded', () => {
        const checkbox = document.querySelector('#checkbox');
        if (checkbox) {
            checkbox.checked = (currentTheme === 'dark');
            updateChartColors(checkbox.checked);
            checkbox.addEventListener('change', function() {
                const isDark = this.checked;
                if (isDark) {
                    root.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                } else {
                    root.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                }
                updateChartColors(isDark);
            });
        }
    });
})();
