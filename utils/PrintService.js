export default {
  imprimir(titulo, contenidoHtml) {
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${titulo}</title>
          <style>
            /* Reset básico para evitar márgenes extraños en impresión */
            * {
              box-sizing: border-box;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10pt;
              margin: 0;
              padding: 0;
            }
            
            /* Estilos específicos para visualización previa (browser) */
            @media screen {
              body {
                background: #e0e0e0;
                padding-bottom: 50px;
              }
              .report-container-print {
                background: white;
                width: 297mm; /* Landscape A4 approx */
                min-height: 210mm;
                margin: 20px auto;
                padding: 15mm;
                box-shadow: 0 0 10px rgba(0,0,0,0.2);
              }
            }

            /* Estilos de botones que NO se imprimen */
            .print-btn-container {
              display: flex;
              justify-content: center;
              gap: 15px;
              padding: 15px;
              background: #343a40;
              position: sticky;
              top: 0;
              z-index: 9999;
            }
            
            @media print {
              .print-btn-container {
                display: none !important;
              }
              body {
                background: white;
              }
              .report-container-print {
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
              }
            }

            .btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-weight: 500;
              padding: 8px 20px;
              border-radius: 6px;
              cursor: pointer;
              border: none;
              font-size: 14px;
              transition: all 0.2s;
              text-decoration: none;
            }
            .btn-primary {
              background-color: #007bff;
              color: white;
            }
            .btn-primary:hover {
              background-color: #0056b3;
            }
            .btn-secondary {
              background-color: #6c757d;
              color: white;
            }
            .btn-secondary:hover {
              background-color: #5a6268;
            }
          </style>
          <script>
            function doPrint() {
              window.print();
            }
            window.onafterprint = function() {
              // No cerramos automáticamente para permitir que el usuario vea si quedó bien
            };
          <\/script>
        </head>
        <body>
          <div class="print-btn-container">
            <button onclick="doPrint()" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              </svg>
              Imprimir Reporte
            </button>
            <button onclick="window.close()" class="btn btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
              </svg>
              Cerrar
            </button>
          </div>
          <div class="report-container-print">
            ${contenidoHtml}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    if (newWindow) {
      newWindow.focus();
    }
  }
}
