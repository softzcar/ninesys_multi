export default {
  imprimir(titulo, contenidoHtml) {
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${titulo}</title>
          <style>
            @page {
              size: portrait;
              margin: 0.5in;
            }
            body {
              font-family: Verdana, sans-serif;
              font-size: 9pt;
            }
            .report-container {
              color: #000;
            }
            .report-header {
              text-align: center;
              margin-bottom: 1rem;
            }
            .report-header h1, .report-header h2 {
              margin: 0;
            }
            .report-info {
              text-align: left;
              margin-top: 1rem;
              display: inline-block;
            }
            .report-info p {
              margin: 0.1rem 0;
              font-size: 9pt;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1rem;
            }
            .report-table th, .report-table td {
              border: 1px solid #ccc;
              padding: 2px;
              text-align: left;
              font-size: 8pt;
            }
            .report-table th {
              background-color: #f2f2f2;
            }

            /* Estilos específicos para impresión */
            .no-print {
              display: none;
            }
            @media print {
              .no-print {
                display: none;
              }
              .print-btn-container {
                display: none !important;
              }
            }

            /* Estilos tipo Bootstrap para los botones */
            .btn {
              display: inline-block;
              font-weight: 400;
              color: #212529;
              text-align: center;
              vertical-align: middle;
              user-select: none;
              background-color: transparent;
              border: 1px solid transparent;
              padding: 0.375rem 0.75rem;
              font-size: 1rem;
              line-height: 1.5;
              border-radius: 0.25rem;
              transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
              cursor: pointer;
              margin: 0 5px;
            }
            .btn-primary {
              color: #fff;
              background-color: #007bff;
              border-color: #007bff;
            }
            .btn-primary:hover {
              background-color: #0069d9;
              border-color: #0062cc;
            }
            .btn-secondary {
              color: #fff;
              background-color: #6c757d;
              border-color: #6c757d;
            }
            .btn-secondary:hover {
              background-color: #5a6268;
              border-color: #545b62;
            }
            .d-flex {
              display: flex !important;
            }
            .justify-content-center {
              justify-content: center !important;
            }
            .align-items-center {
              align-items: center !important;
            }
          </style>
          <script>
            function doPrint() {
              window.print();
            }
            
            // Detectar cuando termina la impresión (o se cancela el diálogo) para cerrar la ventana
            window.onafterprint = function() {
              window.close();
            };
          <\/script>
        </head>
        <body>
          <div class="print-btn-container d-flex justify-content-center align-items-center" style="padding: 20px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; margin-bottom: 20px;">
            <button onclick="doPrint()" class="btn btn-primary d-flex align-items-center">
              <!-- Icono SVG de Impresora (Bootstrap Icons) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer-fill" viewBox="0 0 16 16" style="margin-right: 8px;">
                <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              </svg>
              Imprimir Recibo
            </button>
            
            <button onclick="window.close()" class="btn btn-secondary d-flex align-items-center">
              <!-- Icono SVG de X (Bootstrap Icons) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16" style="margin-right: 8px;">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
              </svg>
              Cancelar
            </button>
          </div>
          ${contenidoHtml}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    if (newWindow) {
      newWindow.opener = null;
      newWindow.focus();
    }
  }
}
