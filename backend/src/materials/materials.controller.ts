import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import axios from 'axios';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get(':codigo/full')
  getMaterialFull(@Param('codigo') codigo: string) {
    return this.materialsService.getMaterialFull(codigo);
  }

  @Post('telegram/webhook')
  async handleTelegram(@Body() body: any) {
    const chatId = body?.message?.chat?.id;
    const text = body?.message?.text;

    if (!chatId || !text) {
      return { ok: true };
    }

    const response = await this.materialsService.getMaterialTelegram(text);

    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: response.mensaje,
      },
    );

    return { ok: true };
  }
}