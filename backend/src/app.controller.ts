import { Controller, Post, Body } from '@nestjs/common';
import { MaterialsService } from './materials/materials.service';
import { StockService } from './stock/stock.service';
import axios from 'axios';

@Controller()
export class AppController {

  constructor(
    private readonly materialsService: MaterialsService,
    private readonly stockService: StockService,
  ) {}

  @Post('telegram/webhook')
  async handleTelegram(@Body() body: any) {

    const chatId = body?.message?.chat?.id;
    const text = body?.message?.text?.toLowerCase().trim();

    if (!chatId || !text) {
      return { ok: true };
    }

    let mensaje = '';

    // ===============================
    // ALMACENES CRUZADOS
    // ===============================

    if (text.includes('cruzados')) {

      const cruzados = await this.stockService.obtenerAlmacenesCruzados();

      mensaje =
        `⚠ ${cruzados.length} materiales con almacenes cruzados detectados.\n\n` +
        `Escribe "listado" para ver los primeros 20.`;

    }

    // ===============================
    // LISTADO
    // ===============================

    else if (text === 'listado') {

      const cruzados = await this.stockService.obtenerAlmacenesCruzados();

      const primeros20 = cruzados.slice(0, 20);

      mensaje = `⚠ LISTADO DE MATERIALES CRUZADOS\n\n`;

      primeros20.forEach((m: any) => {

        mensaje +=
          `${m.codigo}\n` +
          `${m.descripcion}\n` +
          `Alm: ${m.almacen} | Tp: ${m.tipo}\n` +
          `Ubicación: ${m.ubicacion}\n\n`;

      });

      if (cruzados.length > 20) {
        mensaje += `Escribe "segunda parte" para ver el resto.`;
      }

    }

    // ===============================
    // SEGUNDA PARTE
    // ===============================

    else if (text === 'segunda parte') {

      const cruzados = await this.stockService.obtenerAlmacenesCruzados();

      const resto = cruzados.slice(20);

      mensaje = `⚠ SEGUNDA PARTE\n\n`;

      resto.forEach((m: any) => {

        mensaje +=
          `${m.codigo}\n` +
          `${m.descripcion}\n` +
          `Alm: ${m.almacen} | Tp: ${m.tipo}\n` +
          `Ubicación: ${m.ubicacion}\n\n`;

      });

    }

    // ===============================
    // CONSULTA MATERIAL NORMAL
    // ===============================

    else {

      const response = await this.materialsService.getMaterialTelegram(text);
      mensaje = response.mensaje;

    }

    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: mensaje,
      },
    );

    return { ok: true };
  }
}