import type { OpeningHour } from '@/api/types';
import { openStatus } from '@/utils/format';

const h = (dayOfWeek: OpeningHour['dayOfWeek'], openTime: string, closeTime: string) => ({
  dayOfWeek,
  openTime,
  closeTime,
  isOpen: true,
});

// terça a domingo, 11:00–23:00 (como no seed); 2026-10-27 é uma terça
const WEEK = (['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const).map(
  (d) => h(d, '11:00', '23:00')
);
const at = (iso: string) => new Date(iso);

describe('openStatus', () => {
  it('sem horários cadastrados não diz nada', () => {
    expect(openStatus([])).toBeNull();
  });

  it('aberto dentro do horário', () => {
    expect(openStatus(WEEK, at('2026-10-27T12:30:00'))).toEqual({
      open: true,
      label: 'Aberto · fecha às 23:00',
    });
  });

  it('antes de abrir mostra o horário de hoje', () => {
    expect(openStatus(WEEK, at('2026-10-27T09:00:00'))?.label).toBe('Fechado · abre às 11:00');
  });

  it('depois de fechar mostra o próximo dia', () => {
    expect(openStatus(WEEK, at('2026-10-27T23:30:00'))?.label).toBe(
      'Fechado · abre amanhã às 11:00'
    );
  });

  it('pula o dia de folga', () => {
    // domingo à noite: segunda é folga, abre terça
    expect(openStatus(WEEK, at('2026-11-01T23:30:00'))?.label).toBe(
      'Fechado · abre terça às 11:00'
    );
  });

  it('turno que passa da meia-noite', () => {
    const night = [h('FRIDAY', '18:00', '02:00')];
    expect(openStatus(night, at('2026-10-30T23:00:00'))?.open).toBe(true);
    expect(openStatus(night, at('2026-10-31T01:30:00'))?.label).toBe('Aberto · fecha às 02:00');
    expect(openStatus(night, at('2026-10-31T03:00:00'))?.open).toBe(false);
  });
});
