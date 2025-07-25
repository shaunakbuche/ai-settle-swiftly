import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, title, filename } = await req.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data provided for export');
    }

    // Generate HTML content for PDF
    const headers = Object.keys(data[0]);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              color: #2563eb;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .export-date {
              color: #666;
              font-size: 12px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(header => {
                    let value = row[header];
                    if (value === null || value === undefined) value = '';
                    if (typeof value === 'object') value = JSON.stringify(value);
                    return `<td>${String(value)}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="export-date">
            Exported on: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    // For now, return the HTML content as a downloadable file
    // In a production environment, you would use a PDF generation service
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    return new Response(JSON.stringify({ 
      success: true,
      url: `data:text/html;base64,${btoa(htmlContent)}`,
      message: 'HTML export ready (PDF generation requires additional setup)'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Export failed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});