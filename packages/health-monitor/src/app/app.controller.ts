import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('monitor')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html') // 👈 Le decimos al navegador que esto es una página web
  async getDashboard() {
    const results = await this.appService.checkAllServices();
    
    // Generamos las filas de la tabla dinámicamente
    const tableRows = results.map(s => `
      <tr style="background-color: ${s.status === 'UP' ? '#e6ffe6' : '#ffe6e6'};">
        <td style="padding: 10px; border: 1px solid #ddd;">${s.name}</td>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: ${s.status === 'UP' ? 'green' : 'red'};">
          ${s.status === 'UP' ? '🟢 UP' : '🔴 DOWN'}
        </td>
        <td style="padding: 10px; border: 1px solid #ddd;">${s.code}</td>
      </tr>
    `).join('');

    // HTML del Dashboard
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SMART CAMPUS - System Health</title>
        <meta http-equiv="refresh" content="30"> <style>
          body { font-family: Arial, sans-serif; margin: 40px; background-color: #f4f4f9; }
          h1 { color: #333; }
          table { width: 600px; border-collapse: collapse; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          th { background-color: #004080; color: white; padding: 12px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>🏢 SMART CAMPUS UCE - Infraestructure</h1>
        <p>Last Update: <strong>${new Date().toLocaleTimeString()}</strong> (Auto-refresh: 30s)</p>
        <table>
          <thead>
            <tr><th>Microservice</th><th>Status</th><th>HTTP Code</th></tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}