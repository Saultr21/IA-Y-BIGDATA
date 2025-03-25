// Función para validar el formulario
function validateForm() {
    const fileInput = document.getElementById('inputGroupFile02');
    const errorAlert = document.getElementById('error-no-file');
    
    if (fileInput.files.length === 0) {
        errorAlert.style.display = 'block';
        return false;
    }
    
    return true;
}

// Cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Limpiar mensaje de error cuando se selecciona un archivo
    const fileInput = document.getElementById('inputGroupFile02');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            document.getElementById('error-no-file').style.display = 'none';
        });
    }
    
    // Inicializar el gráfico si existe el elemento
    const chartCanvas = document.getElementById('prediccionChart');
    if (chartCanvas) {
        // Comprobar si existen las variables necesarias
        if (typeof confianzas === 'undefined') {
            console.warn("Variable 'confianzas' no definida");
            confianzas = [0, 0, 0, 0, 0, 0];
        }
        
        if (typeof labels === 'undefined') {
            console.warn("Variable 'labels' no definida");
            labels = [
                'Adeno. de colon', 
                'Colon benigno', 
                'Carc. escamoso\npulmonar', 
                'Adeno. pulmonar', 
                'Tejido pulm.\nbenigno', 
                'Otros'
            ];
        }
        
        const ctx = chartCanvas.getContext('2d');
        var chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: confianzas,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',    // Rojo para adenocarcinoma de colon
                        'rgba(255, 205, 86, 0.7)',    // Amarillo para colon benigno
                        'rgba(54, 162, 235, 0.7)',    // Azul para carcinoma escamoso pulmonar
                        'rgba(153, 102, 255, 0.7)',   // Morado para adenocarcinoma pulmonar
                        'rgba(75, 192, 192, 0.7)',    // Verde azulado para tejido pulmonar benigno
                        'rgba(201, 203, 207, 0.7)'    // Gris para otros
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(201, 203, 207, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 10  // Aumentar padding inferior
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.raw.toFixed(1) + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Confianza'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Clasificación'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
});