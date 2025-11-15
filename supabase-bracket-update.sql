-- Actualizar esquema para soportar brackets con rondas
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS bracket JSONB DEFAULT '{"rounds": []}'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 0;

-- Comentario sobre la nueva estructura
COMMENT ON COLUMN rooms.bracket IS 'Estructura completa del bracket con múltiples rondas: {rounds: [{round: 1, matches: [{id, participant1, participant2, winner, isActive}]}]}';
COMMENT ON COLUMN rooms.current_round IS 'Ronda actual del torneo (0-indexed)';
